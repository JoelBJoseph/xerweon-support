import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ListedPerson = {
  id: string
  name: string
  role: string
  email?: string
  phone?: string
  available?: boolean
}

export type AvailabilityRow = {
  person_id: string
  available: boolean
  updated_at?: string
}