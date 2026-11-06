"use client"

import { useCallback, useEffect, useState } from "react"
import { listNotifications, markAsRead, markAllAsRead, type NotificationRecord } from "@/lib/admin-notifications"

const UPDATE_EVENT = "nextsafar:notifications-updated"

/**
 * Hook مشترک برای استفاده از اعلان‌ها در هدر و صفحه
 * هماهنگی از طریق custom event
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])

  const reload = useCallback(() => {
    setNotifications(listNotifications())
  }, [])

  // بارگذاری اولیه + شنونده event
  useEffect(() => {
    reload()
    const handler = () => reload()
    window.addEventListener(UPDATE_EVENT, handler)
    return () => window.removeEventListener(UPDATE_EVENT, handler)
  }, [reload])

  // پخش event به بقیه کامپوننت‌ها
  const broadcast = () => {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
  }

  const readOne = useCallback(
    (id: string) => {
      markAsRead(id)
      reload()
      broadcast()
    },
    [reload]
  )

  const readAll = useCallback(() => {
    markAllAsRead()
    reload()
    broadcast()
  }, [reload])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    readOne,
    readAll,
    reload,
  }
}
