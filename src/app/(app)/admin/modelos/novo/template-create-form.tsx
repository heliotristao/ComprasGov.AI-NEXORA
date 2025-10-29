"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import type { TemplateListItem } from "../../_utils/templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface TemplateCreateFormProps {
  superiorTemplates: TemplateListItem[]
}

const templateSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." })
    .max(255, { message: "O nome pode ter no máximo 255 caracteres." }),
  tipoDocumento: z.enum(["ETP", "TR"]),
  baseTemplateId: z.string().optional().or(z.literal("")),
  descricao: z
    .string()
    .max(1000, { message: "A descrição pode ter no máximo 1000 caracteres." })
    .optional()
    .or(z.literal("")),
})

type TemplateFormValues = z.infer<typeof templateSchema>

function extractTemplateId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const record = payload as Record<string, unknown>
  const candidates = [record.id, record.template_id, record.modelo_id, record.templateId]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim()
    }

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return String(candidate)
    }
  }

  if (typeof record.template === "object" && record.template !== null) {
    return extractTemplateId(record.template)
  }

  return null
}

export function TemplateCreateForm({ superiorTemplates }: TemplateCreateFormProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      nome: "",
      tipoDocumento: undefined,
      baseTemplateId: "",
      descricao: "",
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const superiorOptions = useMemo(() => {
    return superiorTemplates.map((template) => ({
      id: template.id,
      label: `${template.nome} (${template.tipoDocumento})`,
    }))
  }, [superiorTemplates])

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)

    const payload = {
      nome: values.nome,
      tipoDocumento: values.tipoDocumento,
      tipo_documento: values.tipoDocumento,
      descricao: values.descricao && values.descricao.trim().length > 0 ? values.descricao.trim() : null,
      modelo_superior_id:
        values.baseTemplateId && values.baseTemplateId.length > 0 ? Number(values.baseTemplateId) : undefined,
      modeloSuperiorId:
        values.baseTemplateId && values.baseTemplateId.length > 0 ? Number(values.baseTemplateId) : undefined,
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorPayload = await response
          .json()
          .catch(() => ({ message: "Não foi possível criar o modelo." }))

        const message =
          errorPayload && typeof errorPayload === "object" && "message" in errorPayload
            ? String((errorPayload as Record<string, unknown>).message)
            : "Não foi possível criar o modelo."

        setSubmitError(message)
        toast.error(message)
        return
      }

      const data = await response.json().catch(() => null)
      const templateId = extractTemplateId(data)

      toast.success("Modelo criado com sucesso! Redirecionando para a edição.")

      if (templateId) {
        router.push(`/admin/modelos/${templateId}`)
      } else {
        router.push("/admin/modelos-institucionais")
      }
    } catch (error) {
      console.error("Erro ao criar modelo", error)
      const message = "Não foi possível criar o modelo. Tente novamente em instantes."
      setSubmitError(message)
      toast.error(message)
    }
  })

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-secondary">Informações do Modelo</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do modelo</Label>
            <Input
              id="nome"
              placeholder="Ex: TR - Aquisição de equipamentos de TI"
              {...form.register("nome")}
              aria-invalid={Boolean(form.formState.errors.nome)}
            />
            {form.formState.errors.nome ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.nome.message ?? "Informe o nome do modelo."}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoDocumento">Tipo de documento</Label>
              <Select
                id="tipoDocumento"
                placeholder="Selecione o tipo"
                {...form.register("tipoDocumento")}
                aria-invalid={Boolean(form.formState.errors.tipoDocumento)}
              >
                <SelectItem value="">Selecione</SelectItem>
                <SelectItem value="ETP">Estudo Técnico Preliminar (ETP)</SelectItem>
                <SelectItem value="TR">Termo de Referência (TR)</SelectItem>
              </Select>
              {form.formState.errors.tipoDocumento ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.tipoDocumento.message ?? "Selecione o tipo de documento."}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseTemplateId">Baseado em (opcional)</Label>
              <Select
                id="baseTemplateId"
                placeholder="Selecione um modelo superior"
                {...form.register("baseTemplateId")}
              >
                <SelectItem value="">Sem modelo base</SelectItem>
                {superiorOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva o objetivo do modelo e em quais cenários ele deve ser aplicado."
              rows={5}
              {...form.register("descricao")}
            />
            {form.formState.errors.descricao ? (
              <p className="text-sm text-destructive">{form.formState.errors.descricao.message}</p>
            ) : null}
          </div>

          {submitError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 md:flex-row md:justify-between">
          <p className="text-xs text-muted-foreground">
            Após salvar, você poderá configurar seções, campos e regras do modelo em detalhes.
          </p>

          <Button type="submit" disabled={isSubmitting} className="min-w-[180px]">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando modelo...
              </span>
            ) : (
              "Salvar e continuar"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
