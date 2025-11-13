# Risco.AI – Matriz de Risco Preditiva

O módulo **Risco.AI** utiliza um modelo de classificação baseado em **Random Forest** (scikit-learn), treinado a partir de dados históricos das ETPs e dados sintéticos regulados, para estimar a probabilidade de falhas contratuais. O resultado é armazenado na tabela `risk_analysis` e pode ser consultado via API REST. As contribuições SHAP são extraídas diretamente das árvores do ensemble.

## Interpretação do Score

| Score Global | Categoria | Significado | Probabilidade | Impacto |
|--------------|-----------|-------------|---------------|---------|
| 0 – 24       | Baixo     | Contratação estável; riscos residuais mínimos. | 1 | 2 |
| 25 – 49      | Médio     | Há pontos de atenção, recomenda-se monitoramento padrão. | 2 | 3 |
| 50 – 74      | Alto      | Falhas prováveis; mitigações devem ser planejadas. | 4 | 4 |
| 75 – 100     | Crítico   | Forte tendência de atraso/aditivo; exige plano de ação imediato. | 5 | 5 |

- **Probabilidade** e **Impacto** são utilizados para construir a matriz 5x5 de calor (1 = muito baixo, 5 = extremo).
- **Fatores principais** representam as cinco variáveis com maior contribuição SHAP para o score do ETP analisado.
- **Recomendações** são geradas automaticamente com base na categoria e nos fatores predominantes.

## Endpoints Disponíveis

- `POST /api/v1/risco/analisar` – recebe `etp_id` e retorna a última análise (ou calcula uma nova quando `force_refresh=true`).
- `GET /api/v1/risco/matriz` – consolida todas as análises na matriz de calor 5x5 e retorna a distribuição das categorias.

Cada análise bem sucedida gera o evento Kafka `planejamento.risco.calculado`, permitindo integração com outros módulos da suíte Planeja.AI.
