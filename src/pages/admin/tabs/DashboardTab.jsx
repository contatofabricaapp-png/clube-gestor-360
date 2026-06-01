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

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-teal-600">{reservasHoje.length}</p>
          <p className="text-xs text-slate-500 mt-1">Reservas hoje</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{emAndamento.length}</p>
          <p className="text-xs text-slate-500 mt-1">Em andamento</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{livres}/{totalRecs}</p>
          <p className="text-xs text-slate-500 mt-1">Quadras livres</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{filasAtivas.length}</p>
          <p className="text-xs text-slate-500 mt-1">Na fila agora</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{bloqueados}</p>
          <p className="text-xs text-slate-500 mt-1">Sócios bloqueados</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{noShowsHoje}</p>
          <p className="text-xs text-slate-500 mt-1">No-shows hoje</p>
        </Card>
      </div>

      {/* Fila por módulo */}
      {filasAtivas.length > 0 && (
        <Card className="p-4 space-y-2">
          <h3 className="font-bold text-slate-700 text-sm">Fila por módulo</h3>
          {modulos.filter(m => m.ativo).map(m => {
            const n = filasAtivas.filter(f => f.moduloId === m.id).length
            if (!n) return null
            return (
              <div key={m.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{m.icone} {m.nome}</span>
                <Badge variant="purple">{n} aguardando</Badge>
              </div>
            )
          })}
        </Card>
      )}

      {/* Reservas recentes */}
      <div className="space-y-2">
        <h3 className="font-bold text-slate-700 text-sm">Reservas de hoje</h3>
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
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {u?.nome ?? '—'}
                    </p>
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
