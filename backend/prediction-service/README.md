# prediction-service (Mercado.AI)

## Responsabilidade

Este serviço abriga o motor de inteligência de mercado da plataforma, o **Mercado.AI**. Suas funções são:

*   **Treinamento de Modelo:** Contém a lógica para treinar um modelo de Machine Learning com os dados coletados pelo `collector-service`.
*   **Servir Predições:** Expõe um endpoint de API para que outros serviços (como o `planning-service`) possam consultar estatísticas e predições de preços para itens de licitação.

## Como Rodar Localmente

O serviço é containerizado e gerenciado pelo `docker-compose.yml` na raiz do projeto. Para subir o serviço:

```bash
docker compose up prediction-service
```

O serviço estará disponível na porta `8005` do localhost.

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@host:port/db` |
| `MODEL_PATH`   | Caminho interno no container para o artefato do modelo treinado. | `/app/ml/models/price_predictor.joblib` |

## Como Rodar os Testes

Os testes são escritos com `pytest`. Para executá-los, utilize o seguinte comando a partir da raiz do projeto:

```bash
# Exporta o pythonpath para encontrar os módulos locais
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/prediction-service

# Roda os testes do serviço
python -m pytest backend/prediction-service/tests/
```

## Exemplos de API

Para consultar estatísticas de preço para um item, utilize o endpoint `/api/v1/market/price-stats`:

```bash
# Exemplo para "Caneta Esferográfica"
curl -X GET "http://localhost:8005/api/v1/market/price-stats?query=Caneta%20Esferogr%C3%A1fica"

# Exemplo para "Monitor"
curl -X GET "http://localhost:8005/api/v1/market/price-stats?query=Monitor"
```
