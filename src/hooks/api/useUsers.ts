import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useToast } from "@/hooks/useToast"
import { api } from "@/lib/axios"

export type Role = {
  id: string
  name: string
  description?: string
}

export type Organization = {
  id: string
  name: string
  acronym?: string
  type?: string
  city?: string
  state?: string
}

export type User = {
  id: string
  name?: string
  email: string
  organization?: Organization | null
  roles?: Role[]
}

type FetchUsersParams = {
  search?: string
}

type FetchUsersResponse = unknown

type FetchRolesResponse = unknown

type FetchOrganizationsResponse = unknown

function generateFallbackId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeRole(role: unknown): Role {
  if (isRecord(role)) {
    const idRaw = role.id
    const nameRaw = role.name

    return {
      id:
        typeof idRaw === "string"
          ? idRaw
          : typeof idRaw === "number"
            ? String(idRaw)
            : generateFallbackId("role"),
      name: typeof nameRaw === "string" && nameRaw.trim().length > 0 ? nameRaw : "Função sem título",
      description: typeof role.description === "string" ? role.description : undefined,
    }
  }

  return {
    id: generateFallbackId("role"),
    name: "Função sem título",
  }
}

function normalizeOrganization(organization: unknown): Organization {
  if (isRecord(organization)) {
    const idRaw = organization.id
    const nameRaw = organization.name ?? organization.title ?? organization.fullName

    return {
      id:
        typeof idRaw === "string"
          ? idRaw
          : typeof idRaw === "number"
            ? String(idRaw)
            : generateFallbackId("organization"),
      name:
        typeof nameRaw === "string" && nameRaw.trim().length > 0
          ? nameRaw
          : "Órgão sem identificação",
      acronym:
        typeof organization.acronym === "string"
          ? organization.acronym
          : typeof organization.shortName === "string"
            ? organization.shortName
            : undefined,
      type: typeof organization.type === "string" ? organization.type : undefined,
      city: typeof organization.city === "string" ? organization.city : undefined,
      state:
        typeof organization.state === "string"
          ? organization.state
          : typeof organization.uf === "string"
            ? organization.uf
            : undefined,
    }
  }

  return {
    id: generateFallbackId("organization"),
    name: "Órgão sem identificação",
  }
}

function normalizeUser(user: unknown): User {
  if (isRecord(user)) {
    const idRaw = user.id
    const emailRaw = user.email
    const nameRaw = user.name ?? user.full_name ?? user.fullName

    const organization =
      "organization" in user && user.organization != null
        ? normalizeOrganization(user.organization)
        : null

    const rolesRaw = Array.isArray(user.roles) ? user.roles : []
    const roles = rolesRaw.map((role) => normalizeRole(role))

    return {
      id:
        typeof idRaw === "string"
          ? idRaw
          : typeof idRaw === "number"
            ? String(idRaw)
            : generateFallbackId("user"),
      email: typeof emailRaw === "string" ? emailRaw : "email.nao.informado@nexora.ai",
      name: typeof nameRaw === "string" ? nameRaw : undefined,
      organization,
      roles,
    }
  }

  return {
    id: generateFallbackId("user"),
    email: "email.nao.informado@nexora.ai",
  }
}

const fetchUsers = async ({ search }: FetchUsersParams = {}): Promise<User[]> => {
  const { data } = await api.get<FetchUsersResponse>("/api/v1/users", {
    params: { q: search && search.trim().length > 0 ? search : undefined },
  })

  if (!Array.isArray(data)) {
    return []
  }

  return data.map((user) => normalizeUser(user))
}

const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await api.get<FetchRolesResponse>("/api/v1/roles")

  if (!Array.isArray(data)) {
    return []
  }

  return data.map((role) => normalizeRole(role))
}

const fetchOrganizations = async (): Promise<Organization[]> => {
  const { data } = await api.get<FetchOrganizationsResponse>("/api/v1/organizations")

  if (!Array.isArray(data)) {
    return []
  }

  return data.map((organization) => normalizeOrganization(organization))
}

export const useUsers = ({ search }: FetchUsersParams = {}) => {
  return useQuery<User[]>({
    queryKey: ["users", { search: search ?? "" }],
    queryFn: () => fetchUsers({ search }),
  })
}

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 1000 * 60 * 5,
  })
}

export const useOrganizations = () => {
  return useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
    staleTime: 1000 * 60 * 5,
  })
}

export type CreateUserInput = {
  name: string
  email: string
  organizationId: string
  roleId: string
}

const createUserRequest = async (input: CreateUserInput): Promise<User> => {
  const payload = {
    name: input.name,
    email: input.email,
    organization_id: input.organizationId,
    organizationId: input.organizationId,
    role_id: input.roleId,
    roleId: input.roleId,
  }

  const { data } = await api.post("/api/v1/users", payload)

  return normalizeUser(data)
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<User, unknown, CreateUserInput>({
    mutationFn: createUserRequest,
    onSuccess: () => {
      toast({ title: "Usuário criado com sucesso!", variant: "success" })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: () => {
      toast({
        title: "Erro ao criar usuário. Tente novamente.",
        variant: "destructive",
      })
    },
  })
}

const deleteUserRequest = async (userId: string): Promise<void> => {
  await api.delete(`/api/v1/users/${userId}`)
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation<void, unknown, string>({
    mutationFn: deleteUserRequest,
    onSuccess: () => {
      toast({ title: "Usuário excluído com sucesso!", variant: "success" })
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: () => {
      toast({
        title: "Erro ao excluir usuário. Tente novamente.",
        variant: "destructive",
      })
    },
  })
}
