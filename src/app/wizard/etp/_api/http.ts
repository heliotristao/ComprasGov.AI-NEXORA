export interface JsonRecord {
  [key: string]: unknown
}

export async function parseJson(response: Response): Promise<JsonRecord | null> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as JsonRecord
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Resposta não é um JSON válido", error)
    }
    return null
  }
}

export function extractErrorMessage(body: JsonRecord | null, fallback: string) {
  if (!body) return fallback
  if (typeof body.message === "string") return body.message
  if (typeof body.detail === "string") return body.detail
  if (typeof body.error === "string") return body.error
  return fallback
}
