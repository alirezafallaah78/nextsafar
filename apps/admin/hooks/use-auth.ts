"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { auth, type User } from "@/lib/auth"

interface UseAuthOptions {
  redirectOnUnauthorized?: boolean
  requiredRole?: string
  requiredPermission?: string
}

interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

/**
 * Hook اصلی احراز هویت
 * استفاده در همه کامپوننت‌های نیازمند دسترسی به کاربر
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { 
    redirectOnUnauthorized = true, 
    requiredRole, 
    requiredPermission 
  } = options
  
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // جلوگیری از redirect مکرر
  const redirectedRef = useRef(false)
  const mountedRef = useRef(false)

  // بارگذاری اولیه کاربر
  useEffect(() => {
    mountedRef.current = true
    
    const loadUser = () => {
      const currentUser = auth.getUser()
      
      if (!currentUser) {
        setUser(null)
        setLoading(false)
        
        if (redirectOnUnauthorized && !redirectedRef.current && mountedRef.current) {
          redirectedRef.current = true
          router.replace("/login")
        }
        return
      }
      
      // بررسی token منقضی شده
      if (!auth.isAuthenticated()) {
        setUser(null)
        setLoading(false)
        if (redirectOnUnauthorized && !redirectedRef.current) {
          redirectedRef.current = true
          router.replace("/login")
        }
        return
      }
      
      // بررسی دسترسی‌های مورد نیاز
      if (requiredRole && !currentUser.roles.includes(requiredRole)) {
        setUser(null)
        setLoading(false)
        if (!redirectedRef.current) {
          redirectedRef.current = true
          router.replace("/403")
        }
        return
      }
      
      if (requiredPermission && !auth.hasPermission(requiredPermission)) {
        setUser(null)
        setLoading(false)
        if (!redirectedRef.current) {
          redirectedRef.current = true
          router.replace("/403")
        }
        return
      }
      
      setUser(currentUser)
      setLoading(false)
    }
    
    loadUser()
    
    return () => {
      mountedRef.current = false
    }
  }, [router, redirectOnUnauthorized, requiredRole, requiredPermission])

  // تابع خروج
  const logout = async () => {
    setLoading(true)
    await auth.logout()
  }

  // تابع refresh کاربر از API
  const refreshUser = async () => {
    try {
      const freshUser = await auth.fetchProfile()
      if (freshUser) {
        setUser(freshUser)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user && auth.isAuthenticated(),
    isAdmin: auth.isAdmin(),
    hasRole: (role: string) => auth.hasRole(role),
    hasPermission: (permission: string) => auth.hasPermission(permission),
    logout,
    refreshUser,
  }
}

export default useAuth
