export const SESSION_COOKIE_NAME = "nexora_session"
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 horas

export interface SessionUser {
  id?: string
  name?: string
  email?: string
  roles?: string[]
  [key: string]: unknown
}

export interface SessionPayload {
  token: string
  user?: SessionUser | null
}

function normalizeUser(rawUser: unknown): SessionUser | undefined {
  if (!rawUser || typeof rawUser !== "object") {
    return undefined
  }

  const user = rawUser as Record<string, unknown>
  const normalized: SessionUser = {}

  if (typeof user.id === "string" || typeof user.id === "number") {
    normalized.id = String(user.id)
  }

  if (typeof user.name === "string" && user.name.trim().length > 0) {
    normalized.name = user.name.trim()
  }

  if (typeof user.email === "string" && user.email.trim().length > 0) {
    normalized.email = user.email.trim()
  }

  if (Array.isArray(user.roles)) {
    normalized.roles = user.roles
      .map((role) => (typeof role === "string" ? role : null))
      .filter((role): role is string => Boolean(role))
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

export function serializeSessionPayload(payload: SessionPayload): string {
  return JSON.stringify(payload)
}

export function encodeSessionCookieValue(payload: SessionPayload): string {
  return encodeURIComponent(serializeSessionPayload(payload))
}

export function decodeSessionCookieValue(value: string): SessionPayload | null {
  if (!value) return null

  try {
    const decoded = decodeURIComponent(value)
    const parsed = JSON.parse(decoded) as unknown

    if (!parsed || typeof parsed !== "object") {
      return null
    }

    const record = parsed as Record<string, unknown>
    const token = record.token

    if (typeof token !== "string" || token.trim().length === 0) {
      return null
    }

    return {
      token: token.trim(),
      user: normalizeUser(record.user),
    }
  } catch (error) {
    console.error("Falha ao decodificar cookie de sessão", error)
    return null
  }
}
