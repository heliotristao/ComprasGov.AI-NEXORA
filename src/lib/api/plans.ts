import { api } from "@/lib/axios"
import { Plan } from "@/types/plan"

export const getPlan = async (id: string, token: string): Promise<Plan> => {
  const response = await api.get(`/plans/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data as Plan
}
