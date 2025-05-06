import type React from "react"
import "./globals.css"
import { Inter, Amiri } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const arabic = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
})

export const metadata = {
  title: "Memorial for Dr. Essam Fouad Mahrous",
  description: "A digital ongoing charity (صدقة جارية) for the soul of Dr. Essam Fouad Mahrous",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body 
        className={`${inter.variable} ${arabic.variable} font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}