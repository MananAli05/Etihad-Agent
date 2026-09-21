"""
Pulls structured lead fields out of a Sara conversation.

leads.phone is NOT NULL, so a row cannot exist before Sara has captured a
phone number. Extraction is therefore gated on a phone number appearing in
what the visitor typed - that keeps the second Groq call off the critical
path for ordinary browsing questions.
"""

import json
import re
from typing import Any, Dict, List, Optional

from services.groq_service import generate_groq_response, GroqServiceError

# Pakistani mobile numbers: +923xxxxxxxxx / 0092..., 03xxxxxxxxx, 3xxxxxxxxx,
# tolerating spaces and dashes as people type them.
PHONE_RE = re.compile(r"(?:(?:\+|00)?92[\s-]?|0)?3\d{2}[\s-]?\d{7}\b")

EXTRACTION_PROMPT = """You extract CRM fields from a property enquiry conversation.

Return ONLY a JSON object with these keys. Use null for anything the visitor
has not clearly stated. Never guess or invent a value.

{
  "name": string|null,
  "phone": string|null,
  "email": string|null,
  "city": string|null,
  "purpose": "Residential"|"Investment"|null,
  "plot_size": "3 Marla"|"5 Marla"|"10 Marla"|"1 Kanal"|null,
  "budget_range": string|null,
  "payment_method": "Cash"|"Installments"|null,
  "phase_preference": "Phase 1"|"Phase 2"|"Phase 3"|null,
  "timeline": string|null,
  "site_visit_requested": true|false,
  "interest_level": "Hot"|"Warm"|"Cold"|null,
  "notes": string|null
}

Rules:
- Phone numbers must be normalised to +92XXXXXXXXXX.
- interest_level: "Hot" if ready to book or visit, "Warm" if actively
  comparing, "Cold" if only browsing.
- notes: one short sentence on what they are looking for.
"""

ALLOWED_FIELDS = {
    "name", "phone", "email", "city", "purpose", "plot_size",
    "budget_range", "payment_method", "phase_preference", "timeline",
    "site_visit_requested", "interest_level", "notes",
}


def normalise_phone(raw: str) -> Optional[str]:
    """Reduce a typed Pakistani mobile number to +92XXXXXXXXXX."""
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("0092"):
        digits = digits[4:]
    elif digits.startswith("92"):
        digits = digits[2:]
    elif digits.startswith("0"):
        digits = digits[1:]

    if len(digits) == 10 and digits.startswith("3"):
        return f"+92{digits}"
    return None


def contains_phone(text: str) -> bool:
    return bool(PHONE_RE.search(text or ""))


def extract_lead(history: List[Dict[str, str]]) -> Optional[Dict[str, Any]]:
    """
    Run extraction over the conversation. Returns None when there is no
    usable phone number, or when the model returns something unparseable.
    """
    transcript = "\n".join(
        f"{'Visitor' if m.get('role') == 'user' else 'Sara'}: {m.get('content', '')}"
        for m in history
    )
    if not contains_phone(transcript):
        return None

    messages = [
        {"role": "system", "content": EXTRACTION_PROMPT},
        {"role": "user", "content": f"Conversation:\n{transcript}\n\nReturn the JSON object."},
    ]

    try:
        raw = generate_groq_response(messages, json_mode=True)
    except GroqServiceError as exc:
        print(f"[LEAD EXTRACT] Groq call failed: {exc}")
        return None

    data = _parse_json(raw)
    if not data:
        print(f"[LEAD EXTRACT] Could not parse model output: {raw[:200]}")
        return None

    fields = {k: v for k, v in data.items() if k in ALLOWED_FIELDS}

    phone = normalise_phone(str(fields.get("phone") or ""))
    if not phone:
        # Model missed it or mangled it; fall back to the raw transcript match.
        match = PHONE_RE.search(transcript)
        phone = normalise_phone(match.group(0)) if match else None
    if not phone:
        return None

    fields["phone"] = phone
    fields["site_visit_requested"] = bool(fields.get("site_visit_requested"))
    return fields


def _parse_json(raw: str) -> Optional[Dict[str, Any]]:
    """Parse the model's reply, tolerating markdown fences or stray prose."""
    if not raw:
        return None
    try:
        return json.loads(raw)
    except ValueError:
        pass

    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except ValueError:
        return None
