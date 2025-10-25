import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { config } from "@/lib/config"
import { useAuthStore } from "@/stores/authStore"

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  access_token?: string
  [key: string]: unknown
}

async function requestLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  const configuredBaseUrl = config.api.baseUrl?.trim()

  if (!configuredBaseUrl) {
    const error = new Error(
      "Falha na configuração do ambiente. Verifique a variável NEXT_PUBLIC_API_URL e tente novamente.",
    )

    console.error("Configuração de NEXT_PUBLIC_API_URL ausente ou inválida.", error)
    throw error
  }

  let tokenEndpoint: string

  try {
    tokenEndpoint = new URL("/token", configuredBaseUrl).toString()
  } catch (error) {
    console.error("Configuração de NEXT_PUBLIC_API_URL ausente ou inválida.", error)
    throw new Error(
      "Falha na configuração do ambiente. Verifique a variável NEXT_PUBLIC_API_URL e tente novamente.",
    )
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Falha ao autenticar. Tente novamente mais tarde.")
  }

  try {
    return await response.json()
  } catch {
    return {}
  }
}

export function useAuth() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  return useMutation({
    mutationFn: requestLogin,
    onSuccess: (data) => {
      const token = data?.access_token

      if (!token) {
        console.error("Token JWT não encontrado na resposta da API.")
        return
      }

      login(token)
      router.push("/dashboard")
    },
    onError: (error) => {
      console.error("Erro ao autenticar usuário:", error)
    },
  })
}
