import os
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import process_user_message from services
from services.chat_service import process_user_message
from services import supabase_store, voice_intake
from services.lead_extractor import normalise_phone

# Ensure backend/.env is explicitly loaded regardless of current working directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Verify environment variables (without exposing sensitive values)
agent_id_raw = os.getenv("ELEVENLABS_AGENT_ID", "").strip().strip('"').strip("'")
api_key_raw = os.getenv("ELEVENLABS_API_KEY", "").strip().strip('"').strip("'")

print("[ElevenLabs Config] ELEVENLABS_AGENT_ID:", "configured" if agent_id_raw else "missing")
print("[ElevenLabs Config] ELEVENLABS_API_KEY:", "configured" if api_key_raw else "missing")

app = FastAPI(
    title="Etihad Garden Sara Chatbot API",
    description="Backend API powering Sara, the official AI Property Assistant for Etihad Garden.",
    version="1.0.0"
)

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").strip()
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    # Production and Vercel preview deployments each get their own hostname,
    # so match the whole *.vercel.app space rather than listing them.
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request & Response Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or prompt message")
    conversation_id: Optional[str] = Field(None, description="Unique conversation ID")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="Sara AI response")
    conversation_id: str = Field(..., description="Active conversation ID")

class HealthResponse(BaseModel):
    status: str

@app.get("/api/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint to verify backend status."""
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_endpoint(request: ChatRequest):
    """
    POST /api/chat - Main chat endpoint for Sara AI assistant.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message field cannot be empty."
        )

    try:
        reply, conv_id = process_user_message(
            user_message=request.message.strip(),
            conversation_id=request.conversation_id
        )
        return ChatResponse(reply=reply, conversation_id=conv_id)
    except Exception as e:
        groq_key = os.getenv("GROQ_API_KEY", "")
        safe_error = str(e)
        if groq_key and groq_key in safe_error:
            safe_error = safe_error.replace(groq_key, "[REDACTED]")
        print(f"[CHAT ERROR] FastAPI /api/chat request failed: {safe_error}")
        return ChatResponse(
            reply="Maazrat, Sara abhi temporarily available nahi hain. Please try again.",
            conversation_id=request.conversation_id or "default-session"
        )

class LeadFormRequest(BaseModel):
    name: str = Field(..., description="Full name")
    phone: str = Field(..., description="Contact number")
    email: Optional[str] = Field(None)
    city: Optional[str] = Field(None)
    interest: Optional[str] = Field(None, description="Residential Plot / Commercial Property / ...")
    budget: Optional[str] = Field(None)
    plot_size: Optional[str] = Field(None)
    phase_preference: Optional[str] = Field(None)
    message: Optional[str] = Field(None)
    source: Optional[str] = Field(None, description="Channel key; defaults to website_form")


# Keys the admin SourcesPage knows how to display. Anything else would create
# a lead the Sources page cannot attribute.
FORM_SOURCES = {"website_form", "google_form", "whatsapp", "inbound_call"}


class LeadFormResponse(BaseModel):
    status: str
    lead_id: Optional[str] = None


# The selects default to a filled-in option, so "no answer" arrives as one of
# these rather than as an empty field. Store null instead of a fake preference.
UNSET_CHOICES = {"not sure", "no preference", ""}


def _choice(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    return None if value.strip().lower() in UNSET_CHOICES else value.strip()


@app.post("/api/leads", response_model=LeadFormResponse, status_code=status.HTTP_200_OK)
def submit_lead(request: LeadFormRequest):
    """
    POST /api/leads - landing page inquiry form.

    Shares the leads table with the chatbot and voice agent, keyed on phone,
    so the same person enquiring twice enriches one row.
    """
    phone = normalise_phone(request.phone)
    if not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid Pakistani mobile number, e.g. 03001234567.",
        )

    if not supabase_store.is_enabled():
        print("[LEAD FORM] Supabase not configured; submission dropped")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Lead storage is not configured.",
        )

    fields = {
        "name": (request.name or "").strip() or None,
        "phone": phone,
        "email": (request.email or "").strip() or None,
        "city": (request.city or "").strip() or None,
        "purpose": _choice(request.interest),
        "budget_range": _choice(request.budget),
        "plot_size": _choice(request.plot_size),
        "phase_preference": _choice(request.phase_preference),
        "notes": (request.message or "").strip() or None,
        "source": request.source if request.source in FORM_SOURCES else "website_form",
    }

    try:
        lead_id = supabase_store.upsert_lead(fields)
    except Exception as exc:
        print(f"[LEAD FORM] Failed to save: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not save your inquiry. Please try again.",
        )

    print(f"[LEAD FORM] Saved {lead_id} ({fields['name']} / {phone})")
    return LeadFormResponse(status="ok", lead_id=lead_id)


@app.post("/api/voice/webhook", status_code=status.HTTP_200_OK)
async def voice_webhook(request: Request):
    """
    POST /api/voice/webhook - ElevenLabs post-call transcription.

    Configured under the agent's post-call webhook. Saves the transcript and
    promotes it to a lead when a phone number was captured on the call.
    """
    raw = await request.body()

    if not voice_intake.verify_signature(raw, request.headers.get("ElevenLabs-Signature")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature.",
        )

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Body must be JSON.",
        )

    return voice_intake.handle_post_call(body)


@app.get("/api/voice/signed-url")
async def get_signed_url():
    """
    GET /api/voice/signed-url - Generates temporary signed URL for ElevenLabs Conversational AI.
    Ensures ELEVENLABS_API_KEY remains secret on the backend.
    """
    import httpx

    agent_id = os.getenv("ELEVENLABS_AGENT_ID", "").strip().strip('"').strip("'")
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip().strip('"').strip("'")

    if not agent_id:
        print("[ElevenLabs Error] ELEVENLABS_AGENT_ID is missing in environment.")
        return {
            "signedUrl": None,
            "agentId": None,
            "status": "missing_agent_id",
            "message": "ELEVENLABS_AGENT_ID is missing"
        }

    # If API key is provided, attempt to generate signed URL from ElevenLabs
    if api_key:
        try:
            endpoint = f"https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={agent_id}"
            headers = {"xi-api-key": api_key}
            
            async with httpx.AsyncClient() as client:
                res = await client.get(endpoint, headers=headers, timeout=10.0)
                
            if res.status_code == 200:
                data = res.json()
                signed_url = data.get("signed_url")
                return {
                    "signedUrl": signed_url,
                    "signed_url": signed_url,
                    "agentId": agent_id,
                    "agent_id": agent_id,
                    "status": "ok"
                }
            else:
                # Log safe error detail without exposing credentials
                print(f"[ElevenLabs API Warning] Endpoint: {endpoint} | HTTP {res.status_code} | Response: {res.text}")
                # Fallback to returning agentId for public agent connection if signed URL call fails
                return {
                    "signedUrl": None,
                    "signed_url": None,
                    "agentId": agent_id,
                    "agent_id": agent_id,
                    "status": "agent_id_fallback",
                    "message": f"ElevenLabs signed-url returned HTTP {res.status_code}, using direct agentId"
                }
        except Exception as e:
            print(f"[ElevenLabs API Exception] Exception requesting signed URL: {e}")
            return {
                "signedUrl": None,
                "signed_url": None,
                "agentId": agent_id,
                "agent_id": agent_id,
                "status": "error",
                "message": str(e)
            }
    else:
        # Fallback to direct agentId if no API key is provided
        return {
            "signedUrl": None,
            "signed_url": None,
            "agentId": agent_id,
            "agent_id": agent_id,
            "status": "ok"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
