import Image from "next/image"
import { Plane } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { container: 36, icon: 20, text: "text-sm" },
    md: { container: 44, icon: 24, text: "text-base" },
    lg: { container: 56, icon: 32, text: "text-lg" },
  }
  const s = sizes[size]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-sm border border-border"
        style={{ width: s.container, height: s.container }}
      >
        <Image
          src="/logo.png"
          alt="سفر بعدی ایرانیان"
          width={s.container - 4}
          height={s.container - 4}
          priority
          className="object-contain"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.style.display = "none"
            const parent = img.parentElement
            if (parent && !parent.querySelector("svg")) {
              const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
              svg.setAttribute("width", String(s.icon))
              svg.setAttribute("height", String(s.icon))
              svg.setAttribute("viewBox", "0 0 24 24")
              svg.setAttribute("fill", "none")
              svg.setAttribute("stroke", "currentColor")
              svg.setAttribute("stroke-width", "2")
              svg.setAttribute("class", "text-foreground")
              svg.innerHTML = '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'
              parent.appendChild(svg)
            }
          }}
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-extrabold text-foreground", s.text)}>
            سفر بعدی ایرانیان
          </span>
          <span className="text-[11px] text-muted-foreground">پنل مدیریت</span>
        </div>
      )}
    </div>
  )
}
