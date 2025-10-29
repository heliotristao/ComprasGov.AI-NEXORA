"use client"

import { Filter, RefreshCw, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import type { ProcessFilterOption } from "../types"

interface FiltersPanelProps {
  statuses: ProcessFilterOption[]
  types: ProcessFilterOption[]
  units: ProcessFilterOption[]
  responsibles: ProcessFilterOption[]
  selectedStatuses: string[]
  selectedType: string | null
  selectedUnit: string | null
  selectedResponsible: string | null
  searchValue: string
  onSearchChange: (value: string) => void
  onToggleStatus: (status: string) => void
  onTypeChange: (value: string | null) => void
  onUnitChange: (value: string | null) => void
  onResponsibleChange: (value: string | null) => void
  onReset: () => void
  isLoading?: boolean
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-caption text-muted-foreground italic">{message}</p>
}

export function FiltersPanel({
  statuses,
  types,
  units,
  responsibles,
  selectedStatuses,
  selectedType,
  selectedUnit,
  selectedResponsible,
  searchValue,
  onSearchChange,
  onToggleStatus,
  onTypeChange,
  onUnitChange,
  onResponsibleChange,
  onReset,
  isLoading = false,
}: FiltersPanelProps) {
  const activeFilters = [
    selectedStatuses.length > 0,
    Boolean(selectedType),
    Boolean(selectedUnit),
    Boolean(selectedResponsible),
    searchValue.trim().length > 0,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="h-4 w-4 text-primary" />
            Filtros Inteligentes
          </div>
          <p className="mt-1 text-caption text-muted-foreground">
            Refine a visualização combinando status, unidades e responsáveis.
          </p>
        </div>
        <Badge variant={activeFilters > 0 ? "approved" : "secondary"} className="h-6 px-2 text-caption">
          {activeFilters} ativos
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="management-search" className="text-xs font-semibold uppercase text-slate-500">
            Busca rápida
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="management-search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Procure por título, nº E-Docs ou palavra-chave"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-slate-500">Status</Label>
          <ScrollArea className="max-h-48 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="space-y-2">
              {statuses.length === 0 && <EmptyState message={isLoading ? "Carregando status..." : "Nenhum status disponível."} />}
              {statuses.map((status) => {
                const isChecked = selectedStatuses.includes(status.value)
                return (
                  <label
                    key={status.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-md border border-transparent px-2 py-1.5 transition-colors",
                      isChecked ? "bg-primary/5" : "hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => onToggleStatus(status.value)}
                        aria-label={`Filtrar por status ${status.label}`}
                      />
                      <span className="text-sm text-slate-700">{status.label}</span>
                    </div>
                    {isChecked && <Badge variant="approved">Ativo</Badge>}
                  </label>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-slate-500">Tipo de processo</Label>
          <Select value={selectedType ?? ""} onValueChange={(value) => onTypeChange(value || null)}>
            <SelectItem value="">Todos os tipos</SelectItem>
            {types.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-slate-500">Unidade</Label>
          <Select value={selectedUnit ?? ""} onValueChange={(value) => onUnitChange(value || null)}>
            <SelectItem value="">Todas as unidades</SelectItem>
            {units.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-slate-500">Responsável</Label>
          <Select value={selectedResponsible ?? ""} onValueChange={(value) => onResponsibleChange(value || null)}>
            <SelectItem value="">Todos os responsáveis</SelectItem>
            {responsibles.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onReset} disabled={isLoading}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Limpar filtros
      </Button>
    </div>
  )
}
