"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Loader2,
  Search,
  UserPlus,
  UserRound,
} from "lucide-react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { EmptyState } from "@/components/data-display/empty-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  type CreateUserInput,
  type Organization,
  type Role,
  type User,
  useCreateUser,
  useOrganizations,
  useRoles,
  useUsers,
} from "@/hooks/api/useUsers"

const userFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome completo."),
  email: z.string().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
  organizationId: z.string().min(1, "Selecione o órgão."),
  roleId: z.string().min(1, "Selecione o papel."),
})

type UserFormValues = z.infer<typeof userFormSchema>

type NormalizedUser = {
  id: string
  name: string
  email: string
  organization: string
  roles: string
}

function normalizeUser(user: User): NormalizedUser {
  const primaryRole = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : undefined

  return {
    id: user.id,
    name: user.name ?? "Usuário sem nome",
    email: user.email,
    organization: user.organization?.name ?? "—",
    roles: primaryRole?.map((role) => role.name).join(", ") ?? "—",
  }
}

function toSelectOptions<T extends { id: string; name: string }>(items: T[]) {
  return items
    .map((item) => ({ id: item.id, label: item.name }))
    .sort((first, second) => first.label.localeCompare(second.label, "pt-BR"))
}

export function UsersManagementView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const usersQuery = useUsers({ search: debouncedSearch })
  const rolesQuery = useRoles()
  const organizationsQuery = useOrganizations()
  const createUserMutation = useCreateUser()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      organizationId: "",
      roleId: "",
    },
  })

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    if (!isDialogOpen) {
      reset({
        name: "",
        email: "",
        organizationId: "",
        roleId: "",
      })
    }
  }, [isDialogOpen, reset])

  const normalizedUsers = useMemo(() => {
    const payload = usersQuery.data ?? []
    return payload.map((user) => normalizeUser(user))
  }, [usersQuery.data])

  const roleOptions = useMemo(() => toSelectOptions<Role>(rolesQuery.data ?? []), [rolesQuery.data])
  const organizationOptions = useMemo(
    () => toSelectOptions<Organization>(organizationsQuery.data ?? []),
    [organizationsQuery.data],
  )

  const isLoadingUsers = usersQuery.isLoading || usersQuery.isFetching
  const hasError = usersQuery.isError
  const showEmptyState =
    !isLoadingUsers && !hasError && normalizedUsers.length === 0

  const handleSubmitUser = (values: UserFormValues) => {
    const payload: CreateUserInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      organizationId: values.organizationId,
      roleId: values.roleId,
    }

    createUserMutation.mutate(payload, {
      onSuccess: () => {
        setIsDialogOpen(false)
      },
    })
  }

  const emptyStateAction = searchQuery.trim().length
    ? {
        label: "Limpar busca",
        onClick: () => setSearchQuery("")
      }
    : {
        label: "Adicionar novo usuário",
        onClick: () => setIsDialogOpen(true)
      }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Gestão de Usuários</h1>
          <p className="text-sm text-slate-600">
            Busque, cadastre e acompanhe os usuários responsáveis pela governança da plataforma.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Novo Usuário
        </Button>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome, e-mail ou órgão"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {hasError ? (
          <Alert variant="destructive" className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5" />
            <div className="space-y-1">
              <AlertTitle>Erro ao carregar os dados</AlertTitle>
              <AlertDescription>
                Não foi possível carregar a lista de usuários. Tente novamente.
              </AlertDescription>
              <Button size="sm" variant="outline" onClick={() => usersQuery.refetch()}>
                Tentar novamente
              </Button>
            </div>
          </Alert>
        ) : isLoadingUsers ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 p-12 text-slate-500">
            <Loader2 className="mb-2 h-6 w-6 animate-spin" />
            Carregando usuários...
          </div>
        ) : showEmptyState ? (
          <EmptyState
            icon={UserRound}
            title={searchQuery ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
            description={
              searchQuery
                ? "Ajuste os filtros ou limpe a busca para visualizar outros resultados."
                : "Cadastre novos usuários para ampliar o time responsável pela governança."
            }
            action={emptyStateAction}
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Órgão</TableHead>
                  <TableHead>Papel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {normalizedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.organization}</TableCell>
                    <TableCell>{user.roles}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar novo usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para conceder acesso ao time de governança.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit(handleSubmitUser)}>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} placeholder="Maria Silva" autoComplete="name" />
              {errors.name ? <p className="text-sm text-red-600">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@orgao.gov.br"
                {...register("email")}
              />
              {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Órgão</Label>
              <Controller
                control={control}
                name="organizationId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={organizationsQuery.isLoading}
                    placeholder={
                      organizationsQuery.isLoading ? "Carregando órgãos..." : "Selecione um órgão"
                    }
                  >
                    {organizationOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              {errors.organizationId ? (
                <p className="text-sm text-red-600">{errors.organizationId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Papel/Perfil</Label>
              <Controller
                control={control}
                name="roleId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={rolesQuery.isLoading}
                    placeholder={
                      rolesQuery.isLoading ? "Carregando papéis..." : "Selecione um papel"
                    }
                  >
                    {roleOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              {errors.roleId ? <p className="text-sm text-red-600">{errors.roleId.message}</p> : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={createUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createUserMutation.isPending ||
                  rolesQuery.isLoading ||
                  organizationsQuery.isLoading
                }
              >
                {createUserMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersManagementView
