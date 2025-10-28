"use client"

import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export interface TemplateOption {
  id: string
  nome: string
  descricao?: string | null
  nivel?: string | null
  categoria?: string | null
  tipo?: string | null
  origem?: string | null
  instituicao?: string | null
  orgao?: string | null
  atualizado_em?: string | null
  atualizadoEm?: string | null
  updated_at?: string | null
  updatedAt?: string | null
}

interface TemplateSelectProps {
  templates: TemplateOption[]
  value?: string | null
  onChange?: (value: string) => void
  disabled?: boolean
  helperText?: string
  className?: string
}

function resolveGroupKey(template: TemplateOption): string {
  const rawKey =
    template.nivel ??
    template.categoria ??
    template.tipo ??
    (template.origem ? `origem:${template.origem}` : undefined) ??
    "outros"

  return String(rawKey).toUpperCase()
}

function resolveGroupLabel(key: string): string {
  const normalized = key.toUpperCase()

  if (normalized.includes("SUPER")) {
    return "Modelos Superiores"
  }

  if (normalized.includes("INST")) {
    return "Modelos Institucionais"
  }

  if (normalized.startsWith("ORIGEM:")) {
    return `Origem: ${normalized.replace("ORIGEM:", "").trim()}`
  }

  return normalized.charAt(0) + normalized.slice(1).toLowerCase()
}

function resolveOrigin(template: TemplateOption): string | null {
  const origin = template.orgao ?? template.instituicao ?? template.origem ?? null
  return typeof origin === "string" && origin.trim().length > 0 ? origin.trim() : null
}

function resolveUpdatedAt(template: TemplateOption): string | null {
  const raw =
    template.atualizadoEm ??
    template.atualizado_em ??
    template.updatedAt ??
    template.updated_at ??
    null

  if (!raw || typeof raw !== "string") {
    return null
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date)
}

function resolveTemplateLabel(template: TemplateOption): string {
  if (template.nome && template.nome.trim().length > 0) {
    return template.nome.trim()
  }

  return `Template #${template.id}`
}

export function TemplateSelect({
  templates,
  value,
  onChange,
  disabled = false,
  helperText,
  className,
}: TemplateSelectProps) {
  const groupedTemplates = useMemo(() => {
    const groups = new Map<string, TemplateOption[]>()

    templates.forEach((template) => {
      const key = resolveGroupKey(template)
      const collection = groups.get(key) ?? []
      collection.push(template)
      groups.set(key, collection)
    })

    return Array.from(groups.entries()).map(([groupKey, groupTemplates]) => ({
      key: groupKey,
      label: resolveGroupLabel(groupKey),
      templates: [...groupTemplates].sort((a, b) =>
        resolveTemplateLabel(a).localeCompare(resolveTemplateLabel(b), "pt-BR")
      ),
    }))
  }, [templates])

  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Template do documento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Escolha um modelo institucional ou superior para gerar o documento consolidado.
        </p>
      </CardHeader>

      <CardContent>
        {templates.length === 0 ? (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum template disponível para este tipo de documento.
          </div>
        ) : (
          <RadioGroup
            value={value ?? ""}
            onValueChange={onChange}
            className="space-y-3"
            disabled={disabled}
          >
            <ScrollArea className="max-h-[380px] pr-2">
              <div className="space-y-4">
                {groupedTemplates.map((group) => (
                  <div key={group.key} className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.label}
                    </p>

                    <div className="space-y-3">
                      {group.templates.map((template) => {
                        const optionId = `template-${template.id}`
                        const origin = resolveOrigin(template)
                        const updatedAt = resolveUpdatedAt(template)
                        const hasBadge = Boolean(template.nivel || template.categoria || template.tipo)

                        return (
                          <div key={template.id} className="rounded-lg border border-border/60">
                            <RadioGroupItem value={String(template.id)} id={optionId} className="sr-only" />

                            <Label
                              htmlFor={optionId}
                              className={cn(
                                "flex cursor-pointer flex-col gap-2 rounded-lg p-4 transition-colors",
                                "hover:bg-muted/60",
                                value === String(template.id)
                                  ? "border-2 border-primary bg-primary/5"
                                  : "border border-transparent"
                              )}
                            >
                              <div className="flex flex-col gap-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="text-sm font-semibold leading-snug">
                                      {resolveTemplateLabel(template)}
                                    </span>
                                    {template.descricao && (
                                      <p className="mt-1 text-sm text-muted-foreground">
                                        {template.descricao}
                                      </p>
                                    )}
                                  </div>

                                  {hasBadge && (
                                    <Badge variant="outline" className="whitespace-nowrap">
                                      {resolveGroupLabel(resolveGroupKey(template))}
                                    </Badge>
                                  )}
                                </div>

                                {(origin || updatedAt) && (
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    {origin && <span>Origem: {origin}</span>}
                                    {updatedAt && <span>Atualizado em {updatedAt}</span>}
                                  </div>
                                )}
                              </div>
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </RadioGroup>
        )}

        {helperText && (
          <p className="mt-4 text-xs text-muted-foreground">{helperText}</p>
        )}
      </CardContent>
    </Card>
  )
}
