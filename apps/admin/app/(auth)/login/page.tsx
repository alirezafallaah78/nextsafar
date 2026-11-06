"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Plane,
  Smartphone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/auth"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiDown, setApiDown] = useState(false)
  const [checkingApi, setCheckingApi] = useState(true)
  const [logoFailed, setLogoFailed] = useState(false)

  useEffect(() => {
    if (auth.isAuthenticated() && auth.isAdmin()) {
      router.replace("/dashboard")
      return
    }
    api
      .get("/hotels")
      .then(() => {
        setApiDown(false)
        setCheckingApi(false)
      })
      .catch((err) => {
        console.error("API check failed:", err)
        setApiDown(true)
        setCheckingApi(false)
      })
  }, [router])

  const validate = (): string | null => {
    if (!/^09\d{9}$/.test(mobile.trim()))
      return "شماره موبایل معتبر نیست"
    if (password.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد"
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const v = validate()
    if (v) {
      setError(v)
      return
    }

    setLoading(true)
    try {
      const result = await auth.login(mobile.trim(), password)
      console.log("✅ Login successful:", result)
      toast({ title: "ورود موفق", description: "در حال انتقال..." })
      setTimeout(() => router.replace("/dashboard"), 250)
    } catch (err: any) {
      console.error("❌ Login error:", err)
      let msg = "خطایی رخ داد؛ دوباره تلاش کنید"
      
      if (err?.code === "ERR_NETWORK") {
        msg = "اتصال به سرور برقرار نیست"
      } else if (err?.response?.status === 401 || err?.response?.status === 400) {
        msg = "شماره موبایل یا رمز عبور اشتباه است"
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message
      }
      
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const LogoMark = ({ size = 80 }: { size?: number }) =>
    logoFailed ? (
      <Plane className="text-primary" style={{ width: size * 0.55, height: size * 0.55 }} />
    ) : (
      <Image
        src="/logo.png"
        alt="سفر بعدی ایرانیان"
        width={size}
        height={size}
        priority
        className="object-contain"
        onError={() => setLogoFailed(true)}
      />
    )

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -top-32 right-[-12%] h-[440px] w-[440px] rounded-full bg-primary-light/40 blur-3xl" />
        <div className="animate-blob-reverse absolute bottom-[-18%] left-[-10%] h-[480px] w-[480px] rounded-full bg-primary-lightest blur-3xl" />
        <div className="bg-dot-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
      </div>

      <div className="animate-rise relative grid w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-card-hover md:grid-cols-5">
        <div className="relative hidden flex-col items-center justify-center gap-5 overflow-hidden border-l border-border bg-gradient-to-b from-primary-lightest/60 via-background to-background p-10 md:col-span-2 md:flex">
          <div className="animate-blob pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary-light/50 blur-3xl" />
          <div className="animate-blob-reverse pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]" />

          <div className="animate-rise anim-delay-1 relative">
            <span className="animate-ring absolute -inset-5 rounded-3xl border border-primary/10" />
            <span className="animate-ring absolute -inset-2.5 rounded-2xl border border-primary/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card shadow-card">
              <LogoMark size={76} />
            </div>
          </div>

          <div className="animate-rise anim-delay-2 flex flex-col items-center gap-1.5 text-center">
            <h1 className="text-xl font-extrabold text-text-strong">سفر بعدی ایرانیان</h1>
            <span className="text-xs font-bold text-primary" dir="ltr">Nextsafar Iranian</span>
          </div>

          <div className="animate-rise anim-delay-3 h-px w-12 bg-border" />
          <p className="animate-rise anim-delay-3 text-xs text-text-muted">پنل مدیریت</p>
        </div>

        <div className="relative p-8 md:col-span-3 md:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
                <LogoMark size={40} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-extrabold text-text-strong">سفر بعدی ایرانیان</span>
                <span className="text-[10px] font-bold text-primary" dir="ltr">Nextsafar Iranian</span>
              </div>
            </div>

            <div className="animate-rise anim-delay-1 space-y-1.5">
              <h2 className="text-2xl font-extrabold text-text-strong">خوش آمدید</h2>
              <p className="text-sm text-text-muted">برای ادامه، وارد حساب کاربری شوید</p>
            </div>

            <div className="mt-5 space-y-3">
              {checkingApi && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/60 p-3 text-xs text-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>در حال بررسی اتصال به سرور...</span>
                </div>
              )}
              {!checkingApi && apiDown && (
                <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 p-3 text-xs font-bold text-warning">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>اتصال به سرور برقرار نیست (API)</span>
                </div>
              )}
              {error && (
                <div className="animate-rise flex items-center gap-2 rounded-md border border-danger/25 bg-danger/5 p-3 text-xs font-bold text-danger">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="animate-rise anim-delay-2 mt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted">شماره موبایل</Label>
                <div className="group relative">
                  <Smartphone className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle transition group-focus-within:text-primary" />
                  <Input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="username"
                    placeholder="09120000000"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={loading || apiDown}
                    className="h-12 rounded-md border-border bg-background pr-10 text-left text-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-text-muted">رمز عبور</Label>
                  <Link href="/forgot-password" className="text-[11px] font-bold text-primary transition hover:text-primary-dark">
                    فراموشی رمز؟
                  </Link>
                </div>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle transition group-focus-within:text-primary" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || apiDown}
                    className="h-12 rounded-md border-border bg-background pr-10 pl-10 text-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle transition hover:text-text disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || apiDown}
                className={cn(
                  "mt-2 h-12 w-full rounded-md text-sm font-bold text-primary-foreground",
                  "bg-gradient-to-l from-primary to-primary-dark",
                  "shadow-[0_8px_24px_rgba(67,171,255,0.35)]",
                  "transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(67,171,255,0.45)]",
                  "active:translate-y-0",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    <span>در حال ورود...</span>
                  </>
                ) : (
                  <>
                    <span>ورود</span>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="animate-rise anim-delay-3 mt-6 rounded-md border border-border bg-muted/40 p-3">
              <p className="text-[11px] font-bold text-foreground">🔑 اطلاعات ورود پیش‌فرض:</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground" dir="ltr">
                Mobile: 09120000000
              </p>
              <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                Password: Admin@12345
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
