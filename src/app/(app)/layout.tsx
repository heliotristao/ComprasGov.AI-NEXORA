"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { 
  LayoutDashboard,
  FileText,
  ClipboardList,
  Gavel,
  FileSignature,
  Settings,
  Users,
  FileStack,
  Building2,
  BarChart4,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ShieldCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/lib/utils"

type NavigationItem = {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  items?: { label: string; href: string; icon?: React.ComponentType<{ className?: string }> }[]
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Mercado",
    icon: BarChart4,
    items: [
      { label: "Mapa de Preços", href: "/mercado/precos", icon: BarChart4 }
    ]
  },
  {
    label: "Planejamento",
    icon: ClipboardList,
    items: [
      { label: "Planos de Contratação", href: "/plans", icon: FileText },
      { label: "Estudos Técnicos (ETP)", href: "/etp", icon: FileStack },
      { label: "Termos de Referência (TR)", href: "/tr", icon: FileSignature },
    ]
  },
  { 
    label: "Licitações", 
    href: "/licitacoes", 
    icon: Gavel 
  },
  {
    label: "Contratos",
    href: "/contracts",
    icon: FileSignature
  },
  {
    label: "Gestão",
    icon: ShieldCheck,
    items: [
      { label: "Painel de Governança", href: "/gestao", icon: LayoutDashboard },
      { label: "Usuários", href: "/gestao/usuarios", icon: Users },
      { label: "Órgãos", href: "/gestao/orgaos", icon: Building2 },
    ],
  },
  {
    label: "Administração",
    icon: Settings,
    items: [
      { label: "Usuários", href: "/admin/users", icon: Users },
      { label: "Modelos Superiores", href: "/admin/modelos-superiores", icon: Building2 },
      { label: "Modelos Institucionais", href: "/admin/modelos-institucionais", icon: FileStack },
    ]
  },
]

function NavItem({ item, pathname, onNavigate }: { 
  item: NavigationItem
  pathname: string | null
  onNavigate: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = item.icon

  // Se tem href direto, é um link simples
  if (item.href) {
    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        )}
        onClick={onNavigate}
      >
        {Icon && <Icon className="h-5 w-5" />}
        <span>{item.label}</span>
      </Link>
    )
  }

  // Se tem items, é um grupo expansível
  const hasActiveChild = item.items?.some(child => 
    pathname === child.href || pathname?.startsWith(child.href + "/")
  )

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          hasActiveChild
            ? "bg-slate-100 text-slate-900"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5" />}
          <span>{item.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {isOpen && item.items && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-4">
          {item.items.map((subItem) => {
            const SubIcon = subItem.icon
            const isActive = pathname === subItem.href || pathname?.startsWith(subItem.href + "/")
            
            return (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={onNavigate}
              >
                {SubIcon && <SubIcon className="h-4 w-4" />}
                <span>{subItem.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const pathname = usePathname()

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
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out",
          "md:static md:translate-x-0 md:shadow-none",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg shadow-md">
              N
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">NEXORA</div>
              <div className="text-xs text-slate-500">ComprasGov.AI</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navigationItems.map((item) => (
            <NavItem 
              key={item.label} 
              item={item} 
              pathname={pathname}
              onNavigate={closeSidebar}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-blue-50 p-3 text-xs">
            <div className="font-medium text-blue-900">💡 Dica</div>
            <div className="mt-1 text-blue-700">
              Use Ctrl+K para busca rápida
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {isSidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          aria-label="Fechar menu lateral"
        />
      )}

      {/* Main Content */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Page title (opcional - pode ser preenchido por cada página) */}
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-slate-900">
                {/* Título dinâmico baseado na rota */}
              </h1>
            </div>

            {/* User menu */}
            <div className="ml-auto flex items-center gap-4">
              <div className="hidden text-right text-sm md:block">
                <div className="font-medium text-slate-900">{userName}</div>
                <div className="text-xs text-slate-500">{userEmail}</div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {userInitial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium">{userName}</div>
                    <div className="text-xs text-slate-500">{userEmail}</div>
                  </div>
                  <DropdownMenuItem onSelect={() => router.push("/perfil")}>
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/configuracoes")}>
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onSelect={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 pb-10 pt-6 md:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}

