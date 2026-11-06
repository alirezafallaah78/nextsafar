import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  change?: string
  trend?: "up" | "down" | "neutral"
  accent?: "blue" | "gray"
}

const accentMap = {
  blue: "bg-primary/10 text-primary",
  gray: "bg-muted text-muted-foreground",
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  accent = "blue",
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 transition hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={cn("rounded-lg p-3", accentMap[accent])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {trend === "up" && <span className="text-success">↑</span>}
          {trend === "down" && <span className="text-danger">↓</span>}
          <span
            className={cn(
              "font-semibold",
              trend === "up" && "text-success",
              trend === "down" && "text-danger",
              trend === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </span>
          <span className="text-muted-foreground">نسبت به دوره قبل</span>
        </div>
      )}
    </div>
  )
}
