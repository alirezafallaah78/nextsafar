"use client"

import { useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Panel } from "@/components/dashboard/panel"
import { serviceCategories, type TourService } from "@/lib/tour-form"
import { faNum } from "@/lib/jalali"
import { cn } from "@/lib/utils"

interface StepServicesProps {
  data: any
  onChange: (data: any) => void
}

export function StepServices({ data, onChange }: StepServicesProps) {
  const services: TourService[] = data.services || []
  const [custom, setCustom] = useState("")

  const includedCount = services.filter((s) => s.included).length

  const toggle = (id: string) =>
    onChange({
      ...data,
      services: services.map((s) => (s.id === id ? { ...s, included: !s.included } : s)),
    })

  const addCustom = () => {
    const name = custom.trim()
    if (!name) return
    onChange({
      ...data,
      services: [
        ...services,
        { id: `custom-${Date.now()}`, name, included: true, category: "other" },
      ],
    })
    setCustom("")
  }

  const removeCustom = (id: string) =>
    onChange({ ...data, services: services.filter((s) => s.id !== id) })

  return (
    <Panel
      title="خدمات تور"
      description="خدمات شامل در قیمت تور را تیک بزنید"
      action={
        <span className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          {faNum(includedCount)} خدمت فعال
        </span>
      }
    >
      <div className="space-y-6">
        {serviceCategories.map((cat) => {
          const items = services.filter((s) => s.category === cat.id)
          if (items.length === 0) return null

          return (
            <div key={cat.id}>
              <h4 className="mb-2 text-xs font-bold text-muted-foreground">{cat.title}</h4>
              <div className="grid gap-x-6 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
                {items.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-2 py-2 text-right text-sm transition",
                      s.included
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* چک‌باکس مینیمال */}
                    <span
                      className={cn(
                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border transition",
                        s.included
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background group-hover:border-primary/40"
                      )}
                    >
                      {s.included && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1">{s.name}</span>
                    {s.id.startsWith("custom-") && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCustom(s.id)
                        }}
                        className="text-[10px] font-bold text-muted-foreground opacity-0 transition hover:text-danger group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {/* ─── افزودن خدمت دیگر ─── */}
        <div className="border-t border-border pt-4">
          <h4 className="mb-2 text-xs font-bold text-muted-foreground">خدمت دیگر</h4>
          <div className="flex items-center gap-2">
            <Input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustom()
                }
              }}
              placeholder="اگر خدمتی در لیست نیست، اینجا اضافه کنید..."
              className="h-10 rounded-md"
            />
            <Button
              type="button"
              onClick={addCustom}
              className="h-10 rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark"
            >
              <Plus className="ml-2 h-4 w-4" />
              افزودن
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
