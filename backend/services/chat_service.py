import uuid
import os
from typing import Dict, List, Any
from services.groq_service import generate_groq_response, GroqServiceError
from services.knowledge_base import retrieve_context

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

# In-memory store for active conversations
conversations: Dict[str, Dict[str, Any]] = {}

def get_initial_lead_data() -> Dict[str, Any]:
    return {
        "name": None,
        "phone_number": None,
        "city": None,
        "purpose": None,
        "plot_size": None,
        "budget_range": None,
        "payment_method": None,
        "phase_preference": None,
        "timeline": None,
        "site_visit_requested": False,
        "follow_up_time": None,
        "notes": None
    }

def get_or_create_conversation(conversation_id: str = None) -> (str, Dict[str, Any]):
    if not conversation_id or conversation_id not in conversations:
        conversation_id = conversation_id or str(uuid.uuid4())
        conversations[conversation_id] = {
            "history": [],
            "lead_data": get_initial_lead_data()
        }
    return conversation_id, conversations[conversation_id]

def process_user_message(user_message: str, conversation_id: str = None) -> (str, str):
    """
    Processes user chat message, retrieves context, queries Groq, updates history, and returns (reply, conversation_id).
    """
    conversation_id, conv_state = get_or_create_conversation(conversation_id)
    history = conv_state["history"]

    # 1. Retrieve knowledge context
    relevant_context = retrieve_context(user_message)

    # 2. Build message payload for Groq
    system_content = f"{SARA_SYSTEM_PROMPT}\n\n--- APPROVED ETIHAD GARDEN KNOWLEDGE CONTEXT ---\n{relevant_context}\n-----------------------------------------------"

    messages_payload = [{"role": "system", "content": system_content}]

    # Include recent conversation history (up to 8 recent exchanges to fit within token limits)
    recent_history = history[-8:]
    for msg in recent_history:
        messages_payload.append({"role": msg["role"], "content": msg["content"]})

    # Append current user message
    messages_payload.append({"role": "user", "content": user_message})

    # 3. Call Groq Service
    try:
        reply = generate_groq_response(messages_payload)
    except GroqServiceError as err:
        groq_key = os.getenv("GROQ_API_KEY", "")
        safe_msg = str(err)
        if groq_key and groq_key in safe_msg:
            safe_msg = safe_msg.replace(groq_key, "[REDACTED]")
        print(f"[CHAT ERROR] Groq request failed: {safe_msg}")
        reply = "Maazrat, Sara abhi temporarily available nahi hain. Please try again."
    except Exception as ex:
        groq_key = os.getenv("GROQ_API_KEY", "")
        safe_msg = str(ex)
        if groq_key and groq_key in safe_msg:
            safe_msg = safe_msg.replace(groq_key, "[REDACTED]")
        print(f"[CHAT ERROR] Unexpected Chat Service Error: {safe_msg}")
        reply = "Maazrat, Sara abhi temporarily available nahi hain. Please try again."

    # 4. Update in-memory history
    conv_state["history"].append({"role": "user", "content": user_message})
    conv_state["history"].append({"role": "assistant", "content": reply})

    return reply, conversation_id
