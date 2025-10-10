"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Person = {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  available: boolean
}

export function StaffCard({
                            person,
                            isSelf,
                            onToggle,
                          }: {
  person: Person
  isSelf: boolean
  onToggle: () => void
}) {
  const statusColor = person.available ? "bg-cyan-500" : "bg-zinc-700"
  const statusText = person.available ? "Available" : "Unavailable"
  const telHref = person.phone ? `tel:${person.phone.replace(/\D/g, "")}` : undefined

  return (
      <div
          className={cn(
              "group relative rounded-2xl transition-all",
              "bg-zinc-900 border border-cyan-500/20 shadow-sm hover:shadow-[0_0_10px_rgba(6,182,212,0.5)]",
              "hover:translate-y-[-2px]",
              isSelf ? "ring-2 ring-cyan-500/50" : "ring-0"
          )}
      >
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-user.jpg" alt="" />
                  <AvatarFallback>{person.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span
                    aria-hidden="true"
                    className={cn("absolute -bottom-1 -right-1 h-3 w-3 rounded-full ring-2 ring-zinc-900", statusColor)}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                <p className="text-sm text-gray-400">{person.role}</p>
              </div>
            </div>

            <span
                className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border",
                    person.available
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-zinc-700 bg-zinc-800 text-gray-400",
                )}
                aria-label={`Current status: ${statusText}`}
            >
            <span aria-hidden className={cn("h-2 w-2 rounded-full", statusColor)} />
              {statusText}
          </span>
          </div>

          <div className="h-px bg-cyan-500/20" />

          <div className="text-sm text-gray-400 space-y-1">
            {person.email && (
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  <a href={`mailto:${person.email}`} className="text-cyan-400 underline underline-offset-2">
                    {person.email}
                  </a>
                </p>
            )}
            {person.phone && (
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <a href={telHref || "#"} className="text-cyan-400 underline underline-offset-2" aria-disabled={!telHref}>
                    {person.phone}
                  </a>
                </p>
            )}
          </div>

          <div className="pt-2">
            {isSelf ? (
                <Button
                    variant="outline"
                    className={cn(
                        "border-cyan-500 text-cyan-400 hover:bg-cyan-500/10",
                        "w-full"
                    )}
                    aria-pressed={person.available}
                    aria-label={`Set availability for ${person.name}`}
                    onClick={onToggle}
                >
                  Set Availability: {statusText}
                </Button>
            ) : (
                <>
                  {telHref ? (
                      <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black" asChild>
                        <a href={telHref} aria-label={`Call ${person.name}`}>
                          Call
                        </a>
                      </Button>
                  ) : (
                      <Button
                          className="w-full bg-transparent border-zinc-700 text-gray-500"
                          variant="outline"
                          disabled
                      >
                        Call
                      </Button>
                  )}
                </>
            )}
          </div>
        </div>
      </div>
  )
}
