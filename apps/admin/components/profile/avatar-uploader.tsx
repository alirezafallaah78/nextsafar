"use client"

import { useState, useRef } from "react"
import { Camera, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cropToSquare, getBase64SizeKB } from "@/lib/avatar-utils"
import { useToast } from "@/hooks/use-toast"

interface AvatarUploaderProps {
  currentAvatar: string | null
  onAvatarChange: (avatar: string | null) => void
}

export function AvatarUploader({ currentAvatar, onAvatarChange }: AvatarUploaderProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation فرمت
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطا",
        description: "فقط فایل‌های تصویری مجاز هستند (JPG, PNG, GIF)",
        variant: "destructive"
      })
      return
    }

    // Validation حجم فایل اصلی (قبل از crop)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم فایل نباید بیشتر از 5MB باشد",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        
        // Crop به مربع و بهینه‌سازی (256x256 با کیفیت 0.8)
        const cropped = await cropToSquare(base64, 256, 0.8)
        
        const sizeKB = getBase64SizeKB(cropped)
        console.log(`📷 Avatar optimized: ${sizeKB}KB`)
        
        setPreview(cropped)
        onAvatarChange(cropped)
        setUploading(false)
        
        toast({
          title: "عکس پردازش شد",
          description: `حجم نهایی: ${sizeKB} کیلوبایت`,
          variant: "default"
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Avatar processing error:", error)
      toast({
        title: "خطا در پردازش تصویر",
        description: "مشکلی در پردازش تصویر پیش آمد",
        variant: "destructive"
      })
      setUploading(false)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onAvatarChange(null)
  }

  return (
    <div className="relative">
      <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted group">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-10 w-10 rounded-full"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={handleRemove}
                disabled={uploading}
                className="h-10 w-10 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">آپلود عکس</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {getBase64SizeKB(preview)} کیلوبایت
        </p>
      )}
    </div>
  )
}
