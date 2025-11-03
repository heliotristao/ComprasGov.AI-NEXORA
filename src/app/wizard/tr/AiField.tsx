"use client"

import * as React from "react"
import { ClipboardCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { generateFieldContent } from "./_api/ai.client"
import type { JsonRecord } from "./_api/http"

interface AiFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  description?: string
  placeholder?: string
  trId: string | null
  fieldKey: string
  getContext?: () => JsonRecord
  disabled?: boolean
  rows?: number
  testId?: string
}

export function AiField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  description,
  placeholder,
  trId,
  fieldKey,
  getContext,
  disabled = false,
  rows = 5,
  testId,
}: AiFieldProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [generatedText, setGeneratedText] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!trId) {
      toast.error("Salve o rascunho do TR antes de gerar conteúdo com IA.")
      return
    }

    try {
      setIsLoading(true)
      const context = getContext?.() ?? {}
      const response = await generateFieldContent(trId, fieldKey, {
        context,
        currentValue: value,
      })
      setGeneratedText(response.content.trim())
      setIsModalOpen(true)
    } catch (error) {
      console.error("Erro ao gerar conteúdo com IA", error)
      toast.error("Não foi possível gerar o conteúdo com IA. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }, [fieldKey, getContext, trId, value])

  const handleInsert = React.useCallback(() => {
    if (generatedText) {
      onChange(generatedText)
      setIsModalOpen(false)
      toast.success("Conteúdo inserido no campo.")
    }
  }, [generatedText, onChange])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
      toast.success("Conteúdo copiado para a área de transferência.")
    } catch (error) {
      console.error("Erro ao copiar conteúdo", error)
      toast.error("Não foi possível copiar o conteúdo gerado.")
    }
  }, [generatedText])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-semibold text-neutral-800">
          {label}
        </Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleGenerate}
          disabled={isLoading || disabled}
          className="inline-flex items-center gap-2 border-primary-200 text-primary-700 hover:bg-primary-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {isLoading ? "Gerando..." : "Gerar com IA"}
        </Button>
      </div>

      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className="min-h-[140px]"
        aria-invalid={Boolean(error)}
        disabled={disabled}
        data-testid={testId}
      />

      {description ? <p className="text-xs text-neutral-500">{description}</p> : null}

      {error ? <p className="text-xs font-medium text-error-600">{error}</p> : null}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <Sparkles className="h-5 w-5 text-primary-600" aria-hidden />
              Sugestão da IA
            </DialogTitle>
            <DialogDescription>
              Revise o conteúdo sugerido e decida se deseja inseri-lo diretamente no campo ou copiar para ajustes.
            </DialogDescription>
          </DialogHeader>

          <Textarea value={generatedText} readOnly rows={10} className="min-h-[220px]" />

          <DialogFooter className="flex flex-wrap justify-between gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Fechar
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={handleCopy} className="inline-flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" aria-hidden />
                Copiar
              </Button>
              <Button type="button" onClick={handleInsert} disabled={!generatedText}>
                Inserir
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
