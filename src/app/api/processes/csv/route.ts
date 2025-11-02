import { NextRequest, NextResponse } from "next/server"

import {
  buildAuthProxyHeaders,
  buildPlanningApiUrl,
  buildProxyResponse,
  ensureSessionOrUnauthorized,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../_utils"

export async function GET(request: NextRequest) {
  const targetUrl = buildPlanningApiUrl(`/processes/csv${request.nextUrl.search}`)

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  const sessionOrResponse = ensureSessionOrUnauthorized()

  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: buildAuthProxyHeaders(request.headers, sessionOrResponse.token),
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error("Erro ao exportar processos em CSV", error)
    return proxyErrorResponse("Não foi possível exportar os processos.")
  }
}
