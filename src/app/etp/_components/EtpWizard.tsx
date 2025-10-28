"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge, type StatusVariant } from "@/components/data-display/status-badge"
import { api } from "@/lib/axios"

import { AutosaveBadge, type AutosaveStatus } from "@/app/_shared/components/AutosaveBadge"
import { EtpFormStep1 } from "./EtpFormStep1"
import { EtpFormStep2 } from "./EtpFormStep2"
import { EtpFormStep3 } from "./EtpFormStep3"
import { WizardStepper, type WizardStep } from "@/app/_shared/components/WizardStepper"
import { etpFormSchema, type EtpFormValues, type EtpRecord } from "./types"

const AUTO_SAVE_DELAY = 1500
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

function buildDefaultValues(etp: EtpRecord): EtpFormValues {
  const base: EtpFormValues = {
    general: {
      title: etp.formData?.general?.title ?? etp.title ?? "",
      context: etp.formData?.general?.context ?? "",
      justification: etp.formData?.general?.justification ?? "",
    },
    solution: {
      alternatives: etp.formData?.solution?.alternatives ?? "",
      recommended: etp.formData?.solution?.recommended ?? "",
      scope: etp.formData?.solution?.scope ?? "",
    },
    viability: {
      marketAnalysis: etp.formData?.viability?.marketAnalysis ?? "",
      estimatedBudget:
        typeof etp.formData?.viability?.estimatedBudget === "number"
          ? etp.formData.viability.estimatedBudget
          : Number(etp.formData?.viability?.estimatedBudget ?? 0),
      schedule: etp.formData?.viability?.schedule ?? "",
      risks: etp.formData?.viability?.risks ?? "",
    },
  }

  return base
}

export function EtpWizard({ etp, initialStep = 1 }: EtpWizardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const defaultValues = React.useMemo(() => buildDefaultValues(etp), [etp])

  const methods = useForm<EtpFormValues>({
    resolver: zodResolver(etpFormSchema),
    mode: "onChange",
    defaultValues,
  })

  const [currentStep, setCurrentStep] = React.useState(() => {
    if (Number.isNaN(initialStep)) return 1
    return Math.min(Math.max(initialStep, 1), TOTAL_STEPS)
  })

  const [autosaveStatus, setAutosaveStatus] = React.useState<AutosaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(() =>
    etp.updatedAt ? new Date(etp.updatedAt) : null
  )

  const autosaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const skipNextWatchRef = React.useRef(true)

  const handleAutosave = React.useCallback(
    async (values: EtpFormValues) => {
      if (!methods.formState.isDirty) {
        setAutosaveStatus("idle")
        return
      }

      try {
        setAutosaveStatus("saving")
        await api.patch(`/api/etp/${etp.id}`, {
          formData: values,
        })
        setLastSavedAt(new Date())
        setAutosaveStatus("saved")
        skipNextWatchRef.current = true
        methods.reset(values)
      } catch (error) {
        console.error("Falha no auto-save do ETP", error)
        setAutosaveStatus("error")
        toast.error("Não foi possível salvar automaticamente. Tente novamente.")
      }
    },
    [etp.id, methods]
  )

  React.useEffect(() => {
    methods.reset(defaultValues)
    skipNextWatchRef.current = true
  }, [defaultValues, methods])

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
      const clamped = Math.min(Math.max(nextStep, 1), TOTAL_STEPS)
      setCurrentStep(clamped)
      updateUrlStep(clamped)
    },
    [updateUrlStep]
  )

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
    goToStep(currentStep + 1)
  }, [currentStep, goToStep, toast, validateStep])

  const handlePrevious = React.useCallback(() => {
    if (currentStep <= 1) return
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
    [currentStep, goToStep, toast, validateStep]
  )

  const statusVariant = normalizeStatus(etp.status)

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <header className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span>ETP #{etp.id}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <span>Código E-Docs: {etp.edocs || "—"}</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300" aria-hidden />
              <StatusBadge status={statusVariant} />
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
              <Button variant="outline" type="button" onClick={handlePrevious} disabled={currentStep === 1}>
                Voltar
              </Button>
              <Button type="button" onClick={handleNext}>
                {currentStep === TOTAL_STEPS ? "Finalizar" : "Avançar"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </FormProvider>
  )
}
