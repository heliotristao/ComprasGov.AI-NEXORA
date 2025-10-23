from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.llm.chains.quantities_timeline_chain import \
    get_quantities_timeline_chain
from app.llm.chains.solution_comparison_chain import \
    get_solution_comparison_chain
from app.llm.generator import generate_text

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str


class SolutionComparisonRequest(BaseModel):
    problem_description: str


class QuantitiesTimelineRequest(BaseModel):
    problem_description: str


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
    except Exception:
        raise HTTPException(
            status_code=500, detail="An unexpected error occurred."
        )


@router.post("/etp/generate/solution-comparison")
async def post_generate_solution_comparison(
    request: SolutionComparisonRequest
):
    """
    Generates the 'Comparative Analysis of Solutions' section for an ETP.
    """
    try:
        chain = get_solution_comparison_chain()
        input_data = {"problem_description": request.problem_description}
        result = await chain.ainvoke(input_data)
        return {"generated_text": result['text']}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )


@router.post("/etp/generate/quantities-timeline")
async def post_generate_quantities_timeline(
    request: QuantitiesTimelineRequest
):
    """
    Generates the 'Quantities and Timeline' section for an ETP.
    """
    try:
        chain = get_quantities_timeline_chain()
        input_data = {"problem_description": request.problem_description}
        result = await chain.ainvoke(input_data)
        return {"generated_text": result['text']}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )
