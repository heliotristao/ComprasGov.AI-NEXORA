"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { TemplateSelect, type TemplateOption } from "./TemplateSelect"

interface DocumentTemplateField {
  id?: string
  titulo?: string
  label?: string
  descricao?: string | null
  obrigatorio?: boolean
}

interface DocumentTemplateSection {
  id?: string
  titulo?: string
  nome?: string
  descricao?: string | null
  campos?: DocumentTemplateField[]
}

interface DocumentTemplateStructure {
  secoes?: DocumentTemplateSection[]
}

interface DocumentTemplateDefinition {
  id?: string | number
  nome?: string | null
  estrutura?: DocumentTemplateStructure
}

export interface ConsolidationDocument {
  id: number
  identificador?: string | null
  titulo?: string | null
  tipo?: string | null
  tipo_documento?: string | null
  status?: string | null
  progresso_percentual?: number | null
  dados: Record<string, unknown>
  template_id?: string | number | null
  template?: DocumentTemplateDefinition | null
  plan_id?: number | string | null
  processo_vinculado?: string | null
  campos_obrigatorios_preenchidos?: Record<string, boolean>
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
}

interface DocumentValidationResult {
  valido: boolean
  mensagem?: string
  campos_obrigatorios_faltantes?: string[]
  avisos?: string[]
  detalhes?: Record<string, unknown>
  progresso_percentual?: number | null
}

interface GenerationLinks {
  docx?: string
  pdf?: string
  extras: { label: string; url: string }[]
}

interface DocumentGenerationResult {
  links: GenerationLinks
  payload: unknown
}

interface ConsolidarDocumentoProps {
  tipo: "etp" | "tr"
  documento: ConsolidationDocument
  templates: TemplateOption[]
  endpoints: {
    validate: string
    generate: string
    status: string
  }
  backHref?: string
}

interface SectionFieldSummary {
  id: string
  label: string
  descricao?: string | null
  valor?: string[]
  obrigatorio?: boolean
  preenchido?: boolean
}

interface SectionSummary {
  id: string
  titulo: string
  descricao?: string | null
  campos: SectionFieldSummary[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function normalizeString(value: unknown): string | null {
  if (typeof value === "string") {
    return value.trim()
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR").format(value)
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não"
  }

  return null
}

function extractSectionFieldValue(value: unknown): string[] {
  if (value === null || value === undefined) {
    return []
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeString(item) ?? (isRecord(item) ? JSON.stringify(item, null, 2) : null))
      .filter((item): item is string => Boolean(item))
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, item]) => {
        const normalized = normalizeString(item)
        if (normalized) {
          return `${key}: ${normalized}`
        }

        if (isRecord(item) || Array.isArray(item)) {
          return `${key}: ${JSON.stringify(item, null, 2)}`
        }

        return null
      })
      .filter((item): item is string => Boolean(item))
  }

  const normalized = normalizeString(value)
  return normalized ? [normalized] : []
}

function normalizeFieldLabel(field: DocumentTemplateField, fallback: string): string {
  const candidate = field.titulo ?? field.label ?? fallback
  return candidate.trim().length > 0 ? candidate.trim() : fallback
}

function normalizeSectionTitle(section: DocumentTemplateSection, fallbackIndex: number): string {
  const candidate = section.titulo ?? section.nome ?? `Seção ${fallbackIndex + 1}`
  return candidate.trim().length > 0 ? candidate.trim() : `Seção ${fallbackIndex + 1}`
}

function resolveFieldKey(sectionId: string, fieldId: string): string {
  if (!sectionId) {
    return fieldId
  }

  return `${sectionId}.${fieldId}`
}

function extractSections(documento: ConsolidationDocument): SectionSummary[] {
  const estrutura =
    (documento.template?.estrutura?.secoes as DocumentTemplateSection[] | undefined) ??
    ((documento.estrutura as DocumentTemplateStructure | undefined)?.secoes ?? [])

  const sections: SectionSummary[] = []
  const dados: Record<string, unknown> = documento.dados ?? {}

  if (Array.isArray(estrutura) && estrutura.length > 0) {
    estrutura.forEach((secao, index) => {
      const sectionId = secao.id ?? `secao-${index}`
      const sectionSource = dados[sectionId]
      const rawSectionData: Record<string, unknown> = isRecord(sectionSource)
        ? sectionSource
        : dados

      const campos = Array.isArray(secao.campos) ? secao.campos : []

      const normalizedFields: SectionFieldSummary[] = campos.map((campo, campoIndex) => {
        const fieldId = campo.id ?? `campo-${campoIndex}`
        const compositeKey = resolveFieldKey(sectionId, fieldId)
        const value = rawSectionData[fieldId] ?? rawSectionData[compositeKey] ?? dados[compositeKey]
        const valueList = extractSectionFieldValue(value)

        const preenchido = valueList.length > 0
        const obrigatorio =
          campo.obrigatorio ??
          documento.campos_obrigatorios_preenchidos?.[fieldId] ??
          documento.campos_obrigatorios_preenchidos?.[compositeKey]

        return {
          id: fieldId,
          label: normalizeFieldLabel(campo, `Campo ${campoIndex + 1}`),
          descricao: campo.descricao,
          valor: valueList,
          obrigatorio: Boolean(obrigatorio),
          preenchido,
        }
      })

      sections.push({
        id: sectionId,
        titulo: normalizeSectionTitle(secao, index),
        descricao: secao.descricao ?? null,
        campos: normalizedFields,
      })
    })

    return sections
  }

  if (isRecord(dados)) {
    const fallbackFields: SectionFieldSummary[] = Object.entries(dados).map(([key, value]) => {
      const valueList = extractSectionFieldValue(value)
      const obrigatorio = documento.campos_obrigatorios_preenchidos?.[key]

      return {
        id: key,
        label: key,
        valor: valueList,
        obrigatorio: Boolean(obrigatorio),
        preenchido: valueList.length > 0,
      }
    })

    return [
      {
        id: "resumo",
        titulo: "Resumo do documento",
        descricao: null,
        campos: fallbackFields,
      },
    ]
  }

  return []
}

function extractDownloadLinks(payload: unknown): GenerationLinks {
  if (!payload || typeof payload !== "object") {
    return { extras: [] }
  }

  const record = payload as Record<string, unknown>

  const docxCandidate =
    record.docx_url ??
    record.docxUrl ??
    record.document_docx_url ??
    (isRecord(record.links) ? (record.links.docx as string | undefined) : undefined)

  const pdfCandidate =
    record.pdf_url ??
    record.pdfUrl ??
    record.document_pdf_url ??
    (isRecord(record.links) ? (record.links.pdf as string | undefined) : undefined)

  const docx = typeof docxCandidate === "string" && docxCandidate ? docxCandidate : undefined
  const pdf = typeof pdfCandidate === "string" && pdfCandidate ? pdfCandidate : undefined

  const extras: { label: string; url: string }[] = []

  const filesCandidates = record.files ?? record.arquivos ?? record.outputs ?? record.links

  if (Array.isArray(filesCandidates)) {
    filesCandidates.forEach((item, index) => {
      if (isRecord(item) && typeof item.url === "string") {
        const label =
          typeof item.label === "string"
            ? item.label
            : typeof item.tipo === "string"
              ? item.tipo
              : `Arquivo ${index + 1}`
        extras.push({ label, url: item.url })
      } else if (typeof item === "string" && item) {
        extras.push({ label: `Arquivo ${index + 1}`, url: item })
      }
    })
  } else if (isRecord(filesCandidates)) {
    Object.entries(filesCandidates).forEach(([key, value]) => {
      if (typeof value === "string" && value) {
        const normalizedKey = key.toUpperCase()
        if (normalizedKey === "DOCX" && !docx) {
          extras.push({ label: "Documento (DOCX)", url: value })
        } else if (normalizedKey === "PDF" && !pdf) {
          extras.push({ label: "Documento (PDF)", url: value })
        } else {
          extras.push({ label: key, url: value })
        }
      }
    })
  }

  return { docx, pdf, extras }
}

function mapStatusToVariant(status: string | null | undefined): BadgeProps["variant"] {
  if (!status) {
    return "secondary"
  }

  const normalized = status.toUpperCase()

  switch (normalized) {
    case "DRAFT":
    case "EM_ELABORACAO":
      return "draft"
    case "IN_REVIEW":
    case "EM_REVISAO":
      return "pending"
    case "APPROVED":
    case "APROVADO":
    case "FINALIZADO":
      return "approved"
    case "REJECTED":
    case "REPROVADO":
      return "rejected"
    default:
      return "secondary"
  }
}

function mapStatusToLabel(status: string | null | undefined): string {
  if (!status) {
    return "Sem status"
  }

  const normalized = status.toUpperCase()

  switch (normalized) {
    case "DRAFT":
      return "Em elaboração"
    case "IN_REVIEW":
      return "Em revisão"
    case "APPROVED":
      return "Aprovado"
    case "REJECTED":
      return "Devolvido"
    case "FINALIZADO":
      return "Finalizado"
    default:
      return status
  }
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function ConsolidarDocumento({ tipo, documento, templates, endpoints, backHref }: ConsolidarDocumentoProps) {
  const router = useRouter()

  const [status, setStatus] = useState<string | null | undefined>(documento.status)
  const [progress, setProgress] = useState<number>(documento.progresso_percentual ?? 0)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const templateId = documento.template_id ?? documento.template?.id ?? templates[0]?.id
    return templateId ? String(templateId) : ""
  })
  const [validationResult, setValidationResult] = useState<DocumentValidationResult | null>(null)
  const [generationResult, setGenerationResult] = useState<DocumentGenerationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)

  const sections = useMemo(() => extractSections(documento), [documento])

  const validationSucceeded = validationResult?.valido ?? false
  const documentLabel = tipo === "etp" ? "Estudo Técnico Preliminar" : "Termo de Referência"
  const statusVariant = mapStatusToVariant(status)
  const statusLabel = mapStatusToLabel(status)
  const updatedAt = formatDate(documento.updated_at)
  const createdAt = formatDate(documento.created_at)

  const canGenerate = validationSucceeded && selectedTemplateId.length > 0
  const normalizedTemplateId = selectedTemplateId.length > 0 ? selectedTemplateId : undefined

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  const handleValidate = async () => {
    setIsValidating(true)
    setGenerationResult(null)

    try {
      const response = await fetch(endpoints.validate, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.message ?? "Falha ao validar o documento")
      }

      const payload = (await response.json()) as Partial<DocumentValidationResult>
      const normalized: DocumentValidationResult = {
        valido: Boolean(payload.valido),
        mensagem: payload.mensagem,
        campos_obrigatorios_faltantes: payload.campos_obrigatorios_faltantes ?? [],
        avisos: payload.avisos ?? [],
        detalhes: payload.detalhes,
        progresso_percentual: payload.progresso_percentual ?? null,
      }

      setValidationResult(normalized)

      if (typeof normalized.progresso_percentual === "number") {
        setProgress(normalized.progresso_percentual)
      }

      if (normalized.valido) {
        toast.success("Documento validado com sucesso. Nenhuma pendência crítica foi encontrada.")
      } else {
        toast.info("Validação concluída. Revise as pendências antes de gerar o documento.")
      }
    } catch (error) {
      console.error("Erro ao validar documento", error)
      toast.error(error instanceof Error ? error.message : "Não foi possível validar o documento agora.")
    } finally {
      setIsValidating(false)
    }
  }

  const handleGenerate = async () => {
    if (!canGenerate || !normalizedTemplateId) {
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch(endpoints.generate, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ template_id: normalizedTemplateId }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.message ?? "Não foi possível gerar o documento consolidado.")
      }

      const payload = await response.json()
      const links = extractDownloadLinks(payload)

      setGenerationResult({
        links,
        payload,
      })

      toast.success("Documento gerado com sucesso. Faça o download para revisão final.")
    } catch (error) {
      console.error("Erro ao gerar documento", error)
      toast.error(error instanceof Error ? error.message : "Falha ao gerar o documento consolidado.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendToReview = async () => {
    setIsStatusUpdating(true)

    try {
      const response = await fetch(endpoints.status, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status: "IN_REVIEW" }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.message ?? "Não foi possível enviar o documento para revisão.")
      }

      setStatus("IN_REVIEW")
      toast.success("Documento enviado para revisão.")
    } catch (error) {
      console.error("Erro ao enviar documento para revisão", error)
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar o status do documento.")
    } finally {
      setIsStatusUpdating(false)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    setGenerationResult(null)
  }

  const validationHasIssues = Boolean(
    validationResult &&
      (!validationResult.valido ||
        (validationResult.campos_obrigatorios_faltantes && validationResult.campos_obrigatorios_faltantes.length > 0))
  )

  const isInReview = status?.toUpperCase() === "IN_REVIEW"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack} className="gap-2 px-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Consolidação do {documentLabel}
          </h1>

          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>Documento #{documento.id}</span>
          {documento.identificador && <span>Identificador: {documento.identificador}</span>}
          {documento.plan_id && <span>Plano #{documento.plan_id}</span>}
          {createdAt && <span>Criado em {createdAt}</span>}
          {updatedAt && <span>Atualizado em {updatedAt}</span>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status geral do preenchimento</CardTitle>
              <CardDescription>
                Revise o conteúdo registrado para garantir que todas as seções obrigatórias foram completadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Progresso geral</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {sections.length > 0 ? (
                <ScrollArea className="max-h-[560px]">
                  <div className="space-y-4 pr-2">
                    {sections.map((section) => (
                      <Card key={section.id} className="border-muted">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base font-semibold leading-tight">
                                {section.titulo}
                              </CardTitle>
                              {section.descricao && (
                                <CardDescription className="text-xs">
                                  {section.descricao}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {section.campos.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum campo registrado para esta seção.</p>
                          ) : (
                            section.campos.map((campo) => {
                              const valueList = campo.valor ?? []
                              const hasValue = valueList.length > 0
                              const isRequired = Boolean(campo.obrigatorio)
                              const isMissing = isRequired && !hasValue

                              return (
                                <div
                                  key={campo.id}
                                  className={cn(
                                    "rounded-lg border p-3 text-sm transition-colors",
                                    isMissing
                                      ? "border-red-200 bg-red-50/70"
                                      : hasValue
                                        ? "border-slate-200 bg-white"
                                        : "border-dashed border-slate-200 bg-muted/40"
                                  )}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-medium text-slate-900">{campo.label}</span>
                                    {isRequired && (
                                      <Badge variant={hasValue ? "success" : "warning"}>
                                        {hasValue ? "Preenchido" : "Obrigatório"}
                                      </Badge>
                                    )}
                                  </div>

                                  {campo.descricao && (
                                    <p className="mt-1 text-xs text-muted-foreground">{campo.descricao}</p>
                                  )}

                                  <div className="mt-2 space-y-1">
                                    {hasValue ? (
                                      valueList.map((entry, index) => (
                                        <p key={index} className="whitespace-pre-wrap text-sm text-slate-700">
                                          {entry}
                                        </p>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">
                                        Nenhum valor informado.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum dado foi encontrado para este documento. Volte ao preenchimento para incluir as informações necessárias.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {validationResult && (
            <Card className={cn(validationHasIssues ? "border-amber-200 bg-amber-50/60" : "border-emerald-200 bg-emerald-50/60")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {validationHasIssues ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  )}
                  Resultado da validação de conformidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {validationResult.valido ? (
                  <p className="font-medium text-emerald-700">
                    Nenhuma pendência crítica encontrada. Você pode gerar o documento final.
                  </p>
                ) : (
                  <p className="font-medium text-amber-700">
                    Foram identificadas pendências que precisam ser sanadas antes da geração do documento.
                  </p>
                )}

                {validationResult.campos_obrigatorios_faltantes &&
                  validationResult.campos_obrigatorios_faltantes.length > 0 && (
                    <div>
                      <p className="font-medium text-amber-800">Campos obrigatórios pendentes:</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                        {validationResult.campos_obrigatorios_faltantes.map((campo) => (
                          <li key={campo}>{campo}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {validationResult.avisos && validationResult.avisos.length > 0 && (
                  <div>
                    <p className="font-medium text-slate-800">Avisos:</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                      {validationResult.avisos.map((aviso, index) => (
                        <li key={`${aviso}-${index}`}>{aviso}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <TemplateSelect
            templates={templates}
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            helperText="Selecione o modelo que será utilizado na geração do DOCX/PDF. Você pode alterar o template a qualquer momento antes da geração."
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Ações de consolidação</CardTitle>
              <CardDescription>
                Valide a conformidade e gere o documento final utilizando o template selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleValidate}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Validar conformidade
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  A validação confere os requisitos legais, campos obrigatórios e consistência geral do documento.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando documento...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Gerar documento
                    </>
                  )}
                </Button>
                {!validationSucceeded && (
                  <p className="text-xs text-amber-600">
                    Realize a validação de conformidade para habilitar a geração do documento.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {generationResult && (
            <Card className="border-emerald-200 bg-emerald-50/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Documento pronto para download
                </CardTitle>
                <CardDescription className="text-sm text-emerald-700">
                  Baixe os arquivos gerados e finalize a revisão antes do envio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3">
                  {generationResult.links.docx && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => window.open(generationResult.links.docx, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                      Baixar DOCX
                    </Button>
                  )}

                  {generationResult.links.pdf && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.open(generationResult.links.pdf, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </Button>
                  )}

                  {generationResult.links.extras.map((item) => (
                    <Button
                      key={item.url}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <Sparkles className="h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4" />
                Fluxo de revisão
              </CardTitle>
              <CardDescription>
                Após a conferência, envie o documento para revisão formal junto ao controle interno.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleSendToReview}
                disabled={isStatusUpdating || isInReview}
              >
                {isStatusUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {isInReview ? "Documento em revisão" : "Enviar para revisão"}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                O status do documento será atualizado para <strong>Em revisão</strong> e ficará disponível para a equipe responsável.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
