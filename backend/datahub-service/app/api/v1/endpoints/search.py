from fastapi import APIRouter, Query
from app.services.semantic_search import search_service

router = APIRouter()

@router.get("/")
def search_artifacts(
    q: str = Query(..., min_length=3, description="Text query for semantic search"),
):
    """
    Performs a semantic search for artifacts based on a text query.
    Returns a list of matching artifact versions and their similarity scores.
    """
    results = search_service.search(query_text=q)
    return {"query": q, "results": results}
