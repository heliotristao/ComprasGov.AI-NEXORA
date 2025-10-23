import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface PlanningResponse {
  id: string;
  name?: string;
  description?: string;
  problem_description?: string;
  technical_specs?: string;
}

const fetchPlanning = async (id: string): Promise<PlanningResponse> => {
  const { data } = await api.get(`/api/planning/${id}`);
  return data;
};

export const usePlanning = (id: string) => {
  return useQuery({
    queryKey: ["planning", id],
    queryFn: () => fetchPlanning(id),
    enabled: Boolean(id),
  });
};
