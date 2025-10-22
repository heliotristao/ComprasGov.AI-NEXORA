"use client"

import { useRouter } from "next/navigation"
import { ComponentType, useEffect, useState } from "react"

import { useAuthStore } from "@/stores/authStore"

function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  function ComponentWithAuth(props: P) {
    const router = useRouter()
    const token = useAuthStore((state) => state.token)
    const [isHydrated, setIsHydrated] = useState(
      typeof window === "undefined" ? false : useAuthStore.persist.hasHydrated()
    )

    useEffect(() => {
      const onHydrate = useAuthStore.persist.onHydrate?.(() => {
        setIsHydrated(false)
      })
      const onFinishHydration = useAuthStore.persist.onFinishHydration?.(() => {
        setIsHydrated(true)
      })

      return () => {
        onHydrate?.()
        onFinishHydration?.()
      }
    }, [])

    useEffect(() => {
      if (isHydrated && !token) {
        router.replace("/login")
      }
    }, [isHydrated, router, token])

    if (!isHydrated) {
      return <div>Carregando...</div>
    }

    if (!token) {
      return null
    }

    return <WrappedComponent {...(props as P)} />
  }

  ComponentWithAuth.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"})`

  return ComponentWithAuth
}

export default withAuth
