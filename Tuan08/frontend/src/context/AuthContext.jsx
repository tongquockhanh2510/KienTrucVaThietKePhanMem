import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function normalizeStoredUser(payload) {
  if (!payload) return null

  if (payload.userId) {
    return payload
  }

  return {
    token: payload.token || '',
    userId: payload.user?.id || payload.user?._id || '',
    username: payload.user?.username || payload.username || '',
    email: payload.user?.email || payload.email || '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cinema_user')
      return normalizeStoredUser(saved ? JSON.parse(saved) : null)
    } catch {
      return null
    }
  })

  const login = (userData) => {
    const normalizedUser = normalizeStoredUser(userData)
    setUser(normalizedUser)
    localStorage.setItem('cinema_user', JSON.stringify(normalizedUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cinema_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
