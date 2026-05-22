import { useAuth } from '../../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export default function LousaPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Lousa Digital</h1>
        <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-slate-400">Sair</button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-center text-slate-300 font-semibold">
        🚧 Lousa Digital em migração — em breve aqui
      </div>
    </div>
  )
}
