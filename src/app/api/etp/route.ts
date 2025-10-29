import { NextRequest, NextResponse } from "next/server"

import {
  buildAuthProxyHeaders,
  buildPlanningApiUrl,
  buildProxyResponse,
  ensureSessionOrUnauthorized,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../processes/_utils"

export async function POST(request: NextRequest) {
  const targetUrl = buildPlanningApiUrl("/etp")

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  const sessionOrResponse = ensureSessionOrUnauthorized()

  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse
  }

  const session = sessionOrResponse

  const body = await request.text()

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: buildAuthProxyHeaders(request.headers, session.token),
      body: body || undefined,
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error("Erro ao criar rascunho de ETP", error)
    return proxyErrorResponse("Não foi possível criar o rascunho do ETP.")
  }
}
