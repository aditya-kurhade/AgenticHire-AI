import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive font-semibold",
        outline: "text-foreground border-border",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, tone, status, children, ...props }) {
  let resolvedVariant = variant;
  if (!resolvedVariant) {
    if (status) {
      if (status === 'shortlist' || status === 'approved' || status === 'success') resolvedVariant = 'success';
      else if (status === 'pending' || status === 'review' || status === 'paused_approval') resolvedVariant = 'warning';
      else if (status === 'reject' || status === 'failed') resolvedVariant = 'destructive';
      else resolvedVariant = 'secondary';
    } else if (tone) {
      if (tone === "primary") resolvedVariant = "default";
      else if (tone === "success") resolvedVariant = "success";
      else if (tone === "warning") resolvedVariant = "warning";
      else if (tone === "error" || tone === "danger") resolvedVariant = "destructive";
      else resolvedVariant = "secondary";
    }
  }

  return (
    <div className={cn(badgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {children}
    </div>
  )
}

export { Badge, badgeVariants }