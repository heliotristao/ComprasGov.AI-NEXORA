import { useMutation } from "@tanstack/react-query"

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
  return useMutation({
    mutationFn: requestLogin,
  })
}
