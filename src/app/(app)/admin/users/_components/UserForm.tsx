"use client"

import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type RoleOption = {
  id: string
  name: string
}

export type UserFormValues = {
  email: string
  password?: string
  roles: string[]
}

type UserFormProps = {
  defaultValues?: Partial<UserFormValues>
  onSubmit: (values: UserFormValues) => void | Promise<void>
  isSubmitting?: boolean
  roleOptions: RoleOption[]
  rolesLoading?: boolean
  requirePassword?: boolean
}

const baseSchema = z.object({
  email: z.string().min(1, "Informe o e-mail do usuário.").email("Informe um e-mail válido."),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: "A senha deve conter pelo menos 8 caracteres.",
    }),
  roles: z.array(z.string()).min(1, "Selecione ao menos uma função."),
})

const createSchema = baseSchema.extend({
  password: z.string().min(8, "A senha deve conter pelo menos 8 caracteres."),
})

const getSchema = (requirePassword: boolean) => (requirePassword ? createSchema : baseSchema)

export function UserForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  roleOptions,
  rolesLoading = false,
  requirePassword = true,
}: UserFormProps) {
  const formSchema = useMemo(() => getSchema(requirePassword), [requirePassword])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      roles: [],
      ...defaultValues,
    },
  })

  const handleFormSubmit = async (values: UserFormValues) => {
    const payload: UserFormValues = {
      ...values,
      password: values.password ? values.password : undefined,
    }

    await onSubmit(payload)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" placeholder="usuario@exemplo.com" {...register("email")} />
        {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {requirePassword ? (
          <p className="text-xs text-slate-500">Informe uma senha com pelo menos 8 caracteres.</p>
        ) : (
          <p className="text-xs text-slate-500">Preencha para alterar a senha deste usuário.</p>
        )}
        {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>Funções</Label>
        <div className="rounded-md border border-slate-200 p-3">
          {rolesLoading ? (
            <p className="text-sm text-slate-500">Carregando funções...</p>
          ) : roleOptions.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma função disponível.</p>
          ) : (
            <Controller
              name="roles"
              control={control}
              render={({ field: { value, onChange } }) => (
                <div className="flex flex-col gap-2">
                  {roleOptions.map((role) => {
                    const isChecked = value?.includes(role.id) ?? false

                    return (
                      <label key={role.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          value={role.id}
                          checked={isChecked}
                          onChange={(event) => {
                            if (event.target.checked) {
                              onChange([...(value ?? []), role.id])
                            } else {
                              onChange((value ?? []).filter((roleId) => roleId !== role.id))
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                        />
                        <span>{role.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            />
          )}
        </div>
        {errors.roles ? <p className="text-sm text-red-600">{errors.roles.message}</p> : null}
      </div>

      <div className="flex justify-end gap-3">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting || rolesLoading}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
