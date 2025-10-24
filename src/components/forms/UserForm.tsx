"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/axios"
import { User } from "../tables/user-table/columns"

interface Role {
  id: string
  name: string
}

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().optional(),
  roles: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one role.",
  }),
})

type UserFormValues = z.infer<typeof formSchema>

async function getRoles(): Promise<Role[]> {
  const response = await api.get("/api/v1/roles/")
  return response.data
}

async function createUser(data: UserFormValues) {
  const { email, password, roles } = data
  const response = await api.post("/api/v1/users/", { email, password })
  const newUser = response.data
  await Promise.all(
    roles.map((roleId) =>
      api.post(`/api/v1/users/${newUser.id}/roles/${roleId}`)
    )
  )
  return newUser
}

async function updateUser({ id, data, initialRoles }: { id: string; data: UserFormValues; initialRoles: Role[] }) {
  const { email, password, roles: newRoleIds } = data
  const response = await api.patch(`/api/v1/users/${id}`, { email, password: password || undefined })
  const updatedUser = response.data

  const initialRoleIds = initialRoles.map(role => role.id)
  const rolesToAdd = newRoleIds.filter(roleId => !initialRoleIds.includes(roleId))
  const rolesToRemove = initialRoleIds.filter(roleId => !newRoleIds.includes(roleId))

  await Promise.all([
    ...rolesToAdd.map(roleId => api.post(`/api/v1/users/${updatedUser.id}/roles/${roleId}`)),
    ...rolesToRemove.map(roleId => api.delete(`/api/v1/users/${updatedUser.id}/roles/${roleId}`)),
  ])

  return updatedUser
}

interface UserFormProps {
  setOpen: (open: boolean) => void
  initialData?: User
}

export function UserForm({ setOpen, initialData }: UserFormProps) {
  const queryClient = useQueryClient()
  const isEditMode = !!initialData

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User created successfully.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error("Failed to create user.", {
        description: error?.response?.data?.detail || error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success("User updated successfully.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error("Failed to update user.", {
        description: error?.response?.data?.detail || error.message,
      })
    },
  })

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      roles: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email,
        roles: initialData.roles.map(role => role.id),
      })
    }
  }, [initialData, form])

  function onSubmit(values: UserFormValues) {
    if (isEditMode) {
      updateMutation.mutate({ id: initialData.id, data: values, initialRoles: initialData.roles })
    } else {
      createMutation.mutate(values)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                {isEditMode ? "Leave blank to keep the same password." : "Minimum 8 characters."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roles"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Roles</FormLabel>
                <FormDescription>
                  Select the roles to assign to this user.
                </FormDescription>
              </div>
              {isLoadingRoles ? (
                <p>Loading roles...</p>
              ) : (
                roles?.map((role) => (
                  <FormField
                    key={role.id}
                    control={form.control}
                    name="roles"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={role.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(role.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), role.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== role.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {role.name}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {isEditMode ? (updateMutation.isPending ? "Saving..." : "Save Changes") : (createMutation.isPending ? "Creating..." : "Create User")}
        </Button>
      </form>
    </Form>
  )
}
