"use client"

import { useEffect, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase, AvailabilityRow } from "@/lib/supabase-client"
import { StaffCard } from "@/components/staff-card"
import Logo from "@/components/logo"
import { SetAvailableModal } from "@/components/set-available-modal"
import { Button } from "@/components/ui/button"

type Person = {
    id: string
    name: string
    role: string
    email?: string
    phone?: string
    available: boolean
    availableAt?: string | null
}

export default function Page() {
    const [people, setPeople] = useState<Person[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
    const { user } = useUser()

    const matchedIndex = useMemo(() => {
        if (!user) return -1
        const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
        const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").toLowerCase()
        return people.findIndex(
            (p) =>
                (p.email && p.email.toLowerCase() === email) ||
                (!!fullName && p.name.toLowerCase() === fullName)
        )
    }, [user, people])

    // Load data
    useEffect(() => {
        let active = true
        const loadPeople = async () => {
            const { data: peopleData } = await supabase.from("listed_people").select("*")
            const { data: availabilityData } = await supabase.from("availability").select("*")

            const availabilityMap = new Map<string, { available: boolean; available_at: string | null }>()
            availabilityData?.forEach((row: any) =>
                availabilityMap.set(row.person_id, {
                    available: !!row.available,
                    available_at: row.available_at || null,
                })
            )

            if (!active) return
            setPeople(
                peopleData?.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    role: p.role,
                    email: p.email,
                    phone: p.phone,
                    available: availabilityMap.get(p.id)?.available ?? false,
                    availableAt: availabilityMap.get(p.id)?.available_at ?? null,
                })) || []
            )
        }

        loadPeople()
        return () => {
            active = false
        }
    }, [])

    // Realtime updates
    useEffect(() => {
        const channel = supabase
            .channel("availability-updates")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "availability" },
                (payload: any) => {
                    const newData = payload.new as AvailabilityRow
                    if (!newData?.person_id) return
                    setPeople((prev) =>
                        prev.map((p) =>
                            p.id === newData.person_id
                                ? { ...p, available: newData.available, availableAt: newData.available_at }
                                : p
                        )
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Toggle availability
    const toggleAvailability = async (idx: number) => {
        if (idx !== matchedIndex) return
        const person = people[idx]
        const newAvailability = !person.available

        setPeople((prev) => {
            const next = [...prev]
            next[idx] = { ...next[idx], available: newAvailability }
            return next
        })

        await supabase
            .from("availability")
            .upsert({ person_id: person.id, available: newAvailability })
    }

    // Open modal
    const openSetAvailableModal = (idx: number) => {
        if (idx !== matchedIndex) return
        setSelectedIdx(idx)
        setModalOpen(true)
    }

    // Save available time
    const handleSaveAvailableTime = async (isoTime: string) => {
        if (selectedIdx === null) return
        const person = people[selectedIdx]
        setPeople((prev) => {
            const next = [...prev]
            next[selectedIdx] = { ...next[selectedIdx], availableAt: isoTime }
            return next
        })
        await supabase.from("availability").upsert({ person_id: person.id, available_at: isoTime })
    }

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            {/* Page Content */}
            <div className="flex-grow mx-auto w-full max-w-6xl px-4 py-8">
                <header className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Logo />
                            <span className="text-cyan-400">- Customer Support</span>
                        </div>
                    </div>
                    <div className="border-b border-cyan-500/40 mt-3" />
                </header>

                {user && matchedIndex < 0 && (
                    <div className="mb-6 rounded-lg border border-cyan-500/30 bg-zinc-900/70 p-3 text-sm text-gray-400">
                        You’re signed in as “{user?.primaryEmailAddress?.emailAddress || user?.username || user?.id}”,
                        but this identity is not in the directory. You can view the list only.
                    </div>
                )}

                <section
                    aria-label="Staff directory"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {people.map((p, idx) => (
                        <StaffCard
                            key={p.id}
                            person={p}
                            isSelf={idx === matchedIndex}
                            onToggle={() => toggleAvailability(idx)}
                            onSetAvailableAt={() => openSetAvailableModal(idx)}
                        />
                    ))}
                </section>
            </div>

            {/* Sticky Footer */}
            <footer className="sticky bottom-0 w-full border-t border-cyan-500/20 py-4 bg-zinc-950">
                <div className="flex justify-center gap-4">
                    <Button
                        asChild
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium rounded-xl"
                    >
                        <a
                            href="https://forms.gle/GLwzdmX2mxqMmrZU6"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            💬 Feedback Form
                        </a>
                    </Button>
                    <Button
                        asChild
                        className="border border-cyan-500 text-white hover:bg-cyan-500/10 rounded-xl"
                    >
                        <a
                            href="https://forms.gle/PBZs3Ngg6XQbTQL96"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            🐞 Bug Report
                        </a>
                    </Button>
                </div>
            </footer>

            <SetAvailableModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveAvailableTime}
            />
        </main>
    )
}
