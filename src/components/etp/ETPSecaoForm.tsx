"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectItem } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { GerarCampoIADialog } from "./GerarCampoIADialog"

interface Campo {
  id: string
  label: string
  tipo: string
  obrigatorio: boolean
  placeholder?: string
  ajuda?: string
  opcoes?: string[]
  condicao?: string
}

interface Secao {
  id: string
  campos: Campo[]
}

interface ETPSecaoFormProps {
  secao: Secao
  dados: Record<string, any>
  onAtualizarDados: (dados: Record<string, any>) => void
  documentoId: number
}

export function ETPSecaoForm({
  secao,
  dados,
  onAtualizarDados,
  documentoId
}: ETPSecaoFormProps) {
  const [campoIASelecionado, setCampoIASelecionado] = useState<Campo | null>(null)

  const handleChange = (campoId: string, valor: any) => {
    onAtualizarDados({
      ...dados,
      [campoId]: valor
    })
  }

  const avaliarCondicao = (condicao: string): boolean => {
    if (!condicao) return true

    try {
      // Substituir variáveis pelos valores reais
      let expressao = condicao
      Object.keys(dados).forEach(key => {
        const valor = dados[key]
        expressao = expressao.replace(
          new RegExp(`\\b${key}\\b`, 'g'),
          typeof valor === 'string' ? `"${valor}"` : String(valor)
        )
      })

      // Avaliar expressão (cuidado: eval é perigoso em produção)
      // TODO: Usar biblioteca segura de avaliação de expressões
      return eval(expressao)
    } catch {
      return false
    }
  }

  const renderCampo = (campo: Campo) => {
    // Verificar condição de exibição
    if (campo.condicao && !avaliarCondicao(campo.condicao)) {
      return null
    }

    const valor = dados[campo.id] || ""

    return (
      <div key={campo.id} className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Label htmlFor={campo.id} className="text-base">
              {campo.label}
              {campo.obrigatorio && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            {campo.ajuda && (
              <p className="text-sm text-muted-foreground">
                {campo.ajuda}
              </p>
            )}
          </div>

          {/* Botão de geração com IA */}
          {(campo.tipo === "textarea" || campo.tipo === "text") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => setCampoIASelecionado(campo)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar com IA
            </Button>
          )}
        </div>

        {/* Renderizar campo baseado no tipo */}
        {campo.tipo === "text" && (
          <Input
            id={campo.id}
            value={valor}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
          />
        )}

        {campo.tipo === "textarea" && (
          <Textarea
            id={campo.id}
            value={valor}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
            rows={6}
            className="resize-y"
          />
        )}

        {campo.tipo === "radio" && campo.opcoes && (
          <RadioGroup
            value={valor}
            onValueChange={(v) => handleChange(campo.id, v)}
          >
            {campo.opcoes.map((opcao) => (
              <div key={opcao} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao} id={`${campo.id}-${opcao}`} />
                <Label htmlFor={`${campo.id}-${opcao}`} className="font-normal">
                  {opcao}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {campo.tipo === "select" && campo.opcoes && (
          <Select
            value={valor}
            onValueChange={(v) => handleChange(campo.id, v)}
            placeholder="Selecione uma opção"
          >
            {campo.opcoes.map((opcao) => (
              <SelectItem key={opcao} value={opcao}>
                {opcao}
              </SelectItem>
            ))}
          </Select>
        )}

        {campo.tipo === "date" && (
          <Input
            id={campo.id}
            type="date"
            value={valor}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            required={campo.obrigatorio}
          />
        )}

        {campo.tipo === "email" && (
          <Input
            id={campo.id}
            type="email"
            value={valor}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
          />
        )}

        {campo.tipo === "tel" && (
          <Input
            id={campo.id}
            type="tel"
            value={valor}
            onChange={(e) => handleChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            required={campo.obrigatorio}
          />
        )}

        {campo.tipo === "currency" && (
          <Input
            id={campo.id}
            type="text"
            value={valor}
            onChange={(e) => {
              // Formatar como moeda
              const numero = e.target.value.replace(/\D/g, "")
              const valorFormatado = (Number(numero) / 100).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
              })
              handleChange(campo.id, valorFormatado)
            }}
            placeholder="R$ 0,00"
            required={campo.obrigatorio}
          />
        )}

        {/* TODO: Implementar tipos complexos (table, repeater, file_upload) */}
        {campo.tipo === "table" && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Tipo &quot;table&quot; - Implementar componente de tabela
            </p>
          </Card>
        )}

        {campo.tipo === "repeater" && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Tipo &quot;repeater&quot; - Implementar componente repetidor
            </p>
          </Card>
        )}

        {campo.tipo === "file_upload" && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Tipo &quot;file_upload&quot; - Implementar upload de arquivos
            </p>
          </Card>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {secao.campos.map((campo) => renderCampo(campo))}
      </div>

      {/* Dialog de geração com IA */}
      {campoIASelecionado && (
        <GerarCampoIADialog
          open={!!campoIASelecionado}
          onOpenChange={(open) => !open && setCampoIASelecionado(null)}
          campo={campoIASelecionado}
          secaoId={secao.id}
          documentoId={documentoId}
          contexto={dados}
          onAceitar={(conteudo) => {
            handleChange(campoIASelecionado.id, conteudo)
            setCampoIASelecionado(null)
            toast.success("Conteúdo gerado pela IA aplicado!")
          }}
        />
      )}
    </>
  )
}

