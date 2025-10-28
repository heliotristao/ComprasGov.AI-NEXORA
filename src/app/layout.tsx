import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/sonner"

import favicon from "@/public/assets/images/favicon.svg"

export const metadata: Metadata = {
  title: "NEXORA ComprasGov.AI",
  description: "Plataforma de governança para contratações públicas.",
  icons: {
    icon: [
      {
        url: favicon.src,
        type: "image/svg+xml",
      },
    ],
    shortcut: [
      {
        url: favicon.src,
        type: "image/svg+xml",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-50 font-sans text-foreground antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-border bg-white shadow-sm">
              <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
                <span className="text-lg font-semibold text-primary-700">
                  ComprasGov.AI - NEXORA
                </span>
              </div>
            </header>
            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
