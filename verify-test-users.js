import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://rlvlvcwehcbqvxjwoqhq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsdmx2Y3dlaGNicXZ4andvcWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc4NTMsImV4cCI6MjA3MzQ0Mzg1M30.8lwuGi_XD4digdJqBOoMIqEUfHNE9SYg1OIWWVALvHI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Expected test users
const expectedUsers = [
  { email: 'admin@ischoolgo.com', role: 'ADMIN', username: 'admin' },
  { email: 'director@ischoolgo.com', role: 'DIRECTOR', username: 'director' },
  { email: 'marketer@ischoolgo.com', role: 'MARKETER', username: 'marketer' },
  { email: 'headtrainer@ischoolgo.com', role: 'HEAD_TRAINER', username: 'headtrainer' },
  { email: 'agent@ischoolgo.com', role: 'AGENT', username: 'agent' },
  { email: 'teacher@ischoolgo.com', role: 'TEACHER', username: 'teacher' }
]

async function verifyUserLogin(email, password = 'password123') {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log(`❌ Login failed for ${email}: ${error.message}`)
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      // Sign out to clean up
      await supabase.auth.signOut()

      if (profileError) {
        console.log(`⚠️  Login success but no profile for ${email}: ${profileError.message}`)
        return { 
          success: false, 
          error: 'No profile found',
          user: data.user,
          profile: null 
        }
      }

      console.log(`✅ ${email} - Login & Profile OK (${profile.role})`)
      return { 
        success: true, 
        user: data.user, 
        profile 
      }
    }
  } catch (err) {
    console.log(`❌ Exception verifying ${email}: ${err.message}`)
    return { success: false, error: err.message }
  }
}

async function checkProfiles() {
  console.log('🔍 Checking profiles in database...\n')
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role')

    if (error) {
      console.log('❌ Error fetching profiles:', error.message)
      return
    }

    console.log(`📊 Found ${profiles.length} profiles in database:`)
    profiles.forEach(profile => {
      console.log(`   - ${profile.username} (${profile.role}) - Status: ${profile.status}`)
    })
    console.log('')
    
    // Check if all expected roles are present
    const foundRoles = profiles.map(p => p.role)
    const expectedRoles = ['ADMIN', 'DIRECTOR', 'MARKETER', 'HEAD_TRAINER', 'AGENT', 'TEACHER']
    const missingRoles = expectedRoles.filter(role => !foundRoles.includes(role))
    
    if (missingRoles.length > 0) {
      console.log(`⚠️  Missing roles: ${missingRoles.join(', ')}`)
    } else {
      console.log('✅ All expected roles found in profiles')
    }
    console.log('')
    
  } catch (err) {
    console.log('❌ Exception checking profiles:', err.message)
  }
}

async function verifyAllUsers() {
  console.log('🚀 Starting test user verification...\n')
  
  // First check profiles
  await checkProfiles()
  
  console.log('🔐 Testing login for each user...\n')
  
  let successCount = 0
  let failureCount = 0
  const results = []

  for (const user of expectedUsers) {
    const result = await verifyUserLogin(user.email)
    results.push({ ...user, ...result })
    
    if (result.success) {
      successCount++
      // Verify role matches
      if (result.profile && result.profile.role === user.role) {
        console.log(`   ✅ Role verified: ${user.role}`)
      } else {
        console.log(`   ⚠️  Role mismatch: Expected ${user.role}, got ${result.profile?.role || 'unknown'}`)
      }
    } else {
      failureCount++
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('')
  }
  
  console.log('📊 Verification Summary:')
  console.log(`✅ Successful logins: ${successCount}`)
  console.log(`❌ Failed logins: ${failureCount}`)
  console.log(`📝 Total expected: ${expectedUsers.length}`)
  
  if (successCount === expectedUsers.length) {
    console.log('\n🎉 All test users verified successfully!')
    console.log('\n📋 Working Login Credentials:')
    results.forEach(user => {
      if (user.success) {
        console.log(`${user.role}: ${user.email} / password123`)
      }
    })
  } else {
    console.log('\n⚠️  Some users need attention:')
    results.forEach(user => {
      if (!user.success) {
        console.log(`❌ ${user.email} (${user.role}): ${user.error}`)
      }
    })
    console.log('\n💡 Check the Manual User Creation Guide for troubleshooting steps.')
  }
  
  console.log('\n🌐 Test the working accounts at: https://3000-i2uhqpp7miqap95oa1ej3-6532622b.e2b.dev')
}

// Run the verification
verifyAllUsers().catch(console.error)