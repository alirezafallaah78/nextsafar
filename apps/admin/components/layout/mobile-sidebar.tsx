"use client"

import { Sidebar } from "./sidebar"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-lg">
        <Sidebar className="w-72" onNavigate={onClose} />
      </div>
    </div>
  )
}
