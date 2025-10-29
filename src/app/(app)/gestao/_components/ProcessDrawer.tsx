"use client"

import { Building2, CalendarRange, DownloadCloud, FileText, LinkIcon, Loader2, UserCircle2 } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StatusBadge, type StatusVariant } from "@/components/data-display/status-badge"

import type { ProcessDetails, ProcessTimelineEvent } from "../types"

interface ProcessDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  process?: ProcessDetails
  isLoading?: boolean
  error?: string
}

function TimelineItem({ event }: { event: ProcessTimelineEvent }) {
  const formattedDate = formatDateTime(event.date)

  return (
    <li className="relative pl-8">
      <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-primary shadow-sm" />
      <div className="rounded-lg border border-slate-200 bg-white/60 p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
          <span className="text-caption font-medium uppercase tracking-[0.12em] text-slate-500">{formattedDate}</span>
        </div>
        {event.description ? <p className="mt-1 text-sm text-slate-600">{event.description}</p> : null}
        <div className="mt-2 flex flex-wrap gap-2 text-caption text-muted-foreground">
          {event.actor ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
              <UserCircle2 className="h-3.5 w-3.5" /> {event.actor}
            </span>
          ) : null}
          {event.status ? (
            <Badge variant="secondary" className="inline-flex items-center gap-1 border-none bg-slate-100 px-2 py-0.5 text-caption text-slate-600">
              {event.status}
            </Badge>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function resolveStatusVariant(status?: string | null): StatusVariant {
  if (!status) return "PENDING"

  const normalized = status.toLowerCase()

  if (normalized.includes("apro")) return "APPROVED"
  if (normalized.includes("pend")) return "PENDING"
  if (normalized.includes("reje")) return "REJECTED"
  if (normalized.includes("rascun") || normalized.includes("draft")) return "DRAFT"
  if (normalized.includes("arquiv") || normalized.includes("arch")) return "ARCHIVED"

  return "PENDING"
}

function formatDateTime(value?: string | null) {
  if (!value) return "—"

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate)
}

export function ProcessDrawer({ open, onOpenChange, process, isLoading = false, error }: ProcessDrawerProps) {
  const hasContent = Boolean(process)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="right-0 top-0 flex h-full max-h-screen w-full max-w-2xl translate-x-0 translate-y-0 flex-col overflow-hidden rounded-none border-0 bg-slate-50 p-0 shadow-2xl sm:left-auto sm:bottom-0 sm:h-full sm:max-h-none sm:rounded-none sm:rounded-l-3xl sm:border-l sm:border-slate-200">
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="secondary" className="uppercase tracking-[0.18em] text-[11px]">
                Processo
              </Badge>
              <DialogTitle className="text-h4 font-semibold text-slate-900">
                {process?.title ?? "Detalhes do processo"}
              </DialogTitle>
              {process?.status ? (
                <StatusBadge status={resolveStatusVariant(process.status)}>
                  {process.statusLabel ?? process.status}
                </StatusBadge>
              ) : null}
            </div>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Fechar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-8 px-6 py-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
                <p className="text-body text-muted-foreground">Carregando informações do processo...</p>
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {!isLoading && hasContent ? (
              <div className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-body font-semibold text-slate-900">Informações principais</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-caption text-muted-foreground">Número E-Docs</p>
                      <a
                        href={process?.edocsUrl ?? `https://www.edocs.gov.br/${process?.edocsNumber ?? ""}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        {process?.edocsNumber}
                      </a>
                    </div>
                    {process?.responsible ? (
                      <div className="space-y-1">
                        <p className="text-caption text-muted-foreground">Responsável</p>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                          <UserCircle2 className="h-4 w-4 text-slate-500" />
                          {process.responsible}
                        </span>
                      </div>
                    ) : null}
                    {process?.unit ? (
                      <div className="space-y-1">
                        <p className="text-caption text-muted-foreground">Unidade</p>
                        <span className="inline-flex items-center gap-2 text-sm text-slate-800">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          {process.unit}
                        </span>
                      </div>
                    ) : null}
                    {process?.lastUpdated ? (
                      <div className="space-y-1">
                        <p className="text-caption text-muted-foreground">Última atualização</p>
                        <span className="inline-flex items-center gap-2 text-sm text-slate-800">
                          <CalendarRange className="h-4 w-4 text-slate-500" />
                          {formatDateTime(process.lastUpdated)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {process?.description ? (
                    <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      {process.description}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-body font-semibold text-slate-900">Timeline de eventos</h3>
                    <Badge variant="secondary">{(process?.timeline?.length ?? 0) + " registros"}</Badge>
                  </div>
                  {(process?.timeline?.length ?? 0) === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Nenhum evento registrado para este processo.</p>
                  ) : (
                    <ol className="mt-4 space-y-4 border-l border-slate-200 pl-4">
                      {process?.timeline?.map((event) => (
                        <TimelineItem key={event.id} event={event} />
                      ))}
                    </ol>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-body font-semibold text-slate-900">Documentos vinculados</h3>
                    <Badge variant="secondary">{process?.documents?.length ?? 0}</Badge>
                  </div>
                  {(process?.documents?.length ?? 0) === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Nenhum documento anexado ainda.</p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {process?.documents?.map((document) => (
                        <li
                          key={document.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{document.name}</span>
                            <span className="text-caption text-muted-foreground">{document.type}</span>
                          </div>
                          {document.url ? (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={document.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                                <DownloadCloud className="h-4 w-4" />
                                Baixar
                              </a>
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {process?.relatedLinks && process.relatedLinks.length > 0 ? (
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-body font-semibold text-slate-900">Acessos rápidos</h3>
                    <ul className="mt-4 space-y-3">
                      {process.relatedLinks.map((link) => (
                        <li key={link.url}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
