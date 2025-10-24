from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.llm.chains.technical_specs_chain import get_technical_specs_chain
from langchain_core.runnables import Runnable

router = APIRouter()

class TechnicalSpecsRequest(BaseModel):
    object_description: str

@router.post("/tr/generate/technical-specs")
async def generate_technical_specs(
    request: TechnicalSpecsRequest,
    chain: Runnable = Depends(get_technical_specs_chain)
):
    """
    Generates the 'Technical Specifications of the Object' section for a Terms of Reference using RAG.
    """
    try:
        result = await chain.ainvoke(request.object_description)
        return {"technical_specs": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
