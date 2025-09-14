import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getCurrentUser, getUserProfile, signIn as supabaseSignIn, signOut as supabaseSignOut } from '../lib/supabase'
import { User as AppUser } from '../types'

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signIn: (username: string, password?: string) => Promise<boolean>
  signOut: () => Promise<void>
  supabaseUser: User | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => false,
  signOut: async () => {},
  supabaseUser: null
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setSupabaseUser(session.user)
          // Get user profile from our profiles table
          const { data: profile } = await getUserProfile(session.user.id)
          if (profile) {
            setUser({
              id: profile.id,
              full_name: profile.full_name,
              username: profile.username,
              role: profile.role,
              status: profile.status
            })
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        // Get user profile from our profiles table
        const { data: profile } = await getUserProfile(session.user.id)
        if (profile) {
          setUser({
            id: profile.id,
            full_name: profile.full_name,
            username: profile.username,
            role: profile.role,
            status: profile.status
          })
        }
      } else {
        setUser(null)
        setSupabaseUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (usernameOrEmail: string, password?: string): Promise<boolean> => {
    try {
      // If no password provided, try to find user by username (legacy support)
      if (!password) {
        // For now, we'll require both username and password
        // In a real app, you might want to handle username-only login differently
        return false
      }

      // Try to sign in with email first
      let email = usernameOrEmail
      
      // If the input doesn't look like an email, we need to find the user by username
      if (!usernameOrEmail.includes('@')) {
        // Query the profiles table to get the email from username
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', usernameOrEmail)
          .limit(1)
        
        if (profiles && profiles.length > 0) {
          // Get the email from auth.users table
          // Note: This requires service role key in production
          // For demo purposes, we'll construct the email
          email = `${usernameOrEmail}@ischoolgo.com`
        } else {
          return false
        }
      }

      const { error } = await supabaseSignIn(email, password)
      
      if (error) {
        console.error('Sign in error:', error.message)
        return false
      }

      return true
    } catch (error) {
      console.error('Sign in error:', error)
      return false
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await supabaseSignOut()
      setUser(null)
      setSupabaseUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    supabaseUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}