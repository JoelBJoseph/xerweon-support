"use client"

import { useEffect, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase, AvailabilityRow } from "@/lib/supabase-client"
import { StaffCard } from "@/components/staff-card"
import Logo from "@/components/logo"

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

  // Set "available at"
  const setAvailableAt = async (idx: number) => {
    if (idx !== matchedIndex) return
    const person = people[idx]

    const time = prompt("Enter when you'll be available (e.g., 2025-10-10 17:00 or 30min)")
    if (!time) return

    let timestamp: string
    if (time.includes(":")) {
      timestamp = new Date(time).toISOString()
    } else if (time.toLowerCase().includes("min")) {
      const mins = parseInt(time)
      const date = new Date(Date.now() + mins * 60 * 1000)
      timestamp = date.toISOString()
    } else {
      timestamp = new Date().toISOString()
    }

    setPeople((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], availableAt: timestamp }
      return next
    })

    await supabase
        .from("availability")
        .upsert({ person_id: person.id, available_at: timestamp })
  }

  return (
      <main className="min-h-dvh bg-black text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
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

          <section aria-label="Staff directory" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((p, idx) => (
                <StaffCard
                    key={p.id}
                    person={p}
                    isSelf={idx === matchedIndex}
                    onToggle={() => toggleAvailability(idx)}
                    onSetAvailableAt={() => setAvailableAt(idx)}
                />
            ))}
          </section>
        </div>
      </main>
  )
}
