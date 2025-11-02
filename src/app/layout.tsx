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
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
