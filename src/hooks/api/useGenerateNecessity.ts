import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface GenerateNecessityParams {
  problem_description: string;
}

interface GenerateNecessityResponse {
  necessity: string;
}

const generateNecessity = async (params: GenerateNecessityParams): Promise<GenerateNecessityResponse> => {
  const response = await api.post('/api/planning/etp/generate/necessity', params);
  return response.data as GenerateNecessityResponse;
};

export const useGenerateNecessity = () => {
  return useMutation<GenerateNecessityResponse, Error, GenerateNecessityParams>({
    mutationFn: generateNecessity,
  });
};
