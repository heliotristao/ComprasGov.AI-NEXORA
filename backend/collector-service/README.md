# collector-service

## Responsabilidade

Este serviço é responsável pela aquisição de dados externos para a plataforma, atuando como o principal componente de ingestão de informações. Sua principal função é:

*   **Web Scraping:** Executa *scrapers* para extrair dados de fontes públicas, como o Portal Nacional de Contratações Públicas (PNCP), para alimentar o modelo de previsão de preços do Mercado.AI.

## Como Rodar Localmente

O serviço é containerizado e gerenciado pelo `docker-compose.yml` na raiz do projeto. Para subir o serviço:

```bash
docker compose up collector-service
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@host:port/db` |

## Como Rodar os Testes

Este serviço atualmente não possui uma suíte de testes automatizados.
