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
