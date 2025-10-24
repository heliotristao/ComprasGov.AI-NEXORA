import { useMutation, useQueryClient } from '@tanstack/react-query';

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

  return useMutation({
    mutationFn: updatePlanning,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planning', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['plannings'] });
    },
  });
};
