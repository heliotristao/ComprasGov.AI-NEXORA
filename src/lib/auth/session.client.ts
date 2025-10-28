"use client"

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  encodeSessionCookieValue,
  type SessionPayload,
} from "./session"

export function persistSession(session: SessionPayload) {
  if (typeof document === "undefined") {
    return
  }

  const value = encodeSessionCookieValue(session)
  const maxAge = SESSION_MAX_AGE_SECONDS
  const expires = new Date(Date.now() + maxAge * 1000)

  document.cookie = `${SESSION_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; expires=${expires.toUTCString()}; SameSite=Lax`
}

export function clearSessionCookie() {
  if (typeof document === "undefined") {
    return
  }

  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`
}
