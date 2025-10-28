"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectItem } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Copy, 
  Eye,
  Trash2,
  FileText,
  Clock,
  Download,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"

export default function ModelosInstitucionaisPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")

  // Mock data - substituir por chamada real à API
  const modelos = [
    {
      id: 1,
      nome: "ETP Obras e Serviços de Engenharia",
      tipo_documento: "ETP",
      tipo_contratacao: "Obras",
      versao: "2.1",
      status: "ativo",
      baseado_em: "TCE-ES v1.5",
      total_documentos: 12,
      ultima_utilizacao: "2024-10-25",
      criado_em: "2024-08-15"
    },
    {
      id: 2,
      nome: "ETP Aquisição de Insumos Médicos",
      tipo_documento: "ETP",
      tipo_contratacao: "Bens",
      versao: "1.3",
      status: "ativo",
      baseado_em: "TCE-ES v1.5",
      total_documentos: 45,
      ultima_utilizacao: "2024-10-27",
      criado_em: "2024-07-10"
    },
    {
      id: 3,
      nome: "ETP Serviços de TI",
      tipo_documento: "ETP",
      tipo_contratacao: "TI",
      versao: "1.0",
      status: "rascunho",
      baseado_em: "TCU v2.0",
      total_documentos: 0,
      ultima_utilizacao: null,
      criado_em: "2024-10-20"
    },
    {
      id: 4,
      nome: "TR Contratação de Limpeza",
      tipo_documento: "TR",
      tipo_contratacao: "Serviços",
      versao: "1.2",
      status: "ativo",
      baseado_em: "TCE-ES v1.5",
      total_documentos: 8,
      ultima_utilizacao: "2024-10-15",
      criado_em: "2024-06-05"
    },
  ]

  const modelosFiltrados = modelos.filter(m => {
    const matchBusca = m.nome.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = filtroTipo === "todos" || m.tipo_documento === filtroTipo
    const matchStatus = filtroStatus === "todos" || m.status === filtroStatus
    return matchBusca && matchTipo && matchStatus
  })

  const handleNovoModelo = () => {
    router.push("/admin/modelos-institucionais/novo")
  }

  const handleEditar = (id: number) => {
    router.push(`/admin/modelos-institucionais/${id}/editar`)
  }

  const handleVisualizar = (id: number) => {
    router.push(`/admin/modelos-institucionais/${id}`)
  }

  const handleDuplicar = (id: number) => {
    toast.success("Modelo duplicado com sucesso!")
  }

  const handleExcluir = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este modelo?")) {
      toast.success("Modelo excluído com sucesso!")
    }
  }

  const handleExportar = (id: number) => {
    toast.success("Modelo exportado com sucesso!")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
      case "rascunho":
        return <Badge variant="secondary">Rascunho</Badge>
      case "arquivado":
        return <Badge variant="outline">Arquivado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Meus Modelos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os modelos customizados da sua instituição
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/modelos-superiores")}>
            <Download className="h-4 w-4 mr-2" />
            Importar do TCE/TCU
          </Button>
          <Button onClick={handleNovoModelo}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Modelo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Modelos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelos.length}</div>
            <p className="text-xs text-muted-foreground">
              {modelos.filter(m => m.status === "ativo").length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documentos Gerados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modelos.reduce((acc, m) => acc + m.total_documentos, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de documentos criados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mais Utilizado
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...modelos.map(m => m.total_documentos))}
            </div>
            <p className="text-xs text-muted-foreground">
              Insumos Médicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroTipo} onValueChange={setFiltroTipo} placeholder="Tipo" className="w-[180px]">
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="ETP">ETP</SelectItem>
              <SelectItem value="TR">TR</SelectItem>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus} placeholder="Status" className="w-[180px]">
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="arquivado">Arquivado</SelectItem>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>
            {modelosFiltrados.length} {modelosFiltrados.length === 1 ? "Modelo" : "Modelos"}
          </CardTitle>
          <CardDescription>
            Lista de modelos customizados da sua instituição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Baseado em</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Utilização</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelosFiltrados.map((modelo) => (
                <TableRow key={modelo.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{modelo.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        v{modelo.versao} • {modelo.tipo_contratacao}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      {modelo.tipo_documento}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {modelo.baseado_em}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {modelo.total_documentos}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(modelo.status)}
                  </TableCell>
                  <TableCell>
                    {modelo.ultima_utilizacao ? (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(modelo.ultima_utilizacao).toLocaleDateString("pt-BR")}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Nunca usado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleVisualizar(modelo.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditar(modelo.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicar(modelo.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportar(modelo.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleExcluir(modelo.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {modelosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum modelo encontrado
              </p>
              <Button onClick={handleNovoModelo}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Modelo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

