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
* **[Data] - Tarefa SETUP-002:** Repositório populado com estrutura de diretórios e arquivos de governança.
* **[Data] - Tarefa GOV-003:** Aprimoradas as diretrizes de engenharia com foco em segurança, qualidade e performance.
* **[Data] - Tarefa FIX-002:** Corrigido o pipeline de CI para operar no diretório /src.
* **[Data] - Tarefa RECOVERY-001:** Re-inicializada a estrutura do projeto Next.js no diretório /src.
* **[Data] - Tarefa EXTRA-001:** Instaladas as dependências essenciais do frontend (Zustand, TanStack Query, Shadcn/ui).
* **[Data] - Tarefa INFRA-001:** Criado script Terraform para a VPC base.
* **[Data] - Tarefa INFRA-002:** Criado script Terraform para as sub-redes públicas e privadas.
* **[Data Atual] - Tarefa INFRA-003:** Criado script Terraform para provisionar o Internet Gateway e o NAT Gateway da rede.
* **[Data Atual] - Tarefa INFRA-004:** Criado script Terraform para configurar as tabelas de roteamento das sub-redes públicas e privadas.
* **[Data Atual] - Tarefa INFRA-005:** Criado script Terraform para as IAM Roles do cluster EKS (Control Plane e Node Group).
* **[Data Atual] - Tarefa INFRA-006:** Criado script Terraform para provisionar o cluster EKS e o Node Group inicial.
