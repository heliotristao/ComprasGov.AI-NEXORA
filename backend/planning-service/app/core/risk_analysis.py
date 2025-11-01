from app.schemas.risk import Risk, RiskMatrix
from app.llm.chains.risk_analysis_chain import get_risk_analysis_chain
import json

# Placeholder for a more sophisticated rule engine
# In a real scenario, this could be a database or a more complex configuration file.
PREDEFINED_RULES = {
    "software": [
        {
            "risk_description": "Supplier Lock-in",
            "probability": "Medium",
            "impact": "High",
            "mitigation_measure": "Ensure contract includes data export clauses and use open standards where possible.",
        },
        {
            "risk_description": "Integration issues with existing systems",
            "probability": "High",
            "impact": "Medium",
            "mitigation_measure": "Conduct a thorough technical analysis and require a proof of concept before full implementation.",
        },
    ],
    "hardware": [
        {
            "risk_description": "Atraso na entrega",
            "probability": "Medium",
            "impact": "Medium",
            "mitigation_measure": "Estabelecer multas contratuais por atraso e ter fornecedores alternativos mapeados.",
        },
    ],
}


async def generate_risk_matrix(description: str) -> RiskMatrix:
    """
    Generates a risk matrix by combining predefined rules and an LLM-based analysis.
    """
    risks = []

    # 1. Apply predefined rules
    for keyword, predefined_risks in PREDEFINED_RULES.items():
        if keyword in description.lower():
            for risk_data in predefined_risks:
                risks.append(Risk(**risk_data))

    # 2. Augment with LLM-based generation
    try:
        chain = get_risk_analysis_chain()
        llm_output = await chain.ainvoke({"description": description})
        if "risks" in llm_output and isinstance(llm_output["risks"], list):
            for risk_data in llm_output["risks"]:
                risks.append(Risk(**risk_data))
    except Exception as e:
        # Handle potential errors from the LLM response
        print(f"Error processing LLM response: {e}")

    return RiskMatrix(risks=risks)
