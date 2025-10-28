import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ComprasGov.AI - NEXORA",
  description: "Plataforma de governança de compras públicas com IA",
};

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
