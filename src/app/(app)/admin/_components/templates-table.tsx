"use client"

import { useMemo, useState } from "react"

import { DataTable, type DataTableColumn } from "@/components/data-display/data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { TemplateListItem } from "../_utils/templates"

type TemplatesTableProps = {
  title: string
  description?: string
  items: TemplateListItem[]
  errorMessage?: string
}

function getStatusBadgeClass(tone: TemplateListItem["statusTone"]): string {
  switch (tone) {
    case "active":
      return "bg-emerald-100 text-emerald-800"
    case "inactive":
      return "bg-slate-200 text-slate-700"
    case "archived":
      return "bg-amber-100 text-amber-800"
    case "draft":
    default:
      return "bg-sky-100 text-sky-800"
  }
}

export function TemplatesTable({ title, description, items, errorMessage }: TemplatesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items
    }

    const normalizedTerm = searchTerm.toLowerCase()

    return items.filter((item) => {
      return (
        item.nome.toLowerCase().includes(normalizedTerm) ||
        item.tipoDocumento.toLowerCase().includes(normalizedTerm) ||
        (item.origem?.toLowerCase().includes(normalizedTerm) ?? false)
      )
    })
  }, [items, searchTerm])

  const columns = useMemo<DataTableColumn<TemplateListItem>[]>(
    () => [
      {
        id: "nome",
        label: "Nome do Modelo",
        accessor: (row) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm text-slate-900">{row.nome}</span>
            {row.origem ? (
              <span className="text-xs text-muted-foreground">Origem: {row.origem}</span>
            ) : null}
          </div>
        ),
        sortable: true,
        width: "min-w-[240px]",
      },
      {
        id: "tipo",
        label: "Tipo de Documento",
        accessor: (row) => row.tipoDocumento,
        sortable: true,
        width: "w-40",
      },
      {
        id: "versao",
        label: "Versão",
        accessor: (row) => row.versao,
        sortable: true,
        width: "w-24",
        align: "center",
      },
      {
        id: "status",
        label: "Status",
        accessor: (row) => (
          <Badge className={cn("px-2 py-1 text-xs font-medium", getStatusBadgeClass(row.statusTone))}>
            {row.statusLabel}
          </Badge>
        ),
        sortable: true,
        width: "w-32",
        align: "center",
      },
    ],
    []
  )

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-semibold text-secondary">{title}</CardTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {errorMessage ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : (
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {items.length} modelos encontrados
            </span>
          )}

          <div className="w-full md:w-72">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, tipo ou origem"
              className="h-10"
              aria-label="Buscar modelos"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <DataTable
          data={filteredItems}
          columns={columns}
          emptyMessage={
            searchTerm
              ? "Nenhum modelo corresponde aos filtros aplicados."
              : "Nenhum modelo disponível no momento."
          }
        />
      </CardContent>
    </Card>
  )
}
