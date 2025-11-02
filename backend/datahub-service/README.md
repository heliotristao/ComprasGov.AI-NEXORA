# datahub-service

## Responsabilidade

Este microsserviço atua como o catálogo central de metadados e artefatos do sistema. Suas principais funções são:

*   **Armazenamento de Metadados:** Persiste informações sobre os documentos gerados (ETPs, TRs), como versão, hash de conteúdo (checksum) e localização.
*   **Catalogação Semântica:** Indexa os documentos para permitir buscas e análises futuras.
*   **Gerenciamento de Artefatos:** Lida com o armazenamento e recuperação dos arquivos de documentos (DOCX/PDF).

## Como Rodar Localmente

O serviço é containerizado e gerenciado pelo `docker-compose.yml` na raiz do projeto. Para subir o serviço:

```bash
docker compose up datahub-service
```

O serviço estará disponível na porta `8002` do localhost.

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@host:port/db` |
| `S3_BUCKET_NAME` | Nome do bucket S3 para armazenamento de artefatos. | `nexora-artifacts` |
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS. | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Chave de acesso secreta AWS. | `...` |
| `AWS_REGION` | Região da AWS onde o bucket está localizado. | `us-east-1` |

## Como Rodar os Testes

Os testes são escritos com `pytest`. Para executá-los, utilize o seguinte comando a partir da raiz do projeto:

```bash
# Exporta o pythonpath para encontrar os módulos locais
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/datahub-service:$(pwd)/libs/nexora-auth

# Roda os testes do serviço
python -m pytest backend/datahub-service/tests/
```
