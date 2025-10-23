from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.llm.chains.technical_specs_chain import get_technical_specs_chain
from langchain.chains import LLMChain

router = APIRouter()

class TechnicalSpecsRequest(BaseModel):
    problem_description: str

@router.post("/tr/generate/technical-specs")
async def generate_technical_specs(
    request: TechnicalSpecsRequest,
    chain: LLMChain = Depends(get_technical_specs_chain)
):
    """
    Generates the 'Technical Specifications of the Object' section for a Terms of Reference.
    """
    try:
        result = await chain.ainvoke({"problem_description": request.problem_description})
        return {"technical_specs": result['text']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
