"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  User, Mail, Phone, Save, Shield, Loader2 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/dashboard/panel"
import { auth, type User as UserType } from "@/lib/auth"
import { AvatarUploader } from "@/components/profile/avatar-uploader"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  
  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = auth.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    
    setUser(currentUser)
    setFirstName(currentUser.firstName || "")
    setLastName(currentUser.lastName || "")
    setEmail(currentUser.email || "")
    setAvatar(currentUser.avatar || null)
    setLoading(false)
  }, [router])

  const handleAvatarChange = async (newAvatar: string | null) => {
    setAvatar(newAvatar)
    
    try {
      // ذخیره واقعی در دیتابیس از طریق API
      const updated = await auth.updateAvatar(newAvatar)
      if (updated) {
        setUser(updated)
        toast({
          title: "عکس پروفایل ذخیره شد",
          description: newAvatar ? "عکس با موفقیت آپلود شد و در سرور ذخیره شد" : "عکس با موفقیت حذف شد",
          variant: "success"
        })
      }
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      // بازگرداندن آواتار قبلی در صورت خطا
      setAvatar(user?.avatar || null)
      toast({
        title: "خطا در ذخیره عکس",
        description: error.response?.data?.message || "مشکلی در آپلود عکس پیش آمد",
        variant: "destructive"
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "خطا",
        description: "نام و نام خانوادگی الزامی هستند",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      // TODO: در آینده به API متصل شود
      // const response = await fetch('/api/v1/users/profile', {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${auth.getToken()}`
      //   },
      //   body: JSON.stringify({ firstName, lastName, email, avatar })
      // })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      const updated = auth.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        avatar
      })

      if (updated) {
        setUser(updated)
        toast({
          title: "پروفایل ذخیره شد",
          description: "اطلاعات شما با موفقیت بروزرسانی شد",
          variant: "success"
        })
      }
    } catch (error) {
      toast({
        title: "خطا در ذخیره",
        description: "مشکلی در ذخیره اطلاعات پیش آمد",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تنظیمات پروفایل</h1>
        <p className="text-muted-foreground mt-1">
          اطلاعات شخصی و عکس پروفایل خود را مدیریت کنید
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ستون اول: آواتار */}
        <div className="lg:col-span-1">
          <Panel title="عکس پروفایل">
            <div className="flex flex-col items-center space-y-4">
              <AvatarUploader
                currentAvatar={avatar}
                onAvatarChange={handleAvatarChange}
              />
              <p className="text-xs text-muted-foreground text-center">
                فرمت‌های مجاز: JPG, PNG, GIF
                <br />
                حداکثر حجم: 2MB
              </p>
            </div>
          </Panel>
        </div>

        {/* ستون دوم و سوم: اطلاعات شخصی */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="اطلاعات شخصی">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">نام *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="نام خود را وارد کنید"
                      className="pr-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">نام خانوادگی *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="نام خانوادگی خود را وارد کنید"
                      className="pr-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>شماره موبایل</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={user.mobile}
                    disabled
                    className="pr-10 bg-muted"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  شماره موبایل قابل تغییر نیست
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="اطلاعات حساب">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">شناسه کاربری</p>
                    <p className="text-sm text-muted-foreground font-mono" dir="ltr">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">نقش‌ها</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">احراز هویت دو مرحله‌ای</p>
                    <p className="text-sm text-muted-foreground">
                      {user.isTwoFactorEnabled ? "فعال" : "غیرفعال"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {user.isTwoFactorEnabled ? "مدیریت" : "فعال‌سازی"}
                </Button>
              </div>
            </div>
          </Panel>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (user) {
                  setFirstName(user.firstName || "")
                  setLastName(user.lastName || "")
                  setEmail(user.email || "")
                  setAvatar(user.avatar || null)
                }
              }}
            >
              بازنشانی
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  ذخیره تغییرات
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
