"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** تبدیل ارقام فارسی/عربی به انگلیسی */
function toEnglishDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٤٥٦٧٨٩".indexOf(d)))
}

interface MoneyInputProps {
  value: number
  onChange: (v: number) => void
  suffix?: string
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
}

/**
 * اینپوت مبلغ با جداکننده ۳ رقمی زنده
 * نمایش: 18,500,000 | ذخیره: عدد خام
 */
export function MoneyInput({
  value,
  onChange,
  suffix = "ریال",
  placeholder = "0",
  className,
  id,
  disabled,
}: MoneyInputProps) {
  const display = value ? new Intl.NumberFormat("en-US").format(value) : ""

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toEnglishDigits(e.target.value).replace(/[^\d]/g, "")
    onChange(raw ? parseInt(raw, 10) : 0)
  }

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("h-10 rounded-md pl-8 text-left font-medium tabular-nums", className)}
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
        {suffix}
      </span>
    </div>
  )
}
