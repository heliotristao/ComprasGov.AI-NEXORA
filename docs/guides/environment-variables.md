# Guia de Variáveis de Ambiente

Cada aplicativo (`backend`, `web` ) no monorepo requer um arquivo `.env` para configurar suas variáveis de ambiente.

## Como Configurar

1. Para cada aplicativo, copie o arquivo `.env.example` para um novo arquivo chamado `.env.local`.
   * Para o backend: `cp apps/backend/.env.example apps/backend/.env.local`
   * Para o frontend: `cp apps/web/.env.example apps/web/.env.local`

2. Abra cada arquivo `.env.local` e substitua os valores de exemplo pelas suas chaves e configurações locais.

**Importante:** O arquivo `.gitignore` global está configurado para ignorar todos os arquivos `.env*`, exceto os templates `.env.example`. **Nunca** commite seus arquivos `.env` ou `.env.local` contendo segredos.
