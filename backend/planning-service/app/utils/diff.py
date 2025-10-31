import difflib


def generate_diff(text_before: str, text_after: str) -> str:
    """
    Generates a simple text diff between two strings and truncates it to 2KB.
    """
    diff = difflib.unified_diff(
        text_before.split(),
        text_after.split(),
        fromfile='before',
        tofile='after',
    )
    diff_str = "\n".join(diff)
    return diff_str[:2048]
