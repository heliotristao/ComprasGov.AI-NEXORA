/* eslint-disable @next/next/no-img-element */
import * as React from "react"

import { cn } from "@/lib/utils"

interface AvatarContextValue {
  showFallback: boolean
  setShowFallback: (visible: boolean) => void
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

const useAvatarContext = () => React.useContext(AvatarContext)

const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => {
    const [showFallback, setShowFallback] = React.useState(true)

    const contextValue = React.useMemo(
      () => ({
        showFallback,
        setShowFallback,
      }),
      [showFallback]
    )

    return (
      <AvatarContext.Provider value={contextValue}>
        <span
          ref={ref}
          className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
          )}
          {...props}
        >
          {children}
        </span>
      </AvatarContext.Provider>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, onLoad, onError, alt, ...props }, ref) => {
  const context = useAvatarContext()

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    context?.setShowFallback(false)
    onLoad?.(event)
  }

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    context?.setShowFallback(true)
    onError?.(event)
  }

  return (
    <img
      ref={ref}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        "aspect-square h-full w-full object-cover",
        context?.showFallback ? "hidden" : undefined,
        className
      )}
      alt={alt ?? ""}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const context = useAvatarContext()

  if (context && !context.showFallback) {
    return null
  }

  return (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-body-small font-medium",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }

