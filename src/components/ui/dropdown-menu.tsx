"use client"

import * as React from "react"

import {
  Content as DropdownMenuPrimitiveContent,
  Group as DropdownMenuPrimitiveGroup,
  Item as DropdownMenuPrimitiveItem,
  ItemIndicator as DropdownMenuPrimitiveItemIndicator,
  Label as DropdownMenuPrimitiveLabel,
  Portal as DropdownMenuPrimitivePortal,
  RadioGroup as DropdownMenuPrimitiveRadioGroup,
  RadioItem as DropdownMenuPrimitiveRadioItem,
  Root as DropdownMenuPrimitiveRoot,
  Separator as DropdownMenuPrimitiveSeparator,
  Shortcut as DropdownMenuPrimitiveShortcut,
  Sub as DropdownMenuPrimitiveSub,
  SubContent as DropdownMenuPrimitiveSubContent,
  SubTrigger as DropdownMenuPrimitiveSubTrigger,
  Trigger as DropdownMenuPrimitiveTrigger,
} from "@radix-ui/react-dropdown-menu"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitiveRoot

const DropdownMenuTrigger = DropdownMenuPrimitiveTrigger

const DropdownMenuContent = ({
  className,
  sideOffset = 4,
  align = "end",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveContent> & {
  sideOffset?: number
  align?: "start" | "end"
}) => (
  <DropdownMenuPrimitiveContent
    {...props}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md",
      align === "end" ? "right-0" : "left-0",
      className
    )}
    sideOffset={sideOffset}
  />
)

const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveItem> & {
  inset?: boolean
}) => (
  <DropdownMenuPrimitiveItem
    {...props}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
  />
)

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveRadioItem>) => (
  <DropdownMenuPrimitiveRadioItem
    {...props}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
  >
    <DropdownMenuPrimitiveItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-slate-900" />
    </DropdownMenuPrimitiveItemIndicator>
    {children}
  </DropdownMenuPrimitiveRadioItem>
)

const DropdownMenuCheckboxItem = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveItem>) => (
  <DropdownMenuPrimitiveItem
    {...props}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
  >
    <DropdownMenuPrimitiveItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M6.00011 10.2002L3.30011 7.5002L2.33344 8.46686L6.00011 12.1335L14.0001 4.13353L13.0334 3.16686L6.00011 10.2002Z" />
      </svg>
    </DropdownMenuPrimitiveItemIndicator>
    {children}
  </DropdownMenuPrimitiveItem>
)

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveLabel> & {
  inset?: boolean
}) => (
  <DropdownMenuPrimitiveLabel
    {...props}
    className={cn("px-2 py-1.5 text-sm font-semibold text-slate-900", inset && "pl-8", className)}
  />
)

const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveSeparator>) => (
  <DropdownMenuPrimitiveSeparator {...props} className={cn("-mx-1 my-1 h-px bg-slate-200", className)} />
)

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <DropdownMenuPrimitiveShortcut
    {...props}
    className={cn("ml-auto text-xs tracking-widest text-slate-500", className)}
  />
)

const DropdownMenuGroup = DropdownMenuPrimitiveGroup

const DropdownMenuPortal = DropdownMenuPrimitivePortal

const DropdownMenuSub = DropdownMenuPrimitiveSub

const DropdownMenuRadioGroup = DropdownMenuPrimitiveRadioGroup

const DropdownMenuSubContent = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveSubContent>) => (
  <DropdownMenuPrimitiveSubContent
    {...props}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md",
      className
    )}
  />
)

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitiveSubTrigger> & {
  inset?: boolean
}) => (
  <DropdownMenuPrimitiveSubTrigger
    {...props}
    className={cn(
      "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 data-[state=open]:bg-slate-100",
      inset && "pl-8",
      className
    )}
  >
    {children}
    <span aria-hidden className="ml-auto text-xs text-slate-500">
      ▶
    </span>
  </DropdownMenuPrimitiveSubTrigger>
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
