# Dívidas Técnicas

## Dívidas Ativas

Nenhuma dívida ativa registrada.

## Dívidas Resolvidas

| Dívida | Motivo | Impacto | Tarefa Corretiva | Data de Resolução |
| ------ | ------ | ------- | ---------------- | ----------------- |
| F3-E5-MT2 – Ausência de auditoria OWASP ZAP e cabeçalhos de segurança padrão | Falta de processo automatizado para varredura DAST e respostas HTTP sem headers protetivos. | Risco de exposição a XSS, clickjacking e ausência de relatórios de segurança rastreáveis. | Implementação do script `scripts/run_security_audit.sh`, adição de cabeçalhos no API Gateway (FastAPI) e no Next.js, publicação de relatórios em `docs/security_reports`. | 2025-11-07 |
| F1-E0-MT11 – Geração automatizada do cliente OpenAPI | Falha na instalação do `openapi-typescript-codegen` impediu a geração automática do cliente TypeScript. | O pacote `@comprasgov/api-client` permaneceu com um placeholder sem tipagens reais. | F1-E0-MT11.1-EXTRA | 2025-11-07 |
