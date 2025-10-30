import re

def remove_extra_spaces(text: str) -> str:
    """Removes extra spaces from a string."""
    return " ".join(text.split())

def remove_line_breaks(text: str) -> str:
    """Removes line breaks from a string."""
    return text.replace("\n", " ").replace("\r", "")

def normalize_text(text: str) -> str:
    """
    Applies a series of normalization functions to a string.
    """
    if not isinstance(text, str):
        return text

    text = remove_line_breaks(text)
    text = remove_extra_spaces(text)
    return text.strip()
