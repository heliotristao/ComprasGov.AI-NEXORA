import os
import hashlib
from pathlib import Path
from typing import IO

STORAGE_BASE_PATH = Path("/var/planeja/tr_versions")


def store_file(file_stream: IO[bytes], file_name: str) -> tuple[str, str]:
    """
    Stores a file in the designated storage directory and calculates its SHA256 hash.

    Args:
        file_stream: A file-like object (in bytes) to be stored.
        file_name: The name of the file to be saved.

    Returns:
        A tuple containing the full path of the stored file and its SHA256 hash.
    """
    STORAGE_BASE_PATH.mkdir(parents=True, exist_ok=True)
    file_path = STORAGE_BASE_PATH / file_name

    sha256_hash = hashlib.sha256()

    # Reset stream position to the beginning
    file_stream.seek(0)

    with open(file_path, "wb") as f:
        while chunk := file_stream.read(4096):
            f.write(chunk)
            sha256_hash.update(chunk)

    # Reset stream position again after reading
    file_stream.seek(0)

    return str(file_path), sha256_hash.hexdigest()
