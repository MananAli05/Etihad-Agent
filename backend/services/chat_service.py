import uuid
import os
from typing import Dict, List, Optional, Tuple

from services.groq_service import generate_groq_response, GroqServiceError
from services.knowledge_base import retrieve_context
from services.lead_extractor import extract_lead
from services import supabase_store

FALLBACK_REPLY = "Maazrat, Sara abhi temporarily available nahi hain. Please try again."

SARA_SYSTEM_PROMPT = """You are Sara, the official AI property consultant and virtual assistant for Etihad Garden, a luxury housing society in Rahim Yar Khan, Pakistan.

IDENTITY & PERSONA:
- You are a professional, polite, warm, and highly knowledgeable Pakistani female property consultant.
- Speak primarily in natural, polite Pakistani Roman Urdu (or English if the user explicitly speaks in English).
- When greeted with "salam", "assalam o alaikum", or "hello", greet back warmly:
  "Wa Alaikum Assalam! Main Sara hoon, Etihad Garden ki property assistant. Aap kis property ya plot ke baare mein maloomat chahtay hain?"
- You can naturally integrate common English property terms such as: budget, booking, installment, payment, investment, location, phase, plot, property, site visit.
- Personality: Warm, Professional, Friendly, Patient, Respectful, Confident, Helpful, and Natural.
- NEVER sound robotic, scripted, or like an impersonal call center operator.

STRICT KNOWLEDGE BASE & ANTI-HALLUCINATION RULES:
1. Answer factual questions about Etihad Garden ONLY using the supplied Etihad Garden Knowledge Context provided below.
2. DO NOT use general AI knowledge to invent or guess Etihad Garden facts (such as exact unconfirmed prices, discount offers, possession dates, or unannounced project features).
3. If the user asks about a topic or specific detail where the knowledge context does NOT contain the exact answer, respond naturally in Roman Urdu:
   "Ji, is information ki exact detail mere paas abhi available nahi hai. Aap chahein to main aap ko sales team se connect karne mein help kar sakti hoon."
4. Do NOT make up numbers, plot availability, or investment returns.

LEAD QUALIFICATION GUIDELINES:
- Provide helpful, friendly answers first to build trust.
- When the visitor shows genuine buying or booking interest, naturally ask ONE question at a time to gather relevant customer details:
  - Name
  - Phone Number
  - City
  - Purpose (Residential / Investment)
  - Preferred Plot Size (3 Marla, 5 Marla, 10 Marla, 1 Kanal)
  - Estimated Budget
  - Phase Preference (Phase 1, Phase 2, Phase 3)
  - Site Visit Interest
- Never interrogate the user. Keep conversation friendly and conversational.
"""

# Serverless functions get a fresh process per request, so conversation state
# lives in Supabase. This dict is only a fallback for local runs with no
# Supabase credentials configured.
_local_conversations: Dict[str, List[Dict[str, str]]] = {}

HISTORY_TURNS = 16


def _load_history(session_id: str) -> List[Dict[str, str]]:
    if supabase_store.is_enabled():
        return supabase_store.load_history(session_id, limit=HISTORY_TURNS)
    return _local_conversations.get(session_id, [])[-HISTORY_TURNS:]


def _save_turn(session_id: str, user_message: str, reply: str, lead_id: Optional[str]) -> None:
    if supabase_store.is_enabled():
        supabase_store.save_message(session_id, "user", user_message, lead_id)
        supabase_store.save_message(session_id, "sara", reply, lead_id)
        return

    bucket = _local_conversations.setdefault(session_id, [])
    bucket.append({"role": "user", "content": user_message})
    bucket.append({"role": "assistant", "content": reply})


def _capture_lead(history: List[Dict[str, str]]) -> Optional[str]:
    """
    Try to turn the conversation into a CRM lead.

    Returns the lead id when one was written. Never raises: a CRM failure
    must not cost the visitor their reply.
    """
    if not supabase_store.is_enabled():
        return None

    try:
        fields = extract_lead(history)
        if not fields:
            return None
        lead_id = supabase_store.upsert_lead(fields)
        if lead_id:
            print(f"[LEAD] Saved {lead_id} ({fields.get('name') or 'unnamed'} / {fields.get('phone')})")
        return lead_id
    except Exception as exc:
        print(f"[LEAD ERROR] Lead capture failed: {exc}")
        return None


def _redact(err: Exception) -> str:
    """Strip the Groq key out of anything we log."""
    message = str(err)
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key and groq_key in message:
        message = message.replace(groq_key, "[REDACTED]")
    return message


def process_user_message(user_message: str, conversation_id: str = None) -> Tuple[str, str]:
    """
    Processes user chat message, retrieves context, queries Groq, persists the
    exchange, and returns (reply, conversation_id).
    """
    session_id = conversation_id or str(uuid.uuid4())
    history = _load_history(session_id)

    # 1. Retrieve knowledge context
    relevant_context = retrieve_context(user_message)

    # 2. Build message payload for Groq
    system_content = (
        SARA_SYSTEM_PROMPT
        + "\n\n--- APPROVED ETIHAD GARDEN KNOWLEDGE CONTEXT ---\n"
        + relevant_context
        + "\n-----------------------------------------------"
    )

    messages_payload = [{"role": "system", "content": system_content}]
    messages_payload.extend(history)
    messages_payload.append({"role": "user", "content": user_message})

    # 3. Call Groq Service
    try:
        reply = generate_groq_response(messages_payload)
    except GroqServiceError as err:
        print(f"[CHAT ERROR] Groq request failed: {_redact(err)}")
        reply = FALLBACK_REPLY
    except Exception as ex:
        print(f"[CHAT ERROR] Unexpected Chat Service Error: {_redact(ex)}")
        reply = FALLBACK_REPLY

    # 4. Capture the lead before persisting, so both rows can carry lead_id.
    full_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": reply},
    ]
    lead_id = _capture_lead(full_history) if reply != FALLBACK_REPLY else None

    # 5. Persist the exchange
    _save_turn(session_id, user_message, reply, lead_id)

    return reply, session_id
