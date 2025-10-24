"use client"

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRoles } from "@/hooks/api/useRoles"
import type { Role } from "@/hooks/api/useRoles"
import type { User } from "@/hooks/api/useUsers"
import { api } from "@/lib/axios"

interface UserFormProps {
  user?: User
  onSuccess?: () => void
}

interface UserFormValues {
  email: string
  password?: string
  roles: string[]
}

const MIN_PASSWORD_LENGTH = 8

const buildSchema = (mode: "create" | "edit") =>
  z
    .object({
      email: z.string().email({ message: "Informe um email válido." }),
      password: z.string().optional(),
      roles: z.array(z.string()).default([]),
    })
    .superRefine((data, ctx) => {
      const trimmedPassword = data.password?.trim() ?? ""

      if (mode === "create") {
        if (!trimmedPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: "A senha é obrigatória para novos usuários.",
          })
        } else if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["password"],
            message: `A senha deve conter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
          })
        }
      } else if (trimmedPassword && trimmedPassword.length < MIN_PASSWORD_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: `A senha deve conter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        })
      }
    })

const mapRolesToIds = (roles?: Role[]) =>
  roles?.map((role) => String(role.id)) ?? []

export const UserForm = ({ user, onSuccess }: UserFormProps) => {
  const mode = user ? "edit" : "create"
  const queryClient = useQueryClient()
  const rolesQuery = useRoles()

  const schema = useMemo(() => buildSchema(mode), [mode])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? "",
      password: "",
      roles: mapRolesToIds(user?.roles),
    },
  })

  useEffect(() => {
    reset({
      email: user?.email ?? "",
      password: "",
      roles: mapRolesToIds(user?.roles),
    })
  }, [user, reset])

  const selectedRoles = watch("roles", [])

  const mutation = useMutation<User, unknown, UserFormValues>({
    mutationFn: async (values) => {
      const trimmedPassword = values.password?.trim()
      const payload: Record<string, unknown> = {
        email: values.email,
      }

      if (trimmedPassword) {
        payload.password = trimmedPassword
      }

      const uniqueRoles = Array.from(new Set(values.roles))

      const { data } =
        mode === "create"
          ? await api.post<User>("/users/", payload)
          : await api.patch<User>(`/users/${user?.id}`, payload)

      const targetUserId = data?.id ?? user?.id

      if (uniqueRoles.length > 0) {
        if (targetUserId === undefined || targetUserId === null) {
          throw new Error("ID do usuário não retornado pela API.")
        }

        await Promise.all(
          uniqueRoles.map((roleId) =>
            api.post(`/users/${targetUserId}/roles/${roleId}`),
          ),
        )
      }

      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      onSuccess?.()
    },
  })

  const onSubmit = async (values: UserFormValues) => {
    try {
      await mutation.mutateAsync({
        ...values,
        password: values.password?.trim() || undefined,
        roles: values.roles,
      })
    } catch (error) {
      // O estado de erro é tratado pelo TanStack Query através de mutation.isError
      console.error(error)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "create" ? "new-password" : "off"}
          placeholder={mode === "edit" ? "Deixe em branco para manter a senha atual" : undefined}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        ) : mode === "create" ? (
          <p className="text-xs text-slate-500">
            A senha deve conter pelo menos {MIN_PASSWORD_LENGTH} caracteres.
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <Label>Funções</Label>
        {rolesQuery.isLoading ? (
          <p className="text-sm text-slate-500">Carregando funções...</p>
        ) : null}
        {rolesQuery.isError ? (
          <p className="text-sm text-destructive">
            Não foi possível carregar as funções disponíveis.
          </p>
        ) : null}
        {!rolesQuery.isLoading && !rolesQuery.isError ? (
          <div className="flex flex-col gap-3">
            {rolesQuery.data && rolesQuery.data.length > 0 ? (
              rolesQuery.data.map((role) => {
                const roleId = String(role.id)
                const isChecked = selectedRoles?.includes(roleId) ?? false

                return (
                  <label key={roleId} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      id={`role-${roleId}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const checkedValue = Boolean(checked)
                        const currentRoles = selectedRoles ?? []

                        if (checkedValue) {
                          if (!currentRoles.includes(roleId)) {
                            setValue("roles", [...currentRoles, roleId], {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            })
                          }
                        } else {
                          setValue(
                            "roles",
                            currentRoles.filter((value) => value !== roleId),
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            },
                          )
                        }
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{role.name}</span>
                      {role.description ? (
                        <span className="text-xs text-slate-500">{role.description}</span>
                      ) : null}
                    </div>
                  </label>
                )
              })
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma função cadastrada. Crie funções antes de atribuí-las aos usuários.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {mutation.isError ? (
        <p className="text-sm text-destructive" role="alert">
          Não foi possível salvar o usuário. Tente novamente.
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending
            ? "Salvando..."
            : mode === "create"
              ? "Criar usuário"
              : "Salvar alterações"}
        </Button>
      </div>
    </form>
  )
}
