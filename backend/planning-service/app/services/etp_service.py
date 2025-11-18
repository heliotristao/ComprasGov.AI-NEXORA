import uuid
from typing import Any, Dict, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.crud import crud_etp
from app.db.models.etp import ETP


def _deep_merge(source: Dict, destination: Dict) -> Dict:
    """
    Recursively merges source dict into destination dict.
    - If a key in source has a None value, the key is removed from destination.
    - If a key exists in both and both values are dicts, they are merged recursively.
    - Otherwise, the value from source overwrites the value in destination.
    """
    for key, value in source.items():
        if isinstance(value, dict):
            # Get node or create one
            node = destination.setdefault(key, {})
            _deep_merge(value, node)
        elif value is None:
            if key in destination:
                del destination[key]
        else:
            destination[key] = value
    return destination


def perform_merge_patch(db: Session, *, etp_id: uuid.UUID, patch_data: Dict[str, Any]) -> ETP:
    """
    Performs a deep merge patch on the 'data' JSON field of an ETP document.

    Args:
        db: The database session.
        etp_id: The ID of the ETP to patch.
        patch_data: A dictionary containing the partial data to merge.

    Returns:
        The updated ETP object.

    Raises:
        HTTPException: If the ETP with the given ID is not found.
    """
    etp = crud_etp.get_etp(db=db, id=etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")

    # Ensure the 'data' field is a dictionary
    if etp.data is None:
        etp.data = {}

    # Perform the deep merge
    updated_data = _deep_merge(patch_data, etp.data.copy())
    etp.data = updated_data

    # Mark the JSON field as modified for SQLAlchemy
    flag_modified(etp, "data")

    # Persist the changes
    db.add(etp)
    db.commit()
    db.refresh(etp)

    return etp
