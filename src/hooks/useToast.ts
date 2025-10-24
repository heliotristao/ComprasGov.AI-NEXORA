import { toast as sonnerToast } from "sonner"

export type ToastVariant = "default" | "success" | "destructive"

type ToastParams = {
  title: string
  description?: string
  variant?: ToastVariant
}

export const useToast = () => {
  const toast = ({ title, description, variant = "default" }: ToastParams) => {
    const options = description ? { description } : undefined

    switch (variant) {
      case "destructive":
        sonnerToast.error(title, options)
        break
      case "success":
        sonnerToast.success(title, options)
        break
      default:
        sonnerToast(title, options)
        break
    }
  }

  return { toast }
}
