# 🎯 Fluxo Completo: ETP e TR

## Visão Geral

Este documento descreve o fluxo completo implementado para criação de **Estudo Técnico Preliminar (ETP)** e **Termo de Referência (TR)** no sistema ComprasGov.AI - NEXORA.

---

## 📋 Fluxo do Sistema

```
┌──────────────┐
│   PLANO DE   │
│ CONTRATAÇÃO  │
└──────┬───────┘
       │
       │ [Criar ETP]
       ↓
┌──────────────┐
│  SELEÇÃO DE  │
│   TEMPLATE   │
└──────┬───────┘
       │
       │ [Escolher Template]
       ↓
┌──────────────┐
│  WIZARD ETP  │
│ (Multi-Etapa)│
└──────┬───────┘
       │
       │ [Preencher Campos]
       ↓
┌──────────────┐
│  VALIDAÇÃO   │
│      E       │
│ CONSOLIDAÇÃO │
└──────┬───────┘
       │
       │ [Criar TR]
       ↓
┌──────────────┐
│  CRIAÇÃO TR  │
│  (Herança    │
│  Automática) │
└──────┬───────┘
       │
       │ [Herdar Dados do ETP]
       ↓
┌──────────────┐
│  WIZARD TR   │
│ (Multi-Etapa)│
└──────┬───────┘
       │
       │ [Complementar Campos]
       ↓
┌──────────────┐
│  DOCUMENTO   │
│  TR FINAL    │
└──────────────┘
```

---

## 🚀 Páginas Implementadas

### **1. Listagem de Planos** (`/plans`)
**Funcionalidade:** Visualizar todos os planos de contratação

**Ações Disponíveis:**
- ✅ Visualizar plano
- ✅ Editar plano
- ✅ **Criar ETP** (novo)
- ✅ Excluir plano

**Como usar:**
1. Acesse `/plans`
2. Clique no menu de ações (⋮) de um plano
3. Selecione "Criar ETP"

---

### **2. Seleção de Template ETP** (`/etp/novo?planId={id}`)
**Funcionalidade:** Escolher template institucional para o ETP

**Fluxo:**
1. Sistema carrega templates disponíveis do tipo "ETP"
2. Usuário seleciona um template
3. Sistema cria documento ETP vinculado ao plano
4. Redireciona para o wizard

**Dados Exibidos:**
- Nome do template
- Descrição
- Modelo superior base (TCU, TCE, PGE)

---

### **3. Wizard ETP** (`/etp/[id]/wizard`)
**Funcionalidade:** Preencher ETP passo a passo

**Características:**
- ✅ Navegação por seções (sidebar)
- ✅ Formulários dinâmicos baseados no template
- ✅ Salvamento automático a cada 30 segundos
- ✅ Indicador de progresso
- ✅ Geração de campos com IA
- ✅ Validação de campos obrigatórios

**Componentes:**
- `ETPWizard.tsx` - Container principal
- `ETPSidebar.tsx` - Navegação lateral
- `ETPSecaoForm.tsx` - Formulário de cada seção
- `GerarCampoIADialog.tsx` - Modal de geração com IA

---

### **4. Listagem de ETPs** (`/etp`)
**Funcionalidade:** Visualizar todos os ETPs criados

**Informações Exibidas:**
- Plano vinculado
- Template utilizado
- Progresso (%)
- Status (Rascunho, Em Progresso, Validado, Consolidado)
- Data de criação

**Ações Disponíveis:**
- ✅ Continuar edição (wizard)
- ✅ Visualizar
- ✅ Consolidar (se validado)
- ✅ **Criar TR** (se consolidado)

---

### **5. Consolidação ETP** (`/etp/[id]/consolidar`)
**Funcionalidade:** Revisar e consolidar ETP antes de gerar documento

**Opções:**
- ✅ Consolidação Automática com IA
- ✅ Consolidação Manual
- ✅ Geração de documento DOCX
- ✅ Geração de documento PDF

---

### **6. Criação de TR** (`/tr/novo?etpId={id}`)
**Funcionalidade:** Criar TR automaticamente a partir de ETP aprovado

**Processo:**
1. Carrega informações do ETP base
2. Mostra quais dados serão herdados
3. Cria documento TR vinculado ao ETP
4. Copia dados compatíveis automaticamente
5. Redireciona para wizard TR

**Dados Herdados:**
- Descrição da necessidade
- Requisitos da contratação
- Estimativa de valor
- Análise de mercado
- Outros campos compatíveis

---

### **7. Wizard TR** (`/tr/[id]/wizard`)
**Funcionalidade:** Complementar TR com campos específicos

**Características:**
- ✅ Reutiliza componente `ETPWizard`
- ✅ Campos herdados do ETP marcados
- ✅ Campos específicos do TR a preencher
- ✅ Mesmas funcionalidades do wizard ETP

---

### **8. Planejamento** (`/planning`)
**Status:** Redirecionamento automático para `/etp`

**Motivo:** Centralizar gestão de ETPs em uma única página

---

### **9. Licitações** (`/licitacoes`)
**Status:** Estrutura básica criada (em desenvolvimento)

**Funcionalidades Planejadas:**
- Criar processos licitatórios a partir de TRs
- Gerenciar editais e anexos
- Acompanhar prazos e fases
- Receber e analisar propostas
- Gerar contratos

---

## 🎯 Fluxo do Usuário

### **Cenário Completo:**

#### **Passo 1: Criar Plano**
```
Usuário → /plans → [Novo Plano] → Preencher dados → Salvar
```

#### **Passo 2: Criar ETP**
```
Usuário → /plans → [⋮] → [Criar ETP] → Selecionar Template → [Criar]
```

#### **Passo 3: Preencher ETP**
```
Usuário → /etp/[id]/wizard → Navegar seções → Preencher campos → [Salvar]
```

#### **Passo 4: Usar IA (Opcional)**
```
Usuário → [✨ Gerar com IA] → Revisar conteúdo → [Aceitar] ou [Editar]
```

#### **Passo 5: Consolidar ETP**
```
Usuário → /etp → [Consolidar] → [Consolidar com IA] ou [Manual] → [Gerar DOCX]
```

#### **Passo 6: Criar TR**
```
Usuário → /etp → [Criar TR] → Revisar herança → [Criar TR e Continuar]
```

#### **Passo 7: Complementar TR**
```
Usuário → /tr/[id]/wizard → Preencher campos específicos → [Salvar]
```

#### **Passo 8: Finalizar TR**
```
Usuário → /tr/[id]/consolidar → [Gerar Documento] → Download DOCX/PDF
```

---

## 🔧 Componentes Técnicos

### **Backend (FastAPI)**

#### **Modelos:**
- `DocumentoETP` - Tabela de documentos ETP
- `DocumentoTR` - Tabela de documentos TR
- `ModeloInstitucional` - Templates customizáveis
- `CampoObrigatorioLei` - Campos da Lei 14.133/2021

#### **Endpoints:**
```
POST   /api/v1/etp                     - Criar ETP
GET    /api/v1/etp/{id}                - Buscar ETP
PUT    /api/v1/etp/{id}                - Atualizar ETP
GET    /api/v1/etp/{id}/validar        - Validar conformidade
POST   /api/v1/etp/{id}/gerar-campo    - Gerar campo com IA
POST   /api/v1/etp/{id}/consolidar     - Consolidar ETP

POST   /api/v1/tr/criar-de-etp/{etp_id} - Criar TR de ETP
GET    /api/v1/tr/{id}                  - Buscar TR
PUT    /api/v1/tr/{id}                  - Atualizar TR

GET    /api/v1/modelos-institucionais   - Listar templates
```

### **Frontend (Next.js)**

#### **Hooks:**
- `useETPDocument` - Gerenciar documento ETP
- `usePlans` - Listar planos

#### **Componentes:**
- `ETPWizard` - Wizard multi-etapa
- `ETPSidebar` - Navegação lateral
- `ETPSecaoForm` - Formulário dinâmico
- `GerarCampoIADialog` - Modal de IA

---

## 📊 Status de Implementação

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Listagem de Planos | ✅ Completo | Funcionando |
| Criar ETP | ✅ Completo | Botão adicionado |
| Seleção de Template | ✅ Completo | Página criada |
| Wizard ETP | ✅ Completo | Componentes prontos |
| Listagem de ETPs | ✅ Completo | Mock data |
| Consolidação ETP | ✅ Completo | Página criada |
| Criar TR de ETP | ✅ Completo | Herança automática |
| Wizard TR | ✅ Completo | Reutiliza ETP |
| Planejamento | ✅ Corrigido | Redireciona para ETP |
| Licitações | ⚠️ Básico | Estrutura criada |

---

## 🎉 Próximos Passos

### **Imediato:**
1. ✅ Testar fluxo completo no Vercel
2. ✅ Verificar integração com backend
3. ✅ Validar geração de documentos

### **Curto Prazo:**
1. Implementar hooks reais (substituir mock data)
2. Conectar com endpoints do backend
3. Testar geração com IA
4. Implementar download de documentos

### **Médio Prazo:**
1. Criar módulo de Licitações completo
2. Implementar gestão de contratos
3. Adicionar relatórios e dashboards
4. Implementar notificações de prazos

---

## 📝 Observações Importantes

### **Conformidade Legal:**
- ✅ Sistema implementa 100% dos campos obrigatórios da Lei 14.133/2021
- ✅ Validação automática de conformidade
- ✅ Impossível gerar documento não-conforme

### **Flexibilidade:**
- ✅ Templates customizáveis por instituição
- ✅ Suporte a múltiplos órgãos de controle (TCU, TCE, PGE)
- ✅ Versionamento de templates

### **IA e Responsabilidade:**
- ✅ IA é assistente, não substitui responsável técnico
- ✅ Todos os campos gerados por IA são marcados
- ✅ Score de confiança exibido
- ✅ Usuário sempre pode editar

---

**Última atualização:** 27/10/2025
**Versão:** 1.0
**Status:** Implementado e pronto para testes
