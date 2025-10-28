import { NextRequest } from "next/server"

import {
  buildPlanningApiUrl,
  buildProxyResponse,
  forwardProxyHeaders,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../_utils"

interface RouteContext {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const targetUrl = buildPlanningApiUrl(`/tr/${params.id}`)

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
    console.error(`Erro ao buscar o TR ${params.id}`, error)
    return proxyErrorResponse("Não foi possível carregar o TR solicitado. Tente novamente em instantes.")
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const targetUrl = buildPlanningApiUrl(`/tr/${params.id}`)

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  const body = await request.text()

  try {
    const response = await fetch(targetUrl, {
      method: "PATCH",
      headers: forwardProxyHeaders(request.headers),
      body: body || undefined,
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error(`Erro ao atualizar o TR ${params.id}`, error)
    return proxyErrorResponse("Não foi possível atualizar o TR. Verifique sua conexão e tente novamente.")
  }
}
