"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Circle, AlertCircle, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { ETPSidebar } from "../etp/ETPSidebar"
import { ETPSecaoForm } from "../etp/ETPSecaoForm"
import { useTRDocument } from "@/hooks/api/useTRDocument"
import { toast } from "sonner"

interface TRWizardProps {
  documentoId: number
  etpId: number
}

export function TRWizard({ documentoId, etpId }: TRWizardProps) {
  const router = useRouter()
  const [secaoAtual, setSecaoAtual] = useState(0)
  const [salvandoAutomatico, setSalvandoAutomatico] = useState(false)
  
  // Hook customizado para gerenciar documento TR
  const {
    documento,
    template,
    isLoading,
    atualizarDados,
    validarConformidade
  } = useTRDocument(documentoId)

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (!documento) return

    const interval = setInterval(() => {
      handleSalvar(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [documento])

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

  const handleSalvar = async (automatico = false) => {
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
        <div className="max-w-4xl mx-auto">
          {/* Header da seção */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold">{secao.titulo}</h2>
                <p className="text-muted-foreground">{secao.descricao}</p>
              </div>
              <div className="flex items-center gap-2">
                {salvandoAutomatico && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    Salvando...
                  </span>
                )}
                <Button onClick={() => handleSalvar()} variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
            <Progress value={documento.progresso_percentual} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {documento.progresso_percentual}% concluído
            </p>
          </div>

          {/* Formulário da seção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {statusSecaoAtual === "completo" && (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                )}
                {statusSecaoAtual === "em_progresso" && (
                  <Circle className="h-5 w-5 text-warning fill-warning/20" />
                )}
                {statusSecaoAtual === "pendente" && (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                Seção {secaoAtual + 1} de {totalSecoes}
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo conforme a Lei 14.133/2021
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ETPSecaoForm
                secao={secao}
                dados={documento.dados[secao.id] || {}}
                onAtualizarDados={(dados) => handleAtualizarSecao(secao.id, dados)}
                documentoId={documentoId}
              />
            </CardContent>
          </Card>

          {/* Navegação */}
          <div className="flex items-center justify-between mt-8">
            <Button
              onClick={handleAnterior}
              disabled={secaoAtual === 0}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <div className="text-sm text-muted-foreground">
              Seção {secaoAtual + 1} de {totalSecoes}
            </div>

            {secaoAtual < totalSecoes - 1 ? (
              <Button onClick={handleProximo}>
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => router.push(`/tr/${documentoId}/consolidar`)}>
                Finalizar e Consolidar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Alertas de conformidade */}
          {statusSecaoAtual === "pendente" && (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta seção possui campos obrigatórios que ainda não foram preenchidos.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

