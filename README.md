# NEXORA-ComprasGov.AI - O Sistema Operacional para Contratações Públicas

**Status:** ✅ Sistema ETP e TR Implementado - Fase 1 Completa

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

## 5. Documentação do Sistema ETP e TR

### **📋 Relatórios Completos**
* **[RELATORIO_SESSAO_2024-10-27.md](./RELATORIO_SESSAO_2024-10-27.md)** - Relatório detalhado de tudo que foi implementado na sessão de 27/10/2024
* **[RESUMO_EXECUTIVO_ETP_TR.md](./RESUMO_EXECUTIVO_ETP_TR.md)** - Resumo executivo para stakeholders com métricas e ROI
* **[DOCUMENTACAO_SISTEMA_ETP_TR.md](./DOCUMENTACAO_SISTEMA_ETP_TR.md)** - Documentação técnica completa do sistema
* **[SISTEMA_TR_COMPLETO.md](./SISTEMA_TR_COMPLETO.md)** - Documentação específica do sistema de TR
* **[INTEGRACAO_COMPLETA_ETP_TR.md](./INTEGRACAO_COMPLETA_ETP_TR.md)** - Guia de integração e uso

### **🎯 Principais Funcionalidades Implementadas**

#### **Sistema de ETP (Estudo Técnico Preliminar)**
* 13 campos obrigatórios da Lei 14.133/2021 (Art. 18)
* Wizard multi-página com navegação lateral
* Geração de conteúdo com IA (5 chains LLM especializadas)
* Validação automática de conformidade legal
* Geração de documentos DOCX/PDF profissionais
* Gestão multi-tenant de templates institucionais

#### **Sistema de TR (Termo de Referência)**
* 10 campos obrigatórios da Lei 14.133/2021 (Art. 6º, XXIII)
* **Criação automática a partir de ETP aprovado** (inovação!)
* Herança inteligente de dados do ETP
* Transformação automática de conteúdo
* Redução de 80% no tempo de criação
* Mesmo wizard e funcionalidades do ETP

#### **Gestão de Templates**
* Hierarquia: Lei 14.133/2021 → Órgão de Controle (TCU/TCE/PGE) → Instituição
* Templates customizáveis por cliente
* Versionamento e controle de mudanças
* Área de administração completa
* Mapeamento automático ETP → TR

#### **Integração com IA**
* 5 chains LLM especializadas (necessity, solution, viability, quantities, specs)
* Geração genérica com prompts customizados
* Score de confiança por campo gerado
* Consolidação automática com revisão de IA
* Auditoria completa de uso de IA

### **📊 Estatísticas da Implementação**
* **24 arquivos criados** (16 backend + 8 frontend)
* **~7.595 linhas de código**
* **21 endpoints da API**
* **6 tabelas de banco de dados**
* **20+ schemas Pydantic**
* **8 componentes React**
* **100% de conformidade legal**

### **🚀 Como Testar**

```bash
# 1. Popular banco com seeds
cd backend/planning-service
python scripts/seed_etp_system.py

# 2. Criar e aprovar ETP
curl -X POST http://localhost:8000/api/v1/etp \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 1, "template_id": 1, "dados": {}}'

curl -X PUT http://localhost:8000/api/v1/etp/1 \
  -d '{"status": "aprovado"}'

# 3. Criar TR automaticamente do ETP
curl -X POST http://localhost:8000/api/v1/tr/criar-de-etp/1 \
  -H "Content-Type: application/json" \
  -d '{"template_tr_id": 2, "user_id": 1}'

# 4. Verificar dados herdados
curl http://localhost:8000/api/v1/tr/1
```

---

## 6. Histórico Técnico de Alterações
* **[2025-10-29] - Tarefa C5:** Implementado o wizard multietapas para Termo de Referência (TR), com fluxos dinâmicos para Bens e Serviços, auto-save, validação e integração com IA.
* **[2025-10-29] - Tarefa C2:** Implementado o motor de monitoramento de SLA e o serviço de notificações automáticas no `planning-service`, com APIs para configuração e consulta de status.
* **[2025-10-29] - Tarefa C1:** Implementado o Módulo de Gestão com um dashboard unificado para visualização e filtragem de todos os processos da plataforma.
* **[2025-10-29] - Tarefa B7:** Implementada a interface completa do wizard multietapas para ETP com auto-save, validação guiada e integração de geração de conteúdo por IA.
* **[2025-10-29] - Tarefa B3:** Implementado o motor de validação de conformidade para ETPs no `planning-service`, com um endpoint que retorna um checklist de regras e sugestões de melhoria.
* **[2025-10-29] - Tarefa B2:** Implementada a API de auto-save (`PATCH`) para a entidade ETP no `planning-service`, permitindo a atualização incremental de dados e o salvamento contínuo do progresso do usuário.
* **[2025-10-29] - Tarefa B4:** Implementada a funcionalidade de geração de conteúdo por IA para campos do ETP no `planning-service`, incluindo rastreabilidade de cada execução e suporte a múltiplos provedores.
* **[2025-10-29] - Tarefa B1:** Implementado o modelo de dados, migração e CRUD completo para a entidade ETP no `planning-service`, estabelecendo a base para a persistência dos Estudos Técnicos Preliminares.
* **[2025-10-29] - Tarefa ATOM-008:** Implementada a interface administrativa para listagem e criação de templates de documentos (ETP/TR), estabelecendo a base para personalização institucional.
* **[2025-10-30] - Tarefa ATOM-007:** Implementada a persistência de dados com auto-save e carregamento automático nos wizards de ETP e TR, conectando a UI aos endpoints de salvamento do backend.
* **[2025-10-29] - Tarefa ATOM-006:** Implementadas as telas de consolidação para ETP e TR, permitindo validação de conformidade, seleção de template e geração dos documentos finais (DOCX/PDF).
* **[2024-10-28] - Tarefa ATOM-005:** Implementadas as telas de listagem e detalhe de processos, com busca, filtros, paginação server-side e visualização de timeline e vínculos.
* **[2025-10-28] - Tarefa ATOM-003:** Implementado o Wizard de Termo de Referência (TR) com fluxos dinâmicos para Bens e Serviços, incluindo auto-save, validação por etapa e integração via proxy com o backend.
* **[2025-10-28] - Tarefa ATOM-002:** Implementado o Wizard de ETP com múltiplos passos, validação, auto-save e retomada de sessão, incluindo a listagem e criação de rascunhos.
* **[2025-10-28] - Tarefa ATOM-001:** Criada a shell inicial com App Router, dashboard de acesso rápido e Wizard de Planejamento integrado ao layout global.
* **[2025-10-27] - Tarefa BACKEND-P-12:** Criado o endpoint para salvamento de dados do Wizard de ETP, permitindo a persistência do progresso do usuário.
* **[2024-10-27] - Tarefa FEAT-ETP-TR-001:** Implementado sistema completo de ETP e TR com integração de IA, criação automática de TR a partir de ETP, gestão multi-tenant de templates e geração de documentos DOCX/PDF. (Commit: `2924849`)
* **[2024-10-27] - Tarefa FIX-017:** Corrigidas as URLs dos endpoints da API no dashboard para incluir o prefixo `/api/v1`. (Commit: `6ce0587`)
* **[2025-10-26] - Tarefa BACKEND-P-11:** Criado o endpoint `PUT /plans/{plan_id}` e enriquecido o modelo de dados do Plano com novos atributos.
* **[2025-10-26] - Tarefa BACKEND-P-10:** Criado o endpoint `GET /plans/{plan_id}` no `planning-service` para obter os detalhes de um plano específico.
* **[2025-10-26] - Tarefa BACKEND-P-09:** Criado o endpoint `POST /plans` no `planning-service` para a criação de novos planos de contratação.
* **[2025-10-25] - Tarefa BACKEND-P-08:** Criado o endpoint `GET /plans` no `planning-service` para listar os planos de contratação.
* **[2025-10-25] - Tarefa DEBUG-002:** Habilitada a documentação da API (Swagger UI) no `governance-service` para fins de diagnóstico do endpoint de autenticação.
* **[2025-10-25] - Tarefa DEVOPS-PROD-03:** Simplificado o pipeline de CI do backend, removendo a etapa legada de push da imagem Docker para a AWS.
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
