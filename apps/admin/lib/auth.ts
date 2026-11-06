import api from "./api"

export interface User {
  id: string
  mobile: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string | null
  roles: string[]
  permissions: string[]
  isTwoFactorEnabled?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  const payload = decodeJWT(token)
  if (!payload || typeof payload.exp !== "number") return false
  return payload.exp * 1000 <= Date.now() - 5000
}

function clearSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
}

export const auth = {
  login: async (mobile: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post("/auth/login", { mobile, password })
      const data = response.data.data || response.data
      
      const access_token = data.access_token || data.accessToken
      const refresh_token = data.refresh_token || data.refreshToken
      const userData = data.user

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", access_token)
        if (refresh_token) localStorage.setItem("refreshToken", refresh_token)

        const decoded = decodeJWT(access_token)
        const roles: string[] = Array.isArray(decoded?.roles) ? decoded.roles : []
        const permissions: string[] = Array.isArray(decoded?.permissions) ? decoded.permissions : []

        const user: User = {
          id: userData.id,
          mobile: userData.mobile,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email,
          avatar: userData.avatar || null,
          roles,
          permissions,
          isTwoFactorEnabled: userData.isTwoFactorEnabled || false,
        }

        localStorage.setItem("user", JSON.stringify(user))
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        user: userData,
      }
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message)
      throw error
    }
  },

  register: async (data: any): Promise<any> => {
    const response = await api.post("/auth/register", data)
    return response.data
  },

  logout: async () => {
    try {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken }).catch(() => {})
      }
    } catch {}
    finally {
      clearSession()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  },

  getUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    try {
      const user = JSON.parse(userStr)
      return { 
        ...user, 
        roles: Array.isArray(user.roles) ? user.roles : [],
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
      }
    } catch {
      return null
    }
  },

  // Alias برای سازگاری با کد قدیمی
  getCurrentUser: (): User | null => auth.getUser(),

  setUser: (user: User) => {
    if (typeof window === "undefined") return
    localStorage.setItem("user", JSON.stringify(user))
  },

  updateProfile: (updates: Partial<User>) => {
    const current = auth.getUser()
    if (!current) return null
    
    const updated = { ...current, ...updates }
    auth.setUser(updated)
    return updated
  },

  /**
   * آپلود آواتار به API واقعی
   */
  updateAvatar: async (avatar: string | null): Promise<User | null> => {
    try {
      const response = await api.patch("/users/me/avatar", { avatar })
      const userData = response.data.data || response.data
      
      // بروزرسانی کاربر در localStorage
      const current = auth.getUser()
      if (current) {
        const updated = { ...current, avatar: avatar }
        auth.setUser(updated)
        return updated
      }
      
      return userData
    } catch (error: any) {
      console.error("Update avatar error:", error.response?.data || error.message)
      throw error
    }
  },

  isAuthenticated: (): boolean => {
    const token = auth.getToken()
    if (!token) return false
    if (isTokenExpired(token)) {
      clearSession()
      return false
    }
    return true
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("accessToken")
  },

  hasRole: (role: string): boolean => {
    const user = auth.getUser()
    if (!user) return false
    return user.roles.includes(role)
  },

  isAdmin: (): boolean => {
    const user = auth.getUser()
    if (!user) return false
    return user.roles.includes('admin') || user.roles.includes('super_admin')
  },

  hasPermission: (permission: string): boolean => {
    const user = auth.getUser()
    if (!user) return false
    if (auth.isAdmin()) return true
    return user.permissions.includes(permission)
  },

  fetchProfile: async (): Promise<User | null> => {
    try {
      const response = await api.get("/auth/profile")
      const userData = response.data.data || response.data
      
      const user: User = {
        id: userData.id,
        mobile: userData.mobile,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email,
        avatar: userData.avatar || null,
        roles: Array.isArray(userData.roles) 
          ? userData.roles.map((r: any) => typeof r === 'string' ? r : r.name)
          : [],
        permissions: userData.permissions || [],
        isTwoFactorEnabled: userData.isTwoFactorEnabled || false,
      }
      
      auth.setUser(user)
      return user
    } catch (error) {
      console.error("Fetch profile error:", error)
      return null
    }
  },
}
