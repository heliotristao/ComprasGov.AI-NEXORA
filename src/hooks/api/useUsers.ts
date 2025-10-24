import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/axios';

export type Role = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  [key: string]: unknown;
};

type CreateUserInput = {
  email: string;
  password?: string;
  roles: string[];
};

const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await api.get('/roles/');
  return data;
};

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });
};

const createUserRequest = async ({ roles, ...userPayload }: CreateUserInput): Promise<User> => {
  const { data } = await api.post('/users/', userPayload);

  const userIdRaw = (data as { id?: string | number }).id;
  const userId = typeof userIdRaw === 'number' ? String(userIdRaw) : userIdRaw;

  if (roles?.length && userId) {
    await Promise.all(roles.map((roleId) => api.post(`/users/${userId}/roles/${roleId}`)));
  }

  return data;
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<User, unknown, CreateUserInput>({
    mutationFn: createUserRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
