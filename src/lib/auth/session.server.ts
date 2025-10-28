import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  SESSION_COOKIE_NAME,
  decodeSessionCookieValue,
  type SessionPayload,
} from "./session"

export class UnauthorizedError extends Error {
  constructor(message = "Sessão inválida ou expirada.") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Você não possui permissão para acessar este recurso.") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export function getSession(): SessionPayload | null {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  return decodeSessionCookieValue(sessionCookie.value)
}

export function assertSession(): SessionPayload {
  const session = getSession()

  if (!session) {
    throw new UnauthorizedError()
  }

  return session
}

export function requireSessionOrRedirect(loginPath = "/login"): SessionPayload {
  const session = getSession()

  if (!session) {
    redirect(loginPath)
  }

  return session
}

export function sessionHasAnyRole(
  session: SessionPayload | null | undefined,
  roles: string[]
): boolean {
  if (!session || roles.length === 0) {
    return false
  }

  const userRoles = Array.isArray(session.user?.roles) ? session.user?.roles ?? [] : []

  return roles.some((role) => userRoles.includes(role))
}

interface RequireRoleOptions {
  loginPath?: string
  fallbackPath?: string
}

export function requireRole(
  roles: string[],
  { loginPath = "/login", fallbackPath = "/dashboard" }: RequireRoleOptions = {}
): SessionPayload {
  const session = requireSessionOrRedirect(loginPath)

  if (roles.length === 0) {
    return session
  }

  if (sessionHasAnyRole(session, roles)) {
    return session
  }

  redirect(fallbackPath)
}
