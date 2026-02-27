import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "outline" | "ghost" | "secondary" | "critical"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        // Base styles implementing liquid glass and active scale rules from design-taste-frontend
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-wide transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"

        const variants = {
            default: "bg-primary text-black hover:shadow-neon",
            outline: "border border-primary text-primary hover:bg-primary hover:text-black hover:shadow-neon",
            secondary: "bg-secondary text-white hover:shadow-lg hover:shadow-secondary/20",
            ghost: "hover:bg-primary/10 hover:text-primary",
            critical: "border border-critical/30 bg-critical/10 text-critical hover:bg-critical hover:text-white"
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
