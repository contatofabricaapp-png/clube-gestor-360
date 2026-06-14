import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNavigate, Link } from 'react-router-dom'
import { TabBar } from '../../components/ui/index.jsx'
import DashboardTab  from './tabs/DashboardTab.jsx'
import QuadrasTab    from './tabs/QuadrasTab.jsx'
import AulasTab      from './tabs/AulasTab.jsx'
import UsuariosTab   from './tabs/UsuariosTab.jsx'
import ConfigTab     from './tabs/ConfigTab.jsx'
import RelatoriosTab from './tabs/RelatoriosTab.jsx'

const ABAS = [
  { id: 'dashboard',  label: '📊 Dashboard' },
  { id: 'quadras',    label: '🎾 Quadras' },
  { id: 'aulas',      label: '📚 Aulas' },
  { id: 'usuarios',   label: '👥 Usuários' },
  { id: 'relatorios', label: '📈 Relatórios' },
  { id: 'config',     label: '⚙️ Config' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [abaAtiva, setAbaAtiva] = useState('dashboard')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Cabeçalho */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-800 leading-tight">Painel Admin</h1>
          <p className="text-xs text-slate-400 truncate">{user?.nome}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/socio"
            className="p-2 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 text-teal-700 rounded-xl transition-colors text-base"
            title="Ver como sócio"
          >👤</Link>
          <Link
            to="/lousa"
            className="p-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl transition-colors text-base"
            title="Lousa"
          >🖥️</Link>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-xl transition-colors text-base"
            title="Sair"
          >🚪</button>
        </div>
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
        {abaAtiva === 'usuarios'   && <UsuariosTab />}
        {abaAtiva === 'relatorios' && <RelatoriosTab />}
        {abaAtiva === 'config'     && <ConfigTab />}
      </main>

    </div>
  )
}
