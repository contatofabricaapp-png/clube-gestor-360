import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'

export default function CadastroPage() {
  const { login } = useAuth()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({ nome: '', matricula: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const nomeClube = state?.config?.nome_clube || 'Clube Gestor 360'
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function gerarMatricula() {
    return 'SOC' + Date.now().toString().slice(-6)
  }

  async function handleCadastro(e) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim()) return setErro('Informe seu nome completo.')
    if (form.senha.length < 4) return setErro('A senha deve ter pelo menos 4 caracteres.')
    if (form.senha !== form.confirmar) return setErro('As senhas não coincidem.')

    setCarregando(true)
    try {
      const matriculaGerada = form.matricula.trim() || gerarMatricula()

      // Verificar se matrícula já existe
      const existe = state.usuarios.find(u => u.matricula === matriculaGerada)
      if (existe) return setErro('Esta matrícula já está em uso. Escolha outra.')

      // Registrar no store (modo demo)
      dispatch({
        type: 'SALVAR_USUARIO',
        payload: {
          id: null,
          nome: form.nome.trim(),
          matricula: matriculaGerada,
          senha: form.senha,
          perfil: 'socio',
          status: 'Ativo',
          noshow_count: 0,
          bloqueado_ate: null,
        },
      })

      // Login automático
      await login(matriculaGerada, form.senha)
      navigate('/socio')
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.')
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
          <h1 className="text-xl font-bold text-white">{nomeClube}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl w-full p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Criar conta</h2>

          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => set('nome', e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Matrícula <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <p className="text-xs text-slate-400 mb-1.5">Deixe em branco para gerar automaticamente</p>
              <input
                type="text"
                value={form.matricula}
                onChange={e => set('matricula', e.target.value.toUpperCase())}
                placeholder="Ex: SOC999"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={form.senha}
                  onChange={e => set('senha', e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  autoComplete="new-password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarSenha ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar senha</label>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={form.confirmar}
                onChange={e => set('confirmar', e.target.value)}
                placeholder="Repita a senha"
                autoComplete="new-password"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                  form.confirmar && form.confirmar !== form.senha
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200'
                }`}
              />
              {form.confirmar && form.confirmar !== form.senha && (
                <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
              )}
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando || !form.nome || !form.senha}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors mt-1"
            >
              {carregando ? 'Criando conta...' : 'Criar conta →'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="text-sm text-slate-500 hover:text-teal-600 font-medium transition-colors"
            >
              Já tem conta? <span className="text-teal-600">Entrar</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
