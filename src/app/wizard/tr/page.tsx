"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { FormProvider, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { FormActions } from "../etp/FormActions"
import { ValidationPanel } from "../etp/ValidationPanel"
import { WizardShell } from "../etp/WizardShell"
import { type StepDefinition, type StepState } from "../etp/Stepper"
import { useAutosave } from "../etp/use-autosave"
import {
  autosaveTrDocument,
  createTrDraft,
  fetchTrDocument,
  validateTrDocument,
  type TrAutosavePayload,
} from "./_api/tr.client"
import { GarantiaStep } from "./_steps/bens/GarantiaStep"
import { IdentificacaoStep } from "./_steps/bens/IdentificacaoStep"
import { QuantidadesStep } from "./_steps/bens/QuantidadesStep"
import { EspecificacoesStep } from "./_steps/bens/EspecificacoesStep"
import { DimensionamentoStep } from "./_steps/servicos/DimensionamentoStep"
import { EscopoStep } from "./_steps/servicos/EscopoStep"
import { SlasStep } from "./_steps/servicos/SlasStep"
import {
  getEmptyTrValues,
  trSchema,
  type TrFormValues,
  type TrStepFieldPath,
  type TrTipo,
  type TrValidationResult,
} from "./tr.zod"

const BENS_STEPS: StepDefinition[] = [
  {
    id: 1,
    title: "Identificação",
    description: "Contextualize objeto, justificativa e dados institucionais.",
  },
  {
    id: 2,
    title: "Especificações",
    description: "Detalhe requisitos técnicos, mínimos e normas aplicáveis.",
  },
  {
    id: 3,
    title: "Quantidades",
    description: "Dimensione quantitativos, unidades e cronograma de entrega.",
  },
  {
    id: 4,
    title: "Garantia",
    description: "Defina garantias, prazos e condições de assistência técnica.",
  },
]

const SERVICOS_STEPS: StepDefinition[] = [
  {
    id: 1,
    title: "Escopo",
    description: "Defina escopo, objetivos estratégicos e requisitos técnicos.",
  },
  {
    id: 2,
    title: "Dimensionamento",
    description: "Planeje equipe, carga horária e critérios de alocação.",
  },
  {
    id: 3,
    title: "SLAs",
    description: "Estabeleça níveis de serviço, indicadores e penalidades.",
  },
]

const STEP_FIELD_MAP: Record<TrTipo, TrStepFieldPath[][]> = {
  bens: [
    [
      "identificacao.codigoEdocs",
      "identificacao.objeto",
      "identificacao.justificativa",
      "identificacao.setorRequisitante",
    ],
    [
      "especificacoes.descricaoTecnica",
      "especificacoes.requisitosMinimos",
      "especificacoes.normasReferencia",
    ],
    [
      "quantidades.quantidadeTotal",
      "quantidades.unidadeMedida",
      "quantidades.justificativaQuantidade",
      "quantidades.cronogramaEntrega",
    ],
    [
      "garantia.tipoGarantia",
      "garantia.prazoGarantia",
      "garantia.assistenciaTecnica",
    ],
  ],
  servicos: [
    ["escopo.descricaoServico", "escopo.objetivos", "escopo.requisitosTecnicos"],
    [
      "dimensionamento.quantidadeProfissionais",
      "dimensionamento.cargaHoraria",
      "dimensionamento.criteriosAlocacao",
    ],
    ["slas.niveisServico", "slas.indicadoresDesempenho", "slas.penalidades"],
  ],
}

const STEP_DEFINITIONS: Record<TrTipo, StepDefinition[]> = {
  bens: BENS_STEPS,
  servicos: SERVICOS_STEPS,
}

function clampStep(value: unknown, fallback = 1, max = 1) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback
  }
  return Math.min(parsed, max)
}

function parseTipo(value: string | null | undefined): TrTipo {
  if (!value) {
    return "bens"
  }
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  return normalized === "servicos" ? "servicos" : "bens"
}

export default function TrWizardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-neutral-50">
          <p className="text-sm text-neutral-600">Carregando o wizard de Termo de Referência...</p>
        </div>
      }
    >
      <TrWizardPageContent />
    </React.Suspense>
  )
}

function TrWizardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const tipoQueryParam = parseTipo(searchParams.get("tipo"))
  const stepQueryParam = searchParams.get("step")
  const idQueryParam = searchParams.get("id")

  const [trId, setTrId] = React.useState<string | null>(idQueryParam)
  const [tipo, setTipo] = React.useState<TrTipo>(tipoQueryParam)
  const [currentStep, setCurrentStep] = React.useState<number>(() =>
    clampStep(stepQueryParam, 1, STEP_DEFINITIONS[tipoQueryParam].length),
  )
  const prevStepRef = React.useRef(currentStep)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [errorSteps, setErrorSteps] = React.useState<Set<number>>(new Set())
  const [isValidationOpen, setIsValidationOpen] = React.useState(false)
  const [isValidating, setIsValidating] = React.useState(false)
  const [validationResult, setValidationResult] = React.useState<TrValidationResult | null>(null)

  const form = useForm<TrFormValues>({
    resolver: zodResolver(trSchema) as Resolver<TrFormValues>,
    mode: "onChange",
    defaultValues: getEmptyTrValues(tipo),
  })

  React.useEffect(() => {
    if (tipoQueryParam !== tipo) {
      setTipo(tipoQueryParam)
    }
  }, [tipoQueryParam, tipo])

  const createDraftMutation = useMutation({
    mutationFn: () => createTrDraft({ tipo }),
    onSuccess: (response) => {
      const newId = response.id
      setTrId(newId)
      const params = new URLSearchParams(searchParamsString)
      params.set("id", newId)
      params.set("tipo", tipo)
      params.set("step", "1")
      router.replace(`?${params.toString()}`, { scroll: false })
      toast.success("Rascunho de TR criado com sucesso.")
    },
    onError: (error: unknown) => {
      console.error("Falha ao criar rascunho do TR", error)
      toast.error("Não foi possível iniciar o TR. Tente novamente.")
    },
  })

  const shouldCreateDraft = !idQueryParam && !trId && !createDraftMutation.isPending

  React.useEffect(() => {
    if (shouldCreateDraft) {
      createDraftMutation.mutate()
    }
  }, [createDraftMutation, shouldCreateDraft])

  const trQuery = useQuery({
    queryKey: ["wizard-tr", trId],
    enabled: Boolean(trId),
    queryFn: async () => {
      if (!trId) {
        throw new Error("Identificador do TR não informado.")
      }
      return fetchTrDocument(trId)
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const saveAutosave = React.useCallback(
    async (payload: TrAutosavePayload) => {
      if (!trId) {
        throw new Error("TR não identificado para salvar o rascunho.")
      }
      const response = await autosaveTrDocument(trId, payload)
      if (response.document) {
        setTipo(response.document.tipo ?? tipo)
      }
      return response
    },
    [trId, tipo],
  )

  const autosave = useAutosave<TrFormValues>({
    form,
    enabled: Boolean(trId),
    step: currentStep,
    save: async (payload) => {
      const result = await saveAutosave(payload)
      return {
        updatedAt: result.updatedAt,
        data: result.data,
      }
    },
    debounceMs: 700,
  })

  React.useEffect(() => {
    if (!trQuery.data) {
      return
    }

    const { document, values } = trQuery.data
    const normalizedTipo = document.tipo ?? tipo
    setTipo(normalizedTipo)
    form.reset(values)
    autosave.syncSnapshot(values, document.updatedAt ?? null)

    const serverStep = clampStep(document.step, 1, STEP_DEFINITIONS[normalizedTipo].length)

    setCompletedSteps(() => {
      const next = new Set<number>()
      for (let step = 1; step < serverStep; step += 1) {
        next.add(step)
      }
      return next
    })

    setCurrentStep((prev) => {
      const derivedStep = stepQueryParam
        ? clampStep(stepQueryParam, prev, STEP_DEFINITIONS[normalizedTipo].length)
        : serverStep
      return derivedStep
    })
  }, [autosave, form, searchParamsString, stepQueryParam, tipo, trId, trQuery.data])

  React.useEffect(() => {
    form.setValue("tipo", tipo)
  }, [form, tipo])

  React.useEffect(() => {
    const parsedStep = clampStep(stepQueryParam, 1, STEP_DEFINITIONS[tipo].length)
    if (parsedStep !== prevStepRef.current) {
      setCurrentStep(parsedStep)
      prevStepRef.current = parsedStep
    }
  }, [stepQueryParam, tipo])

  const stepStates: StepState[] = React.useMemo(() => {
    const totalSteps = STEP_DEFINITIONS[tipo].length
    return STEP_DEFINITIONS[tipo].map((_, index) => {
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
  }, [completedSteps, currentStep, errorSteps, tipo])

  const updateStepInUrl = React.useCallback(
    (step: number) => {
      if (!trId) {
        return
      }
      const params = new URLSearchParams(searchParamsString)
      params.set("id", trId)
      params.set("tipo", tipo)
      params.set("step", String(step))
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParamsString, tipo, trId],
  )

  const handleNext = React.useCallback(async () => {
    const fields = STEP_FIELD_MAP[tipo][currentStep - 1]
    const isValid = await form.trigger(fields as Parameters<typeof form.trigger>[0], { shouldFocus: true })

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

    const totalSteps = STEP_DEFINITIONS[tipo].length
    if (currentStep >= totalSteps) {
      toast.success("Todas as etapas foram validadas. Execute a verificação de conformidade quando desejar.")
      return
    }

    const nextStep = Math.min(currentStep + 1, totalSteps)
    setCurrentStep(nextStep)
    updateStepInUrl(nextStep)
  }, [currentStep, form, tipo, updateStepInUrl])

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
    [completedSteps, currentStep, updateStepInUrl],
  )

  const handleValidate = React.useCallback(async () => {
    if (!trId) {
      toast.error("Crie ou recarregue o TR antes de validar.")
      return
    }

    setIsValidationOpen(true)
    setIsValidating(true)
    try {
      const result = await validateTrDocument(trId)
      setValidationResult(result)
      if ((result.errors?.length ?? 0) === 0) {
        toast.success("Nenhum erro crítico encontrado na validação.")
      } else {
        toast.info("Foram encontrados pontos de atenção na validação.")
      }
    } catch (error) {
      console.error("Erro ao validar TR", error)
      toast.error("Não foi possível concluir a validação agora.")
    } finally {
      setIsValidating(false)
    }
  }, [trId])

  const totalSteps = STEP_DEFINITIONS[tipo].length
  const isLoading = trQuery.isLoading || createDraftMutation.isPending
  const hasError = Boolean(trQuery.error)

  const getContext = React.useCallback(() => form.getValues(), [form])

  const stepContent = React.useMemo(() => {
    if (tipo === "servicos") {
      return [
        <EscopoStep key="step-serv-1" trId={trId} getContext={getContext} />,
        <DimensionamentoStep key="step-serv-2" trId={trId} getContext={getContext} />,
        <SlasStep key="step-serv-3" trId={trId} getContext={getContext} />,
      ]
    }

    return [
      <IdentificacaoStep key="step-bens-1" trId={trId} getContext={getContext} />,
      <EspecificacoesStep key="step-bens-2" trId={trId} getContext={getContext} />,
      <QuantidadesStep key="step-bens-3" trId={trId} getContext={getContext} />,
      <GarantiaStep key="step-bens-4" trId={trId} getContext={getContext} />,
    ]
  }, [getContext, tipo, trId])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-600">Carregando o wizard de Termo de Referência...</p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-neutral-50">
        <p className="text-lg font-semibold text-neutral-900">Não foi possível carregar o TR selecionado.</p>
        <p className="text-sm text-neutral-600">Recarregue a página ou tente novamente mais tarde.</p>
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <WizardShell
        title="Termo de Referência"
        description="Elabore o TR com fluxos específicos para bens e serviços, autosave e suporte de IA em cada etapa."
        steps={STEP_DEFINITIONS[tipo]}
        states={stepStates}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        actions={
          <FormActions
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isNextDisabled={form.formState.isSubmitting || !form.formState.isValid}
            isNextLoading={form.formState.isSubmitting}
            onValidate={handleValidate}
            isValidating={isValidating}
            autosaveStatus={autosave.status}
            lastSavedAt={autosave.lastSavedAt}
            importTooltip="Em breve"
            isImportEnabled={false}
            isConsolidateEnabled={false}
          />
        }
        badgeLabel="Planeja.AI • Termo de Referência"
      >
        {stepContent[currentStep - 1]}
      </WizardShell>

      <ValidationPanel
        open={isValidationOpen}
        onOpenChange={setIsValidationOpen}
        result={validationResult}
        isLoading={isValidating}
        documentLabel="Termo de Referência"
      />
    </FormProvider>
  )
}
