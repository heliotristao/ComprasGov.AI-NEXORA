import { z } from "zod"

type FieldError = {
  message: string
}

type ResolverResult<TFieldValues> = {
  values: TFieldValues
  errors: Partial<Record<keyof TFieldValues, FieldError>>
}

export function zodResolver<TFieldValues extends Record<string, unknown>>(
  schema: z.ZodSchema<TFieldValues>
) {
  return async (values: TFieldValues): Promise<ResolverResult<TFieldValues>> => {
    const result = schema.safeParse(values)

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      }
    }

    const fieldErrors: Partial<Record<keyof TFieldValues, FieldError>> = {}
    const flattened = result.error.flatten().fieldErrors

    for (const key in flattened) {
      const [message] = flattened[key as keyof typeof flattened] ?? []
      if (message) {
        fieldErrors[key as keyof TFieldValues] = { message }
      }
    }

    return {
      values,
      errors: fieldErrors,
    }
  }
}
