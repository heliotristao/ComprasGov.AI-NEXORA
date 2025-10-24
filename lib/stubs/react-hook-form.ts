import * as React from "react"

type FieldError = {
  message: string
}

type FieldErrors<TFieldValues> = Partial<Record<keyof TFieldValues, FieldError>>

type ResolverResult<TFieldValues> = {
  values: TFieldValues
  errors: FieldErrors<TFieldValues>
}

type Resolver<TFieldValues> = (
  values: TFieldValues
) => Promise<ResolverResult<TFieldValues>> | ResolverResult<TFieldValues>

interface UseFormOptions<TFieldValues> {
  resolver?: Resolver<TFieldValues>
  defaultValues?: TFieldValues
}

interface RegisteredField {
  name: string
  value: string | number | readonly string[] | undefined
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  onBlur: () => void
  ref: (element: HTMLElement | null) => void
}

interface UseFormReturn<TFieldValues> {
  register: (name: keyof TFieldValues) => RegisteredField
  handleSubmit: (
    onValid: (values: TFieldValues) => void | Promise<void>
  ) => (event?: React.FormEvent<HTMLFormElement>) => Promise<void>
  formState: {
    errors: FieldErrors<TFieldValues>
  }
}

function hasErrors<TFieldValues>(errors: FieldErrors<TFieldValues>): boolean {
  return Object.values(errors).some((error) => {
    if (!error) {
      return false
    }

    return Boolean((error as FieldError).message)
  })
}

export function useForm<TFieldValues extends Record<string, unknown>>(
  options: UseFormOptions<TFieldValues> = {}
): UseFormReturn<TFieldValues> {
  const { resolver, defaultValues } = options
  const [values, setValues] = React.useState<TFieldValues>(() => ({
    ...(defaultValues ?? ({} as TFieldValues)),
  }))
  const [errors, setErrors] = React.useState<FieldErrors<TFieldValues>>({})

  const register = React.useCallback(
    (name: keyof TFieldValues): RegisteredField => ({
      name: name as string,
      value: (values?.[name] as string | number | readonly string[] | undefined) ?? "",
      onChange: (event) => {
        const nextValue = event.target.value
        setValues((prev) => ({
          ...prev,
          [name]: nextValue,
        }))
      },
      onBlur: () => undefined,
      ref: () => undefined,
    }),
    [values]
  )

  const handleSubmit = React.useCallback(
    (
      onValid: (values: TFieldValues) => void | Promise<void>
    ) =>
      async (event?: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault?.()
        const currentValues = values
        if (resolver) {
          const result = await resolver(currentValues)
          setErrors(result.errors)
          if (!hasErrors(result.errors)) {
            await onValid(result.values)
          }
        } else {
          setErrors({})
          await onValid(currentValues)
        }
      },
    [resolver, values]
  )

  return {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  }
}
