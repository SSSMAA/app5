import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://rlvlvcwehcbqvxjwoqhq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test users to create
const testUsers = [
  {
    role: 'ADMIN',
    email: 'admin@ischoolgo.com',
    fullName: 'Admin User',
    username: 'admin',
    password: 'password123'
  },
  {
    role: 'DIRECTOR', 
    email: 'director@ischoolgo.com',
    fullName: 'Director User',
    username: 'director',
    password: 'password123'
  },
  {
    role: 'MARKETER',
    email: 'marketer@ischoolgo.com', 
    fullName: 'Marketer User',
    username: 'marketer',
    password: 'password123'
  },
  {
    role: 'HEAD_TRAINER',
    email: 'headtrainer@ischoolgo.com',
    fullName: 'Head Trainer User', 
    username: 'headtrainer',
    password: 'password123'
  },
  {
    role: 'AGENT',
    email: 'agent@ischoolgo.com',
    fullName: 'Agent User',
    username: 'agent', 
    password: 'password123'
  },
  {
    role: 'TEACHER',
    email: 'teacher@ischoolgo.com',
    fullName: 'Teacher User',
    username: 'teacher',
    password: 'password123'
  }
]

async function createTestUser(user) {
  console.log(`Creating user: ${user.email} (${user.role})...`)
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.fullName,
          username: user.username,
          role: user.role
        }
      }
    })

    if (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message)
      return false
    }

    if (data.user) {
      console.log(`✅ Successfully created user: ${user.email}`)
      console.log(`   - User ID: ${data.user.id}`)
      console.log(`   - Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`)
      return true
    }
  } catch (err) {
    console.error(`❌ Exception creating ${user.email}:`, err.message)
    return false
  }
}

async function createAllTestUsers() {
  console.log('🚀 Starting test user creation process...\n')
  
  let successCount = 0
  let failureCount = 0
  
  for (const user of testUsers) {
    const success = await createTestUser(user)
    if (success) {
      successCount++
    } else {
      failureCount++
    }
    
    // Wait 1 second between user creations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('') // Empty line for readability
  }
  
  console.log('📊 Test User Creation Summary:')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failureCount}`)
  console.log(`📝 Total: ${testUsers.length}`)
  
  if (successCount === testUsers.length) {
    console.log('\n🎉 All test users created successfully!')
    console.log('\n📋 Login Credentials:')
    testUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / password123`)
    })
  } else {
    console.log('\n⚠️  Some users failed to create. Check the errors above.')
  }
}

// Run the script
createAllTestUsers().catch(console.error)