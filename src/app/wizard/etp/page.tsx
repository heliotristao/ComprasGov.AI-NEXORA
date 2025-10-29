"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { FormProvider, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { StepIdentification } from "./_steps/StepIdentification"
import { StepContext } from "./_steps/StepContext"
import { StepSolution } from "./_steps/StepSolution"
import { StepViability } from "./_steps/StepViability"
import { autosaveEtpDocument, createEtpDraft, fetchEtpDocument, validateEtpDocument } from "./_api/etp.client"
import { FormActions } from "./FormActions"
import { ValidationPanel } from "./ValidationPanel"
import { WizardShell } from "./WizardShell"
import { type StepDefinition, type StepState } from "./Stepper"
import { useAutosave } from "./use-autosave"
import {
  emptyEtpFormValues,
  etpSchema,
  type EtpFormValues,
  type EtpStepFieldPath,
  validationResponseSchema,
} from "./etp.zod"

const WIZARD_STEPS: StepDefinition[] = [
  {
    id: 1,
    title: "Identificação e contexto",
    description: "Cadastre os dados iniciais do processo e vincule o número E-Docs.",
  },
  {
    id: 2,
    title: "Necessidade e objetivos",
    description: "Detalhe o problema identificado, objetivos estratégicos e fundamentos legais.",
  },
  {
    id: 3,
    title: "Solução recomendada",
    description: "Registre alternativas avaliadas, justificativa da solução escolhida e benefícios esperados.",
  },
  {
    id: 4,
    title: "Viabilidade e riscos",
    description: "Apresente pesquisa de mercado, estimativa de investimento, cronograma e riscos.",
  },
]

const STEP_FIELDS: EtpStepFieldPath[][] = [
  [
    "identification.requestingUnit",
    "identification.edocsNumber",
    "identification.processTitle",
    "identification.summary",
  ],
  ["context.problemDescription", "context.objectives", "context.legalBasis"],
  ["solution.evaluatedAlternatives", "solution.recommendedSolution", "solution.expectedBenefits"],
  [
    "viability.marketAnalysis",
    "viability.estimatedBudget",
    "viability.executionSchedule",
    "viability.risksAndMitigations",
  ],
]

const TOTAL_STEPS = WIZARD_STEPS.length

function clampStep(value: unknown, fallback = 1) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }
  return Math.min(parsed, TOTAL_STEPS)
}

export default function EtpWizardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-neutral-50">
          <p className="text-sm text-neutral-600">Carregando o wizard de Estudo Técnico Preliminar...</p>
        </div>
      }
    >
      <EtpWizardPageContent />
    </React.Suspense>
  )
}

function EtpWizardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const stepQueryParam = searchParams.get("step")
  const idQueryParam = searchParams.get("id")

  const initialStep = clampStep(stepQueryParam, 1)

  const [etpId, setEtpId] = React.useState<string | null>(idQueryParam)
  const [currentStep, setCurrentStep] = React.useState<number>(initialStep)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [errorSteps, setErrorSteps] = React.useState<Set<number>>(new Set())
  const [isValidationOpen, setIsValidationOpen] = React.useState(false)
  const [isValidating, setIsValidating] = React.useState(false)
  const [validationResult, setValidationResult] = React.useState(validationResponseSchema.parse({}))

  const form = useForm<EtpFormValues>({
    resolver: zodResolver(etpSchema) as Resolver<EtpFormValues>,
    mode: "onChange",
    defaultValues: emptyEtpFormValues,
  })

  const createDraftMutation = useMutation({
    mutationFn: createEtpDraft,
    onSuccess: (response) => {
      const newId = response.id
      setEtpId(newId)
      const params = new URLSearchParams(searchParamsString)
      params.set("id", newId)
      params.set("step", "1")
      router.replace(`?${params.toString()}`, { scroll: false })
      toast.success("Rascunho de ETP criado com sucesso.")
    },
    onError: (error: unknown) => {
      console.error("Falha ao criar rascunho do ETP", error)
      toast.error("Não foi possível iniciar o ETP. Tente novamente.")
    },
  })

  const shouldCreateDraft = !idQueryParam && !etpId && !createDraftMutation.isPending

  React.useEffect(() => {
    if (shouldCreateDraft) {
      createDraftMutation.mutate()
    }
  }, [createDraftMutation, shouldCreateDraft])

  const etpQuery = useQuery({
    queryKey: ["wizard-etp", etpId],
    enabled: Boolean(etpId),
    queryFn: async () => {
      if (!etpId) {
        throw new Error("Identificador do ETP não informado.")
      }
      return fetchEtpDocument(etpId)
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const saveAutosave = React.useCallback(
    async (payload: Parameters<typeof autosaveEtpDocument>[1]) => {
      if (!etpId) {
        throw new Error("ETP não identificado para salvar o rascunho.")
      }
      return autosaveEtpDocument(etpId, payload)
    },
    [etpId]
  )

  const autosave = useAutosave({
    form,
    enabled: Boolean(etpId),
    step: currentStep,
    save: saveAutosave,
    debounceMs: 700,
  })

  React.useEffect(() => {
    if (!etpQuery.data) {
      return
    }

    const { document, values } = etpQuery.data
    form.reset(values)
    autosave.syncSnapshot(values, document.updatedAt ?? null)

    const serverStep = clampStep(document.step, 1)

    setCompletedSteps(() => {
      const next = new Set<number>()
      for (let step = 1; step < serverStep; step += 1) {
        next.add(step)
      }
      return next
    })

    setCurrentStep((prev) => {
      const derivedStep = stepQueryParam ? clampStep(stepQueryParam, prev) : serverStep
      if (etpId && (!stepQueryParam || derivedStep !== prev)) {
        const params = new URLSearchParams(searchParamsString)
        params.set("id", etpId)
        params.set("step", String(derivedStep))
        router.replace(`?${params.toString()}`, { scroll: false })
      }
      return derivedStep
    })
  }, [autosave, etpId, etpQuery.data, form, router, searchParamsString, stepQueryParam])

  React.useEffect(() => {
    if (!stepQueryParam) {
      return
    }
    const nextStep = clampStep(stepQueryParam, currentStep)
    if (nextStep !== currentStep) {
      setCurrentStep(nextStep)
    }
  }, [currentStep, stepQueryParam])

  const stepStates: StepState[] = React.useMemo(() => {
    return WIZARD_STEPS.map((_, index) => {
      const stepNumber = index + 1
      if (errorSteps.has(stepNumber)) {
        return "error"
      }
      if (stepNumber === currentStep) {
        return "current"
      }
      if (completedSteps.has(stepNumber) || stepNumber < currentStep) {
        return "completed"
      }
      return "pending"
    })
  }, [completedSteps, currentStep, errorSteps])

  const updateStepInUrl = React.useCallback(
    (step: number) => {
      if (!etpId) {
        return
      }
      const params = new URLSearchParams(searchParamsString)
      params.set("id", etpId)
      params.set("step", String(step))
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [etpId, router, searchParamsString]
  )

  const handleNext = React.useCallback(async () => {
    const fields = STEP_FIELDS[currentStep - 1]
    const isValid = await form.trigger(fields, { shouldFocus: true })

    if (!isValid) {
      setErrorSteps((prev) => new Set(prev).add(currentStep))
      toast.error("Revise os campos destacados antes de avançar.")
      return
    }

    setErrorSteps((prev) => {
      const next = new Set(prev)
      next.delete(currentStep)
      return next
    })

    setCompletedSteps((prev) => new Set(prev).add(currentStep))

    if (currentStep >= TOTAL_STEPS) {
      toast.success("Todas as etapas foram validadas. Execute a verificação de conformidade quando desejar.")
      return
    }

    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS)
    setCurrentStep(nextStep)
    updateStepInUrl(nextStep)
  }, [currentStep, form, updateStepInUrl])

  const handlePrevious = React.useCallback(() => {
    const previousStep = Math.max(1, currentStep - 1)
    setCurrentStep(previousStep)
    updateStepInUrl(previousStep)
  }, [currentStep, updateStepInUrl])

  const handleStepChange = React.useCallback(
    (requestedStep: number) => {
      if (requestedStep === currentStep) {
        return
      }

      const highestCompleted = completedSteps.size > 0 ? Math.max(...Array.from(completedSteps)) : 0
      const maxAllowed = Math.max(highestCompleted + 1, currentStep)

      if (requestedStep > maxAllowed) {
        return
      }

      setCurrentStep(requestedStep)
      updateStepInUrl(requestedStep)
    },
    [completedSteps, currentStep, updateStepInUrl]
  )

  const handleValidate = React.useCallback(async () => {
    if (!etpId) {
      toast.error("Crie ou recarregue o ETP antes de validar.")
      return
    }

    setIsValidationOpen(true)
    setIsValidating(true)
    try {
      const result = await validateEtpDocument(etpId)
      setValidationResult(result)
      if ((result.errors?.length ?? 0) === 0) {
        toast.success("Nenhum erro crítico encontrado na validação.")
      } else {
        toast.info("Foram encontrados pontos de atenção na validação.")
      }
    } catch (error) {
      console.error("Erro ao validar ETP", error)
      toast.error("Não foi possível concluir a validação agora.")
    } finally {
      setIsValidating(false)
    }
  }, [etpId])

  const isLoading = etpQuery.isLoading || createDraftMutation.isPending
  const hasError = Boolean(etpQuery.error)

  const stepContent = React.useMemo(() => {
    const getContext = () => form.getValues()
    return [
      <StepIdentification key="step-1" etpId={etpId} getContext={getContext} />,
      <StepContext key="step-2" etpId={etpId} getContext={getContext} />,
      <StepSolution key="step-3" etpId={etpId} getContext={getContext} />,
      <StepViability key="step-4" etpId={etpId} getContext={getContext} />,
    ]
  }, [etpId, form])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-600">Carregando o wizard de Estudo Técnico Preliminar...</p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-neutral-50">
        <p className="text-lg font-semibold text-neutral-900">Não foi possível carregar o ETP selecionado.</p>
        <p className="text-sm text-neutral-600">Recarregue a página ou tente novamente mais tarde.</p>
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <WizardShell
        title="Estudo Técnico Preliminar"
        description="Construa o ETP em etapas guiadas, com salvamento automático, sugestões de IA e validação jurídica integrada."
        steps={WIZARD_STEPS}
        states={stepStates}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        actions={
          <FormActions
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isNextDisabled={form.formState.isSubmitting}
            isNextLoading={form.formState.isSubmitting}
            onValidate={handleValidate}
            isValidating={isValidating}
            autosaveStatus={autosave.status}
            lastSavedAt={autosave.lastSavedAt}
          />
        }
      >
        {stepContent[currentStep - 1]}
      </WizardShell>

      <ValidationPanel
        open={isValidationOpen}
        onOpenChange={setIsValidationOpen}
        result={validationResult}
        isLoading={isValidating}
      />
    </FormProvider>
  )
}
