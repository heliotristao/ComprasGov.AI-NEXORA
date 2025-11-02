from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app import crud
from app.db import models
from app.utils.diff import generate_diff

class TraceNotFoundError(Exception):
    """Custom exception for when a trace_id is not found or doesn't match."""
    pass

def accept_suggestion(
    db: Session,
    *,
    etp_id: int,
    section: str,
    user_id: int,
    acceptance_data: dict,
) -> models.etp_section_accepts.ETPSectionAccepts:
    """
    Orchestrates the process of accepting an AI suggestion for an ETP section.

    - Validates the trace_id.
    - Generates a diff.
    - Creates an acceptance record.
    - Updates the ETP document.
    """
    trace_id = acceptance_data.get("trace_id")
    new_content = acceptance_data.get("new_content")

    # 1. Validate trace_id
    trace = crud.etp_ai_trace.get(db, id=trace_id)
    if not trace or trace.etp_id != etp_id or trace.section_key != section:
        raise TraceNotFoundError(f"Invalid trace_id '{trace_id}' for etp_id '{etp_id}' and section '{section}'.")

    # 2. Load ETP and get old content
    etp = crud.etp.get(db, id=etp_id)
    if not etp:
        # This should ideally not happen if foreign keys are set up
        raise ValueError(f"ETP with id {etp_id} not found.")

    old_content = etp.data.get(section, {}).get("content", "")

    # 3. Generate diff
    diff_short = generate_diff(old_content, new_content)

    # 4. Create acceptance record
    accept_create_data = {
        "etp_id": etp_id,
        "section_key": section,
        "user_id": user_id,
        "trace_id": trace_id,
        "previous_content": old_content,
        "accepted_content": new_content,
        "diff_short": diff_short,
    }

    # B5.1 should have created this CRUD module.
    # Assuming it exists in crud.__init__ as `etp_section_accepts`
    created_acceptance = crud.etp_section_accepts.create(db, obj_in=accept_create_data)

    # 5. Update ETP document
    if section not in etp.data:
        etp.data[section] = {}
    etp.data[section]["content"] = new_content

    # Mark the JSONB field as modified to ensure it's saved
    flag_modified(etp, "data")

    db.add(etp)
    db.commit()
    db.refresh(etp)

    # 6. Return the new acceptance object
    return created_acceptance
