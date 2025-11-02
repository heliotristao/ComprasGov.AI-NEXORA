"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Eye } from "lucide-react"

import { EmptyState } from "@/components/data-display/empty-state"
import { SkeletonTable } from "@/components/data-display/loading-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTemplates } from "@/hooks/api/useTemplates"

import { TemplatePlaceholdersDialog } from "./TemplatePlaceholdersDialog"

type TemplateRow = {
  id: string
  name: string
  type: string
  organization: string
}

export function TemplatesAdminView() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const templatesQuery = useTemplates()

  const templates = useMemo<TemplateRow[]>(() => {
    const payload = templatesQuery.data ?? []

    return payload.map((template) => ({
      id: template.id,
      name: template.name,
      type: template.type,
      organization: template.organizationName ?? "—",
    }))
  }, [templatesQuery.data])

  const isLoading = templatesQuery.isLoading || templatesQuery.isFetching
  const hasError = templatesQuery.isError
  const showEmptyState = !isLoading && !hasError && templates.length === 0

  const handleOpenPreview = (templateId: string) => {
    setSelectedTemplateId(templateId)
    setIsDialogOpen(true)
  }

  const selectedTemplate = useMemo(() => {
    return templates.find((template) => template.id === selectedTemplateId) ?? null
  }, [selectedTemplateId, templates])

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
            Administração
          </Badge>
          <span className="text-muted-foreground">/</span>
          <span>Templates</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Templates de Documentos</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Consulte rapidamente quais placeholders cada template utiliza para garantir consistência nas comunicações.
          </p>
        </div>
      </header>

      {isLoading ? (
        <SkeletonTable />
      ) : hasError ? (
        <Alert variant="destructive" className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="space-y-1">
            <AlertTitle>Não foi possível carregar os templates.</AlertTitle>
            <AlertDescription>
              Ocorreu um erro ao buscar a lista de templates. Tente novamente em instantes.
            </AlertDescription>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => templatesQuery.refetch()}>
              Tentar novamente
            </Button>
          </div>
        </Alert>
      ) : showEmptyState ? (
        <EmptyState
          title="Nenhum template cadastrado"
          description="Cadastre novos templates para visualizar seus placeholders e garantir a conformidade documental."
        />
      ) : (
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead>Nome do Template</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Órgão Associado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Visualize os placeholders utilizados neste template.
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 text-xs font-semibold uppercase">
                      {template.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{template.organization}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="inline-flex items-center gap-2"
                      onClick={() => handleOpenPreview(template.id)}
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar Placeholders
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TemplatePlaceholdersDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)

          if (!open) {
            setSelectedTemplateId(null)
          }
        }}
        template={selectedTemplate}
      />
    </div>
  )
}
