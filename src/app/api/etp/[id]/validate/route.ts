import { NextRequest, NextResponse } from "next/server"

import {
  buildAuthProxyHeaders,
  buildPlanningApiUrl,
  buildProxyResponse,
  ensureSessionOrUnauthorized,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../../../processes/_utils"

interface RouteParams {
  params: {
    id: string
  }
}

type HttpMethod = "GET" | "POST"

async function proxyValidation(
  request: NextRequest,
  { params }: RouteParams,
  method: HttpMethod
) {
  const documentId = params.id
  const targetUrl = buildPlanningApiUrl(`/etp/${documentId}/validate`)

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  const sessionOrResponse = ensureSessionOrUnauthorized()

  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse
  }

  const session = sessionOrResponse
  const body = method === "GET" ? undefined : await request.text()

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: buildAuthProxyHeaders(request.headers, session.token),
      body: body || undefined,
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error(`Erro ao validar conformidade do ETP ${documentId}`, error)
    return proxyErrorResponse("Não foi possível validar a conformidade do documento.")
  }
}

export async function GET(request: NextRequest, context: RouteParams) {
  return proxyValidation(request, context, "GET")
}

export async function POST(request: NextRequest, context: RouteParams) {
  return proxyValidation(request, context, "POST")
}
