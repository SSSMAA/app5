import { createClient } from '@supabase/supabase-js'

// Get the Supabase URL and Anon Key from the environment variables
// These are read from the .env file in local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
