/**
 * برش تصویر به مربع و بهینه‌سازی حجم
 * @param base64 - تصویر base64 ورودی
 * @param maxSize - حداکثر اندازه (پیش‌فرض: 256 پیکسل)
 * @param quality - کیفیت JPEG (پیش‌فرض: 0.8)
 */
export async function cropToSquare(
  base64: string,
  maxSize: number = 256,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      
      // محاسبه اندازه مربع از تصویر اصلی
      const size = Math.min(img.width, img.height)
      
      // محاسبه اندازه نهایی (حداکثر maxSize)
      const finalSize = Math.min(size, maxSize)
      
      canvas.width = finalSize
      canvas.height = finalSize
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // فعال کردن image smoothing برای کیفیت بهتر
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2
      
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        size,
        size,
        0,
        0,
        finalSize,
        finalSize
      )
      
      // خروجی JPEG با کیفیت قابل تنظیم (حجم بسیار کمتر از PNG)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = base64
  })
}

export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
}

/**
 * محاسبه حجم تقریبی base64 در KB
 */
export function getBase64SizeKB(base64: string): number {
  // حذف header (مثل "data:image/jpeg;base64,")
  const clean = base64.split(',')[1] || base64
  // هر کاراکتر base64 = 6 bits = 0.75 bytes
  const bytes = (clean.length * 3) / 4
  return Math.round(bytes / 1024)
}
