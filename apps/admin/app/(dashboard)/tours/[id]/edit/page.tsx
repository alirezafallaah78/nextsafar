"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TourWizard } from "@/components/tours/tour-wizard"
import { getTour, type TourRecord } from "@/lib/admin-tours"

export default function EditTourPage() {
  const params = useParams()
  const id = params.id as string
  const [record, setRecord] = useState<TourRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rec = getTour(id)
    setRecord(rec)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="soft-card p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">تور یافت نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          توری با این شناسه وجود ندارد یا حذف شده است.
        </p>
        <Button asChild className="mt-6 rounded-md">
          <Link href="/tours">بازگشت به لیست تورها</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ویرایش تور</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          در حال ویرایش «{record.form.title || "بدون عنوان"}»
        </p>
      </div>
      <TourWizard mode="edit" tourId={record.id} initial={record.form} />
    </div>
  )
}
