# governance-service

## Responsabilidade

Este serviço é a autoridade central de identidade e acesso da plataforma. Suas responsabilidades críticas incluem:

*   **Gestão de Usuários:** CRUD completo de usuários.
*   **Gestão de Funções (Roles):** Administração de papéis e permissões (RBAC - Role-Based Access Control).
*   **Autenticação:** Fornece o endpoint `/token` para autenticar usuários e emitir tokens JWT, atuando como o Provedor de Identidade (IdP) do sistema.
*   **Segurança:** Gerencia a lógica de hashing de senhas e a validação de credenciais.

## Como Rodar Localmente

O serviço é containerizado e gerenciado pelo `docker-compose.yml` na raiz do projeto. Para subir o serviço:

```bash
docker compose up governance-service
```

O serviço estará disponível na porta `8004` do localhost.

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o banco de dados PostgreSQL. | `postgresql://user:pass@host:port/db` |
| `SECRET_KEY` | Chave secreta para a assinatura dos tokens JWT. | `your-super-secret-key` |
| `ALGORITHM` | Algoritmo utilizado para a assinatura dos tokens JWT. | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiração (em minutos) para os tokens de acesso. | `30` |

## Como Rodar os Testes

Os testes são escritos com `pytest`. Para executá-los, utilize o seguinte comando a partir da raiz do projeto:

```bash
# Exporta o pythonpath para encontrar os módulos locais
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/governance-service:$(pwd)/libs/nexora-auth

# Roda os testes do serviço
python -m pytest backend/governance-service/tests/
```
