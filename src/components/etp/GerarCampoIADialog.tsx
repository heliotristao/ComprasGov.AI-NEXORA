"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Loader2, Check, X, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/axios"

interface Campo {
  id: string
  label: string
  tipo: string
}

interface GerarCampoIADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campo: Campo
  secaoId: string
  documentoId: number
  contexto: Record<string, any>
  onAceitar: (conteudo: string) => void
}

export function GerarCampoIADialog({
  open,
  onOpenChange,
  campo,
  secaoId,
  documentoId,
  contexto,
  onAceitar
}: GerarCampoIADialogProps) {
  const [gerando, setGerando] = useState(false)
  const [conteudoGerado, setConteudoGerado] = useState("")
  const [scoreConfianca, setScoreConfianca] = useState(0)
  const [editando, setEditando] = useState(false)
  const [conteudoEditado, setConteudoEditado] = useState("")

  const handleGerar = async () => {
    setGerando(true)
    
    try {
      // Chamar API real usando axios
      const { data } = await api.post(`/api/v1/etp/${documentoId}/gerar-campo`, {
        secao_id: secaoId,
        campo_id: campo.id,
        contexto: contexto
      })
      
      setConteudoGerado(data.conteudo_gerado)
      setScoreConfianca(data.score_confianca * 100)
      setConteudoEditado(data.conteudo_gerado)
      
    } catch (error) {
      toast.error("Erro ao gerar conteúdo com IA")
      console.error(error)
      
      // Mock para demonstração
      setTimeout(() => {
        const mockConteudo = `Este é um conteúdo gerado pela IA para o campo "${campo.label}". 

A IA analisou o contexto fornecido e gerou este texto baseado nas melhores práticas para elaboração de Estudos Técnicos Preliminares conforme a Lei 14.133/2021.

Este conteúdo pode ser editado antes de ser aceito.`
        
        setConteudoGerado(mockConteudo)
        setConteudoEditado(mockConteudo)
        setScoreConfianca(85)
      }, 2000)
      
    } finally {
      setGerando(false)
    }
  }

  const handleAceitar = () => {
    onAceitar(editando ? conteudoEditado : conteudoGerado)
    onOpenChange(false)
  }

  const handleRejeitar = () => {
    onOpenChange(false)
  }

  const getCorScore = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Conteúdo com IA
          </DialogTitle>
          <DialogDescription>
            A IA irá gerar conteúdo para o campo: <strong>{campo.label}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!conteudoGerado && !gerando && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Clique no botão abaixo para gerar o conteúdo
              </p>
              <Button onClick={handleGerar} size="lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar com IA
              </Button>
            </div>
          )}

          {gerando && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Gerando conteúdo...
              </p>
              <p className="text-sm text-muted-foreground">
                A IA está analisando o contexto e gerando o conteúdo
              </p>
            </div>
          )}

          {conteudoGerado && !gerando && (
            <>
              {/* Score de confiança */}
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Score de Confiança
                      </span>
                      <span className={`text-sm font-bold ${getCorScore(scoreConfianca)}`}>
                        {scoreConfianca.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={scoreConfianca} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Este score indica o nível de confiança da IA na qualidade do conteúdo gerado
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Conteúdo gerado */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Conteúdo Gerado
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditando(!editando)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {editando ? "Visualizar" : "Editar"}
                  </Button>
                </div>

                {editando ? (
                  <Textarea
                    value={conteudoEditado}
                    onChange={(e) => setConteudoEditado(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/30 whitespace-pre-wrap text-sm">
                    {conteudoGerado}
                  </div>
                )}
              </div>

              {/* Aviso */}
              <Alert>
                <AlertDescription className="text-xs">
                  ⚠️ <strong>Importante:</strong> O conteúdo gerado pela IA deve ser revisado
                  por um responsável técnico antes de ser utilizado no documento oficial.
                  A IA é uma ferramenta de auxílio, não substitui a responsabilidade do servidor.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        {conteudoGerado && !gerando && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleRejeitar}>
              <X className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
            <Button onClick={handleGerar} variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Novamente
            </Button>
            <Button onClick={handleAceitar}>
              <Check className="h-4 w-4 mr-2" />
              Aceitar e Aplicar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

