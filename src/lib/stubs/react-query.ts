import * as React from "react"

type MutationFunction<TData, TVariables> = (variables: TVariables) => Promise<TData> | TData

type MutationOptions<TData, TVariables> = {
  mutationFn: MutationFunction<TData, TVariables>
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
}

type MutationResult<TData, TVariables> = {
  mutate: (variables: TVariables) => void
  mutateAsync: (variables: TVariables) => Promise<TData>
  isPending: boolean
  isError: boolean
  error: Error | null
  reset: () => void
}

export function useMutation<TData = unknown, TVariables = void>(
  options: MutationOptions<TData, TVariables>
): MutationResult<TData, TVariables> {
  const { mutationFn, onSuccess, onError } = options
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const mutateAsync = React.useCallback(
    async (variables: TVariables) => {
      setIsPending(true)
      setError(null)

      try {
        const data = await mutationFn(variables)
        onSuccess?.(data, variables)
        return data
      } catch (err) {
        const normalizedError = err instanceof Error ? err : new Error("Mutation failed")
        setError(normalizedError)
        onError?.(normalizedError, variables)
        throw normalizedError
      } finally {
        setIsPending(false)
      }
    },
    [mutationFn, onError, onSuccess]
  )

  const mutate = React.useCallback(
    (variables: TVariables) => {
      void mutateAsync(variables)
    },
    [mutateAsync]
  )

  const reset = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    mutate,
    mutateAsync,
    isPending,
    isError: error !== null,
    error,
    reset,
  }
}
