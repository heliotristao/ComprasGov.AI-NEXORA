import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"

import favicon from "@/public/assets/images/favicon.svg"

export const metadata: Metadata = {
  title: "NEXORA ComprasGov.AI",
  description: "Plataforma de governança para contratações públicas.",
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
