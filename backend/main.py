import os
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import process_user_message from services
from services.chat_service import process_user_message

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
    allow_origins=origins,
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
