import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border border-panel-line bg-panel text-paper",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
