"""
Reply formatting for the chat widget.

The widget renders Sara's reply as plain text, so any markdown the model emits
shows up literally: a visitor asking about plot sizes was reading "**Residential
Plots**" with the asterisks on screen. The system prompt asks for plain text,
but models drift back to bold and bullet lists whatever it says, so the reply is
flattened here as well.
"""

import re

_BOLD_RE = re.compile(r"\*\*(.+?)\*\*", re.DOTALL)
_ITALIC_RE = re.compile(r"(?<!\*)\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\*)")
_UNDERSCORE_RE = re.compile(r"(?<![A-Za-z0-9_])__(.+?)__(?![A-Za-z0-9_])", re.DOTALL)
_HEADING_RE = re.compile(r"^\s{0,3}#{1,6}\s*", re.MULTILINE)
_BULLET_RE = re.compile(r"^(\s*)[-*+]\s+", re.MULTILINE)
_BLANK_RUN_RE = re.compile(r"\n{3,}")
_TRAILING_SPACE_RE = re.compile(r"[ \t]+$", re.MULTILINE)

BULLET = "•"


def strip_markdown(text: str) -> str:
    """
    Flatten markdown the chat window cannot render.

    Emphasis markers are removed and list markers become a bullet character,
    which reads correctly as plain text. Line structure is kept, since a list
    of plot sizes is easier to read one per line than run together.
    """
    if not text:
        return text

    out = _BOLD_RE.sub(r"\1", text)
    out = _UNDERSCORE_RE.sub(r"\1", out)
    out = _ITALIC_RE.sub(r"\1", out)
    out = _HEADING_RE.sub("", out)
    out = _BULLET_RE.sub(r"\1" + BULLET + " ", out)

    # Markdown pads lists with blank lines; in a chat bubble that reads as a gap.
    out = _TRAILING_SPACE_RE.sub("", out)
    out = _BLANK_RUN_RE.sub("\n\n", out)
    return out.strip()
