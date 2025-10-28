
"use client";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [items] = useState([
    { label: "Novo Planejamento (PCA/DFD)", href: "/wizard/planning" },
    { label: "Novo ETP", href: "/wizard/etp" },
    { label: "Novo TR (Bens)", href: "/wizard/tr-bens" },
    { label: "Novo TR (Serviços)", href: "/wizard/tr-servicos" },
  ]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="text-lg font-semibold">{it.label}</div>
            <div className="mt-2 text-sm text-gray-500">Acessar →</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
