import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rlvlvcwehcbqvxjwoqhq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('Testing authentication with admin account...')
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@ischoolgo.com',
      password: 'password123'
    })
    
    if (error) {
      console.error('❌ Auth error:', error.message)
    } else {
      console.log('✅ Authentication successful!')
      console.log('User ID:', data.user.id)
      console.log('Email:', data.user.email)
      
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
        
      if (profileError) {
        console.error('❌ Profile error:', profileError.message)
      } else {
        console.log('✅ Profile found!')
        console.log('Username:', profile.username)
        console.log('Role:', profile.role)
        console.log('Full name:', profile.full_name)
      }
      
      // Sign out
      await supabase.auth.signOut()
      console.log('✅ Signed out successfully')
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

testAuth().catch(console.error)