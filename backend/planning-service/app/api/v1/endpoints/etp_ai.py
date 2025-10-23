from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.llm.generator import generate_text

router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str

@router.post("/etp/generate")
def post_generate_text(request: GenerateRequest):
    """
    Generates text using the OpenAI API.
    """
    try:
        generated_text = generate_text(request.prompt)
        return {"generated_text": generated_text}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")
