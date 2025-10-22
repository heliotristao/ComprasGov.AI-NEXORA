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

## 4. Histórico Técnico de Alterações
* **[2025-10-22] - Tarefa CI-002:** Criado o repositório no Amazon ECR para o 'governance-service' via Terraform.
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
