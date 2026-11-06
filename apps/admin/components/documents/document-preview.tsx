"use client"

import { useEffect, useState } from "react"
import { Download, FileImage, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DocumentPreviewProps {
  open: boolean
  onClose: () => void
  url: string
  fileName: string
  name: string
}

export function DocumentPreview({ open, onClose, url, fileName, name }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName)
  const isPDF = /\.pdf$/i.test(fileName)


  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      setError(false)
    }
  }, [url, open])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-card shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            {isImage ? (
              <FileImage className="h-5 w-5 text-primary" />
            ) : (
              <FileText className="h-5 w-5 text-primary" />
            )}
            <div>
              <h3 className="text-sm font-bold text-foreground">{name}</h3>
              <p className="text-xs text-muted-foreground" dir="ltr">{fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              className="rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark"
            >
              <Download className="ml-2 h-4 w-4" />
              دانلود
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-sm hover:bg-muted"
              aria-label="بستن"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-auto bg-muted/30 p-4">
          {isLoading && !error && (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-bold text-foreground">
                  پیش‌نمایش ممکن نیست
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  این فایل را می‌توانید دانلود کنید
                </p>
                <Button
                  onClick={handleDownload}
                  className="mt-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark"
                >
                  <Download className="ml-2 h-4 w-4" />
                  دانلود مستقیم
                </Button>
              </div>
            </div>
          )}

          {!error && isImage && (
            <img
              src={url}
              alt={name}
              className={cn(
                "mx-auto max-h-full max-w-full rounded-md object-contain",
                isLoading && "hidden"
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError(true)
              }}
            />
          )}

          {!error && isPDF && (
            <iframe
              src={url}
              className={cn(
                "h-full w-full rounded-md border border-border bg-white",
                isLoading && "hidden"
              )}
              title={name}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setError(true)
              }}
            />
          )}

          {!error && !isImage && !isPDF && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-bold text-foreground">
                  پیش‌نمایش این نوع فایل پشتیبانی نمی‌شود
                </p>
                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                  {fileName}
                </p>
                <Button
                  onClick={handleDownload}
                  className="mt-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-dark"
                >
                  <Download className="ml-2 h-4 w-4" />
                  دانلود فایل
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2 text-[11px] text-muted-foreground">
          <span>برای بستن خارج از کادر کلیک کنید یا Esc بزنید</span>
          <span dir="ltr">{fileName}</span>
        </div>
      </div>
    </div>
  )
}
