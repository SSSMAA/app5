import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rlvlvcwehcbqvxjwoqhq.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg2Nzg1MywiZXhwIjoyMDczNDQzODUzfQ.eGbu9bP7HLYQVXdHxtNFkZEmoaZhZ3QWvTvMg0Fd3b8'

// Create Supabase client with service role key for user creation
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    email: 'admin@ischoolgo.com',
    password: 'password123',
    full_name: 'Admin User',
    username: 'admin',
    role: 'ADMIN'
  },
  {
    email: 'director@ischoolgo.com',
    password: 'password123',
    full_name: 'Director User',
    username: 'director',
    role: 'DIRECTOR'
  },
  {
    email: 'marketer@ischoolgo.com',
    password: 'password123',
    full_name: 'Marketer User',
    username: 'marketer',
    role: 'MARKETER'
  },
  {
    email: 'headtrainer@ischoolgo.com',
    password: 'password123',
    full_name: 'Head Trainer User',
    username: 'headtrainer',
    role: 'HEAD_TRAINER'
  },
  {
    email: 'agent@ischoolgo.com',
    password: 'password123',
    full_name: 'Agent User',
    username: 'agent',
    role: 'AGENT'
  },
  {
    email: 'teacher@ischoolgo.com',
    password: 'password123',
    full_name: 'Teacher User',
    username: 'teacher',
    role: 'TEACHER'
  }
]

async function createTestUsers() {
  console.log('Creating test users...')
  
  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.full_name,
          username: user.username,
          role: user.role
        }
      })

      if (error) {
        console.error(`Error creating user ${user.email}:`, error.message)
      } else {
        console.log(`✅ Successfully created user: ${user.email}`)
      }
    } catch (err) {
      console.error(`Exception creating user ${user.email}:`, err.message)
    }
  }
}

createTestUsers().then(() => {
  console.log('Test user creation completed!')
  process.exit(0)
}).catch(err => {
  console.error('Error creating test users:', err)
  process.exit(1)
})