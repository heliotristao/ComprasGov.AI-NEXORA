"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserForm, type UserFormValues } from "./_components/UserForm"
import { useCreateUser, useRoles } from "@/hooks/api/useUsers"
import { toast } from "sonner"

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const createUserMutation = useCreateUser()
  const rolesQuery = useRoles()

  const handleCreateUser = (values: UserFormValues) => {
    createUserMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Usuário criado com sucesso.")
        setIsDialogOpen(false)
      },
      onError: () => {
        toast.error("Não foi possível criar o usuário. Tente novamente.")
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">
            Gerencie os usuários da plataforma e atribua funções de acesso.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogClose />
            <DialogHeader>
              <DialogTitle>Novo usuário</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para adicionar um novo usuário ao sistema.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreateUser}
              isSubmitting={createUserMutation.isPending}
              roleOptions={rolesQuery.data ?? []}
              rolesLoading={rolesQuery.isLoading}
              requirePassword
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        A tabela de usuários será exibida aqui.
      </div>
    </div>
  )
}
