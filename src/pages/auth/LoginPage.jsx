import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const usuario = await login(matricula, senha)
      // Em modo Supabase, o perfil chega via onAuthStateChange — usamos user do contexto
      const perfil = usuario?.perfil
      if (perfil === 'admin')            navigate('/admin')
      else if (perfil === 'funcionario') navigate('/lousa')
      else                               navigate('/socio')
    } catch (err) {
      setErro(err.message || 'Matrícula ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎾</div>
          <h1 className="text-2xl font-bold text-primary-700">Clube Gestor 360</h1>
          <p className="text-slate-500 text-sm mt-1">Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Matrícula</label>
            <input
              type="text"
              value={matricula}
              onChange={e => setMatricula(e.target.value)}
              placeholder="Ex: SOC001"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {erro && (
            <p className="text-red-500 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
          <p className="font-semibold mb-1">Usuários de teste (senha: 1234)</p>
          <p>ADM001 · FUNC001 · SOC001</p>
        </div>
      </div>
    </div>
  )
}
