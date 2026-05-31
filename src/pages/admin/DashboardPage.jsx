import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { TabBar } from '../../components/ui/index.jsx'
import DashboardTab from './tabs/DashboardTab.jsx'
import QuadrasTab   from './tabs/QuadrasTab.jsx'
import AulasTab     from './tabs/AulasTab.jsx'
import UsuariosTab  from './tabs/UsuariosTab.jsx'
import ConfigTab    from './tabs/ConfigTab.jsx'

const ABAS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'quadras',   label: '🎾 Quadras' },
  { id: 'aulas',     label: '📚 Aulas' },
  { id: 'usuarios',  label: '👥 Usuários' },
  { id: 'config',    label: '⚙️ Config' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [abaAtiva, setAbaAtiva] = useState('dashboard')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Cabeçalho */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Painel Admin</h1>
          <p className="text-xs text-slate-500">{user?.nome}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          Sair
        </button>
      </div>

      {/* Abas */}
      <div className="px-4 pt-3 pb-1 bg-white border-b border-slate-100">
        <TabBar tabs={ABAS} active={abaAtiva} onChange={setAbaAtiva} />
      </div>

      {/* Conteúdo */}
      <main className="flex-1 p-4 overflow-y-auto pb-8">
        {abaAtiva === 'dashboard' && <DashboardTab />}
        {abaAtiva === 'quadras'   && <QuadrasTab />}
        {abaAtiva === 'aulas'     && <AulasTab />}
        {abaAtiva === 'usuarios'  && <UsuariosTab />}
        {abaAtiva === 'config'    && <ConfigTab />}
      </main>

    </div>
  )
}
