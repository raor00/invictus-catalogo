import * as React from "react"
import { cn } from "@/components/ui/Button"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "critical" | "warning" | "outline"
    pulse?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", pulse = false, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-glass border transition-all"

        const variants = {
            default: "bg-background-dark/80 border-primary text-primary",
            secondary: "bg-background-dark/80 border-secondary text-secondary",
            critical: "bg-critical/10 border-critical text-critical",
            warning: "bg-orange-500/10 border-orange-500 text-orange-500",
            outline: "bg-surface border-surface-highlight text-text-muted font-mono"
        }

        const dotColors = {
            default: "bg-primary",
            secondary: "bg-secondary",
            critical: "bg-critical",
            warning: "bg-orange-500",
            outline: "bg-text-muted"
        }

        return (
            <div
                ref={ref}
                className={cn(baseStyles, variants[variant], className)}
                {...props}
            >
                {pulse && (
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-2", pulse && "animate-pulse", dotColors[variant])} />
                )}
                {children}
            </div>
        )
    }
)
Badge.displayName = "Badge"

export { Badge }
