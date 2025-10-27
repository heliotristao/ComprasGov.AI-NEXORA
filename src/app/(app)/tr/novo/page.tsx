"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/axios"
import { toast } from "sonner"

function NovoTRContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const etpId = searchParams.get("etpId")

  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)
  const [etpInfo, setEtpInfo] = useState<any>(null)

  useEffect(() => {
    if (etpId) {
      carregarETP()
    } else {
      setLoading(false)
    }
  }, [etpId])

  const carregarETP = async () => {
    try {
      const response = await api.get(`/api/v1/etp/${etpId}`)
      setEtpInfo(response.data)
    } catch (error) {
      console.error("Erro ao carregar ETP:", error)
      toast.error("Erro ao carregar informações do ETP")
    } finally {
      setLoading(false)
    }
  }

  const handleCriarTR = async () => {
    if (!etpId) {
      toast.error("ETP não identificado")
      return
    }

    setCriando(true)
    try {
      const response = await api.post(`/api/v1/tr/criar-de-etp/${etpId}`)
      
      const trId = response.data.id
      toast.success("TR criado com sucesso a partir do ETP!")
      
      // Redirecionar para o wizard do TR
      router.push(`/tr/${trId}/wizard`)
    } catch (error: any) {
      console.error("Erro ao criar TR:", error)
      toast.error(error.response?.data?.detail || "Erro ao criar TR")
    } finally {
      setCriando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando informações do ETP...</p>
        </div>
      </div>
    )
  }

  if (!etpId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ETP não identificado. Volte para a lista de ETPs e tente novamente.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/etp")} className="mt-4">
          Voltar para ETPs
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Termo de Referência (TR)</h1>
        <p className="text-muted-foreground mt-2">
          O TR será criado automaticamente com base no ETP aprovado
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do ETP Base</CardTitle>
          <CardDescription>
            O TR herdará automaticamente os dados do ETP selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {etpInfo && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-slate-50">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">ETP #{etpInfo.id}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Plano: {etpInfo.plano_identificador || "Não identificado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Template: {etpInfo.template_nome || "Não especificado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Progresso: {etpInfo.progresso_percentual || 0}%
                  </p>
                </div>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Dados que serão herdados:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Descrição da necessidade</li>
                    <li>Requisitos da contratação</li>
                    <li>Estimativa de valor</li>
                    <li>Análise de mercado</li>
                    <li>Outros campos compatíveis</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>O sistema criará um novo TR vinculado a este ETP</li>
              <li>Dados compatíveis serão copiados automaticamente</li>
              <li>Você poderá revisar e complementar as informações</li>
              <li>Campos específicos do TR precisarão ser preenchidos</li>
              <li>Ao final, o documento estará pronto para licitação</li>
            </ol>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/etp")}
              disabled={criando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCriarTR}
              disabled={criando}
              className="flex-1"
            >
              {criando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando TR...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Criar TR e Continuar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NovoTRPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    }>
      <NovoTRContent />
    </Suspense>
  )
}

