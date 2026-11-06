"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CouponForm } from "@/components/coupons/coupon-form"
import { getCoupon, type CouponRecord } from "@/lib/admin-coupons"

export default function EditCouponPage() {
  const params = useParams()
  const id = params.id as string
  const [coupon, setCoupon] = useState<CouponRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCoupon(getCoupon(id))
    setLoading(false)
  }, [id])

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />

  if (!coupon) {
    return (
      <div className="rounded-lg border border-border bg-card p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">کد یافت نشد</h2>
        <Button asChild className="mt-6 rounded-sm"><Link href="/coupons">بازگشت</Link></Button>
      </div>
    )
  }

  return <CouponForm mode="edit" initial={coupon} couponId={coupon.id} />
}
