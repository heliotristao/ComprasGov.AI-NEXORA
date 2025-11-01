"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Building2, Loader2, RefreshCw, Search } from "lucide-react"

import { EmptyState } from "@/components/data-display/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Organization, useOrganizations } from "@/hooks/api/useUsers"

function normalizeOrganizationRow(organization: Organization) {
  const name = organization.name ?? "Órgão sem identificação"
  const acronym = organization.acronym ?? "—"
  const type = organization.type ?? "—"
  const locationParts = [organization.city, organization.state].filter(Boolean)
  const location = locationParts.length > 0 ? locationParts.join("/ ") : "—"

  return {
    id: organization.id,
    name,
    acronym,
    type,
    location,
  }
}

function filterOrganizations(organizations: Organization[], query: string) {
  if (!query) {
    return organizations
  }

  const normalizedQuery = query.toLowerCase()

  return organizations.filter((organization) => {
    const searchable = [
      organization.name,
      organization.acronym,
      organization.type,
      organization.city,
      organization.state,
    ]
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.toLowerCase())

    return searchable.some((value) => value.includes(normalizedQuery))
  })
}

export function OrganizationsManagementView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const organizationsQuery = useOrganizations()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchQuery])

  const filteredOrganizations = useMemo(() => {
    const dataset = organizationsQuery.data ?? []
    return filterOrganizations(dataset, debouncedSearch)
  }, [organizationsQuery.data, debouncedSearch])

  const tableRows = useMemo(
    () => filteredOrganizations.map((organization) => normalizeOrganizationRow(organization)),
    [filteredOrganizations],
  )

  const isLoading = organizationsQuery.isLoading || organizationsQuery.isFetching
  const hasError = organizationsQuery.isError
  const showEmptyState = !isLoading && !hasError && tableRows.length === 0

  const emptyStateAction = searchQuery.trim().length
    ? {
        label: "Limpar busca",
        onClick: () => setSearchQuery("")
      }
    : {
        label: "Recarregar lista",
        onClick: () => organizationsQuery.refetch()
      }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Gestão de Órgãos</h1>
          <p className="text-sm text-slate-600">
            Consulte e organize os órgãos participantes para manter as estruturas de governança atualizadas.
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nome, sigla ou localização"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>

        {hasError ? (
          <Alert variant="destructive" className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5" />
            <div className="space-y-1">
              <AlertTitle>Erro ao carregar os dados</AlertTitle>
              <AlertDescription>
                Não foi possível carregar os órgãos cadastrados. Tente novamente.
              </AlertDescription>
              <Button size="sm" variant="outline" onClick={() => organizationsQuery.refetch()}>
                Tentar novamente
              </Button>
            </div>
          </Alert>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 p-12 text-slate-500">
            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
            Carregando órgãos...
          </div>
        ) : showEmptyState ? (
          <EmptyState
            icon={Building2}
            title={searchQuery ? "Nenhum órgão encontrado" : "Nenhum órgão cadastrado"}
            description={
              searchQuery
                ? "Ajuste os termos da busca para encontrar o órgão desejado."
                : "Cadastre os órgãos com os quais a sua instituição se relaciona para facilitar a governança."
            }
            action={emptyStateAction}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Órgão</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Localização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell className="font-medium text-slate-900">{organization.name}</TableCell>
                    <TableCell>{organization.acronym}</TableCell>
                    <TableCell>{organization.type}</TableCell>
                    <TableCell>{organization.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
        <RefreshCw className="h-3.5 w-3.5" />
        Atualizado automaticamente sempre que novos órgãos são cadastrados.
      </div>
    </div>
  )
}

export default OrganizationsManagementView
