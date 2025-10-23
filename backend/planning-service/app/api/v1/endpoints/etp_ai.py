from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.llm.chains.necessity_chain import get_necessity_chain

router = APIRouter()

class NecessityRequest(BaseModel):
    problem_description: str

@router.post("/etp/generate/necessity")
async def post_generate_necessity(request: NecessityRequest):
    """
    Generates the 'Justificativa da Necessidade' section of an ETP.
    """
    try:
        chain = get_necessity_chain()
        result = await chain.ainvoke({"problem_description": request.problem_description})
        return {"generated_text": result['text']}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
