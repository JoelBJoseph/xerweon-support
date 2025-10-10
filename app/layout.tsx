import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
    title: "Team Directory",
    description: "View and manage staff availability",
}

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
})

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ClerkProvider>
            <html lang="en" className="dark">
            <body className={`font-sans ${inter.variable} ${GeistMono.variable}`}>
            {/* Header */}
            <header className="p-4 flex items-center justify-end gap-2 border-b border-primary/50">
                <SignedIn>
                    <UserButton />
                </SignedIn>

                <SignedOut>
                    {/* Link to login page instead of SignIn/SignUp buttons */}
                    <Link
                        href="/login"
                        className="text-cyan-500 hover:underline font-medium"
                    >
                        Login
                    </Link>
                </SignedOut>
            </header>

            {/* Main content */}
            <Suspense fallback={null}>{children}</Suspense>

            <Analytics />
            </body>
            </html>
        </ClerkProvider>
    )
}
