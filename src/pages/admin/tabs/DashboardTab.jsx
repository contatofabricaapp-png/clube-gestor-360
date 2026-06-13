import { useStore } from '../../../store/useStore.jsx'
import { useRealtime } from '../../../hooks/useRealtime.js'
import { Card, Badge } from '../../../components/ui/index.jsx'
import { hoje, formatDateBR } from '../../../lib/utils.js'

export default function DashboardTab() {
  const { state, dispatch } = useStore()

  useRealtime('reservas', () => dispatch({ type: 'SYNC_REALTIME' }))
  const { reservas, filas, recursos, usuarios, modulos } = state

  const hojeStr = hoje()

  const reservasHoje = reservas.filter(r => r.data === hojeStr)
  const emAndamento  = reservas.filter(r => r.status === 'Em Andamento')
  const filasAtivas  = filas.filter(f => f.status === 'Aguardando')
  const bloqueados   = usuarios.filter(u => u.status === 'Bloqueado').length
  const noShowsHoje  = reservasHoje.filter(r => r.status === 'No-Show').length

  const livres    = recursos.filter(r => r.status === 'Livre').length
  const totalRecs = recursos.length

  // Receita estimada do dia
  const receitaHoje = reservasHoje
    .filter(r => ['Confirmada', 'Em Andamento', 'Finalizada'].includes(r.status))
    .reduce((acc, r) => {
      const mod = modulos.find(m => m.id === r.moduloId)
      if (!mod || mod.gratuito) return acc
      const [hI, mI] = r.horaInicio.split(':').map(Number)
      const [hF, mF] = r.horaFim.split(':').map(Number)
      const min = (hF * 60 + mF) - (hI * 60 + mI)
      return acc + ((min / 60) * mod.valor)
    }, 0)

  const reservasRecentes = [...reservasHoje]
    .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm))
    .slice(0, 15)

  const getUsuario = (id) => usuarios.find(u => u.id === id)
  const getRecurso = (id) => recursos.find(r => r.id === id)
  const getModulo  = (id) => modulos.find(m => m.id === id)

  const statusBadge = {
    'Pendente':             { variant: 'warning', label: 'Pendente' },
    'Confirmada':           { variant: 'info',    label: 'Confirmada' },
    'Em Andamento':         { variant: 'success', label: 'Em Andamento' },
    'Finalizada':           { variant: 'default', label: 'Finalizada' },
    'Cancelada':            { variant: 'slate',   label: 'Cancelada' },
    'No-Show':              { variant: 'danger',  label: 'No-Show' },
    'Aguardando Pagamento': { variant: 'amber',   label: 'Ag. Pagamento' },
  }

  return (
    <div className="space-y-5">

      {/* KPIs primários — em destaque */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hero KPI: Em andamento */}
        <Card className="p-4 bg-teal-50 border-teal-200 text-center">
          <p className="text-4xl font-bold text-teal-600">{emAndamento.length}</p>
          <p className="text-xs text-teal-500 font-medium mt-1">Em andamento agora</p>
        </Card>
        {/* Hero KPI: Quadras livres */}
        <Card className="p-4 bg-emerald-50 border-emerald-200 text-center">
          <p className="text-4xl font-bold text-emerald-600">{livres}/{totalRecs}</p>
          <p className="text-xs text-emerald-500 font-medium mt-1">Quadras livres</p>
        </Card>
      </div>

      {/* Receita do dia em destaque — só mostra se houver */}
      {receitaHoje > 0 && (
        <Card className="p-4 flex items-center justify-between bg-purple-50 border-purple-200">
          <div>
            <p className="text-xs text-purple-400 font-medium">Receita estimada hoje</p>
            <p className="text-3xl font-bold text-purple-700">
              R$ {receitaHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-4xl">💰</span>
        </Card>
      )}

      {/* KPIs secundários */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{reservasHoje.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Reservas hoje</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-purple-500">{filasAtivas.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Na fila</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-red-500">{noShowsHoje}</p>
          <p className="text-xs text-slate-400 mt-0.5">No-shows</p>
        </Card>
      </div>

      {/* Alertas */}
      {(bloqueados > 0 || filasAtivas.length > 0) && (
        <div className="space-y-2">
          {bloqueados > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <span className="text-red-500">🔒</span>
              <p className="text-sm text-red-700">{bloqueados} sócio(s) bloqueado(s)</p>
            </div>
          )}
          {filasAtivas.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-purple-600 mb-1.5">Fila por módulo</p>
              {modulos.filter(m => m.ativo).map(m => {
                const n = filasAtivas.filter(f => f.moduloId === m.id).length
                if (!n) return null
                return (
                  <div key={m.id} className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">{m.icone} {m.nome}</span>
                    <Badge variant="purple">{n} aguardando</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Reservas recentes */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-700 text-sm">
          Reservas de hoje <span className="text-slate-400 font-normal">({reservasHoje.length})</span>
        </h3>
        {reservasRecentes.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 text-sm">Nenhuma reserva hoje</Card>
        ) : (
          reservasRecentes.map(r => {
            const u   = getUsuario(r.usuarioId)
            const rec = getRecurso(r.recursoId)
            const mod = getModulo(r.moduloId)
            const sb  = statusBadge[r.status] ?? { variant: 'default', label: r.status }
            return (
              <Card key={r.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{u?.nome ?? '—'}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {mod?.icone} {rec?.nome ?? 'Qualquer quadra'} · {r.horaInicio}–{r.horaFim}
                    </p>
                  </div>
                  <Badge variant={sb.variant} size="sm">{sb.label}</Badge>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
