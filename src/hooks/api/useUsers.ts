import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/axios"
import type { Role } from "./useRoles"

export interface User {
  id: string | number
  email: string
  roles?: Role[]
  created_at?: string
  updated_at?: string
}

export interface CreateUserPayload {
  email: string
  password: string
}

export interface UpdateUserPayload {
  email?: string
  password?: string
}

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>("/users/")
  return data
}

const createUser = async (payload: CreateUserPayload) => {
  const { data } = await api.post<User>("/users/", payload)
  return data
}

const updateUser = async (userId: string | number, payload: UpdateUserPayload) => {
  const { data } = await api.patch<User>(`/users/${userId}`, payload)
  return data
}

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export const useUpdateUserMutation = (userId: string | number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
