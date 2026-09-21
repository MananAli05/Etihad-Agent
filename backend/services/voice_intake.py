"""
Turns a finished ElevenLabs voice call into a CRM lead.

ElevenLabs posts a post_call_transcription webhook when a conversation ends.
The transcript is replayed through the same extractor the chatbot uses, so
both channels produce identically shaped leads.
"""

import hashlib
import hmac
import os
import time
from typing import Any, Dict, List, Optional

from services import supabase_store
from services.lead_extractor import extract_lead

# ElevenLabs rejects nothing on its side, so stale replays are dropped here.
SIGNATURE_TOLERANCE_SECONDS = 30 * 60


def _direction(agent_id: str) -> str:
    """
    Which agent produced this call.

    Both agents can post to the same webhook, and they mean different things:
    inbound is a stranger who found the website, outbound is a follow-up to
    someone already in the CRM.
    """
    inbound = os.getenv("ELEVENLABS_AGENT_ID", "").strip()
    outbound = os.getenv("ELEVENLABS_OUTBOUND_AGENT_ID", "").strip()

    if outbound and agent_id == outbound:
        return "outbound"
    if inbound and agent_id == inbound:
        return "inbound"
    # An unconfigured agent is likelier to be a new website caller than a
    # follow-up, and treating it as inbound only risks the source label.
    return "inbound"


def verify_signature(payload: bytes, header: Optional[str]) -> bool:
    """
    Validate the ElevenLabs-Signature header: "t=<unix>,v0=<hmac sha256>".

    The HMAC covers "<timestamp>.<raw body>". Verification is skipped when no
    secret is configured, so the endpoint still works before the webhook is
    wired up in the dashboard.
    """
    secret = os.getenv("ELEVENLABS_WEBHOOK_SECRET", "").strip()
    if not secret:
        return True

    if not header:
        print("[VOICE WEBHOOK] Missing signature header")
        return False

    parts = dict(
        piece.split("=", 1) for piece in header.split(",") if "=" in piece
    )
    timestamp, provided = parts.get("t"), parts.get("v0")
    if not (timestamp and provided):
        print("[VOICE WEBHOOK] Malformed signature header")
        return False

    try:
        age = abs(time.time() - int(timestamp))
    except ValueError:
        return False
    if age > SIGNATURE_TOLERANCE_SECONDS:
        print(f"[VOICE WEBHOOK] Signature too old ({age:.0f}s)")
        return False

    expected = hmac.new(
        secret.encode(), f"{timestamp}.".encode() + payload, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, provided):
        print("[VOICE WEBHOOK] Signature mismatch")
        return False
    return True


def _transcript_to_history(transcript: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Reshape the ElevenLabs transcript into extractor-shaped messages."""
    history = []
    for turn in transcript or []:
        text = (turn.get("message") or "").strip()
        if not text:
            # Tool calls and interruptions arrive as turns with no message.
            continue
        role = "user" if (turn.get("role") or "").lower() == "user" else "assistant"
        history.append({"role": role, "content": text})
    return history


def handle_post_call(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a post_call_transcription payload.

    Always reports success to ElevenLabs: retrying a call we could not turn
    into a lead will not help, and a failed CRM write must not make the
    webhook look broken.
    """
    if body.get("type") not in (None, "post_call_transcription"):
        return {"status": "ignored", "reason": f"unhandled type {body.get('type')}"}

    data = body.get("data") or body
    conversation_id = data.get("conversation_id") or "unknown"
    direction = _direction((data.get("agent_id") or "").strip())
    history = _transcript_to_history(data.get("transcript") or [])

    if not history:
        print(f"[VOICE WEBHOOK] {conversation_id}: empty transcript")
        return {"status": "ignored", "reason": "empty transcript"}

    if not supabase_store.is_enabled():
        print(f"[VOICE WEBHOOK] {conversation_id}: Supabase not configured")
        return {"status": "ignored", "reason": "persistence disabled"}

    # Keep the call transcript regardless of whether a lead comes out of it.
    session_id = f"voice-{direction}-{conversation_id}"
    for message in history:
        supabase_store.save_message(
            session_id,
            "user" if message["role"] == "user" else "sara",
            message["content"],
        )

    try:
        fields = extract_lead(history)
    except Exception as exc:
        print(f"[VOICE WEBHOOK] {conversation_id}: extraction failed: {exc}")
        return {"status": "error", "reason": "extraction failed"}

    if not fields:
        print(f"[VOICE WEBHOOK] {conversation_id}: no phone number captured")
        return {"status": "ok", "lead": None}

    # Only an inbound call discovers someone new. An outbound call is a
    # follow-up to a lead another channel already produced, so it enriches the
    # row without claiming the attribution. upsert_lead keeps first-touch
    # source anyway; leaving it unset here makes that explicit.
    if direction == "inbound":
        fields["source"] = "voice_agent"

    lead_id = supabase_store.upsert_lead(fields)
    print(
        f"[VOICE WEBHOOK] {conversation_id} ({direction}): "
        f"lead {lead_id} ({fields.get('phone')})"
    )
    return {"status": "ok", "lead": lead_id, "direction": direction}
