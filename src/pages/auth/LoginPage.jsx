import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const { state } = useStore()
  const navigate = useNavigate()
  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const nomeClube = state?.config?.nome_clube || 'Clube Gestor 360'
  const isDemo = !import.meta.env.VITE_POCKETBASE_URL

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const usuario = await login(matricula, senha)
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)' }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Marca */}
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
            🎾
          </div>
          <h1 className="text-2xl font-bold text-white">{nomeClube}</h1>
          <p className="text-teal-200 text-sm mt-1">Sistema de Gestão</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-2xl w-full p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Acesse sua conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Matrícula</label>
              <p className="text-xs text-slate-400 mb-1.5">Fornecida pela secretaria do clube</p>
              <input
                type="text"
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder="Ex: SOC001"
                autoComplete="username"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando || !matricula || !senha}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-1"
            >
              {carregando ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>

          {/* Links secundários */}
          <div className="mt-5 space-y-3 text-center">
            <Link
              to="/esqueci-senha"
              className="block text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Esqueci minha senha
            </Link>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="flex-1 h-px bg-slate-200" />
              ou
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <Link
              to="/cadastro"
              className="block text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              Não tem conta?{' '}
              <span className="text-teal-600 font-semibold hover:text-teal-700">Cadastre-se</span>
            </Link>
          </div>

          {/* Bloco demo — só aparece sem backend configurado */}
          {isDemo && (
            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-1">Modo demonstração</p>
              <p className="text-xs text-slate-400">ADM001 · FUNC001 · SOC001 — senha: 1234</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
