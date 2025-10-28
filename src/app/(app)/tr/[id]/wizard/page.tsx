"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { TRWizard } from "@/components/tr/TRWizard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function TRWizardPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = use(params)
  const documentoId = parseInt(id)

  if (isNaN(documentoId)) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">ID de documento inválido</p>
          <Button onClick={() => router.push("/tr")}>
            Voltar para TRs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/tr")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para TRs
          </Button>
          <h1 className="text-2xl font-bold">Termo de Referência (TR)</h1>
          <p className="text-muted-foreground">
            Preencha as informações obrigatórias conforme a Lei 14.133/2021
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <TRWizard documentoId={documentoId} etpId={0} />
      </div>
    </div>
  )
}

