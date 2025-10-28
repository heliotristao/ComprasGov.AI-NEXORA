import { NextRequest } from "next/server"

import {
  buildPlanningApiUrl,
  buildProxyResponse,
  forwardProxyHeaders,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../../_utils"

interface RouteContext {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const targetUrl = buildPlanningApiUrl(`/tr/${params.id}/export`)

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: forwardProxyHeaders(request.headers),
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error(`Erro ao exportar o TR ${params.id}`, error)
    return proxyErrorResponse("Não foi possível exportar o TR no momento. Tente novamente em instantes.")
  }
}
