"use client"

import * as React from "react"

import { EdocsInput } from "@/app/_shared/components/EdocsInput"

interface EdocsFieldProps {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  helperText?: string
  error?: string
  required?: boolean
}

export function EdocsField({
  id,
  label = "Número E-Docs",
  value,
  onChange,
  onBlur,
  helperText = "Informe o código oficial do processo no formato AAAA-XXXXXX.",
  error,
  required = true,
}: EdocsFieldProps) {
  return (
    <EdocsInput
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      helperText={helperText}
      error={error}
      required={required}
    />
  )
}
