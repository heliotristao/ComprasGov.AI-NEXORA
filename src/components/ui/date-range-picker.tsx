"use client"

import { forwardRef, useMemo, type ChangeEvent } from "react"
import { CalendarRange } from "lucide-react"

import { cn } from "@/lib/utils"

import { Input } from "./input"

export interface DateRangeValue {
  start?: Date
  end?: Date
}

export interface DateRangePickerProps {
  value?: DateRangeValue
  onChange?: (value: DateRangeValue | undefined) => void
  className?: string
  disabled?: boolean
  startLabel?: string
  endLabel?: string
}

function formatDateForInput(date: Date | undefined) {
  if (!date) return ""
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDateFromInput(value: string) {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map((part) => Number(part))
  if (!year || !month || !day) return undefined
  return new Date(Date.UTC(year, month - 1, day))
}

function normalizeRange(range: DateRangeValue | undefined) {
  if (!range?.start && !range?.end) {
    return undefined
  }

  return {
    start: range?.start,
    end: range?.end
  }
}

const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      onChange,
      className,
      disabled,
      startLabel = "Início",
      endLabel = "Fim"
    },
    ref
  ) => {
    const fromValue = useMemo(() => formatDateForInput(value?.start), [value?.start])
    const toValue = useMemo(() => formatDateForInput(value?.end), [value?.end])

    const handleStartChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      const nextStart = parseDateFromInput(event.target.value)
      let end = value?.end
      if (nextStart && end && nextStart > end) {
        end = nextStart
      }
      const nextRange = normalizeRange({ start: nextStart ?? undefined, end })
      onChange?.(nextRange)
    }

    const handleEndChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      const nextEnd = parseDateFromInput(event.target.value)
      let start = value?.start
      if (start && nextEnd && nextEnd < start) {
        start = nextEnd
      }
      const nextRange = normalizeRange({ start, end: nextEnd ?? undefined })
      onChange?.(nextRange)
    }

    const dateFormatter = useMemo(
      () =>
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: "UTC"
        }),
      []
    )

    const summaryLabel = useMemo(() => {
      if (!value?.start && !value?.end) return "Sem período definido"
      if (value?.start && value?.end) {
        return `De ${dateFormatter.format(value.start)} até ${dateFormatter.format(value.end)}`
      }
      if (value?.start) {
        return `A partir de ${dateFormatter.format(value.start)}`
      }
      if (value?.end) {
        return `Até ${dateFormatter.format(value.end)}`
      }
      return "Sem período definido"
    }, [dateFormatter, value?.end, value?.start])

    return (
      <div ref={ref} className={cn("space-y-1", className)}>
        <div className={cn("flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2", disabled && "opacity-60")}
        >
          <CalendarRange className="h-4 w-4 text-slate-500" />
          <div className="flex flex-1 items-center gap-2 text-sm text-slate-600">
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">{startLabel}</span>
              <Input
                type="date"
                value={fromValue}
                onChange={handleStartChange}
                disabled={disabled}
                className="h-8 w-full border border-slate-200 bg-slate-50 px-2 text-xs focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-400"
              />
            </div>
            <span className="hidden text-xs text-slate-400 sm:inline">até</span>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">{endLabel}</span>
              <Input
                type="date"
                value={toValue}
                onChange={handleEndChange}
                disabled={disabled}
                className="h-8 w-full border border-slate-200 bg-slate-50 px-2 text-xs focus-visible:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-400"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500">{summaryLabel}</p>
      </div>
    )
  }
)
DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker }
