import { NextRequest } from "next/server"

import {
  buildPlanningApiUrl,
  buildProxyResponse,
  forwardProxyHeaders,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "./_utils"

export async function POST(request: NextRequest) {
  const targetUrl = buildPlanningApiUrl("/tr")

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  const body = await request.text()

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: forwardProxyHeaders(request.headers),
      body: body || undefined,
      cache: "no-store",
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error("Erro ao encaminhar criação do TR", error)
    return proxyErrorResponse("Não foi possível criar o TR. Verifique a configuração do serviço de planejamento.")
  }
}
