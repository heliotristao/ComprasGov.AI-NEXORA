"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  FileStack, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  PlusCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - substituir por hook real
const mockETPs = [
  {
    id: 1,
    identificador: "ETP-2025-001",
    plano_identificador: "PLANO-2025-001",
    objeto: "Aquisição de equipamentos de informática",
    template_nome: "ETP Padrão TCU",
    progresso: 45,
    status: "em_elaboracao",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-20T14:30:00Z",
  },
  {
    id: 2,
    identificador: "ETP-2025-002",
    plano_identificador: "PLANO-2025-002",
    objeto: "Contratação de empresa especializada em manutenção predial",
    template_nome: "ETP Padrão TCU",
    progresso: 100,
    status: "aprovado",
    created_at: "2025-01-10T09:00:00Z",
    updated_at: "2025-01-18T16:45:00Z",
  },
  {
    id: 3,
    identificador: "ETP-2025-003",
    plano_identificador: "PLANO-2025-003",
    objeto: "Aquisição de material de expediente",
    template_nome: "ETP Padrão TCU",
    progresso: 85,
    status: "validacao",
    created_at: "2025-01-12T11:30:00Z",
    updated_at: "2025-01-22T10:15:00Z",
  },
  {
    id: 4,
    identificador: "ETP-2025-004",
    plano_identificador: "PLANO-2025-004",
    objeto: "Contratação de serviços de limpeza",
    template_nome: "ETP Padrão TCU",
    progresso: 100,
    status: "concluido",
    created_at: "2025-01-08T08:00:00Z",
    updated_at: "2025-01-16T12:00:00Z",
  },
]

const statusConfig = {
  em_elaboracao: {
    label: "Em Elaboração",
    variant: "default" as const,
    icon: Clock,
    color: "text-blue-600 bg-blue-50",
  },
  validacao: {
    label: "Em Validação",
    variant: "secondary" as const,
    icon: AlertCircle,
    color: "text-yellow-600 bg-yellow-50",
  },
  concluido: {
    label: "Concluído",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50",
  },
  aprovado: {
    label: "Aprovado",
    variant: "default" as const,
    icon: FileCheck,
    color: "text-emerald-600 bg-emerald-50",
  },
}

export default function ETPListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar ETPs
  const filteredETPs = mockETPs.filter((etp) => {
    const matchesSearch = 
      etp.identificador.toLowerCase().includes(searchQuery.toLowerCase()) ||
      etp.plano_identificador.toLowerCase().includes(searchQuery.toLowerCase()) ||
      etp.objeto.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || etp.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Estudos Técnicos Preliminares (ETP)
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Gerencie os ETPs criados para os planos de contratação
          </p>
        </div>
        <Button onClick={() => router.push("/plans")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo ETP
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de ETPs</CardTitle>
            <FileStack className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockETPs.length}</div>
            <p className="text-xs text-slate-600 mt-1">
              Documentos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Elaboração</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockETPs.filter(etp => etp.status === "em_elaboracao").length}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Validação</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockETPs.filter(etp => etp.status === "validacao").length}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Aguardando revisão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <FileCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockETPs.filter(etp => etp.status === "aprovado" || etp.status === "concluido").length}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Prontos para TR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busque e filtre os Estudos Técnicos Preliminares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por identificador, plano ou objeto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "em_elaboracao" ? "default" : "outline"}
                onClick={() => setStatusFilter("em_elaboracao")}
                size="sm"
              >
                Em Elaboração
              </Button>
              <Button
                variant={statusFilter === "validacao" ? "default" : "outline"}
                onClick={() => setStatusFilter("validacao")}
                size="sm"
              >
                Validação
              </Button>
              <Button
                variant={statusFilter === "aprovado" ? "default" : "outline"}
                onClick={() => setStatusFilter("aprovado")}
                size="sm"
              >
                Aprovados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de ETPs</CardTitle>
          <CardDescription>
            {filteredETPs.length} {filteredETPs.length === 1 ? "documento encontrado" : "documentos encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredETPs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileStack className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhum ETP encontrado
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Crie um ETP a partir de um plano de contratação"}
              </p>
              <Button onClick={() => router.push("/plans")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ir para Planos
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificador</TableHead>
                    <TableHead>Plano Base</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredETPs.map((etp) => {
                    const statusInfo = statusConfig[etp.status as keyof typeof statusConfig]
                    const StatusIcon = statusInfo?.icon

                    return (
                      <TableRow key={etp.id}>
                        <TableCell className="font-medium">
                          {etp.identificador}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/plans/${etp.plano_identificador}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {etp.plano_identificador}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="line-clamp-2 text-sm" title={etp.objeto}>
                              {etp.objeto}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {etp.template_nome}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-md w-fit ${statusInfo?.color}`}>
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            <span className="text-xs font-medium">
                              {statusInfo?.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${etp.progresso}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600">
                              {etp.progresso}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDate(etp.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Ações
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/etp/${etp.id}/wizard`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Continuar Edição
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/etp/${etp.id}/visualizar`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/etp/${etp.id}/consolidar`)}
                                disabled={etp.progresso < 100}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Consolidar
                              </DropdownMenuItem>
                              {(etp.status === "aprovado" || etp.status === "concluido") && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/tr/novo?etpId=${etp.id}`)}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Criar TR
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar DOCX
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

