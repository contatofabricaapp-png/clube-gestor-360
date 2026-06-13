import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { Card, Button, Badge, TabBar, EmptyState } from '../../components/ui/index.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import { formatDateBR } from '../../lib/utils.js'

// Borda esquerda por status
const STATUS_BORDER = {
  'Em Andamento':         'border-l-emerald-500',
  'Confirmada':           'border-l-teal-400',
  'Pendente':             'border-l-amber-400',
  'Aguardando Pagamento': 'border-l-orange-400',
  'Finalizada':           'border-l-slate-300',
  'Cancelada':            'border-l-red-400',
  'No-Show':              'border-l-red-600',
}

const STATUS_BADGE = {
  'Pendente':             'warning',
  'Confirmada':           'info',
  'Em Andamento':         'success',
  'Aguardando Pagamento': 'purple',
  'Finalizada':           'default',
  'Cancelada':            'danger',
  'No-Show':              'danger',
}

export default function MinhasReservasPage() {
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const { reservas, filas, recursos, modulos } = state
  const [tab, setTab] = useState('ativas')

  const usuarioStore = state.usuarios.find(u => u.matricula === user?.matricula)

  const minhasReservas = reservas.filter(r => r.usuarioId === usuarioStore?.id)
  const minhaFila      = filas.filter(f => f.usuarioId === usuarioStore?.id)

  const ativas = [
    ...minhasReservas
      .filter(r => !['Cancelada', 'No-Show', 'Finalizada'].includes(r.status))
      .map(r => ({ ...r, _tipo: 'reserva' })),
    ...minhaFila
      .filter(f => f.status === 'Aguardando')
      .map(f => ({ ...f, _tipo: 'fila' })),
  ]

  const historico = [
    ...minhasReservas
      .filter(r => ['Cancelada', 'No-Show', 'Finalizada'].includes(r.status))
      .map(r => ({ ...r, _tipo: 'reserva' }))
      .sort((a, b) => new Date(b.data) - new Date(a.data)),
    ...minhaFila
      .filter(f => f.status !== 'Aguardando')
      .map(f => ({ ...f, _tipo: 'fila' })),
  ]

  const lista = tab === 'ativas' ? ativas : historico

  const getRecurso = id => recursos.find(r => r.id === id)
  const getModulo  = rid => { const rec = getRecurso(rid); return modulos.find(m => m.id === rec?.moduloId) }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-24">
        <h2 className="text-xl font-bold text-slate-800">📅 Minhas Reservas</h2>

        <TabBar
          tabs={[
            { id: 'ativas',    label: `Ativas (${ativas.length})`       },
            { id: 'historico', label: `Histórico (${historico.length})` },
          ]}
          active={tab}
          onChange={setTab}
        />

        {lista.length === 0 ? (
          tab === 'ativas' ? (
            <EmptyState
              icon="📭"
              title="Nenhuma reserva ativa"
              description="Que tal reservar uma quadra agora?"
              actionLabel="Ir ao início"
              onAction={() => navigate('/socio')}
            />
          ) : (
            <EmptyState
              icon="📋"
              title="Histórico vazio"
              description="Suas reservas finalizadas e canceladas aparecerão aqui."
            />
          )
        ) : (
          lista.map(item => {
            // ── Card de reserva ─────────────────────────────────────────────
            if (item._tipo === 'reserva') {
              const recurso = getRecurso(item.recursoId)
              const modulo  = getModulo(item.recursoId)
              const borderClass = STATUS_BORDER[item.status] || 'border-l-slate-200'

              return (
                <Card key={'r' + item.id} className={`p-4 space-y-3 border-l-4 ${borderClass}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl shrink-0">{modulo?.icone}</span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{recurso?.nome}</h4>
                        <p className="text-xs text-slate-500">{modulo?.nome}</p>
                      </div>
                    </div>
                    <Badge variant={STATUS_BADGE[item.status] || 'default'}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-sm grid grid-cols-2 gap-y-1.5">
                    <span className="text-slate-500">Data:</span>
                    <span className="font-medium text-right">{formatDateBR(item.data)}</span>
                    <span className="text-slate-500">Horário:</span>
                    <span className="font-medium text-right">{item.horaInicio} – {item.horaFim}</span>
                    {item.tipo && (
                      <>
                        <span className="text-slate-500">Tipo:</span>
                        <span className="font-medium text-right capitalize">{item.tipo}</span>
                      </>
                    )}
                  </div>

                  {tab === 'ativas' && item.status !== 'Em Andamento' && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      onClick={() => dispatch({ type: 'CANCELAR_RESERVA', payload: { reservaId: item.id } })}
                    >
                      Cancelar reserva
                    </Button>
                  )}
                </Card>
              )
            }

            // ── Card de fila ────────────────────────────────────────────────
            const modulo  = modulos.find(m => m.id === item.moduloId)
            const recurso = item.recursoId ? recursos.find(r => r.id === item.recursoId) : null
            const posicao = filas
              .filter(f => f.moduloId === item.moduloId && f.status === 'Aguardando')
              .sort((a, b) => new Date(a.entradaEm) - new Date(b.entradaEm))
              .findIndex(f => f.id === item.id) + 1

            const ehPrimeiro = posicao === 1 && tab === 'ativas'

            return (
              <Card key={'f' + item.id} className="p-4 border-l-4 border-l-purple-400 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                      ehPrimeiro
                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400 ring-offset-1'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {posicao}º
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate">{modulo?.icone} {modulo?.nome}</h4>
                      <p className="text-xs text-slate-500">{recurso?.nome || 'Qualquer quadra'}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'Aguardando' ? 'purple' : 'default'}>
                    {item.status === 'Aguardando' ? 'Na fila' : item.status}
                  </Badge>
                </div>

                {ehPrimeiro && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                    <p className="text-emerald-700 font-semibold text-sm">🎯 Você é o próximo!</p>
                  </div>
                )}

                {tab === 'ativas' && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => dispatch({ type: 'SAIR_FILA', payload: { filaId: item.id } })}
                  >
                    Sair da fila
                  </Button>
                )}
              </Card>
            )
          })
        )}
      </main>

      <BottomNav />
    </div>
  )
}
