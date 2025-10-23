import { useQuery } from '@tanstack/react-query';
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
