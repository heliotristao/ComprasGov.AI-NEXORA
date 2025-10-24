import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/axios';

import type { PlanningData } from './usePlannings';

interface UpdatePlanningVariables {
  id: string;
  data: PlanningData;
}

const updatePlanning = async ({ id, data }: UpdatePlanningVariables) => {
  const response = await api.patch(`/api/planning/plannings/${id}`, data);
  return response.data;
};

export const useUpdatePlanning = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updatePlanning,
    onSuccess: (_, variables) => {
      toast({ title: 'Progresso do ETP salvo com sucesso!', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['planning', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['plannings'] });
    },
    onError: () => {
      toast({
        title: 'Erro ao salvar progresso do ETP. Tente novamente.',
        variant: 'destructive',
      });
    },
  });
};
