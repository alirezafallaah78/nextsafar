"use client"

import { useCallback } from "react"
import { useAuth } from "./use-auth"
import { logOperation, type OperationAction, type OperationEntity } from "@/lib/admin-logs"

/**
 * Hook برای ثبت خودکار لاگ عملیات
 * استفاده: const { log } = useOperationLogger()
 *         log({ action: "create", entity: "tour", entityLabel: "تور جدید", description: "..." })
 */
export function useOperationLogger() {
  const { user } = useAuth()

  const log = useCallback(
    (data: {
      action: OperationAction
      entity: OperationEntity
      entityId?: string
      entityLabel?: string
      description: string
      metadata?: Record<string, any>
    }) => {
      if (!user) return

      logOperation({
        ...data,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.mobile,
        ipAddress: "localhost", // در حالت واقعی از هدر سرور می‌گیریم
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "",
      })
    },
    [user]
  )

  return { log }
}
