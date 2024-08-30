import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "kyc-inline-flex kyc-items-center kyc-justify-center kyc-whitespace-nowrap kyc-rounded-md kyc-text-sm kyc-font-medium kyc-ring-offset-white kyc-transition-colors focus-visible:kyc-outline-none focus-visible:kyc-ring-2 focus-visible:kyc-ring-zinc-950 focus-visible:kyc-ring-offset-2 disabled:kyc-pointer-events-none disabled:kyc-opacity-50 dark:kyc-ring-offset-zinc-950 dark:focus-visible:kyc-ring-zinc-300",
  {
    variants: {
      variant: {
        default: "kyc-bg-zinc-900 kyc-text-zinc-50 hover:kyc-bg-zinc-900/90 dark:kyc-bg-zinc-50 dark:kyc-text-zinc-900 dark:hover:kyc-bg-zinc-50/90",
        destructive:
          "kyc-bg-red-500 kyc-text-zinc-50 hover:kyc-bg-red-500/90 dark:kyc-bg-red-900 dark:kyc-text-zinc-50 dark:hover:kyc-bg-red-900/90",
        outline:
          "kyc-border kyc-border-zinc-200 kyc-bg-white hover:kyc-bg-zinc-100 hover:kyc-text-zinc-900 dark:kyc-border-zinc-800 dark:kyc-bg-zinc-950 dark:hover:kyc-bg-zinc-800 dark:hover:kyc-text-zinc-50",
        secondary:
          "kyc-bg-zinc-100 kyc-text-zinc-900 hover:kyc-bg-zinc-100/80 dark:kyc-bg-zinc-800 dark:kyc-text-zinc-50 dark:hover:kyc-bg-zinc-800/80",
        ghost: "hover:kyc-bg-zinc-100 hover:kyc-text-zinc-900 dark:hover:kyc-bg-zinc-800 dark:hover:kyc-text-zinc-50",
        link: "kyc-text-zinc-900 kyc-underline-offset-4 hover:kyc-underline dark:kyc-text-zinc-50",
      },
      size: {
        default: "kyc-h-10 kyc-px-4 kyc-py-2",
        sm: "kyc-h-9 kyc-rounded-md kyc-px-3",
        lg: "kyc-h-11 kyc-rounded-md kyc-px-8",
        icon: "kyc-h-10 kyc-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
