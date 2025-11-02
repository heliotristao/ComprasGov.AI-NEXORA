# api-gateway

## Responsabilidade

Este serviço funciona como o ponto de entrada único (`Single Point of Entry`) para todas as requisições externas destinadas aos microsserviços do backend. Suas principais responsabilidades são:

*   **Roteamento:** Encaminha as requisições para o serviço interno apropriado com base no caminho (`path`) da URL.
*   **Autenticação Centralizada:** Valida os tokens JWT de todas as requisições antes de repassá-las, garantindo que apenas usuários autenticados acessem o sistema.
*   **Rate Limiting:** Controla a taxa de requisições para proteger os serviços de sobrecarga.
*   **Logging Centralizado:** Registra todas as requisições recebidas em um local único para fins de auditoria e monitoramento.

## Como Rodar Localmente

O serviço é containerizado e gerenciado pelo `docker-compose.yml` na raiz do projeto. Para subir o serviço:

```bash
docker compose up api-gateway
```

O serviço estará disponível na porta `8000` do localhost, que é a porta principal de entrada da API.

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `GOVERNANCE_SERVICE_URL` | URL do serviço de governança para validar tokens. | `http://governance-service:8000` |
| `PLANNING_SERVICE_URL` | URL do serviço de planejamento. | `http://planning-service:8000` |
| `DATAHUB_SERVICE_URL` | URL do serviço de datahub. | `http://datahub-service:8000` |
| `NOTIFICATION_SERVICE_URL`| URL do serviço de notificação. | `http://notification-service:8000` |


## Como Rodar os Testes

Os testes são escritos com `pytest`. Para executá-los, utilize o seguinte comando a partir da raiz do projeto:

```bash
# Exporta o pythonpath para encontrar os módulos locais
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/api-gateway:$(pwd)/libs/nexora-auth

# Roda os testes do serviço
python -m pytest backend/api-gateway/tests/
```
