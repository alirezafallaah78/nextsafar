import { cn } from "@/lib/utils"

interface PanelProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Panel({ title, description, action, children, className }: PanelProps) {
  return (
    <section className={cn("overflow-hidden rounded-lg border border-border bg-card shadow-card", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <h2 className="text-lg font-bold text-card-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
