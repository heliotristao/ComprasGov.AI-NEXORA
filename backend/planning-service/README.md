# planning-service

## Responsabilidade

Este microsserviço é o coração do sistema de planejamento de contratações, responsável por gerenciar todo o ciclo de vida dos seguintes documentos:

*   **ETP (Estudo Técnico Preliminar):** Criação, validação, aprovação e gestão.
*   **TR (Termo de Referência):** Criação (inclusive automática a partir de um ETP), gestão e consolidação.
*   **Integrações de IA:** Orquestração de chamadas a modelos de linguagem (LLMs) para geração de conteúdo e RAG (Retrieval-Augmented Generation).

## Como Rodar Localmente

O serviço é containerizado e gerenciado pelo `docker-compose.yml` na raiz do projeto. Para subir o serviço:

```bash
docker compose up planning-service
```

O serviço estará disponível na porta `8001` do localhost.

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@host:port/db` |
| `OPENAI_API_KEY` | Chave da API da OpenAI para as funcionalidades de IA. | `sk-xxxxxxxx` |
| `JWT_SECRET_KEY`| Chave secreta para validação de tokens JWT | `your-secret-key`|
| `JWT_ALGORITHM`| Algoritmo de criptografia para tokens JWT | `HS256`|
| `MILVUS_HOST` | Host da base de vetores Milvus | `milvus` |
| `MILVUS_PORT`| Porta da base de vetores Milvus | `19530`|


## Como Rodar os Testes

Os testes são escritos com `pytest`. Para executá-los, utilize o seguinte comando a partir da raiz do projeto:

```bash
# Exporta o pythonpath para encontrar os módulos locais
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/planning-service:$(pwd)/libs/nexora-auth

# Roda os testes do serviço
python -m pytest backend/planning-service/tests/
```
