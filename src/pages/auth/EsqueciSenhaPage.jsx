import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore.jsx'

export default function EsqueciSenhaPage() {
  const { state } = useStore()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const nomeClube = state?.config?.nome_clube || 'Clube Gestor 360'
  const isDemo = !import.meta.env.VITE_POCKETBASE_URL

  async function handleEnviar(e) {
    e.preventDefault()
    setCarregando(true)
    try {
      if (!isDemo) {
        // Com PocketBase: dispara e-mail de redefinição
        const { default: PocketBase } = await import('pocketbase')
        const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
        await pb.collection('users').requestPasswordReset(email)
      }
      // Em modo demo ou após envio: sempre exibe mensagem de sucesso (segurança por obscuridade)
      setEnviado(true)
    } catch {
      setEnviado(true) // não revelamos se o e-mail existe ou não
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
          {!enviado ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800">Recuperar senha</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isDemo
                    ? 'Em modo demo, entre em contato com a administração do clube.'
                    : 'Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.'
                  }
                </p>
              </div>

              {isDemo ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2">
                  <p className="text-2xl">📞</p>
                  <p className="text-sm font-semibold text-amber-800">Entre em contato com a secretaria</p>
                  <p className="text-xs text-amber-600">
                    A redefinição de senha em modo demonstração é feita manualmente pelo administrador do clube.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnviar} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={carregando || !email}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-5xl">📬</p>
              <h2 className="text-lg font-bold text-slate-800">Verifique seu e-mail</h2>
              <p className="text-sm text-slate-500">
                Se o e-mail informado estiver cadastrado, você receberá as instruções em instantes.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              ← Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
