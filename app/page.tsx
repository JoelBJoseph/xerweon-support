"use client"

import { useEffect, useState, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { supabase, ListedPerson, AvailabilityRow } from "@/lib/supabase-client"
import { StaffCard } from "@/components/staff-card"
import Logo from "@/components/logo"

export default function Page() {
  const [people, setPeople] = useState<ListedPerson[]>([])
  const { user } = useUser()

  // Determine if logged-in user is in the directory
  const matchedIndex = useMemo(() => {
    if (!user) return -1
    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase()
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").toLowerCase()
    return people.findIndex(
        (p) =>
            (p.email && p.email.toLowerCase() === email) ||
            (!!fullName && p.name.toLowerCase() === fullName)
    )
  }, [user, people])

  // Load people and availability from Supabase + setup realtime
  useEffect(() => {
    let active = true

    const loadPeople = async () => {
      const { data: peopleData, error: peopleError } = await supabase.from("listed_people").select("*")
      if (peopleError || !peopleData || !active) return

      const { data: availData } = await supabase.from("availability").select("*")
      const availMap = new Map(availData?.map((a: AvailabilityRow) => [a.person_id, a.available]))

      const combined = peopleData.map((p) => ({
        ...p,
        available: availMap.get(p.id) ?? false
      }))

      setPeople(combined)
    }

    loadPeople()

    // Realtime listener for availability changes
    const channel = supabase
        .channel("availability-updates")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "availability" },
            (payload: { new: AvailabilityRow }) => {
              const newData = payload.new
              setPeople((prev) =>
                  prev.map((p) =>
                      p.id === newData.person_id ? { ...p, available: newData.available } : p
                  )
              )
            }
        )
        .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [])

  // Toggle availability (only for self)
  const toggleAvailability = async (idx: number) => {
    if (idx !== matchedIndex) return
    const person = people[idx]
    const newValue = !person.available

    setPeople((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], available: newValue }
      return next
    })

    await supabase.from("availability").upsert({
      person_id: person.id,
      available: newValue
    })
  }

  return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-muted-foreground">- Customer Support</span>
            </div>
          </header>

          {/* Not-in-directory notice */}
          {user && matchedIndex < 0 && (
              <div className="mb-6 rounded-lg border border-border bg-background/50 p-3 text-sm text-muted-foreground">
                You’re signed in as “{user.primaryEmailAddress?.emailAddress || user.username || user.id}”, but this
                identity is not in the directory. You can view the list only.
              </div>
          )}

          {/* Staff Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((p, idx) => (
                <StaffCard
                    key={p.id}
                    person={p}
                    isSelf={idx === matchedIndex}
                    onToggle={() => toggleAvailability(idx)}
                />
            ))}
          </section>
        </div>
      </main>
  )
}
