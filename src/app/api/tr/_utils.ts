import { NextResponse } from "next/server"

function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.replace(/\/$/, "")
}

export function getPlanningApiBaseUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_PLANNING_API_URL
  if (!base || !base.trim()) {
    return null
  }
  return normalizeBaseUrl(base.trim())
}

export function planningApiNotConfiguredResponse() {
  return NextResponse.json(
    {
      message:
        "O proxy do planejamento não está configurado. Defina a variável NEXT_PUBLIC_PLANNING_API_URL para habilitar esta funcionalidade.",
    },
    { status: 501 }
  )
}

export function buildPlanningApiUrl(path: string): string | null {
  const baseUrl = getPlanningApiBaseUrl()
  if (!baseUrl) return null
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function forwardProxyHeaders(headers: Headers): Headers {
  const forwarded = new Headers()
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (lowerKey === "host" || lowerKey === "content-length") {
      return
    }
    forwarded.set(key, value)
  })
  return forwarded
}

export async function buildProxyResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  const contentDisposition = response.headers.get("content-disposition") ?? undefined
  const headers = new Headers()
  if (contentDisposition) {
    headers.set("content-disposition", contentDisposition)
  }

  if (contentType.includes("application/json")) {
    const text = await response.text()
    if (!text) {
      return NextResponse.json(null, {
        status: response.status,
        headers,
      })
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, {
        status: response.status,
        headers,
      })
    } catch {
      headers.set("content-type", contentType)
      return new NextResponse(text, {
        status: response.status,
        headers,
      })
    }
  }

  const blob = await response.arrayBuffer()
  if (contentType) {
    headers.set("content-type", contentType)
  }

  return new NextResponse(blob, {
    status: response.status,
    headers,
  })
}

export function proxyErrorResponse(message: string, status = 502) {
  return NextResponse.json(
    {
      message,
    },
    { status }
  )
}
