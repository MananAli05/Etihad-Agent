"""
Supabase persistence for Sara.

Serverless functions do not keep state between requests, so conversation
history cannot live in a module-level dict. Everything durable goes through
PostgREST here.

Talks to PostgREST over httpx rather than the supabase-py SDK: httpx already
ships as a groq dependency, and avoiding the extra package keeps serverless
cold starts down.

Writes need the service_role key. RLS blocks inserts into chat_history for
the anon/publishable key, so with only that key configured the chat still
works - it just stops persisting.
"""

import os
from typing import Any, Dict, List, Optional
from urllib.parse import quote

import httpx

TIMEOUT = 8.0


def _q(value: str) -> str:
    """
    Percent-encode a PostgREST filter value.

    Phone numbers are stored in +92... form, and a literal "+" in a query
    string decodes as a space - which silently matched nothing and let
    duplicate leads through. Encode every interpolated value.
    """
    return quote(str(value), safe="")


def _config() -> tuple:
    """Read config lazily so .env load order does not matter."""
    url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    return url, key


def is_enabled() -> bool:
    url, key = _config()
    return bool(url and key)


def _headers(extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    _, key = _config()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def _request(method: str, path: str, **kwargs) -> Optional[Any]:
    """
    Single choke point for PostgREST calls.

    Persistence must never take the chat down with it, so every failure is
    logged and swallowed. Callers treat None as "unavailable".
    """
    url, key = _config()
    if not (url and key):
        return None

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            response = client.request(
                method, f"{url}/rest/v1/{path}", headers=_headers(kwargs.pop("extra_headers", None)), **kwargs
            )
    except Exception as exc:
        print(f"[SUPABASE ERROR] {method} {path} failed: {exc}")
        return None

    if response.status_code >= 400:
        print(f"[SUPABASE ERROR] {method} {path} -> HTTP {response.status_code}: {response.text[:300]}")
        return None

    if not response.content:
        return []

    try:
        return response.json()
    except ValueError:
        return []


# --- chat_history -----------------------------------------------------------
# Columns: id, session_id, sender, message, lead_id, created_at
# One row per message. ChatsPage lowercases sender and checks for "user",
# so anything else renders as Sara.

def save_message(session_id: str, sender: str, message: str, lead_id: Optional[str] = None) -> None:
    payload: Dict[str, Any] = {
        "session_id": session_id,
        "sender": sender,
        "message": message,
    }
    if lead_id:
        payload["lead_id"] = lead_id
    _request("POST", "chat_history", json=payload)


def load_history(session_id: str, limit: int = 16) -> List[Dict[str, str]]:
    """
    Return the tail of the conversation as Groq-shaped messages, oldest first.

    Fetches newest-first so the limit keeps the most recent turns, then
    reverses for chronological order.
    """
    rows = _request(
        "GET",
        f"chat_history?session_id=eq.{_q(session_id)}&select=sender,message"
        f"&order=created_at.desc&limit={limit}",
    )
    if not rows:
        return []

    history = [
        {
            "role": "user" if "user" in (row.get("sender") or "").lower() else "assistant",
            "content": row.get("message") or "",
        }
        for row in reversed(rows)
        if row.get("message")
    ]
    return history


# --- leads ------------------------------------------------------------------
# leads.phone is NOT NULL, so a lead cannot be written until Sara has captured
# a phone number. Phone doubles as the natural key for dedupe.

def find_lead_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    rows = _request("GET", f"leads?phone=eq.{_q(phone)}&select=*&limit=1")
    return rows[0] if rows else None


def upsert_lead(fields: Dict[str, Any]) -> Optional[str]:
    """
    Create or update a lead, keyed on phone. Returns the lead id.

    Only non-empty values are written, so a later turn that reveals less
    information never blanks out a field captured earlier.
    """
    phone = (fields.get("phone") or "").strip()
    if not phone:
        return None

    clean = {k: v for k, v in fields.items() if v not in (None, "", [])}
    existing = find_lead_by_phone(phone)

    if existing:
        lead_id = existing.get("id")
        # Do not overwrite a status a human may have moved along in the CRM.
        clean.pop("status", None)
        # Source is first-touch attribution. Three channels write to the same
        # row keyed on phone, so letting a later touch rewrite it would credit
        # the wrong channel with finding the customer.
        clean.pop("source", None)
        if clean:
            _request(
                "PATCH",
                f"leads?id=eq.{_q(lead_id)}",
                json=clean,
                extra_headers={"Prefer": "return=minimal"},
            )
        return lead_id

    clean.setdefault("status", "New")
    # Channel keys must match admin SourcesPage channelMap: website_form,
    # google_form, chatbot, voice_agent, whatsapp, inbound_call.
    clean.setdefault("source", "chatbot")
    rows = _request(
        "POST",
        "leads",
        json=clean,
        extra_headers={"Prefer": "return=representation"},
    )
    if rows and isinstance(rows, list):
        return rows[0].get("id")
    return None
