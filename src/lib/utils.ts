type ClassDictionary = Record<string, boolean | null | undefined>
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassDictionary
  | ClassValue[]

function pushClass(classes: string[], value: ClassValue) {
  if (!value) return

  if (typeof value === "string" || typeof value === "number") {
    classes.push(String(value))
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      pushClass(classes, item)
    }
    return
  }

  if (typeof value === "object") {
    for (const [key, condition] of Object.entries(value)) {
      if (condition) {
        classes.push(key)
      }
    }
  }
}

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = []
  for (const input of inputs) {
    pushClass(classes, input)
  }
  return classes.join(" ")
}
