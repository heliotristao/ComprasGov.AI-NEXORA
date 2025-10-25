import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

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
  const response = await fetch("/api/governance/auth/token", {
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
