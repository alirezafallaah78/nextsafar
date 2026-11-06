"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TourFormTabs } from "./tour-form-tabs"
import { StepBasic } from "./steps/step-basic"
import { StepDates } from "./steps/step-dates"
import { StepPricing } from "./steps/step-pricing"
import { StepItinerary } from "./steps/step-itinerary"
import { StepHotels } from "./steps/step-hotels"
import { StepServices } from "./steps/step-services"
import { defaultTourState, type TourFormState } from "@/lib/tour-form"
import { createTour, updateTour } from "@/lib/admin-tours"
import { cn } from "@/lib/utils"

interface TourWizardProps {
  mode: "create" | "edit"
  tourId?: string
  initial?: TourFormState
}

export function TourWizard({ mode, tourId, initial }: TourWizardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<TourFormState>(initial || defaultTourState)
  const [saving, setSaving] = useState(false)

  const tabs = [
    { id: "basic", label: "اطلاعات پایه", number: 1, completed: !!formData.title && !!formData.destination },
    { id: "dates", label: "تاریخ‌ها", number: 2, completed: formData.dates.length > 0 },
    { id: "pricing", label: "قیمت‌گذاری", number: 3, completed: formData.basePrice > 0 },
    { id: "itinerary", label: "برنامه سفر", number: 4, completed: formData.itinerary.length > 0 },
    { id: "hotels", label: "هتل‌ها", number: 5, completed: true },
    { id: "services", label: "خدمات", number: 6, completed: formData.services.some((s) => s.included) },
  ]

  const currentTab = tabs.findIndex((t) => t.id === activeTab)
  const isLast = currentTab === tabs.length - 1
  const isFirst = currentTab === 0

  const handleNext = () => {
    if (!isLast) setActiveTab(tabs[currentTab + 1].id)
  }

  const handlePrev = () => {
    if (!isFirst) setActiveTab(tabs[currentTab - 1].id)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "عنوان تور الزامی است",
      })
      setActiveTab("basic")
      return
    }

    setSaving(true)
    try {
      if (mode === "create") {
        createTour(formData)
        toast({ title: "تور ایجاد شد", description: `«${formData.title}» با موفقیت ایجاد شد` })
      } else if (tourId) {
        updateTour(tourId, formData)
        toast({ title: "تور بروزرسانی شد", description: `«${formData.title}» ذخیره شد` })
      }
      router.push("/tours")
    } catch (error) {
      toast({ variant: "destructive", title: "خطا در ذخیره", description: "ذخیره تور با خطا مواجه شد" })
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    switch (activeTab) {
      case "basic":
        return <StepBasic data={formData} onChange={setFormData} />
      case "dates":
        return <StepDates data={formData} onChange={setFormData} />
      case "pricing":
        return <StepPricing data={formData} onChange={setFormData} />
      case "itinerary":
        return <StepItinerary data={formData} onChange={setFormData} />
      case "hotels":
        return <StepHotels data={formData} onChange={setFormData} />
      case "services":
        return <StepServices data={formData} onChange={setFormData} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <TourFormTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="min-h-[400px]">{renderStep()}</div>

      <div className="sticky bottom-4 z-10 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handlePrev} disabled={isFirst} className="rounded-md">
            <ArrowRight className="ml-2 h-4 w-4" />
            مرحله قبل
          </Button>

          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <span>پیشرفت:</span>
            <div className="flex gap-1">
              {tabs.map((tab, idx) => (
                <div
                  key={tab.id}
                  className={cn(
                    "h-2 w-10 rounded-full transition",
                    tab.completed ? "bg-success" : idx === currentTab ? "bg-primary" : "bg-slate-200"
                  )}
                />
              ))}
            </div>
            <span>
              {tabs.filter((t) => t.completed).length} / {tabs.length}
            </span>
          </div>

          {isLast ? (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-gradient-to-l from-success to-success shadow-lg shadow-emerald-500/20"
            >
              {saving ? (
                <>در حال ذخیره...</>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  {mode === "create" ? "ایجاد تور" : "ذخیره تغییرات"}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="rounded-md bg-gradient-to-l from-primary to-primary-dark shadow-card-hover"
            >
              مرحله بعد
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
