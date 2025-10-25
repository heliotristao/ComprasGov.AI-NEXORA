# Auditoria de Deploy Vercel via GitHub

## Problemas identificados

1. **Sem pipeline GitHub→Vercel.** Antes da correção, os workflows (`ci-pipeline.yml`, `cd-backend.yml`, `cd-planning-service.yml`) limitavam-se a build/test do frontend e ao deploy dos serviços de backend na Render; nenhum passo chamava a API da Vercel ou o CLI oficial, o que deixava o deploy dependente de ações manuais na plataforma. Referências: `.github/workflows/ci-pipeline.yml`, linhas 1-24; `.github/workflows/cd-backend.yml`, linhas 1-19; `.github/workflows/cd-planning-service.yml`, linhas 1-19.
2. **Variáveis críticas ausentes na configuração.** O Next.js exige `NEXT_PUBLIC_API_URL` (ou equivalentes) para montar a base da API tanto no frontend quanto no route handler `src/app/api/governance/auth/token/route.ts`. O `vercel.json` original não declarava nenhum bloco `env` ou `build.env`, o que significava que um deploy automático via GitHub subia sem essas variáveis, resultando em erro 500 nas chamadas de autenticação. Referências: `vercel.json`, linhas 1-6; `src/lib/env.ts`, linhas 1-44; `src/app/api/governance/auth/token/route.ts`, linhas 1-77.

## Ações corretivas

- Criado o workflow `.github/workflows/cd-frontend-vercel.yml`, que instala o Vercel CLI, sincroniza a configuração com `vercel pull`, injeta `NEXT_PUBLIC_API_URL` a partir de `Secrets` e executa `vercel build` + `vercel deploy --prebuilt`, automatizando a entrega de produção para cada push em `main` que altera o frontend.
- Atualizado o `vercel.json` para referenciar o segredo `@next_public_api_url`, garantindo que tanto a etapa de build quanto as funções serverless tenham acesso à variável crítica de API.

## Testes realizados

Nenhum teste foi executado além da validação estática das configurações.
