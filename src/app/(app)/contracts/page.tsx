"use client"

import { FileText, ShieldCheck, Swords } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contratos</h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe os instrumentos contratuais derivados das licitações.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo em Preparação</CardTitle>
          <CardDescription>
            Estamos finalizando os fluxos de gerenciamento contratual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              <strong>Em breve:</strong> Este espaço reunirá todas as etapas pós-licitação.
              <ul className="mt-2 space-y-1 list-inside list-disc text-sm">
                <li>Formalização e assinatura digital dos contratos</li>
                <li>Gestão de vigência, aditivos e reequilíbrios</li>
                <li>Monitoramento de entregas, medições e fiscalizações</li>
                <li>Integração com a área jurídica e com o painel de riscos</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-6 grid gap-4 rounded-lg bg-slate-50 p-6 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <FileText className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Documentos centralizados</p>
                <p className="text-sm text-muted-foreground">
                  Tenha contratos, aditivos e anexos sempre acessíveis e atualizados.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Swords className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Gestão de conflitos</p>
                <p className="text-sm text-muted-foreground">
                  Registre ocorrências, notificações e tratativas com fornecedores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Conformidade garantida</p>
                <p className="text-sm text-muted-foreground">
                  Acompanhe indicadores de performance e adote planos de ação preventivos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
