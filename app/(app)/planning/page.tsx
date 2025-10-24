'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { usePlannings } from '@/hooks/api/usePlannings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Planning {
  id: string;
  name: string;
  description: string;
}

export default function PlanningPage() {
  const { data, isLoading, isError } = usePlannings();
  const router = useRouter();

  if (isLoading) {
    return <div>Carregando planejamentos...</div>;
  }

  if (isError) {
    return <div>Ocorreu um erro ao buscar os planejamentos.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Planejamentos</h1>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((planning: Planning) => (
                <TableRow key={planning.id}>
                  <TableCell>{planning.id}</TableCell>
                  <TableCell>{planning.name}</TableCell>
                  <TableCell>{planning.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/planning/${planning.id}/tr`)}
                    >
                      Gerar TR
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum planejamento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
