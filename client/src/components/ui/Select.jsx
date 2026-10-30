import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const Select = React.forwardRef(
  ({ className, children, icon: Icon, size = "default", disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            {React.isValidElement(Icon) ? (
              Icon
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </div>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full appearance-none rounded-lg border border-input bg-background font-medium text-foreground transition-all duration-150",
            "hover:border-foreground/25 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&>option]:bg-card [&>option]:text-card-foreground [&>option]:py-1.5",
            size === "sm" ? "h-8 text-xs pl-2.5 pr-7 py-1" : "h-9 text-sm pl-3 pr-8 py-1.5",
            Icon && (size === "sm" ? "pl-8" : "pl-9"),
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform duration-150",
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            disabled && "opacity-50"
          )}
        />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
