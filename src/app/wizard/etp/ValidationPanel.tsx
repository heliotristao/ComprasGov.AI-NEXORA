"use client"

import * as React from "react"
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { EtpValidationResult } from "./etp.zod"

interface ValidationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: EtpValidationResult | null
  isLoading?: boolean
}

function renderList(items: string[], emptyMessage: string, icon: React.ReactNode, accentClass: string) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-neutral-500">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
          <span className={accentClass}>{icon}</span>
          <p className="text-sm text-neutral-700">{item}</p>
        </li>
      ))}
    </ul>
  )
}

export function ValidationPanel({ open, onOpenChange, result, isLoading = false }: ValidationPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl space-y-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-900">Validação de conformidade</DialogTitle>
          <DialogDescription>
            Execute a revisão automática sempre que desejar garantir aderência à Lei 14.133/2021 e às melhores práticas.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-neutral-600">Validando informações do ETP...</p>
        ) : (
          <ScrollArea className="max-h-[420px] space-y-6 pr-4">
            <section className="space-y-3">
              <header className="flex items-center gap-3">
                <Badge variant="warning" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  Erros ({result?.errors?.length ?? 0})
                </Badge>
                <p className="text-sm text-neutral-500">Itens críticos que impedem o avanço do documento.</p>
              </header>
              {renderList(result?.errors ?? [], "Nenhum erro identificado nesta validação.", <AlertTriangle className="h-4 w-4" />, "mt-1 text-error-600")}
            </section>

            <section className="space-y-3">
              <header className="flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-2 border-amber-300 text-amber-600">
                  <Info className="h-4 w-4" aria-hidden />
                  Alertas ({result?.warnings?.length ?? 0})
                </Badge>
                <p className="text-sm text-neutral-500">Ajustes recomendados para reforçar a robustez técnica.</p>
              </header>
              {renderList(result?.warnings ?? [], "Nenhum alerta foi gerado nesta rodada.", <Info className="h-4 w-4" />, "mt-1 text-amber-600")}
            </section>

            <section className="space-y-3">
              <header className="flex items-center gap-3">
                <Badge variant="success" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Informações ({result?.infos?.length ?? 0})
                </Badge>
                <p className="text-sm text-neutral-500">Sugestões e observações para evolução contínua do documento.</p>
              </header>
              {renderList(result?.infos ?? [], "Nenhuma observação adicional foi registrada.", <CheckCircle2 className="h-4 w-4" />, "mt-1 text-success-600")}
            </section>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
