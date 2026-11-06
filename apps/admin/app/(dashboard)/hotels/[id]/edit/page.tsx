"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { HotelForm } from "@/components/hotels/hotel-form"
import { getHotel, type HotelRecord } from "@/lib/admin-hotels"

export default function EditHotelPage() {
  const params = useParams()
  const id = params.id as string
  const [hotel, setHotel] = useState<HotelRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setHotel(getHotel(id))
    setLoading(false)
  }, [id])

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />

  if (!hotel) {
    return (
      <div className="soft-card p-16 text-center">
        <h2 className="text-xl font-bold text-foreground">هتل یافت نشد</h2>
        <Button asChild className="mt-6 rounded-sm"><Link href="/hotels">بازگشت به لیست</Link></Button>
      </div>
    )
  }

  return <HotelForm mode="edit" initial={hotel} hotelId={hotel.id} />
}
