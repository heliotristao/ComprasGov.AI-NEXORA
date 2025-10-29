"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Circle, AlertCircle, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { ETPSidebar } from "./ETPSidebar"
import { ETPSecaoForm } from "./ETPSecaoForm"
import { useETPDocument } from "@/hooks/api/useETPDocument"
import { toast } from "sonner"

interface ETPWizardProps {
  documentoId: number
  planId: number
}

export function ETPWizard({ documentoId, planId }: ETPWizardProps) {
  const router = useRouter()
  const [secaoAtual, setSecaoAtual] = useState(0)
  const [salvandoAutomatico, setSalvandoAutomatico] = useState(false)
  
  // Hook customizado para gerenciar documento ETP
  const {
    documento,
    template,
    isLoading,
    atualizarDados,
    validarConformidade
  } = useETPDocument(documentoId)

  const handleSalvar = useCallback(
    async (automatico = false) => {
      if (!documento) return

      try {
        if (automatico) {
          setSalvandoAutomatico(true)
        }

        await atualizarDados(documento.dados)

        if (!automatico) {
          toast.success("Progresso salvo com sucesso!")
        }
      } catch (error) {
        if (!automatico) {
          toast.error("Erro ao salvar progresso")
        }
      } finally {
        if (automatico) {
          setSalvandoAutomatico(false)
        }
      }
    },
    [atualizarDados, documento]
  )

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (!documento) return

    const interval = setInterval(() => {
      void handleSalvar(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [documento, handleSalvar])

  if (isLoading || !documento || !template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando documento...</p>
        </div>
      </div>
    )
  }

  const secoes = template.estrutura.secoes
  const secao = secoes[secaoAtual]
  const totalSecoes = secoes.length

  const handleProximo = async () => {
    // Salvar antes de avançar
    await handleSalvar()
    
    if (secaoAtual < totalSecoes - 1) {
      setSecaoAtual(secaoAtual + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleAnterior = () => {
    if (secaoAtual > 0) {
      setSecaoAtual(secaoAtual - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleAtualizarSecao = (secaoId: string, dados: any) => {
    const novosDados = {
      ...documento.dados,
      [secaoId]: {
        ...documento.dados[secaoId],
        ...dados
      }
    }

    atualizarDados(novosDados)
  }

  const handleIrParaSecao = (index: number) => {
    setSecaoAtual(index)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getStatusSecao = (index: number): "completo" | "em_progresso" | "pendente" => {
    const secao = secoes[index]
    const dados = documento.dados[secao.id]

    if (!dados) return "pendente"

    // Verificar se todos os campos obrigatórios estão preenchidos
    const camposObrigatorios = secao.campos.filter((c: any) => c.obrigatorio)
    const camposPreenchidos = camposObrigatorios.filter((c: any) => {
      const valor = dados[c.id]
      return valor !== undefined && valor !== null && valor !== ""
    })

    if (camposPreenchidos.length === camposObrigatorios.length) {
      return "completo"
    } else if (camposPreenchidos.length > 0) {
      return "em_progresso"
    }

    return "pendente"
  }

  const statusSecaoAtual = getStatusSecao(secaoAtual)

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar com mapa de navegação */}
      <ETPSidebar
        secoes={secoes}
        secaoAtual={secaoAtual}
        progresso={documento.progresso_percentual}
        onIrParaSecao={handleIrParaSecao}
        getStatusSecao={getStatusSecao}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Estudo Técnico Preliminar - ETP
                </h1>
                <p className="text-muted-foreground">
                  Plano #{planId} • Documento #{documentoId}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {salvandoAutomatico && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Salvando...
                  </span>
                )}
                <Button variant="outline" onClick={() => handleSalvar()}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Seção {secaoAtual + 1} de {totalSecoes}
                </span>
                <span className="font-medium">
                  {documento.progresso_percentual}% completo
                </span>
              </div>
              <Progress value={documento.progresso_percentual} className="h-2" />
            </div>
          </div>

          {/* Alertas */}
          {secao.obrigatoria && statusSecaoAtual === "pendente" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta seção contém campos obrigatórios pela Lei 14.133/2021
              </AlertDescription>
            </Alert>
          )}

          {/* Formulário da seção atual */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">
                    {secao.ordem}. {secao.titulo}
                  </CardTitle>
                  {secao.descricao && (
                    <CardDescription className="text-base">
                      {secao.descricao}
                    </CardDescription>
                  )}
                  {secao.codigo_lei && (
                    <p className="text-sm text-muted-foreground">
                      {secao.codigo_lei}
                    </p>
                  )}
                </div>

                {/* Indicador de status */}
                <div className="flex items-center gap-2">
                  {statusSecaoAtual === "completo" && (
                    <span className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Completo
                    </span>
                  )}
                  {statusSecaoAtual === "em_progresso" && (
                    <span className="flex items-center gap-2 text-sm text-yellow-600">
                      <Circle className="h-4 w-4 fill-current" />
                      Em progresso
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Nota explicativa (colapsável) */}
              {secao.nota_explicativa && (
                <Alert className="mb-6">
                  <AlertDescription className="text-sm">
                    {secao.nota_explicativa}
                  </AlertDescription>
                </Alert>
              )}

              {/* Formulário da seção */}
              <ETPSecaoForm
                secao={secao}
                dados={documento.dados[secao.id] || {}}
                onAtualizarDados={(dados) => handleAtualizarSecao(secao.id, dados)}
                documentoId={documentoId}
              />
            </CardContent>
          </Card>

          {/* Navegação */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleAnterior}
              disabled={secaoAtual === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="text-sm text-muted-foreground">
              Seção {secaoAtual + 1} de {totalSecoes}
            </div>

            {secaoAtual < totalSecoes - 1 ? (
              <Button onClick={handleProximo}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => router.push(`/etp/${documentoId}/consolidar`)}>
                Ir para Consolidação
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

