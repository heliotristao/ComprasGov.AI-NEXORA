from typing import List, Optional

from pydantic import BaseModel, Field, conint, constr


class NecessityPayload(BaseModel):
    description: constr(min_length=50) = Field(
        ...,
        title="Descrição da Necessidade",
        description="Detalhar a necessidade da contratação, considerando o problema a ser resolvido.",
    )
    priority: conint(ge=1, le=5) = Field(
        ..., title="Nível de Prioridade", description="Prioridade da contratação de 1 a 5."
    )


class SolutionComparisonPayload(BaseModel):
    solution_a: str = Field(..., title="Solução A")
    solution_b: str = Field(..., title="Solução B")
    comparison_criteria: List[str] = Field(
        ..., title="Critérios de Comparação", min_items=1
    )
    conclusion: str = Field(..., title="Conclusão da Comparação")


class CostEstimationPayload(BaseModel):
    item: str
    estimated_cost: float = Field(..., gt=0)
    source: str


class StepValidationError(BaseModel):
    loc: List[str]
    msg: str
    type: str


# Mapeamento de nomes de etapas para seus respectivos schemas de validação
step_validation_schemas = {
    "necessity": NecessityPayload,
    "solution_comparison": SolutionComparisonPayload,
    "cost_estimation": CostEstimationPayload,
}
