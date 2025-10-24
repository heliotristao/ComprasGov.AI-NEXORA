import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";

export interface TermsOfReferenceResponse {
  id: string;
  planning_id: string;
  technical_specs: string;
}

const termsOfReferenceQueryKey = (planningId: string) => [
  "terms-of-reference",
  planningId,
];

const fetchTermsOfReference = async (
  planningId: string,
): Promise<TermsOfReferenceResponse> => {
  const { data } = await api.get(
    `/api/planning/terms-of-reference/${planningId}`,
  );

  return data;
};

interface UpdateTermsOfReferenceVariables {
  technical_specs: string;
}

const updateTermsOfReference = async (
  trId: string,
  payload: UpdateTermsOfReferenceVariables,
): Promise<TermsOfReferenceResponse> => {
  const { data } = await api.patch(
    `/api/planning/terms-of-reference/${trId}`,
    payload,
  );

  return data;
};

export const useTermsOfReference = (planningId: string) => {
  return useQuery({
    queryKey: termsOfReferenceQueryKey(planningId),
    queryFn: () => fetchTermsOfReference(planningId),
    enabled: Boolean(planningId),
  });
};

interface UseUpdateTermsOfReferenceParams {
  trId?: string;
  planningId: string;
}

export const useUpdateTermsOfReference = ({
  trId,
  planningId,
}: UseUpdateTermsOfReferenceParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: UpdateTermsOfReferenceVariables) => {
      if (!trId) {
        throw new Error("Termo de Referência não encontrado.");
      }

      return updateTermsOfReference(trId, variables);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(termsOfReferenceQueryKey(planningId), data);
    },
  });
};
