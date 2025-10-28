import { NextRequest, NextResponse } from "next/server"

import {
  buildAuthProxyHeaders,
  buildPlanningApiUrl,
  buildProxyResponse,
  ensureSessionOrUnauthorized,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../processes/_utils"

export async function GET(request: NextRequest) {
  const targetUrl = buildPlanningApiUrl(`/templates${request.nextUrl.search}`)

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  const sessionOrResponse = ensureSessionOrUnauthorized()

  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse
  }

  const session = sessionOrResponse

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: buildAuthProxyHeaders(request.headers, session.token),
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error("Erro ao carregar templates disponíveis", error)
    return proxyErrorResponse("Não foi possível carregar os templates disponíveis no momento.")
  }
}
