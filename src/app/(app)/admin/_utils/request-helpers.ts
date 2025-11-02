import { cookies, headers } from "next/headers"

function resolveInternalBaseUrl(): string | null {
  const headerList = headers()
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host")

  if (!host) {
    return null
  }

  const protocol = headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https")
  return `${protocol}://${host}`
}

export function buildInternalUrl(path: string): string {
  const baseUrl = resolveInternalBaseUrl()
  if (!baseUrl) {
    return path
  }
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

export function buildInternalHeaders(): Headers {
  const cookieHeader = cookies().toString()
  const requestHeaders = new Headers()
  requestHeaders.set("Accept", "application/json")

  if (cookieHeader) {
    requestHeaders.set("Cookie", cookieHeader)
  }

  return requestHeaders
}

export async function internalFetch(path: string, init: RequestInit = {}) {
  const url = buildInternalUrl(path)
  const headers = new Headers(init.headers ?? {})

  buildInternalHeaders().forEach((value, key) => {
    if (!headers.has(key)) {
      headers.set(key, value)
    }
  })

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  })
}
