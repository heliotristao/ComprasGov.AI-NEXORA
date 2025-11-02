"use client"

import * as React from "react"
import { AlertCircle, Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type StepState = "completed" | "current" | "pending" | "error"

export interface StepDefinition {
  id: number
  title: string
  description: string
}

interface StepperProps {
  steps: StepDefinition[]
  states: StepState[]
  onStepChange?: (step: number) => void
}

function getIndicatorContent(state: StepState, index: number) {
  if (state === "completed") {
    return <Check className="h-4 w-4" aria-hidden />
  }
  if (state === "error") {
    return <AlertCircle className="h-4 w-4" aria-hidden />
  }
  return index + 1
}

function getIndicatorClass(state: StepState) {
  switch (state) {
    case "completed":
      return "border-success-500 bg-success-500 text-white"
    case "current":
      return "border-primary-500 bg-primary-50 text-primary-600"
    case "error":
      return "border-error-500 bg-error-50 text-error-600"
    default:
      return "border-neutral-200 bg-white text-neutral-500"
  }
}

function getTitleClass(state: StepState) {
  switch (state) {
    case "current":
      return "text-primary-700"
    case "error":
      return "text-error-600"
    case "completed":
      return "text-neutral-800"
    default:
      return "text-neutral-600"
  }
}

export function Stepper({ steps, states, onStepChange }: StepperProps) {
  return (
    <ol className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      {steps.map((step, index) => {
        const state = states[index] ?? "pending"
        const isClickable = onStepChange && state !== "pending"

        return (
          <li key={step.id} className="flex flex-1 items-start gap-3">
            <button
              type="button"
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                getIndicatorClass(state),
                isClickable && "hover:border-primary-400 hover:text-primary-600"
              )}
              onClick={() => onStepChange?.(index + 1)}
              aria-current={state === "current" ? "step" : undefined}
              aria-disabled={!isClickable}
            >
              {getIndicatorContent(state, index)}
            </button>
            <div className="space-y-1">
              <p className={cn("text-sm font-semibold", getTitleClass(state))}>{step.title}</p>
              <p className="text-xs text-neutral-500">{step.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
