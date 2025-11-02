from fastapi import BackgroundTasks
from app.services import catalog_service

def add_artifact_to_index(background_tasks: BackgroundTasks, artifact_id: str):
    """Adds a task to the background to index the given artifact."""
    background_tasks.add_task(catalog_service.index_artifact, artifact_id)
