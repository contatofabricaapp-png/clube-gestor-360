import { useAuth } from '../../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Painel Admin</h1>
          <p className="text-sm text-slate-500">{user?.nome}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-slate-400 hover:text-red-500">Sair</button>
      </div>

      <div className="bg-primary-100 border border-primary-200 rounded-2xl p-4 text-center text-primary-700 font-semibold">
        🚧 Painel Admin em migração — em breve aqui
      </div>
    </div>
  )
}
