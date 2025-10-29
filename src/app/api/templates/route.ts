import { NextRequest, NextResponse } from "next/server"

import { sessionHasAnyRole } from "@/lib/auth/session.server"
import type { SessionPayload } from "@/lib/auth/session"

import {
  buildAuthProxyHeaders,
  buildPlanningApiUrl,
  buildProxyResponse,
  ensureSessionOrUnauthorized,
  planningApiNotConfiguredResponse,
  proxyErrorResponse,
} from "../processes/_utils"

const ALLOWED_ROLES = ["GESTOR", "MASTER"] as const

function ensureTemplatesSession(): SessionPayload | NextResponse {
  const sessionOrResponse = ensureSessionOrUnauthorized()

  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse
  }

  if (!sessionHasAnyRole(sessionOrResponse, Array.from(ALLOWED_ROLES))) {
    return NextResponse.json(
      { message: "Você não possui permissão para acessar este recurso." },
      { status: 403 }
    )
  }

  return sessionOrResponse
}

function buildTemplatesEndpointPath(searchParams: URLSearchParams): string | null {
  const tipoParam = searchParams.get("tipo")?.toLowerCase()
  const forwardedParams = new URLSearchParams(searchParams)
  forwardedParams.delete("tipo")

  if (tipoParam === "superior") {
    const query = forwardedParams.toString()
    return `/templates/modelos-superiores${query ? `?${query}` : ""}`
  }

  if (tipoParam === "institucional") {
    const query = forwardedParams.toString()
    return `/templates/modelos-institucionais${query ? `?${query}` : ""}`
  }

  const query = forwardedParams.toString()
  return `/templates${query ? `?${query}` : ""}`
}

async function fetchTemplates(
  request: NextRequest,
  session: SessionPayload,
  targetPath: string
) {
  const targetUrl = buildPlanningApiUrl(targetPath)

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function extractTemplatesFromPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (isRecord(payload)) {
    const candidateKeys = ["templates", "items", "results", "data", "modelos"]
    for (const key of candidateKeys) {
      const value = payload[key]
      if (Array.isArray(value)) {
        return value
      }
    }
  }

  return []
}

async function parseTemplatesResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return {
      ok: response.ok,
      data: [] as unknown[],
      message: response.ok ? undefined : `Falha ao carregar templates (status ${response.status}).`,
    }
  }

  try {
    const payload = await response.json()
    return {
      ok: response.ok,
      data: extractTemplatesFromPayload(payload),
      message:
        !response.ok && isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : undefined,
    }
  } catch (error) {
    return {
      ok: response.ok,
      data: [] as unknown[],
      message: response.ok ? undefined : `Falha ao processar resposta (${String(error)})`,
    }
  }
}

async function fetchDocumentTemplates(
  request: NextRequest,
  session: SessionPayload,
  tipo: string
) {
  const forwardedParams = new URLSearchParams(request.nextUrl.searchParams)
  forwardedParams.delete("tipo")

  const normalizedDocType = tipo.toUpperCase()

  if (!forwardedParams.has("tipo_documento")) {
    forwardedParams.set("tipo_documento", normalizedDocType)
  }

  const query = forwardedParams.toString()
  const superiorPath = `/templates/modelos-superiores${query ? `?${query}` : ""}`
  const institucionalPath = `/templates/modelos-institucionais${query ? `?${query}` : ""}`

  const superiorUrl = buildPlanningApiUrl(superiorPath)
  const institucionalUrl = buildPlanningApiUrl(institucionalPath)

  if (!superiorUrl || !institucionalUrl) {
    return planningApiNotConfiguredResponse()
  }

  const baseHeaders = buildAuthProxyHeaders(request.headers, session.token)

  try {
    const [superiorResult, institucionalResult] = await Promise.all([
      fetch(superiorUrl, {
        method: "GET",
        headers: new Headers(baseHeaders),
        cache: "no-store",
      }).then(parseTemplatesResponse),
      fetch(institucionalUrl, {
        method: "GET",
        headers: new Headers(baseHeaders),
        cache: "no-store",
      }).then(parseTemplatesResponse),
    ])

    const combined = [...superiorResult.data, ...institucionalResult.data]

    if (combined.length === 0) {
      const message =
        superiorResult.message ?? institucionalResult.message ?? "Não foi possível carregar os templates solicitados."
      return NextResponse.json({ message }, { status: 502 })
    }

    return NextResponse.json({ templates: combined })
  } catch (error) {
    console.error("Erro ao agregar templates por tipo de documento", error)
    return proxyErrorResponse("Não foi possível carregar os templates solicitados.")
  }
}

export async function GET(request: NextRequest) {
  const sessionOrResponse = ensureTemplatesSession()

  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse
  }

  const tipoParam = request.nextUrl.searchParams.get("tipo")?.toLowerCase()

  if (tipoParam === "etp" || tipoParam === "tr") {
    return fetchDocumentTemplates(request, sessionOrResponse, tipoParam)
  }

  const targetPath = buildTemplatesEndpointPath(request.nextUrl.searchParams)

  if (!targetPath) {
    return NextResponse.json({ message: "Parâmetros de consulta inválidos." }, { status: 400 })
  }

  return fetchTemplates(request, sessionOrResponse, targetPath)
}

export async function POST(request: NextRequest) {
  const sessionOrResponse = ensureTemplatesSession()

  if (sessionOrResponse instanceof NextResponse) {
    return sessionOrResponse
  }

  const targetUrl = buildPlanningApiUrl("/templates")

  if (!targetUrl) {
    return planningApiNotConfiguredResponse()
  }

  try {
    const rawBody = await request.text()
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: buildAuthProxyHeaders(request.headers, sessionOrResponse.token),
      body: rawBody,
    })

    return await buildProxyResponse(response)
  } catch (error) {
    console.error("Erro ao criar template", error)
    return proxyErrorResponse("Não foi possível criar o template no momento.")
  }
}
