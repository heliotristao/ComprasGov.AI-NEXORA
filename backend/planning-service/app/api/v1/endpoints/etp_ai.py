from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.llm.chains.necessity_chain import necessity_chain

router = APIRouter()

class NecessityRequest(BaseModel):
    problem_description: str

@router.post("/etp/generate/necessity")
async def post_generate_necessity(request: NecessityRequest):
    """
    Generates the 'Justificativa da Necessidade' section for an ETP
    based on a problem description.
    """
    try:
        input_data = {"problem_description": request.problem_description}
        result = await necessity_chain.ainvoke(input_data)
        return {"generated_text": result['text']}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred during text generation.")
