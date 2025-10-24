"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/lib/utils"

const navigationItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Planejamento", href: "#" },
  { label: "Licitações", href: "#" },
]

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const { name: userName, email: userEmail } = useMemo(() => {
    if (user && typeof user === "object") {
      const name = "name" in user ? String(user.name) : "Usuário"
      const email = "email" in user ? String(user.email) : "usuario@exemplo.com"
      return { name, email }
    }

    return { name: "Usuário", email: "usuario@exemplo.com" }
  }, [user])

  const userInitial = userName?.charAt(0).toUpperCase() || "U"

  const handleLogout = () => {
    logout()
    if (typeof window !== "undefined") {
      router.replace("/login")
    }
  }

  const toggleSidebar = () => setIsSidebarOpen((previous) => !previous)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-300 ease-in-out",
          "md:static md:translate-x-0 md:shadow-none",
          isSidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="mb-8">
          <span className="text-lg font-semibold text-slate-900">NEXORA ComprasGov.AI</span>
        </div>
        <nav className="flex flex-1 flex-col gap-2 text-sm font-medium text-slate-600">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900"
              onClick={closeSidebar}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-md border border-dashed border-slate-200 p-3 text-xs text-slate-500">
          Área autenticada - conteúdo em desenvolvimento.
        </div>
      </aside>

      {isSidebarOpen ? (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          aria-label="Fechar menu lateral"
        />
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
              aria-label="Alternar menu lateral"
            >
              {isSidebarOpen ? (
                <span aria-hidden="true" className="text-xl">×</span>
              ) : (
                <span aria-hidden="true" className="text-xl">☰</span>
              )}
            </Button>
            <div className="hidden md:flex md:flex-col">
              <span className="text-sm font-medium text-slate-500">Portal</span>
              <span className="text-lg font-semibold text-slate-900">NEXORA ComprasGov.AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm md:block">
              <div className="font-medium text-slate-900">{userName}</div>
              <div className="text-slate-500">{userEmail}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  aria-label="Abrir menu do usuário"
                >
                  {userInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => handleLogout()}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 pb-10 pt-6 md:px-10">{children}</main>
      </div>
    </div>
  )
}
