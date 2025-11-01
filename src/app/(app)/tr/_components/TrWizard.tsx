"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, type Resolver } from "react-hook-form"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AutosaveBadge, type AutosaveStatus } from "@/app/_shared/components/AutosaveBadge"
import { WizardStepper, type WizardStep } from "@/app/_shared/components/WizardStepper"
import { StatusBadge, type StatusVariant } from "@/components/data-display/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTr, type TrDocument } from "@/hooks/useTr"
import { buildEdocsUrl, isValidEdocs, normalizeEdocsValue } from "@/lib/edocs"

import { trFormSchema, trStepSchemas, type TrFormValues, type TrType } from "../_schemas/trSchemas"
import type { TrRecord } from "./types"
import { TrBensEspecificacoesStep } from "./bens/TrBensEspecificacoesStep"
import { TrBensGarantiaStep } from "./bens/TrBensGarantiaStep"
import { TrBensIdentificacaoStep } from "./bens/TrBensIdentificacaoStep"
import { TrBensQuantidadesStep } from "./bens/TrBensQuantidadesStep"
import { TrServicosDimensionamentoStep } from "./servicos/TrServicosDimensionamentoStep"
import { TrServicosEscopoStep } from "./servicos/TrServicosEscopoStep"
import { TrServicosSlasStep } from "./servicos/TrServicosSlasStep"

const AUTO_SAVE_DELAY = 2000

type StepConfig = WizardStep & {
  fields: string[]
  component: React.ReactNode
  extractPayload: (values: TrFormValues) => Record<string, unknown> | null
}

type TrFormBensValues = Extract<TrFormValues, { tipo: "bens" }>
type TrFormServicosValues = Extract<TrFormValues, { tipo: "servicos" }>

const BENS_STEP_CONFIGS: StepConfig[] = [
  {
    id: 1,
    title: "Identificação",
    description: "Contextualize o objeto, justificativa e dados institucionais.",
    fields: [
      "identificacao.codigoEdocs",
      "identificacao.objeto",
      "identificacao.justificativa",
      "identificacao.setorRequisitante",
    ],
    component: <TrBensIdentificacaoStep />,
    extractPayload: (values) => {
      if (values.tipo !== "bens") return null
      return {
        tipo: values.tipo,
        identificacao: values.identificacao,
      }
    },
  },
  {
    id: 2,
    title: "Especificações",
    description: "Detalhe requisitos técnicos, mínimos e normas aplicáveis.",
    fields: [
      "especificacoes.descricaoTecnica",
      "especificacoes.requisitosMinimos",
      "especificacoes.normasReferencia",
    ],
    component: <TrBensEspecificacoesStep />,
    extractPayload: (values) => {
      if (values.tipo !== "bens") return null
      return {
        tipo: values.tipo,
        especificacoes: values.especificacoes,
      }
    },
  },
  {
    id: 3,
    title: "Quantidades",
    description: "Dimensione quantitativos, unidades e cronograma de entrega.",
    fields: [
      "quantidades.quantidadeTotal",
      "quantidades.unidadeMedida",
      "quantidades.justificativaQuantidade",
      "quantidades.cronogramaEntrega",
    ],
    component: <TrBensQuantidadesStep />,
    extractPayload: (values) => {
      if (values.tipo !== "bens") return null
      return {
        tipo: values.tipo,
        quantidades: values.quantidades,
      }
    },
  },
  {
    id: 4,
    title: "Garantia",
    description: "Defina garantias, prazos e condições de assistência técnica.",
    fields: [
      "garantia.tipoGarantia",
      "garantia.prazoGarantia",
      "garantia.assistenciaTecnica",
    ],
    component: <TrBensGarantiaStep />,
    extractPayload: (values) => {
      if (values.tipo !== "bens") return null
      return {
        tipo: values.tipo,
        garantia: values.garantia,
      }
    },
  },
]

const SERVICOS_STEP_CONFIGS: StepConfig[] = [
  {
    id: 1,
    title: "Escopo",
    description: "Defina escopo, objetivos estratégicos e requisitos técnicos.",
    fields: ["escopo.descricaoServico", "escopo.objetivos", "escopo.requisitosTecnicos"],
    component: <TrServicosEscopoStep />,
    extractPayload: (values) => {
      if (values.tipo !== "servicos") return null
      return {
        tipo: values.tipo,
        escopo: values.escopo,
      }
    },
  },
  {
    id: 2,
    title: "Dimensionamento",
    description: "Planeje equipe, carga horária e critérios de alocação.",
    fields: [
      "dimensionamento.quantidadeProfissionais",
      "dimensionamento.cargaHoraria",
      "dimensionamento.criteriosAlocacao",
    ],
    component: <TrServicosDimensionamentoStep />,
    extractPayload: (values) => {
      if (values.tipo !== "servicos") return null
      return {
        tipo: values.tipo,
        dimensionamento: values.dimensionamento,
      }
    },
  },
  {
    id: 3,
    title: "SLAs",
    description: "Estabeleça níveis de serviço, indicadores e penalidades.",
    fields: ["slas.niveisServico", "slas.indicadoresDesempenho", "slas.penalidades"],
    component: <TrServicosSlasStep />,
    extractPayload: (values) => {
      if (values.tipo !== "servicos") return null
      return {
        tipo: values.tipo,
        slas: values.slas,
      }
    },
  },
]

const STEP_CONFIGS: Record<TrType, StepConfig[]> = {
  bens: BENS_STEP_CONFIGS,
  servicos: SERVICOS_STEP_CONFIGS,
}

function clampStep(step: number | null | undefined, total: number) {
  if (!Number.isFinite(step)) return 1
  const parsed = Number(step)
  if (!Number.isFinite(parsed)) return 1
  return Math.min(Math.max(parsed, 1), total)
}

function normalizeStatus(status: string | null | undefined): StatusVariant {
  const normalized = status ? status.toUpperCase() : "DRAFT"
  if (["DRAFT", "PENDING", "APPROVED", "REJECTED", "ARCHIVED"].includes(normalized)) {
    return normalized as StatusVariant
  }
  return "DRAFT"
}

function toNumberOrNaN(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return Number.NaN
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? Number.NaN : parsed
}

function buildDefaultValues(
  tr: TrRecord,
  tipo: TrType,
  data?: Record<string, unknown> | Partial<Record<string, unknown>>
): TrFormValues {
  const formData = ((data ?? tr.formData ?? {}) as Record<string, any>) ?? {}

  if (tipo === "bens") {
    const bensForm: TrFormBensValues = {
      tipo: "bens",
      identificacao: {
        objeto: formData?.identificacao?.objeto ?? "",
        justificativa: formData?.identificacao?.justificativa ?? "",
        setorRequisitante: formData?.identificacao?.setorRequisitante ?? "",
        codigoEdocs: formData?.identificacao?.codigoEdocs ?? formData?.identificacao?.codigo_edocs ?? tr.edocs ?? "",
      },
      especificacoes: {
        descricaoTecnica: formData?.especificacoes?.descricaoTecnica ?? formData?.especificacoes?.descricao_tecnica ?? "",
        requisitosMinimos:
          formData?.especificacoes?.requisitosMinimos ?? formData?.especificacoes?.requisitos_minimos ?? "",
        normasReferencia:
          formData?.especificacoes?.normasReferencia ?? formData?.especificacoes?.normas_referencia ?? "",
      },
      quantidades: {
        quantidadeTotal: toNumberOrNaN(
          formData?.quantidades?.quantidadeTotal ?? formData?.quantidades?.quantidade_total
        ),
        unidadeMedida:
          formData?.quantidades?.unidadeMedida ?? formData?.quantidades?.unidade_medida ?? "",
        justificativaQuantidade:
          formData?.quantidades?.justificativaQuantidade ??
          formData?.quantidades?.justificativa_quantidade ??
          "",
        cronogramaEntrega:
          formData?.quantidades?.cronogramaEntrega ?? formData?.quantidades?.cronograma_entrega ?? "",
      },
      garantia: {
        tipoGarantia: formData?.garantia?.tipoGarantia ?? formData?.garantia?.tipo_garantia ?? "",
        prazoGarantia: formData?.garantia?.prazoGarantia ?? formData?.garantia?.prazo_garantia ?? "",
        assistenciaTecnica:
          formData?.garantia?.assistenciaTecnica ?? formData?.garantia?.assistencia_tecnica ?? "",
      },
    }

    return bensForm
  }

  const servicosForm: TrFormServicosValues = {
    tipo: "servicos",
    escopo: {
      descricaoServico: formData?.escopo?.descricaoServico ?? formData?.escopo?.descricao_servico ?? "",
      objetivos: formData?.escopo?.objetivos ?? "",
      requisitosTecnicos:
        formData?.escopo?.requisitosTecnicos ?? formData?.escopo?.requisitos_tecnicos ?? "",
    },
    dimensionamento: {
      quantidadeProfissionais: toNumberOrNaN(
        formData?.dimensionamento?.quantidadeProfissionais ??
          formData?.dimensionamento?.quantidade_profissionais
      ),
      cargaHoraria: formData?.dimensionamento?.cargaHoraria ?? formData?.dimensionamento?.carga_horaria ?? "",
      criteriosAlocacao:
        formData?.dimensionamento?.criteriosAlocacao ?? formData?.dimensionamento?.criterios_alocacao ?? "",
    },
    slas: {
      niveisServico: formData?.slas?.niveisServico ?? formData?.slas?.niveis_servico ?? "",
      indicadoresDesempenho:
        formData?.slas?.indicadoresDesempenho ?? formData?.slas?.indicadores_desempenho ?? "",
      penalidades: formData?.slas?.penalidades ?? "",
    },
  }

  return servicosForm
}

function extractStepPayload(
  configs: StepConfig[],
  stepIndex: number,
  values: TrFormValues
): Record<string, unknown> | null {
  const config = configs[stepIndex - 1]
  if (!config) return null
  return config.extractPayload(values)
}

function typeLabel(tipo: TrType) {
  return tipo === "bens" ? "Bens" : "Serviços"
}

function buildInitialDocument(tr: TrRecord, tipo: TrType, initialStep?: number): TrDocument {
  const configs = STEP_CONFIGS[tipo]
  const totalSteps = configs.length
  return {
    id: tr.id,
    tipo,
    step: clampStep(tr.step ?? initialStep ?? 1, totalSteps),
    status: tr.status ?? null,
    updatedAt: tr.updatedAt ?? null,
    createdAt: tr.createdAt ?? null,
    data: (tr.formData as Record<string, unknown>) ?? {},
  }
}

export interface TrWizardProps {
  tr: TrRecord
  initialStep?: number
  tipo: TrType
}

export function TrWizard({ tr, initialStep = 1, tipo }: TrWizardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialDocument = React.useMemo(() => buildInitialDocument(tr, tipo, initialStep), [tr, tipo, initialStep])

  const { data: trDocument, error, isLoading, isFetching, saveStep, isSaving } = useTr(tr.id, {
    initialData: initialDocument,
  })

  const documentData = trDocument ?? initialDocument

  const [activeTipo, setActiveTipo] = React.useState<TrType>(documentData.tipo ?? tipo)

  React.useEffect(() => {
    if (tipo && tipo !== activeTipo) {
      setActiveTipo(tipo)
    }
  }, [activeTipo, tipo])

  React.useEffect(() => {
    if (trDocument?.tipo && trDocument.tipo !== activeTipo) {
      setActiveTipo(trDocument.tipo)
    }
  }, [activeTipo, trDocument?.tipo])

  const stepConfigs = React.useMemo(() => STEP_CONFIGS[activeTipo], [activeTipo])
  const totalSteps = stepConfigs.length

  const defaultValues = React.useMemo(
    () => buildDefaultValues(tr, activeTipo, documentData.data),
    [activeTipo, documentData.data, tr]
  )

  const methods = useForm<TrFormValues>({
    resolver: zodResolver(trFormSchema) as Resolver<TrFormValues>,
    mode: "onChange",
    defaultValues,
  })

  const [currentStep, setCurrentStep] = React.useState(() => clampStep(documentData.step, totalSteps))
  const [autosaveStatus, setAutosaveStatus] = React.useState<AutosaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(() =>
    documentData.updatedAt ? new Date(documentData.updatedAt) : null
  )

  const autosaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const skipNextWatchRef = React.useRef(true)

  React.useEffect(() => {
    if (trDocument?.updatedAt) {
      setLastSavedAt(new Date(trDocument.updatedAt))
    }
  }, [trDocument?.updatedAt])

  React.useEffect(() => {
    if (!trDocument?.step) return
    setCurrentStep((previous) => {
      const next = clampStep(trDocument.step, totalSteps)
      if (next === previous) return previous
      return next
    })
  }, [totalSteps, trDocument?.step])

  React.useEffect(() => {
    methods.reset(defaultValues)
    skipNextWatchRef.current = true
  }, [defaultValues, methods])

  const updateUrlStep = React.useCallback(
    (nextStep: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("step", String(nextStep))
      params.set("tipo", activeTipo)
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [activeTipo, pathname, router, searchParams]
  )

  const goToStep = React.useCallback(
    (nextStep: number) => {
      const clamped = clampStep(nextStep, totalSteps)
      setCurrentStep(clamped)
      updateUrlStep(clamped)
    },
    [totalSteps, updateUrlStep]
  )

  const saveCurrentStep = React.useCallback(
    async (
      targetStep: number,
      values: TrFormValues,
      { force }: { force?: boolean } = {}
    ) => {
      const shouldPersistValues = force || methods.formState.isDirty
      let patch = shouldPersistValues
        ? extractStepPayload(stepConfigs, currentStep, values) ?? { tipo: values.tipo }
        : undefined

      if (patch && !("tipo" in patch) && values.tipo) {
        patch = { tipo: values.tipo, ...patch }
      }

      if (!patch && targetStep === currentStep && !shouldPersistValues) {
        setAutosaveStatus("idle")
        return true
      }

      try {
        setAutosaveStatus("saving")
        const updated = await saveStep(targetStep, patch)
        const updatedAt = updated?.updatedAt ?? (updated as any)?.updated_at ?? null
        setLastSavedAt(updatedAt ? new Date(updatedAt) : new Date())
        setAutosaveStatus("saved")
        skipNextWatchRef.current = true
        methods.reset(values)
        return true
      } catch (err) {
        console.error("Falha ao salvar etapa do TR", err)
        setAutosaveStatus("error")
        toast.error("Não foi possível salvar automaticamente. Tente novamente.")
        return false
      }
    },
    [currentStep, methods, saveStep, stepConfigs]
  )

  const handleAutosave = React.useCallback(
    async (values: TrFormValues) => {
      await saveCurrentStep(currentStep, values, { force: true })
    },
    [currentStep, saveCurrentStep]
  )

  React.useEffect(() => {
    const subscription = methods.watch((values) => {
      if (skipNextWatchRef.current) {
        skipNextWatchRef.current = false
        return
      }

      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }

      setAutosaveStatus("scheduled")
      const nextValues = values as TrFormValues

      autosaveTimeoutRef.current = setTimeout(() => {
        void handleAutosave(nextValues)
      }, AUTO_SAVE_DELAY)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [handleAutosave, methods])

  React.useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (!error) {
      return
    }

    console.error("Falha ao carregar TR", error)
    toast.error("Não foi possível carregar os dados mais recentes do TR.")
  }, [error])

  const validateStep = React.useCallback(
    async (stepIndex: number) => {
      const schema = trStepSchemas[activeTipo][stepIndex]
      const values = methods.getValues()
      const payload = extractStepPayload(stepConfigs, stepIndex, values)

      if (!schema || !payload) {
        return true
      }

      const result = schema.safeParse(payload)
      if (!result.success) {
        const fields = stepConfigs[stepIndex - 1]?.fields
        if (fields?.length) {
          const isValid = await methods.trigger(fields as any, { shouldFocus: true })
          return isValid
        }
        return false
      }

      const fields = stepConfigs[stepIndex - 1]?.fields
      if (fields?.length) {
        return methods.trigger(fields as any, { shouldFocus: true })
      }

      return true
    },
    [activeTipo, methods, stepConfigs]
  )

  const handleNext = React.useCallback(async () => {
    if (currentStep >= totalSteps) {
      return
    }

    const isValid = await validateStep(currentStep)
    if (!isValid) {
      toast.error("Revise os campos obrigatórios antes de avançar.")
      return
    }

    const values = methods.getValues()
    const saved = await saveCurrentStep(currentStep + 1, values)
    if (saved) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, goToStep, methods, saveCurrentStep, totalSteps, validateStep])

  const handlePrevious = React.useCallback(async () => {
    if (currentStep <= 1) {
      return
    }

    const values = methods.getValues()
    const saved = await saveCurrentStep(currentStep - 1, values)
    if (saved) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep, methods, saveCurrentStep])

  const handleStepClick = React.useCallback(
    async (targetStep: number) => {
      if (targetStep === currentStep) return

      if (targetStep > currentStep) {
        const isValid = await validateStep(currentStep)
        if (!isValid) {
          toast.error("Conclua os campos obrigatórios antes de avançar.")
          return
        }
      }

      const values = methods.getValues()
      const saved = await saveCurrentStep(targetStep, values)
      if (saved) {
        goToStep(targetStep)
      }
    },
    [currentStep, goToStep, methods, saveCurrentStep, validateStep]
  )

  const statusVariant = normalizeStatus(trDocument?.status ?? tr.status)
  const activeStep = stepConfigs[currentStep - 1]
  const currentEdocs = activeTipo === "bens" ? methods.watch("identificacao.codigoEdocs" as const) : undefined
  const normalizedHeaderEdocs = normalizeEdocsValue(currentEdocs ?? tr.edocs)
  const hasValidHeaderEdocs = isValidEdocs(normalizedHeaderEdocs)

  if (isLoading && !trDocument) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    )
  }

  if (error && !trDocument) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive">
        <h2 className="text-lg font-semibold">Falha ao carregar o Termo de Referência</h2>
        <p className="mt-2 text-sm text-destructive/80">
          Atualize a página ou tente novamente. Persistindo o erro, contate o suporte técnico.
        </p>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <header className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span>TR #{tr.id}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <span>Tipo: {typeLabel(activeTipo)}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <span>
                Código E-Docs:
                {hasValidHeaderEdocs ? (
                  <a
                    href={buildEdocsUrl(normalizedHeaderEdocs)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 inline-flex items-center gap-1 text-primary-600 underline-offset-2 hover:text-primary-700 hover:underline"
                  >
                    {normalizedHeaderEdocs}
                  </a>
                ) : (
                  <span className="ml-1">—</span>
                )}
              </span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <StatusBadge status={statusVariant} />
              {isFetching || isSaving ? (
                <span className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Atualizando dados
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {tr.title || `Termo de Referência - ${typeLabel(activeTipo)}`}
            </h1>
            <p className="text-sm text-neutral-500">
              Preencha todas as etapas para consolidar o Termo de Referência com rastreabilidade completa.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <AutosaveBadge status={autosaveStatus} lastSavedAt={lastSavedAt} />
            <Button variant="outline" asChild>
              <a href={`/api/tr/${tr.id}/export`} target="_blank" rel="noopener noreferrer">
                Exportar JSON
              </a>
            </Button>
          </div>
        </header>

        <WizardStepper steps={stepConfigs} currentStep={currentStep} onStepChange={handleStepClick} />

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900">{activeStep?.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">{activeStep?.component}</CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-neutral-100 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-neutral-500">
              Última atualização: {lastSavedAt ? lastSavedAt.toLocaleString("pt-BR") : "—"}
            </div>
            <div className="flex w-full gap-3 md:w-auto">
              <Button
                variant="outline"
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1 || autosaveStatus === "saving" || autosaveStatus === "scheduled"}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={autosaveStatus === "saving" || autosaveStatus === "scheduled"}
              >
                {currentStep === totalSteps ? "Finalizar" : "Avançar"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  )
}

