import { NextResponse } from "next/server"

import { getSession } from "@/lib/auth/session.server"
import type { SessionPayload } from "@/lib/auth/session"

import {
  buildPlanningApiUrl,
  buildProxyResponse,
  forwardProxyHeaders as baseForwardProxyHeaders,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../tr/_utils"

export {
  buildPlanningApiUrl,
  buildProxyResponse,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
}

export function ensureSessionOrUnauthorized(): SessionPayload | NextResponse {
  const session = getSession()

  if (!session || !session.token) {
    return NextResponse.json(
      { message: "Sessão expirada. Faça login novamente." },
      { status: 401 }
    )
  }

  return session
}

export function buildAuthProxyHeaders(requestHeaders: Headers, token: string): Headers {
  const headers = new Headers()

  baseForwardProxyHeaders(requestHeaders).forEach((value, key) => {
    headers.set(key, value)
  })

  headers.set("Authorization", `Bearer ${token}`)
  return headers
}
