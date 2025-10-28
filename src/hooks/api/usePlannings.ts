import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

const fetchPlannings = async () => {
  const { data } = await api.get('/api/v1/plannings');
  return data;
};

export const usePlannings = () => {
  return useQuery({
    queryKey: ['plannings'],
    queryFn: fetchPlannings,
  });
};

export interface PlanningData {
  year: string;
  name: string;
  necessity: string;
  solution_comparison: string;
  contract_quantities: string;
  technical_viability: string;
  expected_results: string;
}

const createPlanning = async (data: PlanningData) => {
  const response = await api.post('/api/v1/plannings', data);
  return response.data;
};

export const useCreatePlanning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlanning,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannings'] });
    },
  });
};
