"use client"

import { Coffee, Plus, Trash2, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/dashboard/panel"
import type { ItineraryDay } from "@/lib/tour-form"
import { cn } from "@/lib/utils"

interface StepItineraryProps {
  data: any
  onChange: (data: any) => void
}

function emptyDay(dayNumber: number): ItineraryDay {
  return {
    id: `day-${Date.now()}-${Math.random()}`,
    day: dayNumber,
    title: "",
    description: "",
    city: "",
    meals: { breakfast: false, lunch: false, dinner: false },
  }
}

export function StepItinerary({ data, onChange }: StepItineraryProps) {
  const itinerary: ItineraryDay[] = data.itinerary || []

  const update = (newIt: ItineraryDay[]) => {
    onChange({ ...data, itinerary: newIt })
  }

  const addDay = () => update([...itinerary, emptyDay(itinerary.length + 1)])
  const removeDay = (index: number) => {
    const newIt = itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }))
    update(newIt)
  }
  const updateDay = (index: number, field: string, value: any) => {
    const newIt = [...itinerary]
    if (field === "meals") {
      newIt[index] = { ...newIt[index], meals: { ...newIt[index].meals, ...value } }
    } else {
      newIt[index] = { ...newIt[index], [field]: value }
    }
    update(newIt)
  }

  return (
    <div className="space-y-6">
      <Panel
        title="برنامه سفر روزانه"
        description="برای هر روز برنامه کامل را مشخص کنید"
        action={
          <Button onClick={addDay} size="sm" className="rounded-md bg-gradient-to-l from-primary to-primary-dark">
            <Plus className="ml-2 h-4 w-4" />
            افزودن روز
          </Button>
        }
      >
        {itinerary.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-lightest">
              <Utensils className="h-8 w-8 text-primary-dark" />
            </div>
            <h3 className="text-lg font-bold">هنوز روزی اضافه نشده</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              برنامه هر روز از سفر را با جزئیات وارد کنید
            </p>
            <Button onClick={addDay} className="mt-4 rounded-md">
              <Plus className="ml-2 h-4 w-4" />
              افزودن روز اول
            </Button>
          </div>
        ) : (
          <div className="relative space-y-4 pr-6">
            {/* خط عمودی تایم‌لاین */}
            <div className="absolute right-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary to-primary-dark" />

            {itinerary.map((day, index) => (
              <div key={day.id} className="relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                {/* نقطه تایم‌لاین */}
                <div className="absolute right-[-14px] top-5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[11px] font-bold text-white shadow">
                  {day.day}
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-lg font-bold text-foreground">روز {day.day}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDay(index)}
                    className="h-8 w-8 text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>عنوان روز</Label>
                    <Input
                      value={day.title}
                      onChange={(e) => updateDay(index, "title", e.target.value)}
                      placeholder="مثال: ورود به استانبول"
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>شهر</Label>
                    <Input
                      value={day.city}
                      onChange={(e) => updateDay(index, "city", e.target.value)}
                      placeholder="استانبول"
                      className="rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>توضیحات روز</Label>
                  <textarea
                    value={day.description}
                    onChange={(e) => updateDay(index, "description", e.target.value)}
                    rows={3}
                    placeholder="برنامه‌های این روز..."
                    className="w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { key: "breakfast", label: "صبحانه", icon: "☕" },
                    { key: "lunch", label: "ناهار", icon: "🍽️" },
                    { key: "dinner", label: "شام", icon: "🌙" },
                  ].map((meal) => (
                    <button
                      key={meal.key}
                      type="button"
                      onClick={() => updateDay(index, "meals", { [meal.key]: !day.meals[meal.key as keyof typeof day.meals] })}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
                        day.meals[meal.key as keyof typeof day.meals]
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-500"
                      )}
                    >
                      <span>{meal.icon}</span>
                      <span>{meal.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
