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
import { useEtp, type EtpDocument } from "@/hooks/useEtp"

import { buildEdocsUrl, isValidEdocs, normalizeEdocsValue } from "@/lib/edocs"

import { EtpFormStep1 } from "./EtpFormStep1"
import { EtpFormStep2 } from "./EtpFormStep2"
import { EtpFormStep3 } from "./EtpFormStep3"
import { etpFormSchema, type EtpFormValues, type EtpRecord } from "./types"

const AUTO_SAVE_DELAY = 2000
const TOTAL_STEPS = 3

const WIZARD_STEPS: (WizardStep & { fields: (keyof EtpFormValues | `${keyof EtpFormValues}.${string}`)[] })[] = [
  {
    id: 1,
    title: "Contexto e necessidade",
    description: "Fundamente o ETP com título, contexto e justificativas.",
    fields: ["general.title", "general.context", "general.justification"],
  },
  {
    id: 2,
    title: "Soluções avaliadas",
    description: "Documente alternativas, escolha recomendada e escopo da solução.",
    fields: ["solution.alternatives", "solution.recommended", "solution.scope"],
  },
  {
    id: 3,
    title: "Viabilidade",
    description: "Detalhe mercado, estimativas financeiras, cronograma e riscos.",
    fields: [
      "viability.marketAnalysis",
      "viability.estimatedBudget",
      "viability.schedule",
      "viability.risks",
    ],
  },
]

export interface EtpWizardProps {
  etp: EtpRecord
  initialStep?: number
}

function normalizeStatus(status: string | undefined | null): StatusVariant {
  const normalized = status ? status.toUpperCase() : "DRAFT"
  if (["DRAFT", "PENDING", "APPROVED", "REJECTED", "ARCHIVED"].includes(normalized)) {
    return normalized as StatusVariant
  }
  return "DRAFT"
}

function clampStep(step: number | null | undefined, total = TOTAL_STEPS) {
  if (!Number.isFinite(step)) return 1
  const parsed = Number(step)
  if (!Number.isFinite(parsed)) return 1
  return Math.min(Math.max(parsed, 1), total)
}

function resolveFormData(
  etp: EtpRecord,
  data?: Record<string, unknown> | Partial<EtpFormValues>
): Partial<EtpFormValues> {
  if (!data || typeof data !== "object") {
    return (etp.formData ?? {}) as Partial<EtpFormValues>
  }
  return (data as Partial<EtpFormValues>) ?? {}
}

function buildDefaultValues(
  etp: EtpRecord,
  data?: Record<string, unknown> | Partial<EtpFormValues>
): EtpFormValues {
  const formData = resolveFormData(etp, data)

  const general = (formData.general ?? {}) as Partial<EtpFormValues["general"]>
  const solution = (formData.solution ?? {}) as Partial<EtpFormValues["solution"]>
  const viability = (formData.viability ?? {}) as Partial<EtpFormValues["viability"]>

  return {
    general: {
      title: general.title ?? etp.title ?? "",
      context: general.context ?? "",
      justification: general.justification ?? "",
    },
    solution: {
      alternatives: solution.alternatives ?? "",
      recommended: solution.recommended ?? "",
      scope: solution.scope ?? "",
    },
    viability: {
      marketAnalysis: viability.marketAnalysis ?? "",
      estimatedBudget:
        typeof viability.estimatedBudget === "number"
          ? viability.estimatedBudget
          : Number(viability.estimatedBudget ?? 0),
      schedule: viability.schedule ?? "",
      risks: viability.risks ?? "",
    },
  }
}

function extractStepPatch(step: number, values: EtpFormValues): Record<string, unknown> | undefined {
  if (step === 1) {
    return { general: values.general }
  }
  if (step === 2) {
    return { solution: values.solution }
  }
  if (step === 3) {
    return { viability: values.viability }
  }
  return undefined
}

function buildInitialDocument(etp: EtpRecord, initialStep?: number): EtpDocument {
  return {
    id: etp.id,
    step: clampStep(etp.step ?? initialStep ?? 1),
    status: etp.status,
    updatedAt: etp.updatedAt ?? null,
    createdAt: etp.createdAt ?? null,
    data: (etp.formData as Record<string, unknown>) ?? {},
  }
}

export function EtpWizard({ etp, initialStep = 1 }: EtpWizardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const initialDocument = React.useMemo(() => buildInitialDocument(etp, initialStep), [etp, initialStep])

  const {
    data: etpDocument,
    error,
    isLoading,
    isFetching,
    saveStep,
    isSaving,
  } = useEtp(etp.id, {
    initialData: initialDocument,
  })

  const documentData = etpDocument ?? initialDocument

  const normalizedEdocs = React.useMemo(() => normalizeEdocsValue(etp.edocs), [etp.edocs])
  const hasValidEdocs = React.useMemo(() => isValidEdocs(normalizedEdocs), [normalizedEdocs])

  const defaultValues = React.useMemo(
    () => buildDefaultValues(etp, documentData.data as Partial<EtpFormValues>),
    [documentData.data, etp]
  )

  const methods = useForm<EtpFormValues>({
    resolver: zodResolver(etpFormSchema) as Resolver<EtpFormValues>,
    mode: "onChange",
    defaultValues,
  })

  const [currentStep, setCurrentStep] = React.useState(() => clampStep(documentData.step, TOTAL_STEPS))
  const [autosaveStatus, setAutosaveStatus] = React.useState<AutosaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(() =>
    documentData.updatedAt ? new Date(documentData.updatedAt) : null
  )

  const autosaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const skipNextWatchRef = React.useRef(true)

  React.useEffect(() => {
    if (etpDocument?.updatedAt) {
      setLastSavedAt(new Date(etpDocument.updatedAt))
    }
  }, [etpDocument?.updatedAt])

  React.useEffect(() => {
    if (!etpDocument?.step) return
    setCurrentStep((prev) => {
      const next = clampStep(etpDocument.step, TOTAL_STEPS)
      if (prev === next) return prev
      return next
    })
  }, [etpDocument?.step])

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

  const goToStep = React.useCallback(
    (nextStep: number) => {
      const clamped = clampStep(nextStep, TOTAL_STEPS)
      setCurrentStep(clamped)
      updateUrlStep(clamped)
    },
    [updateUrlStep]
  )

  const saveCurrentStep = React.useCallback(
    async (
      targetStep: number,
      values: EtpFormValues,
      { force }: { force?: boolean } = {}
    ) => {
      const shouldPersistValues = force || methods.formState.isDirty
      const patch = shouldPersistValues ? extractStepPatch(currentStep, values) : undefined

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
        console.error("Falha ao salvar etapa do ETP", err)
        setAutosaveStatus("error")
        toast.error("Não foi possível salvar automaticamente. Tente novamente.")
        return false
      }
    },
    [currentStep, methods, saveStep]
  )

  const handleAutosave = React.useCallback(
    async (values: EtpFormValues) => {
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
      const nextValues = values as EtpFormValues

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

    console.error("Falha ao carregar ETP", error)
    toast.error("Não foi possível carregar os dados mais recentes do ETP.")
  }, [error])

  const validateStep = React.useCallback(
    async (stepIndex: number) => {
      const step = WIZARD_STEPS[stepIndex - 1]
      if (!step) return true
      const isValid = await methods.trigger(step.fields as any, {
        shouldFocus: true,
      })
      return isValid
    },
    [methods]
  )

  const handleNext = React.useCallback(async () => {
    if (currentStep >= TOTAL_STEPS) return
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
  }, [currentStep, goToStep, methods, saveCurrentStep, validateStep])

  const handlePrevious = React.useCallback(async () => {
    if (currentStep <= 1) return
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

  const statusVariant = normalizeStatus(etpDocument?.status ?? etp.status)

  if (isLoading && !etpDocument) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    )
  }

  if (error && !etpDocument) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive">
        <h2 className="text-lg font-semibold">Falha ao carregar o Estudo Técnico Preliminar</h2>
        <p className="mt-2 text-sm text-destructive/80">
          Atualize a página ou tente novamente em instantes. Persistindo o erro, contate o suporte técnico.
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
              <span>ETP #{etp.id}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <span>
                Código E-Docs:
                {hasValidEdocs ? (
                  <a
                    href={buildEdocsUrl(normalizedEdocs)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 inline-flex items-center gap-1 text-primary-600 underline-offset-2 hover:text-primary-700 hover:underline"
                  >
                    {normalizedEdocs}
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
              {etp.title || defaultValues.general.title || "Estudo Técnico Preliminar"}
            </h1>
            <p className="text-sm text-neutral-500">
              Preencha todas as etapas para concluir o Estudo Técnico Preliminar com rastreabilidade completa.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <AutosaveBadge status={autosaveStatus} lastSavedAt={lastSavedAt} />
            <Button variant="outline" asChild>
              <a href={`/api/etp/${etp.id}/export`} target="_blank" rel="noopener noreferrer">
                Exportar JSON
              </a>
            </Button>
          </div>
        </header>

        <WizardStepper steps={WIZARD_STEPS} currentStep={currentStep} onStepChange={handleStepClick} />

        <Card className="border border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-900">
              {WIZARD_STEPS[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 ? <EtpFormStep1 /> : null}
            {currentStep === 2 ? <EtpFormStep2 /> : null}
            {currentStep === 3 ? <EtpFormStep3 /> : null}
          </CardContent>
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
                {currentStep === TOTAL_STEPS ? "Finalizar" : "Avançar"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  )
}

