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
import { Search, MoreVertical, Eye, Edit, FileText, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Mock data - substituir por hook real
const mockETPs = [
  {
    id: 1,
    plano_identificador: "PLANO-2025-001",
    template_nome: "ETP Padrão TCU",
    progresso: 45,
    status: "em_progresso",
    created_at: "2025-10-27T10:00:00Z"
  },
  {
    id: 2,
    plano_identificador: "PLANO-2025-003",
    template_nome: "ETP Padrão TCU",
    progresso: 100,
    status: "consolidado",
    created_at: "2025-10-26T14:30:00Z"
  }
]

const statusMap = {
  rascunho: { label: "Rascunho", color: "bg-slate-500" },
  em_progresso: { label: "Em Progresso", color: "bg-blue-500" },
  validado: { label: "Validado", color: "bg-green-500" },
  consolidado: { label: "Consolidado", color: "bg-purple-500" },
}

export default function ETPs Page() {
  const router = useRouter()
  const [busca, setBusca] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estudos Técnicos Preliminares (ETP)</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os ETPs criados para os planos de contratação
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ETPs Cadastrados</CardTitle>
              <CardDescription>
                {mockETPs.length} documento(s) encontrado(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por plano..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockETPs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum ETP encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  mockETPs.map((etp) => (
                    <TableRow key={etp.id}>
                      <TableCell className="font-medium">
                        {etp.plano_identificador}
                      </TableCell>
                      <TableCell>{etp.template_nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={etp.progresso} className="w-24" />
                          <span className="text-sm text-muted-foreground">
                            {etp.progresso}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${statusMap[etp.status as keyof typeof statusMap].color} text-white`}
                        >
                          {statusMap[etp.status as keyof typeof statusMap].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(etp.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/etp/${etp.id}/wizard`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Continuar Edição
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/etp/${etp.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            {etp.status === "validado" && (
                              <DropdownMenuItem onClick={() => router.push(`/etp/${etp.id}/consolidar`)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Consolidar
                              </DropdownMenuItem>
                            )}
                            {etp.status === "consolidado" && (
                              <DropdownMenuItem onClick={() => router.push(`/tr/novo?etpId=${etp.id}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Criar TR
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

