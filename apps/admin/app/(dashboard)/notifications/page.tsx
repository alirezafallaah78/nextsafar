"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Check, CheckCheck, Mail, MessageSquare, Phone, Send, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Panel } from "@/components/dashboard/panel"
import { StatCard } from "@/components/dashboard/stat-card"
import { useNotifications } from "@/hooks/use-notifications"
import { useToast } from "@/hooks/use-toast"
import {
  channelMap, eventMap, listTemplates, sendTestNotification, statusMap, toggleTemplate,
  type NotificationChannel,
} from "@/lib/admin-notifications"

const channelIcons: Record<NotificationChannel, any> = {
  sms: Phone,
  email: Mail,
  internal: Bell,
  whatsapp: MessageSquare,
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const { notifications, unreadCount, readOne, readAll, reload } = useNotifications()
  const [templates, setTemplates] = useState(listTemplates())
  const [tab, setTab] = useState<"history" | "templates">("history")
  const [query, setQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")

  const refreshTemplates = () => setTemplates(listTemplates())
  useEffect(refreshTemplates, [tab])

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const q = query.trim().toLowerCase()
      const matchQ = !q || n.title.includes(q) || n.body.includes(q) || n.recipient.name.includes(q)
      const matchCh = channelFilter === "all" || n.channel === channelFilter
      const matchS = statusFilter === "all" || n.status === statusFilter
      const matchR = readFilter === "all" || (readFilter === "unread" && !n.read) || (readFilter === "read" && n.read)
      return matchQ && matchCh && matchS && matchR
    })
  }, [notifications, query, channelFilter, statusFilter, readFilter])

  const totalSent = notifications.filter((n) => n.status === "sent").length
  const totalFailed = notifications.filter((n) => n.status === "failed").length
  const activeTemplates = templates.filter((t) => t.active).length

  const handleToggleTemplate = (id: string) => {
    toggleTemplate(id)
    refreshTemplates()
  }

  const handleTest = (id: string) => {
    try {
      const n = sendTestNotification(id)
      toast({ title: "ارسال تست شد", description: `${n.id} به‌عنوان ارسال تست ثبت شد` })
      reload()
    } catch {
      toast({ variant: "destructive", title: "خطا در ارسال" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">اطلاع‌رسانی‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">مدیریت اعلان‌های SMS، ایمیل، واتساپ و داخلی</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="ارسال موفق" value={totalSent.toLocaleString("fa-IR")} icon={CheckCheck} accent="blue" />
        <StatCard title="ناموفق" value={totalFailed.toLocaleString("fa-IR")} icon={Bell} accent="gray" />
        <StatCard title="خوانده‌نشده" value={unreadCount.toLocaleString("fa-IR")} icon={Bell} accent="blue" />
        <StatCard title="قالب‌های فعال" value={activeTemplates.toLocaleString("fa-IR")} icon={Mail} accent="gray" />
      </div>

      {/* تب‌ها */}
      <div className="flex items-center gap-2 rounded-md bg-muted p-1">
        <button onClick={() => setTab("history")} className={`flex-1 rounded-sm px-4 py-2 text-sm font-bold transition ${tab === "history" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          تاریخچه اعلان‌ها ({notifications.length.toLocaleString("fa-IR")})
        </button>
        <button onClick={() => setTab("templates")} className={`flex-1 rounded-sm px-4 py-2 text-sm font-bold transition ${tab === "templates" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          قالب‌ها ({templates.length.toLocaleString("fa-IR")})
        </button>
      </div>

      {tab === "history" ? (
        <Panel
          title="تاریخچه اعلان‌ها"
          description={`${filtered.length.toLocaleString("fa-IR")} اعلان`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="جستجو..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-48 rounded-md pr-10" />
              </div>
              <Select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} className="h-10 w-32">
                <option value="all">همه کانال‌ها</option>
                {Object.entries(channelMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 w-32">
                <option value="all">همه</option>
                {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
              <Select value={readFilter} onChange={(e) => setReadFilter(e.target.value)} className="h-10 w-36">
                <option value="all">همه</option>
                <option value="unread">خوانده‌نشده</option>
                <option value="read">خوانده‌شده</option>
              </Select>
              {unreadCount > 0 && (
                <Button onClick={readAll} variant="outline" className="rounded-sm border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
                  <Check className="ml-2 h-4 w-4" />
                  علامت‌گذاری همه
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {filtered.length === 0 && <div className="py-16 text-center text-muted-foreground">اعلانی یافت نشد.</div>}
            {filtered.map((n) => {
              const Icon = channelIcons[n.channel]
              return (
                <button
                  key={n.id}
                  onClick={() => !n.read && readOne(n.id)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-right transition ${n.read ? "border-border bg-background" : "border-primary/30 bg-primary/5 hover:border-primary/50"}`}
                >
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${n.read ? "bg-muted" : "bg-primary/10 text-primary"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-bold ${n.read ? "text-foreground" : "text-foreground"}`}>{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      <Badge variant={statusMap[n.status].variant}>{statusMap[n.status].label}</Badge>
                      <Badge variant="secondary">{channelMap[n.channel].label}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span>👤 {n.recipient.name}</span>
                      <span dir="ltr">{n.recipient.contact}</span>
                      <span>🕒 {n.sentAt}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Panel>
      ) : (
        <Panel title="قالب‌های اطلاع‌رسانی" description="قالب‌های پیام برای رویدادهای مختلف">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-right text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 font-medium">رویداد</th>
                  <th className="pb-3 font-medium">کانال</th>
                  <th className="pb-3 font-medium">موضوع</th>
                  <th className="pb-3 font-medium">متن</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                  <th className="pb-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="py-3 font-bold text-foreground">{eventMap[t.event]}</td>
                    <td className="py-3"><Badge variant="secondary">{channelMap[t.channel].label}</Badge></td>
                    <td className="py-3 text-muted-foreground">{t.subject}</td>
                    <td className="py-3 max-w-xs truncate text-muted-foreground">{t.body}</td>
                    <td className="py-3">
                      <Badge variant={t.active ? "success" : "secondary"}>
                        {t.active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleTemplate(t.id)} className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary">
                          {t.active ? <CheckCheck className="h-5 w-5" /> : <Check className="h-5 w-5 opacity-50" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleTest(t.id)} className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary" aria-label="ارسال تست">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  )
}
