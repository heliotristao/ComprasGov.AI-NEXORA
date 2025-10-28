"use client"

import { useMemo } from "react"
import Link from "next/link"
import { CalendarClock, FileText, Layers, Link2, ShieldCheck, User } from "lucide-react"

import type { ProcessDetailData, ProcessLinkItem, ProcessTimelineEvent } from "../_types"
import type { SessionUser } from "@/lib/auth/session"
import { DOCUMENT_TYPE_LABELS, PROCESS_STATUS_LABELS, USER_ROLES } from "@/lib/constants"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProcessDetailProps {
  process: ProcessDetailData
  links: ProcessLinkItem[]
  timeline: ProcessTimelineEvent[]
  sessionUser: SessionUser | null
}

function hasRole(sessionUser: SessionUser | null, roles: string[]): boolean {
  if (!sessionUser?.roles || sessionUser.roles.length === 0) {
    return false
  }

  const normalizedRoles = sessionUser.roles.map((role) => role.toLowerCase())
  return roles.some((role) => normalizedRoles.includes(role.toLowerCase()))
}

function resolveStatusLabel(status: string) {
  const normalized = status.toLowerCase() as keyof typeof PROCESS_STATUS_LABELS
  return PROCESS_STATUS_LABELS[normalized] ?? status
}

function buildStatusBadgeVariant(status: string): BadgeProps["variant"] {
  const normalized = status.toLowerCase()

  if (normalized.includes("aprov")) return "approved"
  if (normalized.includes("pend")) return "pending"
  if (normalized.includes("reje")) return "rejected"
  if (normalized.includes("rascun")) return "draft"
  if (normalized.includes("arquiv")) return "archived"

  return "secondary"
}

function formatDate(value?: string) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") {
    return "—"
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function resolveDocumentLabel(type: string) {
  const normalized = type.toLowerCase()
  return DOCUMENT_TYPE_LABELS[normalized as keyof typeof DOCUMENT_TYPE_LABELS] ?? type
}

export function ProcessDetail({ process, links, timeline, sessionUser }: ProcessDetailProps) {
  const canAdvance = useMemo(
    () => hasRole(sessionUser, [USER_ROLES.MASTER, USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
    [sessionUser]
  )

  const sortedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => {
      if (!a.timestamp) return 1
      if (!b.timestamp) return -1
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })
  }, [timeline])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary/80">Processo</p>
              <h1 className="text-3xl font-semibold text-slate-900">{process.identifier}</h1>
            </div>
            <p className="max-w-2xl text-base text-muted-foreground">{process.object}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={buildStatusBadgeVariant(process.status)}>{resolveStatusLabel(process.status)}</Badge>
              {process.type ? <Badge variant="outline">{process.type}</Badge> : null}
              {process.unit ? (
                <Badge variant="outline" className="gap-1">
                  <Layers className="h-3.5 w-3.5" />
                  {process.unit}
                </Badge>
              ) : null}
              {process.phase ? (
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {process.phase}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="text-sm text-muted-foreground">
              <p>Atualizado em {formatDate(process.updatedAt)}</p>
              <p>Registrado em {formatDate(process.createdAt)}</p>
            </div>
            {canAdvance ? (
              <Button className="gap-2" size="lg">
                Avançar etapa
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="links">Vínculos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo</CardTitle>
                <CardDescription>Dados principais do processo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-1">
                  <span className="text-muted-foreground">EDOCS</span>
                  <span className="font-medium text-slate-900">{process.edocs ?? "—"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Responsável</span>
                  <span className="font-medium text-slate-900">{process.owner ?? "Não informado"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Valor estimado</span>
                  <span className="font-medium text-slate-900">{formatCurrency(process.value)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Situação</CardTitle>
                <CardDescription>Fase atual e histórico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Fase atual</span>
                  <span className="font-medium text-slate-900">{process.phase ?? "Não informada"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Última atualização</span>
                  <span className="font-medium text-slate-900">{formatDate(process.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Descrição</CardTitle>
              <CardDescription>Contexto detalhado do objeto</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {process.description && process.description.trim().length > 0
                  ? process.description
                  : "Nenhuma descrição detalhada disponível para este processo."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          {links.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Nenhum vínculo encontrado</CardTitle>
                <CardDescription>
                  Documentos vinculados aparecerão aqui assim que forem relacionados ao processo.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {links.map((link) => (
                <Card key={link.id} className="flex h-full flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4 text-primary" />
                      {link.title}
                    </CardTitle>
                    <CardDescription>{resolveDocumentLabel(link.type)}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between gap-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{link.description ?? "Documento vinculado ao processo."}</p>
                      {link.status ? (
                        <Badge variant="secondary" className="w-fit">
                          Status: {resolveStatusLabel(link.status)}
                        </Badge>
                      ) : null}
                    </div>
                    <Button asChild variant="outline" className="gap-2 self-start">
                      <Link href={link.targetUrl}>
                        <Link2 className="h-4 w-4" /> Abrir documento
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          {sortedTimeline.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Linha do tempo vazia</CardTitle>
                <CardDescription>
                  Eventos registrados do processo serão exibidos aqui para facilitar a auditoria.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="relative space-y-6 border-l border-dashed border-primary/30 pl-6">
                {sortedTimeline.map((event) => (
                  <div key={event.id} className="relative">
                    <span className="absolute -left-[13px] top-1.5 h-3 w-3 rounded-full border border-white bg-primary shadow" />
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{event.title}</h3>
                        {event.category ? (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Layers className="h-3 w-3" />
                            {event.category}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5" /> {formatDate(event.timestamp)}
                        </span>
                        {event.author ? (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> {event.author}
                          </span>
                        ) : null}
                      </div>
                      {event.description ? (
                        <p className="text-sm text-slate-700">{event.description}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
