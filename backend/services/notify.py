"""
Email alerts for new leads.

A lead that sits in the CRM until someone thinks to open it is a lead going
cold. Every channel - chatbot, voice, website form, Google Form - now pushes a
notification the moment a lead is created.

Uses smtplib from the standard library rather than a provider SDK, so it works
with Gmail, Zoho, or anything else that speaks SMTP, and adds nothing to the
serverless cold start.

Sending is best-effort. A mail server being down must never cost a visitor
their reply or stop the lead being saved.
"""

import os
import smtplib
import ssl
from email.message import EmailMessage
from typing import Any, Dict, Optional

TIMEOUT = 10

# Ordered so the most decision-useful fields come first in the email.
FIELD_LABELS = [
    ("phone", "Phone"),
    ("city", "City"),
    ("purpose", "Purpose"),
    ("plot_size", "Plot size"),
    ("budget_range", "Budget"),
    ("phase_preference", "Phase"),
    ("payment_method", "Payment"),
    ("timeline", "Timeline"),
    ("interest_level", "Interest"),
    ("email", "Email"),
    ("notes", "Notes"),
]

SOURCE_LABELS = {
    "chatbot": "Website chatbot",
    "voice_agent": "Voice call",
    "website_form": "Website form",
    "google_form": "Google Form",
    "whatsapp": "WhatsApp",
    "inbound_call": "Inbound call",
}


def _config() -> Dict[str, Any]:
    """Read config lazily so .env load order does not matter."""
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587").strip() or 587),
        "user": os.getenv("SMTP_USER", "").strip(),
        "password": os.getenv("SMTP_PASSWORD", "").strip(),
        "sender": os.getenv("SMTP_FROM", "").strip() or os.getenv("SMTP_USER", "").strip(),
        "to": os.getenv("LEAD_ALERT_TO", "").strip(),
    }


def is_enabled() -> bool:
    cfg = _config()
    return bool(cfg["host"] and cfg["user"] and cfg["password"] and cfg["to"])


def _subject(fields: Dict[str, Any]) -> str:
    """
    Lead the subject with whatever makes this lead worth opening now.

    A site visit request or a hot lead is a different job from a general
    enquiry, and the inbox is where that distinction has to survive.
    """
    name = (fields.get("name") or "New enquiry").strip()
    source = SOURCE_LABELS.get(fields.get("source"), fields.get("source") or "website")

    if fields.get("site_visit_requested"):
        return f"Site visit request - {name} ({source})"
    if (fields.get("interest_level") or "").lower() == "hot":
        return f"Hot lead - {name} ({source})"
    return f"New lead - {name} ({source})"


def _body(fields: Dict[str, Any], lead_id: Optional[str]) -> str:
    lines = [
        (fields.get("name") or "Unnamed").strip(),
        f"Source: {SOURCE_LABELS.get(fields.get('source'), fields.get('source') or 'unknown')}",
        "",
    ]

    for key, label in FIELD_LABELS:
        value = fields.get(key)
        if value in (None, "", []):
            continue
        lines.append(f"{label}: {value}")

    if fields.get("site_visit_requested"):
        lines.append("Site visit: requested")

    admin = os.getenv("ADMIN_URL", "https://etihad-admin.vercel.app").rstrip("/")
    lines += ["", f"Open in CRM: {admin}/admin/leads"]
    if lead_id:
        lines.append(f"Lead id: {lead_id}")

    return "\n".join(lines)


def send_lead_alert(fields: Dict[str, Any], lead_id: Optional[str] = None) -> bool:
    """
    Email the sales inbox about a newly created lead.

    Returns True when the message was handed to the mail server. Never raises:
    the caller is in the middle of answering a visitor.
    """
    cfg = _config()
    if not is_enabled():
        print("[NOTIFY] SMTP not configured; skipping lead alert")
        return False

    message = EmailMessage()
    message["Subject"] = _subject(fields)
    message["From"] = cfg["sender"]
    message["To"] = cfg["to"]
    if fields.get("email"):
        # Replying from the inbox should reach the customer, not the server.
        message["Reply-To"] = fields["email"]
    message.set_content(_body(fields, lead_id))

    try:
        context = ssl.create_default_context()
        if cfg["port"] == 465:
            with smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=TIMEOUT, context=context) as smtp:
                smtp.login(cfg["user"], cfg["password"])
                smtp.send_message(message)
        else:
            with smtplib.SMTP(cfg["host"], cfg["port"], timeout=TIMEOUT) as smtp:
                smtp.starttls(context=context)
                smtp.login(cfg["user"], cfg["password"])
                smtp.send_message(message)
    except Exception as exc:
        # Logged, not raised: the lead is already saved and the visitor is
        # waiting on a reply.
        print(f"[NOTIFY ERROR] Could not send lead alert: {exc}")
        return False

    print(f"[NOTIFY] Lead alert sent to {cfg['to']} for {fields.get('phone')}")
    return True
