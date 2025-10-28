"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface WizardStep {
  id: number
  title: string
  description: string
}

export interface WizardStepperProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange?: (step: number) => void
}

export function WizardStepper({ steps, currentStep, onStepChange }: WizardStepperProps) {
  return (
    <ol className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      {steps.map((step, index) => {
        const position = index + 1
        const isActive = position === currentStep
        const isCompleted = position < currentStep

        return (
          <li key={step.id} className="flex flex-1 items-start gap-3">
            <button
              type="button"
              onClick={() => onStepChange?.(position)}
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                isCompleted && "border-primary-500 bg-primary-500 text-white",
                isActive && "border-primary-500 bg-primary-50 text-primary-600",
                !isActive && !isCompleted && "border-neutral-200 bg-white text-neutral-500",
                onStepChange ? "hover:border-primary-400 hover:text-primary-600" : "cursor-default"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : position}
            </button>
            <div className="space-y-1">
              <p className={cn("text-sm font-semibold", isActive ? "text-primary-700" : "text-neutral-700")}>{step.title}</p>
              <p className="text-xs text-neutral-500">{step.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
