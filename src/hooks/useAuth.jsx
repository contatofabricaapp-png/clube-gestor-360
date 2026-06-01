import { useState, useEffect, createContext, useContext } from 'react'
import { pb } from '../lib/pocketbase'

const USUARIOS_DEMO = [
  { id: 1,  matricula: 'ADM001',  nome: 'Admin Master',   perfil: 'admin',       status: 'Ativo' },
  { id: 2,  matricula: 'FUNC001', nome: 'João Recepção',  perfil: 'funcionario', status: 'Ativo' },
  { id: 3,  matricula: 'SOC001',  nome: 'Maria Silva',    perfil: 'socio',       status: 'Ativo' },
  { id: 5,  matricula: 'SOC003',  nome: 'Ana Oliveira',   perfil: 'socio',       status: 'Ativo' },
  { id: 6,  matricula: 'SOC004',  nome: 'Pedro Costa',    perfil: 'socio',       status: 'Ativo' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pb) {
      const saved = localStorage.getItem('cg360_user')
      if (saved) setUser(JSON.parse(saved))
      setLoading(false)
      return
    }

    // Modo PocketBase: restaura sessão do authStore (persiste via cookie/localStorage)
    if (pb.authStore.isValid) {
      const record = pb.authStore.model
      setUser({
        id:        record.id,
        nome:      record.nome,
        matricula: record.matricula,
        perfil:    record.perfil,
        status:    record.status ?? 'Ativo',
      })
    }
    setLoading(false)

    // Escuta mudanças de auth (logout em outra aba, token expirado)
    const unsub = pb.authStore.onChange(() => {
      if (!pb.authStore.isValid) setUser(null)
    })

    return () => unsub()
  }, [])

  async function login(matricula, senha) {
    if (!pb) {
      const u = USUARIOS_DEMO.find(d => d.matricula === matricula.toUpperCase())
      if (!u || senha !== '1234') throw new Error('Matrícula ou senha inválidos.')
      const userData = { ...u }
      setUser(userData)
      localStorage.setItem('cg360_user', JSON.stringify(userData))
      return userData
    }

    try {
      const result = await pb.collection('users').authWithPassword(matricula, senha)
      const record = result.record
      const userData = {
        id:        record.id,
        nome:      record.nome,
        matricula: record.matricula,
        perfil:    record.perfil,
        status:    record.status ?? 'Ativo',
      }
      setUser(userData)
      return userData
    } catch {
      throw new Error('Matrícula ou senha inválidos.')
    }
  }

  function logout() {
    if (!pb) {
      setUser(null)
      localStorage.removeItem('cg360_user')
      return
    }
    pb.authStore.clear()
    setUser(null)
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
