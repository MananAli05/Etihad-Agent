import os
import re
from typing import List, Dict

KNOWLEDGE_BASE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "knowledge_base",
    "etihad_garden.md"
)

class KnowledgeBaseService:
    def __init__(self, file_path: str = KNOWLEDGE_BASE_PATH):
        self.file_path = file_path
        self.sections: List[Dict[str, str]] = []
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        if not os.path.exists(self.file_path):
            self.sections = []
            return

        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Split content by markdown level 1 headings (# Title)
            raw_sections = re.split(r'\n(?=# )', content)
            parsed_sections = []

            for sec in raw_sections:
                sec = sec.strip()
                if not sec or sec.startswith("<!--"):
                    continue

                lines = sec.split("\n", 1)
                title = lines[0].replace("#", "").strip()
                body = lines[1].strip() if len(lines) > 1 else ""
                parsed_sections.append({
                    "title": title,
                    "content": sec
                })

            self.sections = parsed_sections
        except Exception as e:
            print(f"Error loading knowledge base: {e}")
            self.sections = []

    def retrieve_relevant_context(self, user_query: str, max_sections: int = 4) -> str:
        """
        Lightweight keyword & semantic relevance search across knowledge base sections.
        """
        if not self.sections:
            self._load_knowledge_base()
            if not self.sections:
                return "Etihad Garden overview and contact details."

        query_lower = user_query.lower()
        words = re.findall(r'\w+', query_lower)

        # Keyword mapping for common English/Urdu/Roman Urdu terms
        keyword_aliases = {
            "price": ["price", "prices", "cost", "rate", "kimat", "keemat", "paisa", "paisa", "rupees", "pkr", "lakh", "lakhs", "crore"],
            "payment": ["payment", "installment", "kist", "kistein", "plan", "downpayment", "down payment", "booking"],
            "plot": ["plot", "plots", "marla", "kanal", "size", "sizes", "residential", "commercial"],
            "location": ["location", "kahan", "address", "map", "airport", "hospital", "sheikh zayed", "road", "rahim yar khan", "ryk"],
            "phase": ["phase", "phase 1", "phase 2", "phase 3", "block"],
            "contact": ["contact", "phone", "number", "email", "office", "rabta", "call", "whatsapp", "address"],
            "site visit": ["visit", "site", "daura", "dekhna", "tour", "appointment"],
            "facility": ["facility", "facilities", "amenities", "mosque", "park", "security", "electricity", "water", "gas"],
        }

        scored_sections = []
        for sec in self.sections:
            title_lower = sec["title"].lower()
            content_lower = sec["content"].lower()
            score = 0

            # Match title
            for word in words:
                if len(word) > 2:
                    if word in title_lower:
                        score += 5
                    if word in content_lower:
                        score += 1

            # Match alias groups
            for key, aliases in keyword_aliases.items():
                if any(alias in query_lower for alias in aliases):
                    if key in title_lower or any(alias in title_lower for alias in aliases):
                        score += 4
                    if any(alias in content_lower for alias in aliases):
                        score += 2

            scored_sections.append((score, sec))

        # Sort by score descending
        scored_sections.sort(key=lambda x: x[0], reverse=True)

        # Pick top matching sections
        selected_sections = [sec for score, sec in scored_sections[:max_sections] if score > 0]

        # If no strong match, include Overview and Contact Information by default
        if not selected_sections:
            default_titles = ["Etihad Garden Overview", "Contact Information", "Property Types", "Plot Sizes"]
            selected_sections = [sec for sec in self.sections if sec["title"] in default_titles]

        context_blocks = [sec["content"] for sec in selected_sections]
        return "\n\n".join(context_blocks)


# Singleton instance for easy import
kb_service = KnowledgeBaseService()

def retrieve_context(query: str) -> str:
    return kb_service.retrieve_relevant_context(query)
