# NEXORA-ComprasGov.AI - O Sistema Operacional para Contratações Públicas

**Status:** Fase 0 - Setup

---

## 1. Visão Estratégica
Plataforma SaaS B2G que utiliza IA para revolucionar o ciclo de contratações públicas no Brasil.

## 2. Arquitetura e Tech Stack
* **Frontend:** Next.js, TypeScript, Tailwind CSS, Shadcn/ui
* **Backend:** Python (FastAPI), Go (Gin)
* **Infraestrutura:** Terraform, Kubernetes (EKS), Docker
* **CI/CD:** GitHub Actions

## 3. Diretrizes de Desenvolvimento
* **Backend e Infraestrutura:** Consulte JULES.MD.
* **Frontend:** Consulte CODEX.MD.

## 4. Importação do Blueprint na Render
Ao importar o blueprint da Render, o campo de repositório não é preenchido automaticamente. Utilize uma das opções abaixo para apontar o blueprint para o seu clone ou fork:

1. Durante a etapa "Connect repository" da importação, selecione manualmente o repositório correto na sua conta da Render.
2. Alternativamente, antes da importação, defina a variável de ambiente **RENDER_REPO_URL** no Render com a URL completa do seu repositório. O blueprint utilizará esse valor para o campo `repo`.

> Caso esteja usando um fork, confirme que a URL informada corresponde ao fork desejado antes de concluir a importação.

## 5. Histórico Técnico de Alterações
* **[2025-10-25] - Tarefa FIX-016:** Corrigida a ausência da rota de autenticação `POST /token` no `governance-service`, resolvendo o erro 404 no login.
* **[2025-10-25] - Tarefa FIX-015:** Ajustado o path da chamada de API de autenticação no frontend para corresponder à rota exposta pelo backend, resolvendo o erro 404.
* **[2025-10-25] - Tarefa DEVOPS-PROD-02:** Limpeza do pipeline de CI/CD do backend, removendo passos legados de autenticação da AWS.
* **[2025-10-25] - Tarefa FIX-014:** Configurada a política de CORS nos serviços de backend para permitir requisições do frontend em produção, resolvendo o bloqueio de comunicação.
* **[2025-10-25] - Tarefa OPS-PROD-002:** Corrigida a variável de ambiente `NEXT_PUBLIC_API_URL` no Vercel para incluir o prefixo `/api/v1`, resolvendo a falha de comunicação do frontend em produção.
* **[2025-10-25] - Tarefa OPS-PROD-002:** Corrigida a configuração de deploy do Vercel para remover a referência a um "Secret" inexistente.
* **[2025-10-25] - Tarefa DEVOPS-PROD-01:** Unificado e corrigido o processo de CI/CD. Deploys para Render (backend) e Vercel (frontend) agora são automatizados via GitHub Actions de forma segura.
* **[2025-10-24] - Tarefa INFRA-PROD-03R:** Realizado o deploy do 'planning-service' na plataforma Render.com.
* **[2025-10-24] - Tarefa INFRA-PROD-02R:** Realizado o deploy do 'governance-service' na plataforma Render.com.
* **[2025-10-24] - Tarefa FIX-012:** Corrigida a comunicação de rede entre o frontend e os serviços de backend no ambiente Docker.
* **[2025-10-24] - Tarefa EXTRA-005:** Implementado um mecanismo de "upsert" para garantir a existência do usuário Master padrão.
* **[2025-10-24] - Tarefa FRONTEND-P-13:** Implementado sistema de notificações (toasts) para feedback de ações do usuário.
* **[2025-10-24] - Tarefa EXTRA-004:** Implementado o seeding inicial das Funções (Roles) e do primeiro usuário Master.
* **[2025-10-24] - Tarefa FRONTEND-P-12:** Gerado o código-fonte para a funcionalidade de exclusão de usuários com modal de confirmação.
* **[2025-10-24] - Tarefa FRONTEND-P-11:** Gerado o código-fonte para o formulário de criação e edição de usuários.
* **[2025-10-24] - Tarefa BACKEND-P-06:** Implementada a lógica de autorização (RBAC) para proteger os endpoints da API.
* **[2025-10-24] - Tarefa BACKEND-P-05:** Criados os endpoints da API para o gerenciamento de Funções e suas associações com usuários.
* **[2025-10-24] - Tarefa BACKEND-P-04:** Criados os endpoints da API (CRUD) para o gerenciamento de usuários.
* **[2025-10-24] - Tarefa DB-P-02:** Criados os modelos de dados no banco de dados para suportar o sistema de Funções (RBAC).
* **[2025-10-24] - Tarefa INFRA-009:** Criado o Provedor de Identidade OIDC da AWS via Terraform para habilitar a autenticação dos pipelines.
* **[2025-10-24] - Tarefa FIX-010:** Sincronizada a regra de validação de senha entre o backend e o frontend.
* **[2025-10-24] - Tarefa IA-P-14:** Implementada a técnica de RAG na cadeia de IA para as 'Especificações Técnicas' do TR.
* **[2025-10-24] - Tarefa IA-P-13:** Implementada a técnica de RAG na cadeia de IA para a 'Viabilidade Técnica'.
* **[2025-10-24] - Tarefa FIX-009:** Corrigida a configuração de `build` no `vercel.json` para apontar para `next.config.mjs`, resolvendo o erro 404.
* **[2025-10-24] - Tarefa FIX-008:** Corrigido o caminho do script de seeding no pipeline de CI do `governance-service`.
* **[2025-10-24] - Tarefa FIX-007:** Corrigida a falha de build do Next.js renomeando o arquivo de configuração.
* **[2025-10-24] - Tarefa FIX-006:** Corrigido o erro 404 na Vercel através da configuração do `vercel.json`.
* **[2025-10-23] - Tarefa EXTRA-003 (Rev. 2):** Recriado o script de linha de comando para a criação de usuários administradores.
* **[2025-10-24] - Tarefa FIX-004 (Rev. 2):** Padronizada a autenticação OIDC em todos os pipelines de CI/CD.
* **2025-10-24 - Tarefa IA-P-05 (Rev. 2):** Recriada a cadeia de IA para gerar a seção 'Justificativa da Necessidade' do ETP.
* **2025-10-24 - Tarefa EXTRA-002 (Rev. 2):** Padronizado o formato de data em todo o histórico de alterações do README.
* **2025-10-24 - Tarefa GOV-005:** Formalizada a obrigatoriedade de permissões OIDC nos padrões de engenharia.
* **2025-10-24 - Tarefa FIX-005:** Corrigida falha de permissão OIDC no pipeline do 'planning-service'.
* **2025-10-24 - Tarefa IA-P-10:** Configurada a infraestrutura de Vector Store (Milvus) para o sistema de RAG.
* **2025-10-23 - Tarefa FRONTEND-P-09:** Implementada a persistência de dados (carregar e salvar) na página do Termo de Referência.
* **2025-10-23 - Tarefa FRONTEND-P-08:** Implementado o botão 'Salvar Progresso' para persistência incremental do ETP.
* **2025-10-23 - Tarefa BACKEND-P-02:** Implementado o endpoint de atualização (PATCH) para salvar o progresso dos planejamentos.
* **2025-10-23 - Tarefa FRONTEND-P-07:** Implementado o botão 'Gerar com IA' para a seção 'Especificações Técnicas' do TR.
* **2025-10-23 - Tarefa FRONTEND-P-06:** Criada a página e a navegação para o módulo de Termo de Referência (TR).
* **2025-10-23 - Tarefa FRONTEND-P-05:** Implementado o botão 'Gerar com IA' para a seção 'Viabilidade Técnica'.
* **2025-10-23 - Tarefa IA-P-09:** Criada a cadeia de IA para gerar a seção 'Especificações Técnicas' do TR.
* **2025-10-23 - Tarefa IA-P-08:** Criada a cadeia de IA para gerar a seção 'Viabilidade Técnica' do ETP.
* **2025-10-23 - Tarefa IA-P-07:** Criada a cadeia de IA para gerar a seção 'Quantitativos e Cronograma' do ETP.
* **2025-10-23 - Tarefa IA-P-06:** Criada a cadeia de IA para gerar a seção 'Comparativo de Soluções' do ETP.
* **2025-10-23 - Tarefa FRONTEND-P-02:** Implementado o botão 'Gerar com IA' no formulário de ETP, conectando a UI à API de geração de texto.
* **2025-10-23 - Tarefa IA-P-04:** Integrada a fundação de IA Generativa (LangChain) ao 'planning-service'.
* **2025-10-23 - Tarefa IA-P-03 (Rev):** Integrada a funcionalidade de previsão de preços (Mercado.AI) ao 'planning-service'.
* **2025-10-23 - Tarefa IA-P-01:** Criado ocollector-servicecom um web scraper para extrair dados de preços do PNCP.
* **2025-10-23 - Tarefa IA-P-02:** Implementada a persistência dos dados de preços de mercado no banco de dados.
* **2025-10-23 - Tarefa FRONTEND-P-01:** Expandido o formulário de criação de planejamento com campos detalhados do ETP.
* **2025-10-23 - Tarefa BACKEND-P-01:** Expandido o modelo de dados doplanning-servicepara uma estrutura de ETP mais detalhada.
* **2025-10-23 - Tarefa BACKEND-012:** Implementado o endpoint de WebSocket no 'dispute-service' em Go.
* **2025-10-23 - Tarefa BACKEND-011:** Criada a estrutura de boilerplate em Go para o 'dispute-service'.
* **2025-10-23 - Tarefa COMPOSE-001:** Criado o arquivo docker-compose.yml para orquestrar o ambiente de desenvolvimento.
* **2025-10-23 - Tarefa BACKEND-010:** Refatorado o endpoint de listagem de planejamentos para ler os dados do banco de dados.
* **2025-10-22 - Tarefa BACKEND-009:** Refatorado o endpoint de criação de planejamentos para persistir os dados no banco de dados.
* **2025-10-22 - Tarefa BACKEND-008:** Refatorado o endpoint de autenticação para validar usuários contra o banco de dados.
* **2025-10-23 - Tarefa DB-002:** Configurado o Alembic para gerenciamento de migrações de banco de dados nos serviços de backend.
* **2025-10-22 - Tarefa DB-001:** Provisionada a instância de banco de dados PostgreSQL (RDS) via Terraform.
* **2025-10-23 - Tarefa FRONTEND-009:** Conectado o formulário de criação de planejamento ao endpoint da API.
* **2025-10-22 - Tarefa FRONTEND-008:** Conectada a tabela de listagem de planejamentos ao endpoint da API.
* **2025-10-22 - Tarefa BACKEND-007:** Implementado o endpoint de listagem de planejamentos no 'planning-service'.
* **2025-10-22 - Tarefa INFRA-008:** Configurado o provedor de identidade OIDC e a IAM Role para permitir que o GitHub Actions se autentique na AWS de forma segura.
* **2025-10-22 - Tarefa BACKEND-006:** Implementado o endpoint de criação de novos planejamentos no 'planning-service'.
* **2025-10-22 - Tarefa CD-002:** Criado o pipeline de Implantação Contínua no GitHub Actions para o 'planning-service'.
* **2025-10-22 - Tarefa CI-004:** Criado o repositório no Amazon ECR para o 'planning-service' via Terraform.
* **2025-10-22 - Tarefa CI-003:** Criado o pipeline de Integração Contínua no GitHub Actions para o 'planning-service'.
* **2025-10-22 - Tarefa BACKEND-005:** Criados os manifestos Kubernetes (Deployment, Service, Ingress) para o 'planning-service'.
* **2025-10-22 - Tarefa BACKEND-004:** Criada a estrutura de boilerplate inicial para o microsserviço 'planning-service'.
* **2025-10-22 - Tarefa BACKEND-003:** Implementado o endpoint de autenticação com geração de token JWT no 'governance-service'.
* **2025-10-22 - Tarefa CD-001:** Criado o pipeline de Implantação Contínua no GitHub Actions para o 'governance-service'.
* **2025-10-22 - Tarefa CI-002:** Criado o repositório no Amazon ECR para o 'governance-service' via Terraform.
* **2025-10-22 - Tarefa CI-001:** Criado o pipeline de Integração Contínua no GitHub Actions para o 'governance-service'.
* **2025-10-22 - Tarefa SETUP-002:** Repositório populado com estrutura de diretórios e arquivos de governança.
* **2025-10-22 - Tarefa GOV-003:** Aprimoradas as diretrizes de engenharia com foco em segurança, qualidade e performance.
* **2025-10-22 - Tarefa FIX-002:** Corrigido o pipeline de CI para operar no diretório /src.
* **2025-10-22 - Tarefa RECOVERY-001:** Re-inicializada a estrutura do projeto Next.js no diretório /src.
* **2025-10-22 - Tarefa EXTRA-001:** Instaladas as dependências essenciais do frontend (Zustand, TanStack Query, Shadcn/ui).
* **2025-10-22 - Tarefa INFRA-001:** Criado script Terraform para a VPC base.
* **2025-10-22 - Tarefa INFRA-002:** Criado script Terraform para as sub-redes públicas e privadas.
* **2025-10-22 - Tarefa INFRA-003:** Criado script Terraform para provisionar o Internet Gateway e o NAT Gateway da rede.
* **2025-10-22 - Tarefa INFRA-004:** Criado script Terraform para configurar as tabelas de roteamento das sub-redes públicas e privadas.
* **2025-10-22 - Tarefa INFRA-005:** Criado script Terraform para as IAM Roles do cluster EKS (Control Plane e Node Group).
* **2025-10-22 - Tarefa INFRA-006:** Criado script Terraform para provisionar o cluster EKS e o Node Group inicial.
* **2025-10-22 - Tarefa BACKEND-001:** Criada a estrutura de boilerplate inicial para o microsserviço 'governance-service'.
* **2025-10-22 - Tarefa BACKEND-002:** Criados os manifestos Kubernetes (Deployment, Service, Ingress) para o 'governance-service'.
* **2025-10-22 - Tarefa FRONTEND-001:** Criada a página de Login com formulário e hook de autenticação inicial.
* **2025-10-22 - Tarefa FRONTEND-002:** Criado o layout principal da aplicação e a página inicial do Dashboard.
* **2025-10-22 - Tarefa EXTRA-003:** Corrigidas as datas de todo o histórico de alterações anterior.
* **2025-10-22 - Tarefa FRONTEND-004:** Implementado o mecanismo de proteção de rotas para a área autenticada.
* **2025-10-22 - Tarefa FIX-003:** Corrigida a versão inválida do FastAPI no 'governance-service' para restaurar o pipeline de CI.
