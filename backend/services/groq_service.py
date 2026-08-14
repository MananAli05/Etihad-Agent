import os
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
        )
        if completion.choices and len(completion.choices) > 0:
            return completion.choices[0].message.content.strip()
        else:
            raise GroqServiceError("Groq API returned an empty response.")
    except Exception as e:
        if isinstance(e, GroqServiceError):
            raise e
        raise GroqServiceError(f"Groq API Error: {str(e)}")
