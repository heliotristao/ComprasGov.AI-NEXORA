"use client"

import { useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { exportRiskMatrixToPdf } from "@/lib/risk/export-to-pdf"
import {
  IMPACT_LEVELS,
  PROBABILITY_LEVELS,
  RiskMatrixGrid,
  RiskMatrixRisk,
  distributeRisks,
  formatImpactLabel,
  formatProbabilityLabel,
  getSeverityClasses,
  normalizeRisks,
} from "@/lib/risk/matrix"
import { cn } from "@/lib/utils"
import { AlertCircle, Download, Loader2 } from "lucide-react"

const REQUEST_STATUSES = ["idle", "loading", "success", "empty", "error"] as const

interface RiskMatrixResponse {
  risks?: unknown
}

type RequestStatus = (typeof REQUEST_STATUSES)[number]

export default function RiskMatrixPage() {
  const [description, setDescription] = useState("")
  const [analysisDescription, setAnalysisDescription] = useState("")
  const [risks, setRisks] = useState<RiskMatrixRisk[]>([])
  const [status, setStatus] = useState<RequestStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const matrix: RiskMatrixGrid = useMemo(() => distributeRisks(risks), [risks])

  const isLoading = status === "loading"
  const isEmpty = status === "empty"
  const hasResult = status === "success"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!description.trim()) {
      setErrorMessage("Informe a descrição do objeto para analisar os riscos.")
      setStatus("error")
      return
    }

    setStatus("loading")
    setErrorMessage(null)
    setExportError(null)

    try {
      const response = await fetch("/api/v1/risk/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: description.trim() }),
      })

      if (!response.ok) {
        throw new Error("Não foi possível gerar a matriz de riscos.")
      }

      const payload: RiskMatrixResponse = await response.json()
      const normalizedRisks = normalizeRisks(payload.risks)

      setRisks(normalizedRisks)
      setAnalysisDescription(description.trim())

      if (normalizedRisks.length === 0) {
        setStatus("empty")
      } else {
        setStatus("success")
      }
    } catch (error) {
      console.error(error)
      setErrorMessage("Ocorreu um erro ao analisar os riscos. Tente novamente em instantes.")
      setStatus("error")
    }
  }

  async function handleExport() {
    if (!risks.length || isExporting) {
      return
    }

    setIsExporting(true)
    setExportError(null)

    try {
      await exportRiskMatrixToPdf({
        description: analysisDescription || description,
        risks,
      })
    } catch (error) {
      console.error(error)
      setExportError("Não foi possível exportar o PDF. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Riscos</CardTitle>
          <CardDescription>
            Informe a descrição do objeto da contratação para gerar automaticamente a matriz de riscos com heatmap e medidas de
            mitigação sugeridas pela IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="risk-description" className="text-sm font-medium text-foreground">
                Descrição do Objeto da Contratação
              </label>
              <Textarea
                id="risk-description"
                placeholder="Descreva o objeto da contratação com detalhes para análise contextual dos riscos."
                minLength={10}
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-sm text-muted-foreground">
                Quanto mais contexto você fornecer, mais precisa será a análise automática da matriz de riscos.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Analisar Riscos
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleExport}
                disabled={!risks.length || isLoading || isExporting || status === "error"}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Exportar PDF
              </Button>
              <span className="text-sm text-muted-foreground">
                O PDF inclui a visualização do heatmap e a lista detalhada de riscos com medidas de mitigação.
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      {status === "error" && errorMessage && (
        <Alert variant="error" className="border-error-200 bg-error-50">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Falha na análise</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {exportError && (
        <Alert variant="error" className="border-error-200 bg-error-50">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Falha na exportação</AlertTitle>
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Gerando matriz de riscos</CardTitle>
            <CardDescription>Aguarde enquanto geramos os riscos mais prováveis e suas medidas de mitigação.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Processando a solicitação com a IA...
            </div>
          </CardContent>
        </Card>
      )}

      {isEmpty && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Nenhum risco identificado</CardTitle>
            <CardDescription>
              Ajuste a descrição do objeto e tente novamente para obter recomendações de mitigação alinhadas ao contexto.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {hasResult && (
        <TooltipProvider delayDuration={150}>
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de calor dos riscos</CardTitle>
                <CardDescription>
                  Cada célula representa o cruzamento entre probabilidade (linhas) e impacto (colunas). Passe o mouse para ver os
                  riscos detalhados.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-full">
                  <table className="w-full border-separate border-spacing-3 text-sm">
                    <thead>
                      <tr>
                        <th className="w-48 align-bottom text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Probabilidade ↓
                        </th>
                        {IMPACT_LEVELS.map((impact) => (
                          <th
                            key={impact}
                            className="min-w-[140px] text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            Impacto {impact}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PROBABILITY_LEVELS.map((probability, rowIndex) => (
                        <tr key={probability}>
                          <th className="align-middle text-left text-sm font-semibold text-muted-foreground">
                            {probability}
                          </th>
                          {IMPACT_LEVELS.map((impact, columnIndex) => {
                            const cellRisks = matrix[rowIndex][columnIndex]
                            const severityClasses = getSeverityClasses(rowIndex, columnIndex)

                            return (
                              <td key={`${probability}-${impact}`} className="p-1">
                                <div
                                  className={cn(
                                    "relative flex h-28 flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2 text-center",
                                    severityClasses,
                                    cellRisks.length > 0 ? "shadow-sm shadow-black/5" : "text-muted-foreground"
                                  )}
                                >
                                  {cellRisks.length > 0 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                          <span className="text-2xl font-bold leading-none">{cellRisks.length}</span>
                                          <span className="text-xs font-medium uppercase tracking-wide">{cellRisks.length === 1 ? "Risco" : "Riscos"}</span>
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-sm space-y-3">
                                        {cellRisks.map((risk, riskIndex) => (
                                          <div key={`${risk.risk_description}-${riskIndex}`} className="space-y-1">
                                            <p className="text-sm font-semibold text-white">{risk.risk_description}</p>
                                            <p className="text-xs text-white/80">
                                              Mitigação: {risk.mitigation_measure}
                                            </p>
                                          </div>
                                        ))}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span className="text-lg font-semibold">—</span>
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lista detalhada de riscos</CardTitle>
                <CardDescription>
                  Utilize esta visão para planejar ações preventivas e acompanhar a execução das medidas propostas para cada risco.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {risks.map((risk, index) => (
                  <div
                    key={`${risk.risk_description}-${index}`}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>
                          <p className="text-base font-semibold text-foreground">{risk.risk_description}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{risk.mitigation_measure}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="warning">Probabilidade: {formatProbabilityLabel(risk.probability)}</Badge>
                        <Badge variant="secondary">Impacto: {formatImpactLabel(risk.impact)}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </TooltipProvider>
      )}
    </div>
  )
}
