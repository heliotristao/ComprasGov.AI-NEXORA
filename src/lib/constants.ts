/**
 * Constantes do Design System NEXORA
 * Baseado no documento DESIGN-SYSTEM-NEXORA.md
 */

// Status de Processos
export const PROCESS_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ARCHIVED: "archived",
} as const

export type ProcessStatus = typeof PROCESS_STATUS[keyof typeof PROCESS_STATUS]

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  draft: "Rascunho",
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  archived: "Arquivado",
}

// Níveis de Risco
export const RISK_LEVELS = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS]

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
}

// Roles de Usuário
export const USER_ROLES = {
  MASTER: "master",
  ADMIN: "admin",
  MANAGER: "manager",
  ANALYST: "analyst",
  VIEWER: "viewer",
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  master: "Master",
  admin: "Administrador",
  manager: "Gestor",
  analyst: "Analista",
  viewer: "Visualizador",
}

// Tipos de Documento
export const DOCUMENT_TYPES = {
  ETP: "etp",
  TR: "tr",
  MARKET_RESEARCH: "market_research",
  RISK_ANALYSIS: "risk_analysis",
  APPROVAL: "approval",
  OTHER: "other",
} as const

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  etp: "Estudo Técnico Preliminar",
  tr: "Termo de Referência",
  market_research: "Pesquisa de Mercado",
  risk_analysis: "Análise de Riscos",
  approval: "Aprovação",
  other: "Outro",
}

// Tamanhos de Ícones
export const ICON_SIZES = {
  SM: 16,
  MD: 20,
  LG: 24,
  XL: 32,
} as const

// Limites de Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
  ],
  ALLOWED_EXTENSIONS: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"],
} as const

// Paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const

// Breakpoints (em pixels)
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1280,
  WIDE: 1440,
} as const

// Durações de Animação (em ms)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
} as const

// Delays
export const DELAYS = {
  TOOLTIP: 500,
  TOAST: 5000,
  AUTO_SAVE: 3000,
} as const

// Mensagens Padrão
export const MESSAGES = {
  LOADING: "Carregando...",
  ERROR: "Ocorreu um erro. Tente novamente.",
  SUCCESS: "Operação realizada com sucesso!",
  NO_DATA: "Nenhum dado encontrado.",
  CONFIRM_DELETE: "Tem certeza que deseja excluir?",
  UNSAVED_CHANGES: "Você tem alterações não salvas. Deseja sair mesmo assim?",
} as const

// Rotas da Aplicação
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/perfil",
  USERS: "/configuracoes/usuarios",
  ORG_SETTINGS: "/configuracoes/orgao",
  PROCESSES: "/planejamento/processos",
  NEW_PROCESS: "/planejamento/processos/novo",
  PROCESS_DETAILS: (id: string) => `/planejamento/processos/${id}`,
} as const

