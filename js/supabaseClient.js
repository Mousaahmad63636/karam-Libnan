// Supabase client initialization
// IMPORTANT: Do NOT commit service role keys. Use only anon public key in the frontend.
// Provide the anon key either via build pipeline injecting SUPABASE_ANON_KEY or assign manually below.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://xbznaxiummganlidnmdd.supabase.co'
// Replace process.env style with global injected variable or manual assignment.
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'REPLACE_WITH_ANON_KEY_AT_RUNTIME'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
})
