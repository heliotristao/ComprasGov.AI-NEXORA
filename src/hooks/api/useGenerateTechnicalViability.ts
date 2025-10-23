import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface GenerateTechnicalViabilityParams {
  problem_description: string;
}

interface GenerateTechnicalViabilityResponse {
  technical_viability: string;
}

const generateTechnicalViability = async (
  params: GenerateTechnicalViabilityParams,
): Promise<GenerateTechnicalViabilityResponse> => {
  const response = await api.post(
    "/api/planning/etp/generate/technical-viability",
    params,
  );
  return response.data;
};

export const useGenerateTechnicalViability = () => {
  return useMutation<
    GenerateTechnicalViabilityResponse,
    Error,
    GenerateTechnicalViabilityParams
  >({
    mutationFn: generateTechnicalViability,
  });
};
