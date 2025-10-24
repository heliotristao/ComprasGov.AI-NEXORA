import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/axios"

export interface Role {
  id: string | number
  name: string
  description?: string | null
}

const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await api.get<Role[]>("/roles/")
  return data
}

export const useRoles = () =>
  useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 5 * 60 * 1000,
  })
