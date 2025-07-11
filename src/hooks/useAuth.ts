import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import app from '@/firebase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth(app)
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
      
      if (user) {
        try {
          // Get token that will be refreshed automatically by Firebase
          const idToken = await user.getIdToken(true) // Force refresh
          setToken(idToken)
          localStorage.setItem('authToken', idToken)
          
          // Set up token refresh every 30 minutes (tokens expire after 1 hour)
          const refreshInterval = setInterval(async () => {
            try {
              const newToken = await user.getIdToken(true)
              setToken(newToken)
              localStorage.setItem('authToken', newToken)
            } catch (error) {
              console.error('Token refresh failed:', error)
            }
          }, 30 * 60 * 1000) // 30 minutes

          return () => clearInterval(refreshInterval)
        } catch (error) {
          console.error('Error getting token:', error)
        }
      } else {
        setToken(null)
        localStorage.removeItem('authToken')
      }
    })

    return unsubscribe
  }, [])

  return { user, loading, token }
}
