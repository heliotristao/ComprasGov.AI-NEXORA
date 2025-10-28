import axios from "axios"

import { resolveApiBaseUrl } from "@/lib/env"

export const api = axios.create()

const initialBaseUrl = resolveApiBaseUrl()

if (initialBaseUrl) {
  api.defaults.baseURL = initialBaseUrl
}

api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    const latestBaseUrl = resolveApiBaseUrl()

    if (latestBaseUrl) {
      config.baseURL = latestBaseUrl
    }
  }

  if (!config.baseURL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL não está definida ou é inválida. Configure a variável de ambiente para realizar chamadas à API."
    )
  }

  return config
})
