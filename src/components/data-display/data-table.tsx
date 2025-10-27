"use client"

import * as React from "react"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { PAGE_SIZE_OPTIONS } from "@/lib/constants"

/**
 * Definição de coluna da tabela
 */
export interface DataTableColumn<T> {
  /** ID único da coluna */
  id: string
  /** Label exibido no header */
  label: string
  /** Função para acessar o valor da célula */
  accessor: (row: T) => React.ReactNode
  /** Se a coluna é ordenável */
  sortable?: boolean
  /** Largura da coluna (classe Tailwind) */
  width?: string
  /** Alinhamento do texto */
  align?: "left" | "center" | "right"
}

/**
 * Alias para DataTableColumn (para compatibilidade)
 */
export type Column<T> = DataTableColumn<T>

/**
 * Definição de coluna da tabela (duplicado para remover)
 */
interface _DataTableColumn<T> {
  /** ID único da coluna */
  id: string
  /** Label exibido no header */
  label: string
  /** Função para acessar o valor da célula */
  accessor: (row: T) => React.ReactNode
  /** Se a coluna é ordenável */
  sortable?: boolean
  /** Largura da coluna (classe Tailwind) */
  width?: string
  /** Alinhamento do texto */
  align?: "left" | "center" | "right"
}

/**
 * Props para o componente DataTable
 */
export interface DataTableProps<T> {
  /** Array de dados */
  data: T[]
  /** Definição das colunas */
  columns: DataTableColumn<T>[]
  /** Mensagem quando não há dados */
  emptyMessage?: string
  /** Se deve mostrar paginação */
  showPagination?: boolean
  /** Tamanho da página inicial */
  initialPageSize?: number
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente de tabela de dados que segue o Design System NEXORA.
 * 
 * Tabela com ordenação, paginação e estados vazios.
 * Totalmente tipada com TypeScript genérico.
 * 
 * @example
 * ```tsx
 * <DataTable
 *   data={processes}
 *   columns={[
 *     { id: "id", label: "ID", accessor: (row) => row.id, sortable: true },
 *     { id: "name", label: "Nome", accessor: (row) => row.name, sortable: true },
 *     { id: "status", label: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
 *   ]}
 *   showPagination
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  emptyMessage = "Nenhum dado encontrado.",
  showPagination = true,
  initialPageSize = 10,
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initialPageSize)

  // Ordenação
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data

    const column = columns.find((col) => col.id === sortColumn)
    if (!column) return data

    return [...data].sort((a, b) => {
      const aValue = column.accessor(a)
      const bValue = column.accessor(b)

      // Converter para string para comparação
      const aStr = String(aValue)
      const bStr = String(bValue)

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }, [data, sortColumn, sortDirection, columns])

  // Paginação
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const paginatedData = React.useMemo(() => {
    if (!showPagination) return sortedData

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, currentPage, pageSize, showPagination])

  // Handlers
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1) // Reset para primeira página
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.width,
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right"
                  )}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.id)}
                    >
                      <span>{column.label}</span>
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <p className="text-body text-muted-foreground">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right"
                      )}
                    >
                      {column.accessor(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {showPagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-body-small text-muted-foreground">Linhas por página:</p>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              className="h-8 w-[70px]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-body-small text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

