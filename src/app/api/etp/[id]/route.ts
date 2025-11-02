import { NextRequest, NextResponse } from "next/server"

import {
  buildAuthProxyHeaders,
  buildPlanningApiUrl,
  buildProxyResponse,
  ensureSessionOrUnauthorized,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../../processes/_utils"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const documentId = params.id
  const targetUrl = buildPlanningApiUrl(`/etp/${documentId}`)

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
    console.error(`Erro ao carregar ETP ${documentId}`, error)
    return proxyErrorResponse("Não foi possível carregar os dados do ETP solicitado.")
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const documentId = params.id
  const targetUrl = buildPlanningApiUrl(`/etp/${documentId}`)

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
      method: "PATCH",
      headers: buildAuthProxyHeaders(request.headers, session.token),
      body: body || undefined,
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error(`Erro ao atualizar ETP ${documentId}`, error)
    return proxyErrorResponse("Não foi possível salvar as informações do ETP.")
  }
}
