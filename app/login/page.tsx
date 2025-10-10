"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs"

export default function LoginPage() {
    const router = useRouter()
    const { isSignedIn } = useUser()

    // Redirect if already signed in
    useEffect(() => {
        if (isSignedIn) {
            router.push("/")
        }
    }, [isSignedIn, router])

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            <SignedOut>
                <h1 className="text-2xl mb-6">Login</h1>
                <div className="flex gap-4">
                    <SignInButton mode="modal">
                        <button className="px-4 py-2 bg-cyan-500 text-black rounded">Sign In</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="px-4 py-2 border border-cyan-500 text-white rounded">Sign Up</button>
                    </SignUpButton>
                </div>
            </SignedOut>
        </main>
    )
}
