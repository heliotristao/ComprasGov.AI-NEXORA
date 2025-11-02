export const EDOCS_REGEX = /^[A-Z]{4}-\d{6}$/

const FALLBACK_EDOCS_BASE_URL = "https://www.gov.br/compras/edocs"

function sanitizeBaseUrl(rawValue: string | undefined): string {
  if (!rawValue) {
    return FALLBACK_EDOCS_BASE_URL
  }

  const trimmed = rawValue.trim()
  if (!trimmed) {
    return FALLBACK_EDOCS_BASE_URL
  }

  try {
    const parsed = new URL(trimmed)
    return parsed.toString().replace(/\/+$/, "")
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `NEXT_PUBLIC_EDOCS_BASE_URL inválida: ${trimmed}. Usando fallback ${FALLBACK_EDOCS_BASE_URL}.`,
        error,
      )
    }
    return FALLBACK_EDOCS_BASE_URL
  }
}

export const EDOCS_BASE_URL = sanitizeBaseUrl(process.env.NEXT_PUBLIC_EDOCS_BASE_URL)

export function applyEdocsMask(rawValue: string): string {
  if (!rawValue) {
    return ""
  }

  const normalized = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "")

  let letters = ""
  let digits = ""

  for (const character of normalized) {
    if (letters.length < 4 && /[A-Z]/.test(character)) {
      letters += character
      continue
    }

    if (letters.length >= 4 && digits.length < 6 && /\d/.test(character)) {
      digits += character
    }
  }

  if (!letters) {
    return digits ? "" : ""
  }

  if (!digits) {
    return letters
  }

  return `${letters}-${digits}`
}

export function normalizeEdocsValue(value: string | null | undefined): string {
  if (!value) {
    return ""
  }

  return applyEdocsMask(value)
}

export function isValidEdocs(value: string): boolean {
  return EDOCS_REGEX.test(value)
}

export function buildEdocsUrl(value: string): string {
  const normalizedValue = normalizeEdocsValue(value)

  if (!normalizedValue) {
    return EDOCS_BASE_URL
  }

  return `${EDOCS_BASE_URL}/${encodeURIComponent(normalizedValue)}`
}
