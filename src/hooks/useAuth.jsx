import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('cg360_user')
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  function login(userData) {
    setUser(userData)
    localStorage.setItem('cg360_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('cg360_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
