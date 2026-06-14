import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function BottomNav() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isSocio      = user?.perfil === 'socio'
  const isFuncionario = user?.perfil === 'funcionario'
  const isAdmin      = user?.perfil === 'admin'

  const items = [
    ...(isSocio || isAdmin ? [
      { path: '/socio',            icon: '🏠', label: 'Início'    },
      { path: '/socio/reservas',   icon: '📅', label: 'Reservas'  },
      { path: '/socio/fila',       icon: '⏳', label: 'Fila'      },
      { path: '/socio/torneios',   icon: '🏆', label: 'Torneios'  },
    ] : []),
    ...(isFuncionario || isAdmin ? [
      { path: '/lousa',          icon: '📋', label: 'Lousa'     },
    ] : []),
    ...(isAdmin ? [
      { path: '/admin',          icon: '⚙️', label: 'Admin'     },
    ] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-40">
      <div className="flex justify-around py-2">
        {items.map(item => {
          const ativo = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors ${
                ativo ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
