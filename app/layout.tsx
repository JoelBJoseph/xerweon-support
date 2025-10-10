import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import "./globals.css";
import {dark} from "@clerk/themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Staff Directory",
    description: "Staff availability dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;
    return (
        <ClerkProvider publishableKey={clerkKey} appearance={dark}>
            <html lang="en" className="dark">
            <body className={`font-sans ${inter.variable} ${GeistMono.variable}`}>
            <header className="p-4 flex items-center justify-end gap-2 border-b border-primary/50">
                <SignedOut>{/* no buttons here; login page handles it */}</SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </header>
            <Suspense fallback={null}>{children}</Suspense>
            </body>
            </html>
        </ClerkProvider>
    );
}

//just checking