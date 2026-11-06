"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Hotel, MapPin, Plane, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { navSections } from "@/config/nav"
import { listTours, toViewModel, tourStatusMap } from "@/lib/admin-tours"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

interface SearchItem {
  id: string
  type: "tour" | "hotel" | "page"
  title: string
  subtitle?: string
  href: string
  icon: any
  badge?: string
}

const typeLabel: Record<SearchItem["type"], string> = {
  tour: "تور",
  hotel: "هتل",
  page: "صفحه",
}

export function GlobalSearch() {
  const router = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [hotels, setHotels] = useState<SearchItem[]>([])
  const hotelsLoaded = useRef(false)

  /* ─── debounce ─── */
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 220)
    return () => clearTimeout(t)
  }, [query])

  /* ─── ⌘K / Ctrl+K ─── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  /* ─── بستن با کلیک بیرون ─── */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  /* ─── بارگذاری هتل‌ها از API (یک‌بار) ─── */
  useEffect(() => {
    if (!open || hotelsLoaded.current) return
    hotelsLoaded.current = true
    api
      .get("/hotels", { params: { per_page: 50 } })
      .then((res) => {
        const payload = res.data?.data
        const list = Array.isArray(payload) ? payload : payload?.hotels || []
        setHotels(
          list.slice(0, 30).map((h: any) => ({
            id: `hotel-${h.id || h.slug}`,
            type: "hotel" as const,
            title: h.name || h.title || "هتل بدون نام",
            subtitle: h.city || h.destination || "",
            href: "/hotels",
            icon: Hotel,
          }))
        )
      })
      .catch(() => setHotels([]))
  }, [open])

  /* ─── ایندکس جستجو: تورها + هتل‌ها + صفحات ─── */
  const index = useMemo<SearchItem[]>(() => {
    const tours: SearchItem[] = listTours()
      .map(toViewModel)
      .map((t) => ({
        id: `tour-${t.id}`,
        type: "tour" as const,
        title: t.title,
        subtitle: t.destination,
        href: `/tours/${t.id}/edit`,
        icon: Plane,
        badge: tourStatusMap[t.status]?.label,
      }))

    const pages: SearchItem[] = navSections.flatMap((s) =>
      s.items.map((i) => ({
        id: `page-${i.href}`,
        type: "page" as const,
        title: i.title,
        subtitle: s.title,
        href: i.href,
        icon: i.icon,
      }))
    )

    return [...tours, ...hotels, ...pages]
  }, [hotels])

  /* ─── جستجوی چندکلمه‌ای (تا ۳ کلمه) ─── */
  const results = useMemo<SearchItem[]>(() => {
    const tokens = debounced.trim().split(/\s+/).filter(Boolean).slice(0, 3)
    if (tokens.length === 0) return []

    const scored = index
      .map((item) => {
        const hay = `${item.title} ${item.subtitle ?? ""}`.toLowerCase()
        const hits = tokens.filter((t) => hay.includes(t.toLowerCase())).length
        return { item, hits }
      })
      .filter((r) => r.hits > 0)
      .sort((a, b) => b.hits - a.hits)

    // اولویت با نتایجی است که همه کلمات را دارند
    const full = scored.filter((r) => r.hits === tokens.length)
    return (full.length ? full : scored).slice(0, 10).map((r) => r.item)
  }, [debounced, index])

  useEffect(() => setActiveIdx(0), [debounced])

  const select = (item: SearchItem) => {
    setOpen(false)
    setQuery("")
    router.push(item.href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      if (results[activeIdx]) {
        e.preventDefault()
        select(results[activeIdx])
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const showPanel = open && debounced.trim().length > 0

  return (
    <div ref={wrapRef} className="relative mx-6 hidden max-w-md flex-1 lg:block">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="جستجو تا ۳ کلمه: تور، هتل، صفحه..."
        className="h-10 w-full rounded-md border border-input bg-background pr-10 pl-12 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
      />

      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label="پاک کردن جستجو"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none hidden rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-block">
            ⌘K
          </kbd>
        )}
      </div>

      {/* ─── پنل نتایج زنده ─── */}
      {showPanel && (
        <div
          dir="rtl"
          className="animate-slide-down absolute top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-card-hover"
        >
          <div className="max-h-80 overflow-y-auto p-1.5">
            {results.length === 0 ? (
              <div className="py-10 text-center">
                <Search className="mx-auto h-6 w-6 text-muted-foreground/50" />
                <p className="mt-2 text-xs font-bold text-foreground">نتیجه‌ای یافت نشد</p>
                <p className="mt-1 text-[11px] text-muted-foreground">عبارت دیگری را امتحان کنید</p>
              </div>
            ) : (
              results.map((item, idx) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => select(item)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-right transition",
                      idx === activeIdx ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                    <Badge variant="secondary">{item.badge || typeLabel[item.type]}</Badge>
                  </button>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground">
            <span>↑↓ جابجایی · Enter انتخاب · Esc بستن</span>
            <span>{results.length} نتیجه</span>
          </div>
        </div>
      )}
    </div>
  )
}
