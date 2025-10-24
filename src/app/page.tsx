"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuthStore } from "@/stores/authStore"

export default function HomePage() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const redirectTo = (tokenValue: string | null | undefined) => {
      if (tokenValue) {
        router.replace("/dashboard")
        return
      }

      router.replace("/login")
    }

    if (useAuthStore.persist.hasHydrated()) {
      redirectTo(token)
      return
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration?.((state) => {
      redirectTo(state?.token as string | null | undefined)
    })

    useAuthStore.persist.rehydrate?.()

    return () => {
      unsubscribe?.()
    }
  }, [router, token])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" aria-hidden="true" />
      <p className="mt-3 text-sm text-slate-500">Redirecionando para a aplicação...</p>
    </div>
  )
}
