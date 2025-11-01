import pytest
from unittest.mock import patch, AsyncMock
from app.core.risk_analysis import generate_risk_matrix
from app.schemas.risk import RiskMatrix

# Mock LLM response for consistent testing
mock_llm_output = {
    "risks": [
        {
            "risk_description": "Mocked LLM Risk 1",
            "probability": "Baixa",
            "impact": "Alto",
            "mitigation_measure": "Mocked Mitigation 1",
        },
        {
            "risk_description": "Mocked LLM Risk 2",
            "probability": "Média",
            "impact": "Médio",
            "mitigation_measure": "Mocked Mitigation 2",
        },
    ]
}

@pytest.mark.asyncio
@patch("app.core.risk_analysis.get_risk_analysis_chain")
async def test_generate_risk_matrix_with_matching_keyword(mock_get_risk_chain):
    """
    Tests that the risk matrix generation correctly combines predefined rules
    and LLM-generated risks when a keyword is found.
    """
    mock_chain = AsyncMock()
    mock_chain.ainvoke.return_value = mock_llm_output
    mock_get_risk_chain.return_value = mock_chain

    description = "Acquisition of new software licenses."
    risk_matrix = await generate_risk_matrix(description)

    assert isinstance(risk_matrix, RiskMatrix)
    # 2 software rules + 2 LLM risks
    assert len(risk_matrix.risks) == 4

    risk_descriptions = [risk.risk_description for risk in risk_matrix.risks]
    assert "Supplier Lock-in" in risk_descriptions
    assert "Mocked LLM Risk 1" in risk_descriptions
    mock_chain.ainvoke.assert_called_once_with({"description": description})


@pytest.mark.asyncio
@patch("app.core.risk_analysis.get_risk_analysis_chain")
async def test_generate_risk_matrix_without_matching_keyword(mock_get_risk_chain):
    """
    Tests that the risk matrix generation only returns the LLM-based risks
    when no keywords from predefined rules are matched.
    """
    mock_chain = AsyncMock()
    mock_chain.ainvoke.return_value = mock_llm_output
    mock_get_risk_chain.return_value = mock_chain

    description = "Purchase of office supplies."
    risk_matrix = await generate_risk_matrix(description)

    assert isinstance(risk_matrix, RiskMatrix)
    # Only the 2 LLM risks should be present
    assert len(risk_matrix.risks) == 2

    risk_descriptions = [risk.risk_description for risk in risk_matrix.risks]
    assert "Supplier Lock-in" not in risk_descriptions
    assert "Mocked LLM Risk 2" in risk_descriptions
    mock_chain.ainvoke.assert_called_once_with({"description": description})
