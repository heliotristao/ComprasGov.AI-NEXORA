import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface GenerateTechnicalSpecsParams {
  problem_description: string;
}

interface GenerateTechnicalSpecsResponse {
  technical_specs: string;
}

const generateTechnicalSpecs = async (
  params: GenerateTechnicalSpecsParams,
): Promise<GenerateTechnicalSpecsResponse> => {
  const response = await api.post(
    "/api/planning/tr/generate/technical-specs",
    params,
  );
  return response.data as GenerateTechnicalSpecsResponse;
};

export const useGenerateTechnicalSpecs = () => {
  return useMutation<
    GenerateTechnicalSpecsResponse,
    Error,
    GenerateTechnicalSpecsParams
  >({
    mutationFn: generateTechnicalSpecs,
  });
};
