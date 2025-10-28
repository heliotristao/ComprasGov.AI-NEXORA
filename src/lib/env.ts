import { config } from "@/lib/config"

const API_URL_ENV_NAME = "NEXT_PUBLIC_API_URL" as const

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "")
}

function parseAndNormalizeUrl(rawValue: string): string {
  const parsedUrl = new URL(rawValue)
  return normalizeUrl(parsedUrl.toString())
}

export function resolveApiBaseUrl(): string | null {
  const rawValue = config.api.baseUrl

  if (!rawValue || !rawValue.trim()) {
    return null
  }

  try {
    return parseAndNormalizeUrl(rawValue)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `Valor inválido para a variável ${API_URL_ENV_NAME}: ${rawValue}. Informe uma URL absoluta.`,
        error,
      )
    }

    return null
  }
}

export function getApiBaseUrl(): string {
  const resolvedUrl = resolveApiBaseUrl()

  if (!resolvedUrl) {
    throw new Error(
      `A variável de ambiente ${API_URL_ENV_NAME} não está definida ou é inválida. Configure-a para apontar para o backend.`
    )
  }

  return resolvedUrl
}

export function getOptionalApiBaseUrl(): string | null {
  const resolvedUrl = resolveApiBaseUrl()

  if (!resolvedUrl && process.env.NODE_ENV !== "production") {
    console.warn(`NEXT_PUBLIC_API_URL ausente ou inválida.`)
  }

  return resolvedUrl
}
