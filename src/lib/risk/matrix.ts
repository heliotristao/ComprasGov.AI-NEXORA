export interface RiskMatrixRisk {
  risk_description: string
  probability: string
  impact: string
  mitigation_measure: string
}

export type RiskMatrixGrid = RiskMatrixRisk[][][]

export const PROBABILITY_LEVELS = ["Alta", "Média", "Baixa"] as const
export const IMPACT_LEVELS = ["Baixo", "Médio", "Alto"] as const

const PROBABILITY_SCALE_MAP: Record<string, number> = {
  alta: 0,
  high: 0,
  elevada: 0,
  "muito alta": 0,
  media: 1,
  médio: 1,
  medio: 1,
  medium: 1,
  moderada: 1,
  regular: 1,
  baixa: 2,
  baixo: 2,
  low: 2,
  reduzida: 2,
}

const IMPACT_SCALE_MAP: Record<string, number> = {
  alto: 2,
  alta: 2,
  high: 2,
  elevado: 2,
  critico: 2,
  crítico: 2,
  grave: 2,
  medio: 1,
  médio: 1,
  media: 1,
  medium: 1,
  moderado: 1,
  moderada: 1,
  regular: 1,
  baixo: 0,
  baixa: 0,
  low: 0,
  reduzido: 0,
  reduzida: 0,
}

const SEVERITY_CLASS_MATRIX: readonly (readonly string[])[] = [
  [
    "bg-amber-200 border-amber-300 text-amber-900",
    "bg-orange-200 border-orange-300 text-orange-900",
    "bg-red-200 border-red-300 text-red-900",
  ],
  [
    "bg-lime-200 border-lime-300 text-lime-900",
    "bg-amber-200 border-amber-300 text-amber-900",
    "bg-red-200 border-red-300 text-red-900",
  ],
  [
    "bg-emerald-100 border-emerald-200 text-emerald-900",
    "bg-lime-100 border-lime-200 text-lime-900",
    "bg-orange-200 border-orange-300 text-orange-900",
  ],
] as const

const SEVERITY_HEX_MATRIX: readonly (readonly string[])[] = [
  ["#fde68a", "#fdba74", "#fca5a5"],
  ["#d9f99d", "#fde68a", "#f87171"],
  ["#bbf7d0", "#d9f99d", "#fdba74"],
] as const

function sanitizeScale(value?: string | null): string | null {
  if (!value) {
    return null
  }

  return value
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
}

export function resolveProbabilityIndex(value?: string | null): number | null {
  const key = sanitizeScale(value)
  if (!key) {
    return null
  }

  return PROBABILITY_SCALE_MAP[key] ?? null
}

export function resolveImpactIndex(value?: string | null): number | null {
  const key = sanitizeScale(value)
  if (!key) {
    return null
  }

  return IMPACT_SCALE_MAP[key] ?? null
}

export function createEmptyGrid(): RiskMatrixGrid {
  return PROBABILITY_LEVELS.map(() => IMPACT_LEVELS.map(() => [] as RiskMatrixRisk[]))
}

export function distributeRisks(risks: RiskMatrixRisk[]): RiskMatrixGrid {
  const grid = createEmptyGrid()

  for (const risk of risks) {
    const probabilityIndex = resolveProbabilityIndex(risk.probability) ?? 1
    const impactIndex = resolveImpactIndex(risk.impact) ?? 1
    grid[probabilityIndex][impactIndex].push(risk)
  }

  return grid
}

function capitalize(value: string): string {
  if (!value) {
    return value
  }

  const lower = value.toLowerCase()
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`
}

export function formatProbabilityLabel(value: string): string {
  const index = resolveProbabilityIndex(value)
  if (index !== null) {
    return PROBABILITY_LEVELS[index]
  }

  return capitalize(value)
}

export function formatImpactLabel(value: string): string {
  const index = resolveImpactIndex(value)
  if (index !== null) {
    return IMPACT_LEVELS[index]
  }

  return capitalize(value)
}

export function getSeverityClasses(rowIndex: number, columnIndex: number): string {
  return SEVERITY_CLASS_MATRIX[rowIndex]?.[columnIndex] ?? "bg-muted border-border text-foreground"
}

export function getSeverityHexColor(rowIndex: number, columnIndex: number): string {
  return SEVERITY_HEX_MATRIX[rowIndex]?.[columnIndex] ?? "#e5e7eb"
}

export function normalizeRisks(value: unknown): RiskMatrixRisk[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null
      }

      const candidate = item as Record<string, unknown>

      const risk_description = typeof candidate.risk_description === "string" ? candidate.risk_description.trim() : null
      const probability = typeof candidate.probability === "string" ? candidate.probability.trim() : null
      const impact = typeof candidate.impact === "string" ? candidate.impact.trim() : null
      const mitigation_measure =
        typeof candidate.mitigation_measure === "string" ? candidate.mitigation_measure.trim() : null

      if (!risk_description || !mitigation_measure) {
        return null
      }

      return {
        risk_description,
        probability: probability ?? "Média",
        impact: impact ?? "Médio",
        mitigation_measure,
      }
    })
    .filter((item): item is RiskMatrixRisk => Boolean(item))
}
