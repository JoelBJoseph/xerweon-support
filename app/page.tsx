// app/page.tsx
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
}

export default function Page() {
  const [people, setPeople] = useState<Person[]>([])
  const { user } = useUser()

  // Determine current logged-in user
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

  // Load people + availability from Supabase
  useEffect(() => {
    let active = true
    const loadPeople = async () => {
      // Fetch listed people
      const { data: peopleData, error: peopleError } = await supabase
          .from("listed_people")
          .select("*")
      if (peopleError || !peopleData) return

      // Fetch availability
      const { data: availabilityData } = await supabase
          .from<AvailabilityRow>("availability")
          .select("*")
      const availabilityMap = new Map<string, boolean>()
      availabilityData?.forEach((row) => availabilityMap.set(row.person_id, !!row.available))

      if (!active) return
      const mappedPeople: Person[] = peopleData.map((p: any) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        email: p.email,
        phone: p.phone,
        available: availabilityMap.get(p.id) ?? false,
      }))
      setPeople(mappedPeople)
    }

    loadPeople()
    return () => {
      active = false
    }
  }, [])

  // Realtime availability updates
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
                      p.id === newData.person_id ? { ...p, available: newData.available } : p
                  )
              )
            }
        )
        .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Toggle availability for logged-in user
  const toggleAvailability = async (idx: number) => {
    if (idx !== matchedIndex) return
    setPeople((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], available: !next[idx].available }
      return next
    })
    const person = people[idx]
    await supabase
        .from("availability")
        .upsert({ person_id: person.id, available: !person.available })
  }

  return (
      <main className="min-h-dvh">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="text-muted-foreground">- Customer Support</span>
              </div>
            </div>
            <div className="border-b border-primary/50 mt-3" />
          </header>

          {/* Not-in-directory notice */}
          {user && matchedIndex < 0 && (
              <div
                  role="status"
                  className="mb-6 rounded-lg border border-border bg-background/50 p-3 text-sm text-muted-foreground"
              >
                You’re signed in as “{user?.primaryEmailAddress?.emailAddress || user?.username || user?.id}”, but this
                identity is not in the directory. You can view the list only.
              </div>
          )}

          {/* Grid of people */}
          <section aria-label="Staff directory" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((p, idx) => (
                <StaffCard key={p.id} person={p} isSelf={idx === matchedIndex} onToggle={() => toggleAvailability(idx)} />
            ))}
          </section>
        </div>
      </main>
  )
}
