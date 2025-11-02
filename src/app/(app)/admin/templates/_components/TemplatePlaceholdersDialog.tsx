"use client"

import { AlertCircle, Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTemplatePlaceholders } from "@/hooks/api/useTemplates"

interface TemplatePlaceholdersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: {
    id: string
    name: string
    type: string
    organization: string
  } | null
}

export function TemplatePlaceholdersDialog({ open, onOpenChange, template }: TemplatePlaceholdersDialogProps) {
  const templateId = template?.id ?? ""

  const placeholdersQuery = useTemplatePlaceholders(templateId, { enabled: open })

  const placeholders = placeholdersQuery.data ?? []
  const isLoading = placeholdersQuery.isLoading || placeholdersQuery.isFetching
  const hasError = placeholdersQuery.isError

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-6">
        <DialogHeader>
          <DialogTitle>Placeholders do template</DialogTitle>
          <DialogDescription>
            Consulte os campos dinâmicos utilizados no template selecionado para validar sua cobertura documental.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{template?.name ?? "Template selecionado"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tipo {template?.type ?? "—"} • Órgão {template?.organization ?? "—"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando placeholders...
            </div>
          ) : hasError ? (
            <Alert variant="destructive" className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5" />
              <div className="space-y-1">
                <AlertTitle>Não foi possível carregar os placeholders.</AlertTitle>
                <AlertDescription>
                  Ocorreu um erro ao consultar o serviço de templates. Tente novamente em instantes.
                </AlertDescription>
              </div>
            </Alert>
          ) : placeholders.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Nenhum placeholder foi encontrado para este template.
            </div>
          ) : (
            <ScrollArea className="max-h-80 pr-2">
              <div className="flex flex-wrap gap-2">
                {placeholders.map((placeholder) => (
                  <Badge key={placeholder.id} variant="outline" className="bg-white">
                    {placeholder.label}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
