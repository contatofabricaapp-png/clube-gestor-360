import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

// Usuários de fallback enquanto Supabase não estiver configurado
const USUARIOS_DEMO = [
  { id: 1,  matricula: 'ADM001',  nome: 'Admin Master',   perfil: 'admin',       status: 'Ativo' },
  { id: 2,  matricula: 'FUNC001', nome: 'João Recepção',  perfil: 'funcionario', status: 'Ativo' },
  { id: 3,  matricula: 'SOC001',  nome: 'Maria Silva',    perfil: 'socio',       status: 'Ativo' },
  { id: 5,  matricula: 'SOC003',  nome: 'Ana Oliveira',   perfil: 'socio',       status: 'Ativo' },
  { id: 6,  matricula: 'SOC004',  nome: 'Pedro Costa',    perfil: 'socio',       status: 'Ativo' },
]

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      // Modo demo: restaura sessão do localStorage
      const saved = localStorage.getItem('cg360_user')
      if (saved) setUser(JSON.parse(saved))
      setLoading(false)
      return
    }

    // Modo Supabase: verifica sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) _carregarPerfil(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) _carregarPerfil(session.user)
      else { setUser(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function _carregarPerfil(authUser) {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('id, nome, matricula, perfil, status')
        .eq('auth_id', authUser.id)
        .single()

      if (data) setUser(data)
      else {
        // Fallback: usa user_metadata (cadastrado via Supabase Dashboard)
        const meta = authUser.user_metadata || {}
        setUser({
          id:        authUser.id,
          nome:      meta.nome      || authUser.email,
          matricula: meta.matricula || authUser.email,
          perfil:    meta.perfil    || 'socio',
          status:    'Ativo',
        })
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // login(matricula, senha) — funciona em modo demo e Supabase
  async function login(matricula, senha) {
    if (!supabase) {
      const u = USUARIOS_DEMO.find(
        d => d.matricula === matricula.toUpperCase()
      )
      // Senha fixa '1234' em modo demo
      if (!u || senha !== '1234') throw new Error('Matrícula ou senha inválidos.')
      const userData = { ...u }
      setUser(userData)
      localStorage.setItem('cg360_user', JSON.stringify(userData))
      return userData
    }

    const email = `${matricula.toLowerCase()}@clube.local`
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error('Matrícula ou senha inválidos.')
    // perfil carregado via onAuthStateChange
  }

  function logout() {
    if (!supabase) {
      setUser(null)
      localStorage.removeItem('cg360_user')
      return
    }
    supabase.auth.signOut()
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
