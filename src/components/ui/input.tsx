import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "kyc-flex kyc-h-10 kyc-w-full kyc-rounded-md kyc-border kyc-border-zinc-200 kyc-bg-white kyc-px-3 kyc-py-2 kyc-text-sm kyc-ring-offset-white file:kyc-border-0 file:kyc-bg-transparent file:kyc-text-sm file:kyc-font-medium placeholder:kyc-text-zinc-500 focus-visible:kyc-outline-none focus-visible:kyc-ring-2 focus-visible:kyc-ring-zinc-950 focus-visible:kyc-ring-offset-2 disabled:kyc-cursor-not-allowed disabled:kyc-opacity-50 dark:kyc-border-zinc-800 dark:kyc-bg-zinc-950 dark:kyc-ring-offset-zinc-950 dark:placeholder:kyc-text-zinc-400 dark:focus-visible:kyc-ring-zinc-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
