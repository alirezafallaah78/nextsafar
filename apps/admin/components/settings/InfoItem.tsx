"use client"

import { useState, useEffect } from "react"
import { FileText } from "lucide-react"

interface InfoItemProps {
  icon?: any
  label: string
  value: string
  ltr?: boolean
  color?: string
}

export default function InfoItem({
  icon: Icon,
  label,
  value,
  ltr,
  color = "primary",
}: InfoItemProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fallback icon اگر icon پاس داده نشد
  const FinalIcon = Icon || FileText

  // Skeleton برای SSR - جلوگیری از hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
        <div className="h-9 w-9 flex-shrink-0 rounded-md bg-muted animate-pulse" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3 transition hover:border-primary/20">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
        <FinalIcon className="h-4 w-4 text-primary" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p
          className={`mt-0.5 truncate text-sm font-bold text-foreground ${ltr ? "font-mono" : ""}`}
          dir={ltr ? "ltr" : undefined}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  )
}
