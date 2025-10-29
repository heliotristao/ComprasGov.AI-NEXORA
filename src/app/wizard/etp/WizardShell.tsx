"use client"

import * as React from "react"

import { Stepper, type StepDefinition, type StepState } from "./Stepper"

interface WizardShellProps {
  title: string
  description: string
  steps: StepDefinition[]
  states: StepState[]
  currentStep: number
  onStepChange?: (step: number) => void
  actions: React.ReactNode
  children: React.ReactNode
}

export function WizardShell({
  title,
  description,
  steps,
  states,
  currentStep,
  onStepChange,
  actions,
  children,
}: WizardShellProps) {
  const activeStep = steps[currentStep - 1]

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 md:px-6">
        <header className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">Planeja.AI • Estudo Técnico Preliminar</p>
            <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
            <p className="text-sm text-neutral-600">{description}</p>
          </div>

          <div className="mt-6">
            <Stepper steps={steps} states={states} onStepChange={onStepChange} />
          </div>
        </header>

        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-neutral-900">{activeStep?.title}</h2>
            <p className="text-sm text-neutral-500">{activeStep?.description}</p>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-8">{children}</div>
          </div>

          <div className="rounded-b-2xl border-t border-neutral-200 bg-neutral-50 px-6 py-4">{actions}</div>
        </section>
      </div>
    </div>
  )
}
