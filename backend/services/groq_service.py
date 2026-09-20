import os
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DEFAULT_MODEL = "openai/gpt-oss-120b"

class GroqServiceError(Exception):
    """Custom exception for Groq Service errors."""
    pass

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    placeholder_keys = ["your_groq_api_key_here", "your_actual_key", "your_key_here", ""]

    if not api_key or api_key in placeholder_keys:
        raise GroqServiceError(
            "GROQ_API_KEY is unconfigured or set to placeholder in backend/.env. "
            "Please update backend/.env with your actual key (e.g. GROQ_API_KEY=gsk_...)."
        )

    try:
        from groq import Groq
        return Groq(api_key=api_key)
    except ImportError:
        raise GroqServiceError("The 'groq' Python package is not installed in the active environment.")
    except Exception as e:
        raise GroqServiceError(f"Failed to initialize Groq client: {str(e)}")

def generate_groq_response(messages: List[Dict[str, str]]) -> str:
    """
    Calls the Groq API with given chat messages and returns the assistant's reply.
    """
    client = get_groq_client()
    model = os.getenv("GROQ_MODEL", DEFAULT_MODEL).strip()

    params = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 1024,
    }

    # gpt-oss models are reasoning models: their thinking tokens are billed against
    # max_tokens, which can starve the visible answer. Keep that budget small.
    if "gpt-oss" in model:
        params["reasoning_effort"] = "low"

    try:
        completion = client.chat.completions.create(**params)
    except Exception as e:
        raise GroqServiceError(f"Groq API Error: {str(e)}")

    if not completion.choices:
        raise GroqServiceError("Groq API returned no choices.")

    choice = completion.choices[0]
    reply = (choice.message.content or "").strip()

    if not reply:
        # A reasoning model that spends its whole budget thinking returns empty
        # content with finish_reason="length" rather than an error.
        raise GroqServiceError(
            f"Groq returned empty content (model={model}, finish_reason={choice.finish_reason})."
        )

    return reply
