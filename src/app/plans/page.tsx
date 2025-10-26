import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockPlans = [
  {
    id: "PLAN-2025-001",
    object: "Contratação de serviço de limpeza para o prédio principal",
    status: "Em Elaboração",
    createdAt: "25/10/2025",
  },
  {
    id: "PLAN-2025-002",
    object: "Aquisição de equipamentos de informática para o setor administrativo",
    status: "Em Aprovação",
    createdAt: "28/10/2025",
  },
  {
    id: "PLAN-2025-003",
    object: "Serviços de manutenção preventiva de sistemas de climatização",
    status: "Concluído",
    createdAt: "30/10/2025",
  },
]

export default function PlansPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Planos de Contratação</h1>
        <Link className="ml-auto w-full sm:w-auto sm:flex-none" href="/plans/new">
          <Button className="w-full sm:w-auto">Novo Plano</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">ID do Plano</TableHead>
              <TableHead>Objeto</TableHead>
              <TableHead className="w-[160px]">Status</TableHead>
              <TableHead className="w-[160px]">Data de Criação</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPlans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium text-slate-900">{plan.id}</TableCell>
                <TableCell className="text-slate-700">{plan.object}</TableCell>
                <TableCell>{plan.status}</TableCell>
                <TableCell>{plan.createdAt}</TableCell>
                <TableCell className="text-right text-slate-400">—</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
