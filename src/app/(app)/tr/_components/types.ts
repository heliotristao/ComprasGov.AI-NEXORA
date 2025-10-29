import type { TrFormValues, TrType } from "../_schemas/trSchemas"

export interface TrRecord {
  id: string
  tipo: TrType
  status?: string | null
  title?: string | null
  edocs?: string | null
  owner?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  formData?: Partial<Record<string, unknown>>
  step?: number | null
}

export type { TrFormValues, TrType }
