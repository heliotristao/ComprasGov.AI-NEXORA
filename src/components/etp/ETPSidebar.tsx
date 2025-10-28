"use client"

import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Secao {
  id: string
  titulo: string
  ordem: number
  obrigatoria: boolean
}

interface ETPSidebarProps {
  secoes: Secao[]
  secaoAtual: number
  progresso: number
  onIrParaSecao: (index: number) => void
  getStatusSecao: (index: number) => "completo" | "em_progresso" | "pendente"
}

export function ETPSidebar({
  secoes,
  secaoAtual,
  progresso,
  onIrParaSecao,
  getStatusSecao
}: ETPSidebarProps) {
  return (
    <div className="w-80 border-r bg-card">
      <div className="p-6 border-b">
        <h2 className="font-semibold text-lg mb-4">Mapa de Navegação</h2>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso Geral</span>
            <span className="font-medium">{progresso}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="p-4 space-y-1">
          {secoes.map((secao, index) => {
            const status = getStatusSecao(index)
            const isAtual = index === secaoAtual

            return (
              <button
                key={secao.id}
                onClick={() => onIrParaSecao(index)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg transition-colors",
                  "hover:bg-accent/50",
                  isAtual && "bg-accent"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Ícone de status */}
                  <div className="mt-0.5">
                    {status === "completo" && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {status === "em_progresso" && (
                      <Circle className="h-5 w-5 text-yellow-600 fill-current" />
                    )}
                    {status === "pendente" && (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isAtual && "text-primary",
                          !isAtual && "text-foreground"
                        )}
                      >
                        {secao.ordem}. {secao.titulo}
                      </span>
                    </div>

                    {secao.obrigatoria && status === "pendente" && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-orange-500">
                          Obrigatório
                        </span>
                      </div>
                    )}

                    {status === "completo" && (
                      <span className="text-xs text-green-600 mt-1 block">
                        ✓ Completo
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>

      {/* Legenda */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Legenda:
        </p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Completo</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-yellow-600 fill-current" />
            <span>Em progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-muted-foreground" />
            <span>Pendente</span>
          </div>
        </div>
      </div>
    </div>
  )
}

