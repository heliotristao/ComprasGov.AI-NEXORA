"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { AutosaveBadge, type AutosaveStatus } from "@/app/_shared/components/AutosaveBadge"
import { WizardStepper, type WizardStep } from "@/app/_shared/components/WizardStepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, type StatusVariant } from "@/components/data-display/status-badge"

import {
  trFormSchema,
  trStepSchemas,
  type TrFormValues,
  type TrType,
} from "../_schemas/trSchemas"
import type { TrRecord } from "./types"
import { TrBensEspecificacoesStep } from "./bens/TrBensEspecificacoesStep"
import { TrBensGarantiaStep } from "./bens/TrBensGarantiaStep"
import { TrBensIdentificacaoStep } from "./bens/TrBensIdentificacaoStep"
import { TrBensQuantidadesStep } from "./bens/TrBensQuantidadesStep"
import { TrServicosDimensionamentoStep } from "./servicos/TrServicosDimensionamentoStep"
import { TrServicosEscopoStep } from "./servicos/TrServicosEscopoStep"
import { TrServicosSlasStep } from "./servicos/TrServicosSlasStep"

const AUTO_SAVE_DELAY = 1500

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

function clampStep(step: number, total: number) {
  return Math.min(Math.max(step, 1), total)
}

function normalizeStatus(status: string | null | undefined): StatusVariant {
  const normalized = status ? status.toUpperCase() : "DRAFT"
  if (["DRAFT", "PENDING", "APPROVED", "REJECTED", "ARCHIVED"].includes(normalized)) {
    return normalized as StatusVariant
  }
  return "DRAFT"
}

function buildDefaultValues(tr: TrRecord, tipo: TrType): TrFormValues {
  const formData = (tr.formData ?? {}) as Record<string, any>

  if (tipo === "bens") {
    const bensForm: TrFormBensValues = {
      tipo: "bens",
      identificacao: {
        objeto: formData?.identificacao?.objeto ?? "",
        justificativa: formData?.identificacao?.justificativa ?? "",
        setorRequisitante: formData?.identificacao?.setorRequisitante ?? "",
        codigoEdocs:
          formData?.identificacao?.codigoEdocs ?? tr.edocs ?? "",
      },
      especificacoes: {
        descricaoTecnica: formData?.especificacoes?.descricaoTecnica ?? "",
        requisitosMinimos: formData?.especificacoes?.requisitosMinimos ?? "",
        normasReferencia: formData?.especificacoes?.normasReferencia ?? "",
      },
      quantidades: {
        quantidadeTotal:
          formData?.quantidades?.quantidadeTotal !== undefined
            ? Number(formData?.quantidades?.quantidadeTotal)
            : formData?.quantidades?.quantidade_total !== undefined
              ? Number(formData?.quantidades?.quantidade_total)
              : undefined,
        unidadeMedida: formData?.quantidades?.unidadeMedida ?? formData?.quantidades?.unidade_medida ?? "",
        justificativaQuantidade:
          formData?.quantidades?.justificativaQuantidade ?? formData?.quantidades?.justificativa_quantidade ?? "",
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
      requisitosTecnicos: formData?.escopo?.requisitosTecnicos ?? formData?.escopo?.requisitos_tecnicos ?? "",
    },
    dimensionamento: {
      quantidadeProfissionais:
        formData?.dimensionamento?.quantidadeProfissionais !== undefined
          ? Number(formData?.dimensionamento?.quantidadeProfissionais)
          : formData?.dimensionamento?.quantidade_profissionais !== undefined
            ? Number(formData?.dimensionamento?.quantidade_profissionais)
            : undefined,
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

function extractStepPayload(values: TrFormValues, tipo: TrType, stepIndex: number): Record<string, unknown> | null {
  const config = STEP_CONFIGS[tipo][stepIndex - 1]
  if (!config) return null
  return config.extractPayload(values)
}

function typeLabel(tipo: TrType) {
  return tipo === "bens" ? "Bens" : "Serviços"
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

  const stepConfigs = STEP_CONFIGS[tipo]
  const totalSteps = stepConfigs.length

  const defaultValues = React.useMemo(() => buildDefaultValues(tr, tipo), [tr, tipo])

  const methods = useForm<TrFormValues>({
    resolver: zodResolver(trFormSchema),
    mode: "onChange",
    defaultValues,
  })

  const [currentStep, setCurrentStep] = React.useState(() => clampStep(initialStep, totalSteps))
  const [autosaveStatus, setAutosaveStatus] = React.useState<AutosaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(() =>
    tr.updatedAt ? new Date(tr.updatedAt) : null
  )

  const autosaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const skipNextWatchRef = React.useRef(true)

  const currentEdocs = tipo === "bens" ? methods.watch("identificacao.codigoEdocs" as const) : undefined

  React.useEffect(() => {
    methods.reset(defaultValues)
    skipNextWatchRef.current = true
  }, [defaultValues, methods])

  const updateUrlStep = React.useCallback(
    (nextStep: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("step", String(nextStep))
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const notifyStepChange = React.useCallback(
    async (nextStep: number) => {
      try {
        await fetch(`/api/tr/${tr.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            step: nextStep,
            tipo,
          }),
        })
      } catch (error) {
        console.error("Não foi possível sincronizar o passo do TR", error)
      }
    },
    [tipo, tr.id]
  )

  const goToStep = React.useCallback(
    (nextStep: number, options?: { skipNotify?: boolean }) => {
      const clamped = clampStep(nextStep, totalSteps)
      setCurrentStep(clamped)
      updateUrlStep(clamped)
      if (!options?.skipNotify) {
        void notifyStepChange(clamped)
      }
    },
    [notifyStepChange, totalSteps, updateUrlStep]
  )

  const handleAutosave = React.useCallback(
    async (values: TrFormValues) => {
      if (!methods.formState.isDirty) {
        setAutosaveStatus("idle")
        return
      }

      const patch = extractStepPayload(values, tipo, currentStep)
      if (!patch) {
        setAutosaveStatus("idle")
        return
      }

      try {
        setAutosaveStatus("saving")
        const response = await fetch(`/api/tr/${tr.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            step: currentStep,
            patch,
          }),
        })

        if (!response.ok) {
          throw new Error(`Auto-save do TR retornou status ${response.status}`)
        }

        setLastSavedAt(new Date())
        setAutosaveStatus("saved")
        skipNextWatchRef.current = true
        methods.reset(values)
      } catch (error) {
        console.error("Falha no auto-save do TR", error)
        setAutosaveStatus("error")
        toast.error("Não foi possível salvar automaticamente. Tente novamente.")
      }
    },
    [currentStep, methods, tipo, tr.id]
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

  const validateStep = React.useCallback(
    async (stepIndex: number) => {
      const schema = trStepSchemas[tipo][stepIndex]
      const values = methods.getValues()
      const payload = extractStepPayload(values, tipo, stepIndex)

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
    [methods, stepConfigs, tipo]
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

    goToStep(currentStep + 1)
  }, [currentStep, goToStep, totalSteps, validateStep])

  const handlePrevious = React.useCallback(() => {
    if (currentStep <= 1) {
      return
    }
    goToStep(currentStep - 1)
  }, [currentStep, goToStep])

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

      goToStep(targetStep)
    },
    [currentStep, goToStep, validateStep]
  )

  const statusVariant = normalizeStatus(tr.status)
  const activeStep = stepConfigs[currentStep - 1]

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <header className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span>TR #{tr.id}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <span>Tipo: {typeLabel(tipo)}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <span>Código E-Docs: {currentEdocs || tr.edocs || "—"}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <StatusBadge status={statusVariant} />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              {tr.title || `Termo de Referência - ${typeLabel(tipo)}`}
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
            <CardTitle className="text-lg font-semibold text-neutral-900">
              {activeStep?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">{activeStep?.component}</CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-neutral-100 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-neutral-500">
              Última atualização: {lastSavedAt ? lastSavedAt.toLocaleString("pt-BR") : "—"}
            </div>
            <div className="flex w-full gap-3 md:w-auto">
              <Button variant="outline" type="button" onClick={handlePrevious} disabled={currentStep === 1}>
                Voltar
              </Button>
              <Button type="button" onClick={handleNext}>
                {currentStep === totalSteps ? "Finalizar" : "Avançar"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  )
}
