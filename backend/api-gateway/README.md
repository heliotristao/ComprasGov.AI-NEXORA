# API Gateway

## Arquitetura

Este serviço atua como o ponto de entrada único para a plataforma NEXORA, utilizando uma arquitetura baseada em **Traefik** como proxy reverso e um serviço auxiliar FastAPI para lógica de autenticação.

O fluxo de uma requisição é o seguinte:
1.  O Traefik recebe a requisição HTTP.
2.  Ele aplica middlewares, como o de **Rate Limiting**.
3.  Utiliza o mecanismo de **Forward Authentication**: a requisição é pausada e uma sub-requisição é enviada para o serviço `api-gateway` (`/auth`).
4.  O `api-gateway` valida o token JWT da requisição original.
    *   Se válido, retorna `200 OK` e passa os dados do usuário (ID, roles, etc.) em headers (`X-User-ID`, `X-User-Roles`).
    *   Se inválido, retorna `401 Unauthorized`, e o Traefik bloqueia a requisição.
5.  Com a autenticação validada, o Traefik encaminha a requisição original, enriquecida com os headers de usuário, para o microsserviço de backend correspondente (`planning-service`, `datahub-service`, etc.).

## Roteamento

O roteamento é configurado diretamente no `docker-compose.yml` através de labels do Traefik. A convenção de roteamento é baseada no path da URL:

| Rota | Microsserviço de Destino | Autenticação |
| :--- | :--- | :--- |
| `/api/v1/planning/*` | `planning-service` | ✅ Obrigatória |
| `/api/v1/datahub/*` | `datahub-service` | ✅ Obrigatória |
| `/api/v1/governance/*`| `governance-service` | ✅ Obrigatória |
| `/api/v1/governance/token` | `governance-service` | ❌ Pública |
| `/api/v1/governance/.well-known/jwks.json` | `governance-service` | ❌ Pública |

## Execução Local

O serviço é parte integrante do `docker-compose.yml` na raiz do projeto. Para iniciar todo o ambiente, incluindo o gateway:

```bash
docker compose up
```

O gateway estará escutando na porta `80`, e o painel de controle do Traefik estará disponível em `http://localhost:8080`.

## Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
| :--- | :--- | :--- |
| `GOVERNANCE_JWKS_URL` | URL para buscar as chaves públicas (JWKS) para validar os tokens JWT. | `http://governance-service:8000/.well-known/jwks.json` |

## Testes

Para executar os testes unitários do serviço de autenticação, utilize o comando abaixo a partir da raiz do projeto:

```bash
# Adiciona o diretório do serviço e das bibliotecas ao PYTHONPATH
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend/api-gateway:$(pwd)/libs/nexora-auth

# Executa os testes
python -m pytest backend/api-gateway/tests/
```
