"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Construction } from "lucide-react"

export default function LicitacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Licitações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os processos licitatórios do órgão
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo em Desenvolvimento</CardTitle>
          <CardDescription>
            Esta funcionalidade está sendo desenvolvida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Construction className="h-4 w-4" />
            <AlertDescription>
              <strong>Em breve:</strong> Neste módulo você poderá:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Criar processos licitatórios a partir de TRs aprovados</li>
                <li>Gerenciar editais e anexos</li>
                <li>Acompanhar prazos e fases da licitação</li>
                <li>Receber e analisar propostas</li>
                <li>Gerar contratos automaticamente</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-6 p-6 bg-slate-50 rounded-lg">
            <h3 className="font-semibold mb-3">Fluxo Completo do Sistema:</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-2 bg-blue-100 text-blue-900 rounded font-medium">
                1. Plano
              </div>
              <span>→</span>
              <div className="px-3 py-2 bg-green-100 text-green-900 rounded font-medium">
                2. ETP
              </div>
              <span>→</span>
              <div className="px-3 py-2 bg-purple-100 text-purple-900 rounded font-medium">
                3. TR
              </div>
              <span>→</span>
              <div className="px-3 py-2 bg-orange-100 text-orange-900 rounded font-medium">
                4. Licitação
              </div>
              <span>→</span>
              <div className="px-3 py-2 bg-red-100 text-red-900 rounded font-medium">
                5. Contrato
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
