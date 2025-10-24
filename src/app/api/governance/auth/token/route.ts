import { NextRequest, NextResponse } from "next/server"

const DEFAULT_GOVERNANCE_URL =
  process.env.GOVERNANCE_SERVICE_URL ||
  process.env.NEXT_PUBLIC_GOVERNANCE_SERVICE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000"

function ensureBaseUrl() {
  try {
    return new URL(DEFAULT_GOVERNANCE_URL)
  } catch (error) {
    console.error("Invalid governance service URL", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null)

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { message: "Corpo da requisição inválido. Informe email e senha." },
      { status: 400 }
    )
  }

  const { email, password } = payload as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email e senha são obrigatórios." },
      { status: 400 }
    )
  }

  const baseUrl = ensureBaseUrl()

  if (!baseUrl) {
    return NextResponse.json(
      { message: "Configuração da API de governança ausente ou inválida." },
      { status: 500 }
    )
  }

  const tokenUrl = new URL("/api/v1/token", baseUrl)
  const body = new URLSearchParams({
    username: email,
    password,
    grant_type: "password",
  })

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    })

    const text = await response.text()
    const maybeJson = text ? safeJsonParse(text) : null

    if (!response.ok) {
      return NextResponse.json(
        maybeJson ?? { message: text || "Falha ao autenticar no serviço de governança." },
        { status: response.status }
      )
    }

    return NextResponse.json(maybeJson ?? { access_token: text })
  } catch (error) {
    console.error("Erro ao contatar serviço de governança", error)

    return NextResponse.json(
      { message: "Não foi possível contatar o serviço de governança." },
      { status: 502 }
    )
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown
  } catch (error) {
    console.error("Falha ao analisar resposta JSON do serviço de governança", error)
    return null
  }
}
