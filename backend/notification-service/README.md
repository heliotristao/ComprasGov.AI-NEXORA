# notification-service

## Responsabilidade

Este microsserviço é responsável por desacoplar e gerenciar o envio de todas as notificações da plataforma. Ele suporta múltiplos canais e provedores.

*   **Canais Suportados:** E-mail, Webhooks.
*   **Provedores:** Amazon SES para e-mails, `httpx` para webhooks customizados.
*   **Rastreabilidade:** Mantém um histórico de todas as notificações enviadas, incluindo status de entrega.

## Como Rodar Localmente

O serviço é containerizado e gerenciado pelo `docker-compose.yml` na raiz do projeto. Para subir o serviço:

```bash
docker compose up notification-service
```

O serviço estará disponível na porta `8003` do localhost.

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@host:port/db` |
| `AWS_REGION` | Região da AWS onde o serviço SES está configurado. | `us-east-1` |
| `SES_SENDER_EMAIL` | E-mail remetente para as notificações via SES. | `noreply@nexora.ai` |
| `AWS_ACCESS_KEY_ID` | Chave de acesso AWS. | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Chave de acesso secreta AWS. | `...` |

## Como Rodar os Testes

Os testes são escritos com `pytest`. Para executá-los, utilize o seguinte comando a partir da raiz do projeto:

```bash
# Exporta o pythonpath para encontrar os módulos locais
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/notification-service:$(pwd)/libs/nexora-auth

# Roda os testes do serviço
python -m pytest backend/notification-service/tests/
```
