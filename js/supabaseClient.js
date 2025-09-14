// Supabase client for Karam Libnan Admin Panel
// Fixed configuration with proper client setup

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase configuration
const SUPABASE_URL = 'https://xbznaxiummganlidnmdd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhiem5heGl1bW1nYW5saWRubWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTc4MDQsImV4cCI6MjA3MDgzMzgwNH0.jM5vsB2UeeI6ZHlDWJylD6drRBrHvutmm2EA7GMddQs'

// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { 
    persistSession: true,
    autoRefreshToken: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'karam-libnan-admin'
    }
  }
})

// Global access for legacy compatibility
window.supabase = supabase

// Export configuration for testing
export const config = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY
}

// Test connection function
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('main_categories')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase connection successful')
    return { success: true, data }
  } catch (err) {
    console.error('Supabase connection error:', err)
    return { success: false, error: err.message }
  }
}

console.log('Supabase client initialized successfully')
