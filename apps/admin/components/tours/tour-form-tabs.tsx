"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  number: number
  completed: boolean
}

interface TourFormTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function TourFormTabs({ tabs, activeTab, onTabChange }: TourFormTabsProps) {
  return (
    <div className="soft-card overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex overflow-x-auto">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id
          const isLast = idx === tabs.length - 1

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group relative flex min-w-[160px] flex-1 items-center gap-3 px-5 py-4 transition-all",
                isActive
                  ? "bg-gradient-to-l from-primary to-primary-dark text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50",
                !isLast && "border-l border-slate-200"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.completed
                    ? "bg-success text-white"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {tab.completed && !isActive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{tab.number}</span>
                )}
              </div>
              <div className="flex flex-col items-start text-right">
                <span className="text-sm font-semibold">{tab.label}</span>
                <span
                  className={cn(
                    "text-[11px]",
                    isActive ? "text-primary-light" : "text-slate-400"
                  )}
                >
                  مرحله {tab.number} از {tabs.length}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
