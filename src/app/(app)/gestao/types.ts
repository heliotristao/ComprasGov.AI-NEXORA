export interface ProcessSummary {
  id: string
  edocsNumber: string
  edocsUrl?: string | null
  type: string
  title: string
  status: string
  statusLabel?: string
  responsible?: string
  unit?: string
  lastUpdated?: string
  slaDays?: number | null
  approvalPercentage?: number | null
}

export interface ProcessDocument {
  id: string
  type: string
  name: string
  url?: string | null
  uploadedAt?: string | null
}

export interface ProcessTimelineEvent {
  id: string
  title: string
  description?: string | null
  status?: string | null
  actor?: string | null
  date: string
}

export interface ProcessDetails extends ProcessSummary {
  description?: string | null
  value?: number | null
  riskLevel?: string | null
  timeline: ProcessTimelineEvent[]
  documents: ProcessDocument[]
  relatedLinks?: { label: string; url: string }[]
}

export interface ProcessMetrics {
  activeProcesses: number
  pendingProcesses: number
  averageSla: number
  approvalRate: number
  trend?: {
    active?: number[]
    pending?: number[]
    sla?: number[]
    approval?: number[]
  }
}

export interface ProcessListMeta {
  total: number
  page: number
  pageSize: number
}

export interface ProcessFilterOption {
  value: string
  label: string
}

export interface ProcessAvailableFilters {
  statuses: ProcessFilterOption[]
  types: ProcessFilterOption[]
  units: ProcessFilterOption[]
  responsibles: ProcessFilterOption[]
}

export interface ProcessListResponse {
  processes: ProcessSummary[]
  meta: ProcessListMeta
  availableFilters: ProcessAvailableFilters
}

export interface ListProcessesParams {
  search?: string
  status?: string[]
  type?: string | null
  unit?: string | null
  responsible?: string | null
  page?: number
  pageSize?: number
}
