# Dívidas Técnicas

## F1-E0-MT11 – Geração automatizada do cliente OpenAPI
- **Motivo:** Não foi possível instalar a dependência `openapi-typescript-codegen` via `pnpm` devido a restrições de acesso ao registry NPM no ambiente de execução. Consequentemente, o comando `pnpm generate:api-client` não pôde gerar o código a partir do `openapi.json` do backend.
- **Impacto:** O pacote `@comprasgov/api-client` contém apenas um placeholder em `packages/api-client/src/index.ts`, impossibilitando o consumo real dos endpoints com tipagem automática.
- **Próximos Passos:** Habilitar o acesso ao registry, executar `pnpm install` para disponibilizar o binário `openapi` e rodar `pnpm generate:api-client` com o backend FastAPI ativo (`http://localhost:8000/openapi.json`). Substituir os placeholders pelos arquivos gerados automaticamente.
