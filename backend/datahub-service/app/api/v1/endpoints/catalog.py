from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.services import catalog_service

router = APIRouter()

@router.get("/search")
def search(
    *,
    db: Session = Depends(deps.get_db),
    q: str,
    semantic: bool = True,
):
    """
    Search for artifacts.
    """
    results = catalog_service.search_artifacts(query=q, semantic=semantic)
    return results

@router.post("/reindex")
def reindex_artifacts(
    *,
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    artifact_id: str = None,
):
    """
    Re-index all artifacts or a specific artifact.
    """
    # This is a stub. In a real implementation, we would have logic
    # to re-index all artifacts or a specific one.
    return {"message": "Re-indexing triggered."}
