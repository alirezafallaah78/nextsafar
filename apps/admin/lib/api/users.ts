import api from "../api"

/* ═══ Types برای پاسخ API ═══ */
export interface ApiUser {
  id: string
  firstName: string | null
  lastName: string | null
  mobile: string
  email: string | null
  isActive: boolean
  roles: Array<{
    id: string
    name: string
    displayName: string
  }>
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  // فیلدهایی که ممکن است در detail بیاید
  orders?: Array<any>
  ordersCount?: number
  totalSpent?: number
}

export interface UsersMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UsersResponse {
  data: ApiUser[]
  meta: UsersMeta
}

export interface FetchUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  status?: "active" | "blocked" | "all"
}

/* ═══ توابع API ═══ */

/** دریافت لیست کاربران با pagination و فیلتر */
export async function fetchUsers(params: FetchUsersParams = {}): Promise<UsersResponse> {
  const { page = 1, limit = 20, search, role, status } = params
  
  const queryParams: Record<string, any> = { page, limit }
  if (search) queryParams.search = search
  if (role && role !== "all") queryParams.role = role
  
  const response = await api.get("/users", { params: queryParams })
  const result = response.data

  // فیلتر وضعیت (active/blocked) در کلاینت چون API فقط isActive دارد
  let filteredData = result.data || []
  if (status === "active") {
    filteredData = filteredData.filter((u: ApiUser) => u.isActive)
  } else if (status === "blocked") {
    filteredData = filteredData.filter((u: ApiUser) => !u.isActive)
  }

  return {
    data: filteredData,
    meta: result.meta || {
      total: filteredData.length,
      page,
      limit,
      totalPages: Math.ceil(filteredData.length / limit),
    },
  }
}

/** دریافت جزئیات یک کاربر */
export async function fetchUser(id: string): Promise<ApiUser> {
  const response = await api.get(`/users/${id}`)
  return response.data
}

/** بروزرسانی اطلاعات کاربر */
export async function updateUser(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
  const response = await api.patch(`/users/${id}`, data)
  return response.data
}

/** تغییر وضعیت کاربر (فعال/غیرفعال) */
export async function toggleUserStatus(id: string): Promise<ApiUser> {
  const response = await api.patch(`/users/${id}/toggle-active`)
  return response.data
}

/** تغییر نقش کاربر */
export async function updateUserRole(id: string, roleName: string): Promise<void> {
  // این endpoint در بک‌اند وجود ندارد، پس باید از updateUser استفاده کنیم
  // یا در بک‌اند پیاده‌سازی شود
  await api.patch(`/users/${id}`, { role: roleName })
}

/** دریافت سفارش‌های یک کاربر */
export async function fetchUserOrders(userId: string): Promise<any[]> {
  try {
    const response = await api.get("/orders", { params: { userId, limit: 100 } })
    return response.data.data || response.data || []
  } catch {
    return []
  }
}

/** محاسبه آمار کاربر (تعداد سفارش و مجموع خرید) */
export async function calcUserStats(userId: string): Promise<{ ordersCount: number; totalSpent: number }> {
  const orders = await fetchUserOrders(userId)
  const paidOrders = orders.filter((o: any) => o.status === "paid" || o.paymentStatus === "paid")
  const totalSpent = paidOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || o.paidAmount || 0), 0)
  return {
    ordersCount: orders.length,
    totalSpent,
  }
}
