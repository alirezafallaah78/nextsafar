"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  activeVisaCases: number
  totalHotels: number
  totalTours: number
}

export interface DashboardData {
  overview: DashboardStats
  recentOrders: any[]
  recentLeads: any[]
  generatedAt: string
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get("/admin/dashboard")
      
      if (response.data.success) {
        setData(response.data.data)
      } else {
        throw new Error("Failed to load dashboard")
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "خطا در بارگذاری داشبورد"
      setError(msg)
      toast({
        variant: "destructive",
        title: "خطا",
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}
