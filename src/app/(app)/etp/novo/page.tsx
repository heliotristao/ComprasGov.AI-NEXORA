"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, AlertCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/axios"
import { toast } from "sonner"

interface ModeloInstitucional {
  id: number
  nome: string
  descricao: string
  tipo: string
  modelo_superior_id: number
  modelo_superior_nome: string
}

export default function NovoETPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("planId")

  const [modelos, setModelos] = useState<ModeloInstitucional[]>([])
  const [modeloSelecionado, setModeloSelecionado] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    carregarModelos()
  }, [])

  const carregarModelos = async () => {
    try {
      const response = await api.get("/api/v1/modelos-institucionais", {
        params: { tipo: "ETP", ativo: true }
      })
      setModelos(response.data.modelos || [])
    } catch (error) {
      console.error("Erro ao carregar modelos:", error)
      toast.error("Erro ao carregar templates disponíveis")
    } finally {
      setLoading(false)
    }
  }

  const handleCriar = async () => {
    if (!modeloSelecionado) {
      toast.error("Selecione um template para continuar")
      return
    }

    if (!planId) {
      toast.error("Plano de contratação não identificado")
      return
    }

    setCriando(true)
    try {
      const response = await api.post("/api/v1/etp", {
        plan_id: parseInt(planId),
        template_id: modeloSelecionado
      })

      const documentoId = response.data.id
      toast.success("ETP criado com sucesso!")
      
      // Redirecionar para o wizard
      router.push(`/etp/${documentoId}/wizard`)
    } catch (error: any) {
      console.error("Erro ao criar ETP:", error)
      toast.error(error.response?.data?.detail || "Erro ao criar ETP")
    } finally {
      setCriando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando templates...</p>
        </div>
      </div>
    )
  }

  if (!planId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Plano de contratação não identificado. Volte para a lista de planos e tente novamente.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/plans")} className="mt-4">
          Voltar para Planos
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Estudo Técnico Preliminar (ETP)</h1>
        <p className="text-muted-foreground mt-2">
          Selecione o template institucional que será utilizado para criar o ETP
        </p>
      </div>

      {modelos.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum template de ETP está disponível. Entre em contato com o administrador do sistema.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Templates Disponíveis</CardTitle>
            <CardDescription>
              Escolha o template que melhor se adequa ao tipo de contratação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={modeloSelecionado?.toString()}
              onValueChange={(value) => setModeloSelecionado(parseInt(value))}
              className="space-y-4"
            >
              {modelos.map((modelo) => (
                <div
                  key={modelo.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => setModeloSelecionado(modelo.id)}
                >
                  <RadioGroupItem value={modelo.id.toString()} id={`modelo-${modelo.id}`} />
                  <div className="flex-1">
                    <Label
                      htmlFor={`modelo-${modelo.id}`}
                      className="font-semibold cursor-pointer flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {modelo.nome}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {modelo.descricao}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Baseado em: {modelo.modelo_superior_nome}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/plans")}
                disabled={criando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCriar}
                disabled={!modeloSelecionado || criando}
                className="flex-1"
              >
                {criando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando ETP...
                  </>
                ) : (
                  "Criar ETP e Continuar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

