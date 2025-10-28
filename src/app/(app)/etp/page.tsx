import { Suspense } from "react"

import { EtpList } from "./_components/EtpList"

export default function EtpPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Planejamento • ETP</h1>
        <p className="text-sm text-neutral-500">
          Centralize a criação e acompanhamento dos Estudos Técnicos Preliminares em andamento.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="space-y-3">
            <div className="h-12 w-full animate-pulse rounded-lg bg-neutral-100" />
            <div className="h-48 w-full animate-pulse rounded-lg bg-neutral-100" />
          </div>
        }
      >
        <EtpList />
      </Suspense>
    </div>
  )
}
