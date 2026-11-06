"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import {
  fetchUsers,
  fetchUser,
  toggleUserStatus as apiToggleStatus,
  updateUser as apiUpdateUser,
  calcUserStats,
  type ApiUser,
  type UsersMeta,
  type FetchUsersParams,
} from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/admin-users"

/**
 * تبدیل ApiUser به فرمت مورد استفاده در فرانت‌اند
 * ✅ تاریخ‌ها در فرمت ISO برگردانده می‌شوند و در کامپوننت‌ها format می‌شوند
 */
export function mapApiUserToUserRecord(apiUser: ApiUser, stats?: { ordersCount: number; totalSpent: number }) {
  const roleName = (apiUser.roles?.[0]?.name || "user") as UserRole
  return {
    id: apiUser.id,
    firstName: apiUser.firstName || "",
    lastName: apiUser.lastName || "",
    mobile: apiUser.mobile,
    email: apiUser.email || undefined,
    role: roleName,
    status: (apiUser.isActive ? "active" : "blocked") as "active" | "blocked",
    createdAtISO: apiUser.createdAt,
    lastLoginAtISO: apiUser.lastLoginAt,
    ordersCount: stats?.ordersCount || apiUser.ordersCount || 0,
    totalSpent: stats?.totalSpent || apiUser.totalSpent || 0,
    passengers: [] as any[],
  }
}

/**
 * Hook برای لیست کاربران
 * ✅ رفع infinite loop با useRef
 */
export function useUsersList() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [meta, setMeta] = useState<UsersMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<FetchUsersParams>({ page: 1, limit: 20 })

  // ✅ ref برای نگه‌داری params بدون ایجاد dependency
  const paramsRef = useRef(params)
  useEffect(() => {
    paramsRef.current = params
  }, [params])

  const load = useCallback(async (newParams?: FetchUsersParams) => {
    const currentParams = newParams || paramsRef.current
    if (newParams) setParams(newParams)

    setLoading(true)
    setError(null)
    try {
      const response = await fetchUsers(currentParams)
      const mapped = response.data.map((u) => mapApiUserToUserRecord(u))
      setUsers(mapped)
      setMeta(response.meta)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "خطا در دریافت کاربران"
      setError(msg)
      toast({ variant: "destructive", title: "خطا", description: msg })
    } finally {
      setLoading(false)
    }
    // ✅ فقط toast در dependencies - نه params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast])

  const toggleStatus = useCallback(async (id: string, currentStatus: "active" | "blocked") => {
    try {
      await apiToggleStatus(id)
      toast({
        title: currentStatus === "active" ? "کاربر مسدود شد" : "کاربر فعال شد",
      })
      await load()
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: err.response?.data?.message || "خطا در تغییر وضعیت",
      })
    }
  }, [toast, load])

  const updateRole = useCallback(async (id: string, role: UserRole) => {
    try {
      await apiUpdateUser(id, { role: role } as any)
      toast({ title: "نقش بروزرسانی شد" })
      await load()
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: err.response?.data?.message || "خطا در تغییر نقش",
      })
    }
  }, [toast, load])

  return {
    users,
    meta,
    loading,
    error,
    load,
    setParams,
    toggleStatus,
    updateRole,
    params,
  }
}

/**
 * Hook برای جزئیات یک کاربر
 */
export function useUserDetail(userId: string | null) {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const apiUser = await fetchUser(userId)
      const stats = await calcUserStats(userId)
      setUser(mapApiUserToUserRecord(apiUser, stats))
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "خطا در دریافت اطلاعات کاربر"
      console.error("fetchUser error:", err)
      setError(msg)
      toast({ variant: "destructive", title: "خطا", description: msg })
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  useEffect(() => {
    load()
  }, [load])

  return { user, loading, error, reload: load }
}

/**
 * Hook برای آمار سریع
 */
export function useUsersStats(users: any[]) {
  return useMemo(() => {
    const totalCustomers = users.filter((u) => u.role === "user").length
    const totalStaff = users.filter((u) =>
      ["support", "tour_agent", "visa_agent", "hotel_agent", "finance", "content"].includes(u.role)
    ).length
    const totalAdmins = users.filter((u) => ["admin", "super_admin"].includes(u.role)).length
    const totalPassengers = users.reduce((sum, u) => sum + (u.passengers?.length || 0), 0)
    return { totalCustomers, totalStaff, totalAdmins, totalPassengers }
  }, [users])
}
