"use client"

import * as React from "react"
import type { UseFormReturn } from "react-hook-form"

export type AutosaveStatus = "idle" | "scheduled" | "saving" | "saved" | "error"

export interface AutosavePayload<TFormValues> {
  step: number
  data: Partial<TFormValues>
}

export interface AutosaveResponse<TFormValues> {
  updatedAt: string | null
  data: Partial<TFormValues>
}

interface UseAutosaveOptions<TFormValues extends Record<string, any>> {
  form: UseFormReturn<TFormValues>
  enabled: boolean
  step: number
  save: (payload: AutosavePayload<TFormValues>) => Promise<AutosaveResponse<TFormValues>>
  debounceMs?: number
  initialSnapshot?: TFormValues
  initialSavedAt?: Date | string | null
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function computeDiff(current: unknown, previous: unknown): Record<string, unknown> {
  if (!isPlainObject(current)) {
    return {}
  }

  const diff: Record<string, unknown> = {}
  const previousObject = isPlainObject(previous) ? previous : {}

  for (const key of Object.keys(current)) {
    const currentValue = current[key]
    const previousValue = previousObject[key]

    if (isPlainObject(currentValue)) {
      const nested = computeDiff(currentValue, previousValue)
      if (Object.keys(nested).length > 0) {
        diff[key] = nested
      }
      continue
    }

    if (Array.isArray(currentValue)) {
      if (!Array.isArray(previousValue) || JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
        diff[key] = currentValue
      }
      continue
    }

    if (!Object.is(currentValue, previousValue)) {
      diff[key] = currentValue
    }
  }

  return diff
}

function normalizeTimestamp(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export interface UseAutosaveResult<TFormValues> {
  status: AutosaveStatus
  lastSavedAt: Date | null
  flush: () => Promise<void>
  syncSnapshot: (values: TFormValues, savedAt?: Date | string | null) => void
}

export function useAutosave<TFormValues extends Record<string, any>>({
  form,
  enabled,
  step,
  save,
  debounceMs = 700,
  initialSnapshot,
  initialSavedAt = null,
}: UseAutosaveOptions<TFormValues>): UseAutosaveResult<TFormValues> {
  const [status, setStatus] = React.useState<AutosaveStatus>("idle")
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(() => normalizeTimestamp(initialSavedAt))

  const snapshotRef = React.useRef<TFormValues>(deepClone(initialSnapshot ?? form.getValues()))
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const skipNextWatchRef = React.useRef(true)

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const syncSnapshot = React.useCallback(
    (values: TFormValues, savedAt?: Date | string | null) => {
      snapshotRef.current = deepClone(values)
      skipNextWatchRef.current = true
      setStatus("idle")
      if (savedAt !== undefined) {
        setLastSavedAt(normalizeTimestamp(savedAt))
      }
    },
    []
  )

  const flush = React.useCallback(async () => {
    if (!enabled) {
      return
    }

    clearTimer()

    const currentValues = form.getValues()
    const snapshot = snapshotRef.current
    const diff = computeDiff(currentValues, snapshot) as Partial<TFormValues>

    if (!diff || Object.keys(diff).length === 0) {
      setStatus((prev) => (prev === "error" ? prev : "idle"))
      return
    }

    setStatus("saving")

    try {
      const response = await save({
        step,
        data: diff,
      })

      snapshotRef.current = deepClone(currentValues)
      setLastSavedAt(normalizeTimestamp(response.updatedAt) ?? new Date())
      setStatus("saved")
    } catch (error) {
      console.error("Falha ao executar autosave do documento", error)
      setStatus("error")
    }
  }, [clearTimer, enabled, form, save, step])

  const schedule = React.useCallback(() => {
    if (!enabled) {
      return
    }

    clearTimer()
    setStatus("scheduled")

    timerRef.current = setTimeout(() => {
      void flush()
    }, debounceMs)
  }, [clearTimer, debounceMs, enabled, flush])

  React.useEffect(() => {
    if (!enabled) {
      clearTimer()
      setStatus("idle")
      return () => {}
    }

    const subscription = form.watch(() => {
      if (skipNextWatchRef.current) {
        skipNextWatchRef.current = false
        return
      }

      schedule()
    })

    return () => {
      subscription.unsubscribe()
      clearTimer()
    }
  }, [clearTimer, enabled, form, schedule])

  React.useEffect(() => {
    skipNextWatchRef.current = true
  }, [step])

  return {
    status,
    lastSavedAt,
    flush,
    syncSnapshot,
  }
}
