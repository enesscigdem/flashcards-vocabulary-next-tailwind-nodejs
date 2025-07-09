import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { FlashcardProvider } from "@/contexts/flashcard-context"

export const metadata: Metadata = {
    title: "Flashcard Study - Advanced Language Learning",
    description: "Minimal flashcard study experience with spaced repetition",
    generator: "v0.dev",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <FlashcardProvider>{children}</FlashcardProvider>
        </ThemeProvider>
        </body>
        </html>
    )
}
