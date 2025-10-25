# Auditoria de Deploy Render via GitHub

## Problemas identificados

1. **Hook único para múltiplos serviços.** Os workflows `cd-backend.yml` e `cd-planning-service.yml` utilizam o mesmo segredo `RENDER_DEPLOY_HOOK` para acionar o Render. Deploy Hooks são específicos por serviço, logo o pipeline do `planning-service` hoje reaplica apenas o deploy do `governance-service`, deixando o `planning-service` sem entrega automatizada na Render. Referências: `.github/workflows/cd-backend.yml`, linhas 1-19; `.github/workflows/cd-planning-service.yml`, linhas 1-19; `render.yaml`, linhas 1-14.

## Testes realizados

Nenhum teste foi executado. A validação foi interrompida após a identificação dos problemas acima.
