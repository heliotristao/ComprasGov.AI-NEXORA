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
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Copy, 
  Eye,
  Power,
  PowerOff,
  FileText,
  Clock
} from "lucide-react"
import { toast } from "sonner"

export default function ModelosSuperioresPage() {
  const router = useRouter()
  const [busca, setBusca] = useState("")

  // Mock data - substituir por chamada real à API
  const modelos = [
    {
      id: 1,
      nome: "Modelo TCU - ETP Padrão",
      codigo: "TCU-ETP-V2",
      tipo_documento: "ETP",
      tipo_contratacao: "Geral",
      versao: "2.0",
      ativo: true,
      total_instituicoes: 15,
      ultima_atualizacao: "2024-10-15",
      descricao: "Modelo padrão do Tribunal de Contas da União para Estudo Técnico Preliminar"
    },
    {
      id: 2,
      nome: "Modelo TCE-ES - ETP Obras",
      codigo: "TCE-ES-ETP-OBRAS-V1.5",
      tipo_documento: "ETP",
      tipo_contratacao: "Obras",
      versao: "1.5",
      ativo: true,
      total_instituicoes: 8,
      ultima_atualizacao: "2024-09-20",
      descricao: "Modelo do TCE-ES específico para obras e serviços de engenharia"
    },
    {
      id: 3,
      nome: "Modelo TCE-ES - ETP Serviços",
      codigo: "TCE-ES-ETP-SERVICOS-V1.5",
      tipo_documento: "ETP",
      tipo_contratacao: "Serviços",
      versao: "1.5",
      ativo: true,
      total_instituicoes: 12,
      ultima_atualizacao: "2024-09-20",
      descricao: "Modelo do TCE-ES para contratação de serviços comuns"
    },
    {
      id: 4,
      nome: "Modelo PGE-ES - TR Padrão",
      codigo: "PGE-ES-TR-V1.0",
      tipo_documento: "TR",
      tipo_contratacao: "Geral",
      versao: "1.0",
      ativo: false,
      total_instituicoes: 3,
      ultima_atualizacao: "2024-06-10",
      descricao: "Modelo da Procuradoria Geral do Estado para Termo de Referência"
    },
  ]

  const modelosFiltrados = modelos.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    m.codigo.toLowerCase().includes(busca.toLowerCase())
  )

  const handleNovoModelo = () => {
    router.push("/admin/modelos-superiores/novo")
  }

  const handleEditar = (id: number) => {
    router.push(`/admin/modelos-superiores/${id}/editar`)
  }

  const handleVisualizar = (id: number) => {
    router.push(`/admin/modelos-superiores/${id}`)
  }

  const handleDuplicar = (id: number) => {
    toast.success("Modelo duplicado com sucesso!")
  }

  const handleToggleAtivo = (id: number, ativo: boolean) => {
    toast.success(ativo ? "Modelo ativado!" : "Modelo desativado!")
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Modelos Superiores
          </h1>
          <p className="text-muted-foreground">
            Gerencie os modelos padrão de TCU, TCE e PGE
          </p>
        </div>

        <Button onClick={handleNovoModelo}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Modelo
        </Button>
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
                placeholder="Buscar por nome ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
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
            Lista de modelos superiores cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Instituições</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualização</TableHead>
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
                        {modelo.descricao}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {modelo.codigo}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        {modelo.tipo_documento}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {modelo.tipo_contratacao}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">v{modelo.versao}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {modelo.total_instituicoes} {modelo.total_instituicoes === 1 ? "instituição" : "instituições"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {modelo.ativo ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <Power className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <PowerOff className="h-3 w-3 mr-1" />
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(modelo.ultima_atualizacao).toLocaleDateString("pt-BR")}
                    </div>
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
                        <DropdownMenuItem 
                          onClick={() => handleToggleAtivo(modelo.id, !modelo.ativo)}
                        >
                          {modelo.ativo ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
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
              <p className="text-muted-foreground">
                Nenhum modelo encontrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

