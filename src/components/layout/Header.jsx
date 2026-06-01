import { Badge } from '../ui/index.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNavigate, Link } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const perfilLabel = { admin: 'Admin', funcionario: 'Funcionário', socio: 'Sócio' }
  const perfilVariant = { admin: 'purple', funcionario: 'info', socio: 'success' }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Clube Gestor 360</h1>
            <p className="text-xs text-slate-500">{user?.nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={perfilVariant[user?.perfil] || 'default'}>
            {perfilLabel[user?.perfil] || user?.perfil}
          </Badge>
          {user?.perfil === 'admin' && (
            <Link
              to="/admin"
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 text-lg"
              title="Painel Admin"
            >
              ⚙️
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
            title="Sair"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  )
}
