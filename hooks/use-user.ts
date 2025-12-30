'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  avatar?: string
  createdAt?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await axios.get('/api/auth/me')
      setUser(response.data.user)
    } catch (error: any) {
      if (error.response?.status === 401) {
        // User is not authenticated
        setUser(null)
        setError('Not authenticated')
      } else {
        console.error('Error fetching user:', error)
        setError(error.response?.data?.error || 'Failed to fetch user data')
        toast.error('Failed to load user data')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = () => {
    fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return {
    user,
    isLoading,
    error,
    refreshUser,
  }
}