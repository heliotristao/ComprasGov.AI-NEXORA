# Auditoria de Deploy Render via GitHub

## Problemas identificados

1. **Hook único para múltiplos serviços.** Antes da correção, os workflows `cd-backend.yml` e `cd-planning-service.yml` utilizavam o mesmo segredo `RENDER_DEPLOY_HOOK` para acionar o Render. Deploy Hooks são específicos por serviço, logo o pipeline do `planning-service` reaplicava apenas o deploy do `governance-service`, deixando o `planning-service` sem entrega automatizada na Render. Referências: `.github/workflows/cd-backend.yml`, linhas 1-19; `.github/workflows/cd-planning-service.yml`, linhas 1-19; `render.yaml`, linhas 1-14.
2. **Blueprint cobria apenas o governance-service.** O arquivo `render.yaml` descrevia somente o serviço `governance-service`; não havia definição equivalente para o `planning-service`, embora existisse um workflow dedicado a ele. Dessa forma, mesmo se um Deploy Hook específico fosse configurado, a Render não tinha instruções para construir e publicar o `planning-service`. Referências: `render.yaml`, linhas 1-14.
3. **Container do planning-service ignorava a porta dinâmica da Render.** O `Dockerfile` do `planning-service` fixava o parâmetro `--port 80` no comando do Uvicorn, enquanto a Render expõe o tráfego no valor da variável `$PORT` (tipicamente 10000). Sem ajustar o Dockerfile para consumir `PORT`, o serviço ficava inacessível após o deploy. Referências: `backend/planning-service/Dockerfile`, linhas 1-8.

## Ações corretivas

- Atualizados os workflows `cd-backend.yml` e `cd-planning-service.yml` para consumirem, respectivamente, os segredos `RENDER_GOVERNANCE_DEPLOY_HOOK` e `RENDER_PLANNING_DEPLOY_HOOK`, com validação explícita para evitar execuções silenciosas quando o segredo não estiver configurado.
- Expandido o `render.yaml` com a definição do serviço `planning-service`, mantendo o modo Docker e declarando as variáveis de ambiente necessárias para conexão ao banco e secret management.
- Ajustado o `backend/planning-service/Dockerfile` para respeitar o `PORT` provido pela Render (com fallback para 8000), alinhando o comportamento ao container do `governance-service`.

## Testes realizados

Nenhum teste foi executado além da validação estática das configurações.
