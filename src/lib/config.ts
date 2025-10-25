// /src/lib/config.ts

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

if (!apiBaseUrl) {
  console.error(
    "ERRO CRÍTICO: A variável de ambiente NEXT_PUBLIC_API_URL não está definida.",
  )
  // Em um app real, poderíamos lançar um erro aqui, mas por enquanto, vamos logar.
}

export const config = {
  api: {
    baseUrl: apiBaseUrl || "", // Usa a URL ou uma string vazia como fallback
  },
}
