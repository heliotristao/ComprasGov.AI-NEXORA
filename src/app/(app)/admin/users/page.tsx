"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserForm, type UserFormValues } from "./_components/UserForm"
import { useCreateUser, useDeleteUser, useRoles, useUsers } from "@/hooks/api/useUsers"
import { toast } from "sonner"

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null)
  const createUserMutation = useCreateUser()
  const deleteUserMutation = useDeleteUser()
  const usersQuery = useUsers()
  const rolesQuery = useRoles()

  const userPendingDeletion = useMemo(
    () => usersQuery.data?.find((user) => user.id === userToDeleteId) ?? null,
    [userToDeleteId, usersQuery.data]
  )

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

  const handleConfirmUserDeletion = () => {
    if (!userPendingDeletion) return

    deleteUserMutation.mutate(userPendingDeletion.id, {
      onSuccess: () => {
        toast.success("Usuário deletado com sucesso.")
        setUserToDeleteId(null)
      },
      onError: () => {
        toast.error("Não foi possível deletar o usuário. Tente novamente.")
      },
    })
  }

  const handleToggleDeleteDialog = (open: boolean) => {
    if (!open) {
      setUserToDeleteId(null)
    }
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

      <div className="rounded-lg border border-slate-200">
        {usersQuery.isLoading ? (
          <div className="p-6 text-center text-sm text-slate-500">Carregando usuários...</div>
        ) : usersQuery.isError ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Não foi possível carregar os usuários. Tente novamente mais tarde.
          </div>
        ) : usersQuery.data && usersQuery.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Funções</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersQuery.data.map((user) => {
                const roles = Array.isArray(user.roles)
                  ? user.roles.map((role) =>
                      typeof role === "string" ? role : (role as { name?: string }).name ?? "—"
                    )
                  : []

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{user.email}</span>
                        {user.name ? (
                          <span className="text-xs text-slate-500">{String(user.name)}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {roles.length > 0 ? (
                        <span className="text-sm text-slate-600">{roles.join(", ")}</span>
                      ) : (
                        <span className="text-sm text-slate-400">Sem funções atribuídas</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUserToDeleteId(user.id)}
                      >
                        Deletar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-sm text-slate-500">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      <Dialog open={Boolean(userPendingDeletion)} onOpenChange={handleToggleDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja deletar este usuário?
              <br />
              <span className="font-medium text-slate-900">
                {userPendingDeletion?.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDeleteId(null)}
              disabled={deleteUserMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmUserDeletion}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deletando..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
