"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { UserForm } from "@/components/forms/UserForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { api } from "@/lib/axios"
import { User, columns as makeColumns } from "@/components/tables/user-table/columns"
import { UserTable } from "@/components/tables/user-table"

async function getUsers(): Promise<User[]> {
  const response = await api.get("/api/v1/users/")
  return response.data
}

export default function UserManagementPage() {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setOpen(true)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedUser(undefined)
    }
  }

  const columns = makeColumns(handleEdit)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>New User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Edit User" : "Create User"}</DialogTitle>
              <DialogDescription>
                {selectedUser
                  ? "Update the user's details below."
                  : "Fill in the details below to create a new user."}
              </DialogDescription>
            </DialogHeader>
            <UserForm setOpen={setOpen} initialData={selectedUser} />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <UserTable columns={columns} data={users || []} />
      )}
    </div>
  )
}
