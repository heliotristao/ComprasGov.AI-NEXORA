import { redirect } from "next/navigation"

import { getSession } from "@/lib/auth/session.server"

export default function RootPage() {
  const session = getSession()

  if (!session) {
    redirect("/login")
  }

  redirect("/dashboard")
  return null
}
