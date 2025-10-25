# Auditoria de Deploy Render via GitHub

## Problemas identificados

1. **Hook único para múltiplos serviços.** Os workflows `cd-backend.yml` e `cd-planning-service.yml` utilizam o mesmo segredo `RENDER_DEPLOY_HOOK` para acionar o Render. Deploy Hooks são específicos por serviço, logo o pipeline do `planning-service` hoje reaplica apenas o deploy do `governance-service`, deixando o `planning-service` sem entrega automatizada na Render. Referências: `.github/workflows/cd-backend.yml`, linhas 1-19; `.github/workflows/cd-planning-service.yml`, linhas 1-19; `render.yaml`, linhas 1-14.
2. **Blueprint cobre apenas o governance-service.** O arquivo `render.yaml` descreve somente o serviço `governance-service`; não há definição equivalente para o `planning-service`, embora exista um workflow dedicado a ele. Dessa forma, mesmo se um Deploy Hook específico fosse configurado, a Render não teria instruções para construir e publicar o `planning-service`. Referências: `render.yaml`, linhas 1-14.
3. **Container do planning-service ignora a porta dinâmica da Render.** O `Dockerfile` do `planning-service` fixa o parâmetro `--port 80` no comando do Uvicorn, enquanto a Render expõe o tráfego no valor da variável `$PORT` (tipicamente 10000). Sem ajustar o Dockerfile para consumir `PORT`, o serviço ficaria inacessível após o deploy. Referências: `backend/planning-service/Dockerfile`, linhas 1-8.

## Testes realizados

Nenhum teste foi executado. A validação foi interrompida após a identificação dos problemas acima.
