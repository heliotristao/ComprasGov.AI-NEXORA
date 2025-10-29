"use client"

import * as React from "react"
import { ShieldCheck, ChevronLeft, ChevronRight, Bot } from "lucide-react"

import { AutosaveBadge } from "@/app/_shared/components/AutosaveBadge"
import { Button } from "@/components/ui/button"

import type { AutosaveStatus } from "./use-autosave"

interface FormActionsProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  isNextDisabled?: boolean
  isNextLoading?: boolean
  isPreviousDisabled?: boolean
  onValidate: () => void
  isValidating?: boolean
  autosaveStatus: AutosaveStatus
  lastSavedAt: Date | null
}

export function FormActions({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isNextDisabled = false,
  isNextLoading = false,
  isPreviousDisabled = false,
  onValidate,
  isValidating = false,
  autosaveStatus,
  lastSavedAt,
}: FormActionsProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <AutosaveBadge status={autosaveStatus} lastSavedAt={lastSavedAt} />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onValidate}
          disabled={isValidating}
          className="inline-flex items-center gap-2 border-primary-200 text-primary-700 hover:bg-primary-50"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {isValidating ? "Validando..." : "Validar"}
        </Button>

        <Button type="button" variant="outline" size="sm" disabled className="inline-flex items-center gap-2">
          <Bot className="h-4 w-4" aria-hidden />
          Aceitar IA (em breve)
        </Button>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onPrevious}
          disabled={isFirstStep || isPreviousDisabled}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-700"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className="inline-flex items-center gap-2"
        >
          {isNextLoading ? (
            <span>Processando...</span>
          ) : (
            <>
              {isLastStep ? "Finalizar" : "Avançar"}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
