import type { Metadata } from "next"
import { DirectionProvider } from "@radix-ui/react-direction"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "سفر بعدی ایرانیان | پنل مدیریت",
  description: "سامانه مدیریت یکپارچه فروش و عملیات — Nextsafar Iranian",
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <DirectionProvider dir="rtl">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  )
}
