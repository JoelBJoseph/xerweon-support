// components/staff-card.tsx
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
  availableAt?: string | null
}

type Props = {
  person: Person
  isSelf?: boolean
  onToggle?: () => void
  onSetAvailableAt?: () => void
}

// Format: DD/MM/YYYY HH:mm
function formatAvailableAt(isoTime?: string | null): string {
  if (!isoTime) return "N/A"
  const d = new Date(isoTime)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(
      d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

// Relative "in 2h 30m"
function formatRelativeTime(isoTime?: string | null): string {
  if (!isoTime) return ""
  const now = new Date()
  const target = new Date(isoTime)
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return "now"

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  return parts.join(" ")
}

export function StaffCard({ person, isSelf = false, onToggle, onSetAvailableAt }: Props) {
  const statusColor = person.available ? "bg-cyan-500" : "bg-zinc-700"
  const statusText = person.available ? "Available" : "Unavailable"
  const telHref = person.phone ? `tel:${person.phone.replace(/\D/g, "")}` : null

  // dim only for non-self unavailable users
  const dimClass = !person.available && !isSelf ? "opacity-60 grayscale hover:opacity-80" : ""

  return (
      <div
          className={cn(
              "rounded-2xl border border-cyan-500/20 bg-zinc-900 p-4 shadow-md transition-all",
              "hover:border-cyan-500/40 hover:shadow-[0_0_10px_rgba(6,182,212,0.06)]",
              dimClass
          )}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-cyan-500/20">
                  <AvatarImage src="/placeholder-user.jpg" alt={person.name} />
                  <AvatarFallback>{person.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span
                    className={cn(
                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full ring-2 ring-zinc-900",
                        statusColor
                    )}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{person.name}</h3>
                <p className="text-sm text-gray-400">{person.role}</p>
              </div>
            </div>

            <span
                className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border font-medium",
                    person.available
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-zinc-700 bg-zinc-800 text-gray-400"
                )}
            >
            <span className={cn("h-2 w-2 rounded-full", statusColor)} />
              {statusText}
          </span>
          </div>

          {/* If unavailable and NOT self -> minimal view */}
          {!person.available && !isSelf ? (
              <div className="mt-3 text-sm text-gray-400 italic">
                {person.availableAt ? (
                    <p>
                      Available at:{" "}
                      <span className="text-cyan-400 font-medium">{formatAvailableAt(person.availableAt)}</span>{" "}
                      (<span className="text-gray-300">{formatRelativeTime(person.availableAt)}</span>)
                    </p>
                ) : (
                    <p>Not available currently</p>
                )}
              </div>
          ) : (
              /* Full view (either available OR it's the logged-in user) */
              <>
                {/* Divider */}
                <div className="h-px bg-cyan-500/20 my-3" />

                {/* Contact Info */}
                <div className="text-sm text-gray-400 space-y-1">
                  {person.email && (
                      <p>
                        <span className="text-gray-500">Email:</span>{" "}
                        <a href={`mailto:${person.email}`} className="text-cyan-400 underline">
                          {person.email}
                        </a>
                      </p>
                  )}
                  {person.phone && (
                      <p>
                        <span className="text-gray-500">Phone:</span>{" "}
                        <a href={telHref || "#"} className="text-cyan-400 underline" aria-disabled={!telHref}>
                          {person.phone}
                        </a>
                      </p>
                  )}
                </div>

                {/* Actions + Available At */}
                <div className="pt-3 space-y-2">
                  {/* If self, show toggle + set available buttons */}
                  {isSelf ? (
                      <>
                        <Button
                            variant="outline"
                            className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                            onClick={onToggle}
                        >
                          Set Availability: {statusText}
                        </Button>

                        {!person.available && (
                            <Button
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
                                onClick={onSetAvailableAt}
                            >
                              Set Available Time
                            </Button>
                        )}
                      </>
                  ) : (
                      // not self: call button or disabled
                      <Button
                          className={cn(
                              "w-full",
                              telHref ? "bg-cyan-500 hover:bg-cyan-400 text-black" : "bg-transparent border-zinc-700 text-gray-500 cursor-not-allowed"
                          )}
                          asChild={!!telHref}
                          disabled={!telHref}
                      >
                        {telHref ? <a href={telHref}>Call</a> : <>Call</>}
                      </Button>
                  )}

                  {/* Show availableAt info inside card for everyone (if present) */}
                  {!person.available && person.availableAt && (
                      <p className="text-xs text-center text-gray-400 italic">
                        Available at:{" "}
                        <span className="text-cyan-400 font-medium">{formatAvailableAt(person.availableAt)}</span>{" "}
                        (<span className="text-gray-300">{formatRelativeTime(person.availableAt)}</span>)
                      </p>
                  )}
                </div>
              </>
          )}
        </div>
      </div>
  )
}
