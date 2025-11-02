import { NextRequest, NextResponse } from "next/server"

import {
  buildAuthProxyHeaders,
  buildPlanningApiUrl,
  buildProxyResponse,
  ensureSessionOrUnauthorized,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../../../../processes/_utils"

interface RouteParams {
  params: {
    id: string
    fieldKey: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const documentId = params.id
  const fieldKey = params.fieldKey
  const targetUrl = buildPlanningApiUrl(`/etp/${documentId}/generate/${fieldKey}`)

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
    console.error(`Erro ao gerar conteúdo de ${fieldKey} para o ETP ${documentId}`, error)
    return proxyErrorResponse("Não foi possível gerar o conteúdo com IA.")
  }
}
