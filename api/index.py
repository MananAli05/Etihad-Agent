"""
Vercel serverless entry point for the Sara backend.

Vercel exposes the ASGI `app` exported from this module. The FastAPI routes
still carry their /api prefix, and vercel.json rewrites every /api/* request
here, so paths line up with the local uvicorn server exactly.

backend/ stays the single source of truth; this only puts it on sys.path.
"""

import os
import sys

BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, os.path.abspath(BACKEND_DIR))

from main import app  # noqa: E402  (path setup must run first)

__all__ = ["app"]
