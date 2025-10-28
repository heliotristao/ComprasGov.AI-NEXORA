export interface ProcessListItem {
  id: string
  identifier: string
  object: string
  status: string
  type?: string
  unit?: string
  updatedAt?: string
  owner?: string
  value?: number | null
}

export interface ProcessListMetadata {
  page: number
  perPage: number
  total: number
  sortField?: string | null
  sortDirection?: "asc" | "desc" | null
}

export interface ProcessDetailData {
  id: string
  identifier: string
  object: string
  status: string
  type?: string
  unit?: string
  owner?: string
  edocs?: string | null
  phase?: string | null
  createdAt?: string
  updatedAt?: string
  value?: number | null
  description?: string | null
}

export interface ProcessLinkItem {
  id: string
  type: string
  title: string
  status?: string
  targetUrl: string
  description?: string | null
}

export interface ProcessTimelineEvent {
  id: string
  title: string
  description?: string
  author?: string
  timestamp?: string
  category?: string
}
