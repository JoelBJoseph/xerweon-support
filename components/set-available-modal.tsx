"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
    open: boolean
    onClose: () => void
    onSave: (datetime: string) => void
}

export function SetAvailableModal({ open, onClose, onSave }: Props) {
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")

    const handleSave = () => {
        if (!date || !time) return
        const combined = new Date(`${date}T${time}`)
        if (isNaN(combined.getTime())) return
        onSave(combined.toISOString())
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border border-cyan-500/30 text-white">
                <DialogHeader>
                    <DialogTitle className="text-cyan-400">Set Available Time</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-3">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Time</label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                </div>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} className="border-zinc-700 text-gray-400 hover:bg-zinc-800">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-400 text-black">
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
