"use client"

import * as React from "react"

import {
  Dialog as PrimitiveDialog,
  DialogTrigger as PrimitiveDialogTrigger,
  DialogContent as PrimitiveDialogContent,
  DialogOverlay as PrimitiveDialogOverlay,
  DialogPortal as PrimitiveDialogPortal,
  DialogClose as PrimitiveDialogClose,
  DialogHeader as PrimitiveDialogHeader,
  DialogFooter as PrimitiveDialogFooter,
  DialogTitle as PrimitiveDialogTitle,
  DialogDescription as PrimitiveDialogDescription,
} from "@/lib/stubs/radix-dialog"
import { cn } from "@/lib/utils"

const Dialog = PrimitiveDialog
const DialogTrigger = PrimitiveDialogTrigger
const DialogPortal = PrimitiveDialogPortal
const DialogOverlay = PrimitiveDialogOverlay

const DialogContent = ({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof PrimitiveDialogContent>) => (
  <PrimitiveDialogContent
    {...props}
    className={cn(
      "relative grid gap-4 border border-slate-200 bg-white p-6 shadow-lg",
      className,
    )}
  >
    {children}
  </PrimitiveDialogContent>
)

const DialogHeader = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PrimitiveDialogHeader>) => (
  <PrimitiveDialogHeader className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

const DialogFooter = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PrimitiveDialogFooter>) => (
  <PrimitiveDialogFooter className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
)

const DialogTitle = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PrimitiveDialogTitle>) => (
  <PrimitiveDialogTitle className={cn("text-lg font-semibold text-slate-900", className)} {...props} />
)

const DialogDescription = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PrimitiveDialogDescription>) => (
  <PrimitiveDialogDescription className={cn("text-sm text-slate-600", className)} {...props} />
)

const DialogClose = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof PrimitiveDialogClose>) => (
  <PrimitiveDialogClose
    {...props}
    className={cn(
      "absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-slate-500 transition-colors hover:text-slate-900",
      className,
    )}
  >
    <span aria-hidden>×</span>
    <span className="sr-only">Fechar</span>
  </PrimitiveDialogClose>
)

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
