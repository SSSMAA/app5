import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rlvlvcwehcbqvxjwoqhq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg2Nzg1MywiZXhwIjoyMDczNDQzODUzfQ.eGbu9bP7HLYQVXdHxtNFkZEmoaZhZ3QWvTvMg0Fd3b8'

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testEmails = [
  'admin@ischoolgo.com',
  'director@ischoolgo.com',
  'marketer@ischoolgo.com',
  'headtrainer@ischoolgo.com',
  'agent@ischoolgo.com',
  'teacher@ischoolgo.com'
]

async function confirmUsers() {
  console.log('Confirming test user emails...')
  
  for (const email of testEmails) {
    try {
      console.log(`Confirming user: ${email}`)
      
      // Get user by email
      const { data: users, error: getUserError } = await supabase.auth.admin.listUsers()
      
      if (getUserError) {
        console.error(`Error getting users:`, getUserError.message)
        continue
      }
      
      const user = users.users.find(u => u.email === email)
      if (!user) {
        console.log(`❌ User not found: ${email}`)
        continue
      }
      
      // Update user to confirm email
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true
      })

      if (error) {
        console.error(`Error confirming user ${email}:`, error.message)
      } else {
        console.log(`✅ Successfully confirmed user: ${email}`)
      }
    } catch (err) {
      console.error(`Exception confirming user ${email}:`, err.message)
    }
  }
}

confirmUsers().then(() => {
  console.log('User confirmation completed!')
  process.exit(0)
}).catch(err => {
  console.error('Error confirming users:', err)
  process.exit(1)
})