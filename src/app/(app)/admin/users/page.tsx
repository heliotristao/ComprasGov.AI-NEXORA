"use client"

import { useMemo, useState } from "react"

import { UserForm } from "@/components/admin/users/UserForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { User } from "@/hooks/api/useUsers"
import { useUsers } from "@/hooks/api/useUsers"

const UsersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { data: users, isLoading, isError } = useUsers()

  const handleOpenCreate = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleSuccess = () => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }

  const modalTitle = useMemo(
    () => (selectedUser ? "Editar usuário" : "Novo usuário"),
    [selectedUser],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">
            Gerencie os usuários administradores e atribua funções.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Novo Usuário</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Funções</TableHead>
              <TableHead className="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : null}

            {isError ? (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-destructive">
                  Não foi possível carregar os usuários.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError && users && users.length > 0 ? (
              users.map((user) => {
                const roleLabels = user.roles ?? []

                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {roleLabels.length > 0 ? (
                          roleLabels.map((role) => (
                            <span
                              key={`${user.id}-${role.id}`}
                              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            Nenhuma função atribuída
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(user)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : null}

            {!isLoading && !isError && (!users || users.length === 0) ? (
              <TableRow>
                <TableCell colSpan={3} className="py-6 text-center text-sm text-slate-500">
                  Nenhum usuário cadastrado até o momento.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => (open ? setIsModalOpen(true) : closeModal())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              Preencha as informações do usuário e defina as funções desejadas.
            </DialogDescription>
          </DialogHeader>
          <UserForm user={selectedUser ?? undefined} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersPage
