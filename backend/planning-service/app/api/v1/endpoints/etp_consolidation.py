import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud
from app.db import models
from app.schemas.etp_consolidation import ETPConsolidationJobCreate, ETPConsolidationJobStatus
from nexora_auth.decorators import require_scope
from app.api import deps
from app.tasks.consolidation_worker import consolidate_etp_task
from app.crud import crud_etp

router = APIRouter()

def get_etp_crud():
    return crud_etp

@router.post(
    "/etp/{id}/consolidate",
    response_model=ETPConsolidationJobStatus,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_scope("etp:write"))],
)
def consolidate_etp(
    id: uuid.UUID,
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    etp_crud = Depends(get_etp_crud)
):
    """
    Initiate an asynchronous ETP consolidation job.
    """
    etp = etp_crud.get(db, id=id)
    if not etp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ETP not found",
        )

    job_id = uuid.uuid4()
    db_obj = crud.etp_consolidation_job.create(
        db, obj_in=ETPConsolidationJobCreate(etp_id=id, job_id=job_id)
    )

    current_user_id = current_user.id

    consolidate_etp_task.delay(str(db_obj.job_id), str(etp.id), current_user_id)

    return {"job_id": db_obj.job_id, "status": "queued"}


@router.get(
    "/etp/{id}/consolidation-status/{job_id}",
    response_model=ETPConsolidationJobStatus,
    dependencies=[Depends(require_scope("etp:read"))],
)
def get_consolidation_status(
    id: uuid.UUID,
    job_id: uuid.UUID,
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    """
    Get the status of an ETP consolidation job.
    """
    job = crud.etp_consolidation_job.get_by_job_id(db, job_id=job_id)
    if not job or job.etp_id != id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consolidation job not found",
        )

    response = {"job_id": job.job_id, "status": job.status}

    if job.status == "done":
        response["artifact_id"] = job.artifact_id
        response["checksum_sha1"] = job.checksum_sha1
        # TODO: Construct download URL from datahub-service
        response["download_url"] = f"/api/v1/datahub/artifacts/{job.artifact_id}/download"

    return response
