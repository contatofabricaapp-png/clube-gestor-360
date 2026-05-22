import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { Card, Button, Badge, TabBar } from '../../components/ui/index.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import { formatDateBR } from '../../lib/utils.js'

export default function MinhasReservasPage() {
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const { reservas, filas, recursos, modulos } = state
  const [tab, setTab] = useState('ativas')

  const usuarioStore = state.usuarios.find(u => u.matricula === user?.matricula)

  const minhasReservas = reservas.filter(r => r.usuarioId === usuarioStore?.id)
  const minhaFila     = filas.filter(f => f.usuarioId === usuarioStore?.id)

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
      .map(r => ({ ...r, _tipo: 'reserva' })),
    ...minhaFila
      .filter(f => f.status !== 'Aguardando')
      .map(f => ({ ...f, _tipo: 'fila' })),
  ]

  const lista = tab === 'ativas' ? ativas : historico

  const getRecurso = id => recursos.find(r => r.id === id)
  const getModulo  = rid => { const rec = getRecurso(rid); return modulos.find(m => m.id === rec?.moduloId) }

  const statusVariant = {
    'Pendente':             'warning',
    'Confirmada':           'info',
    'Em Andamento':         'success',
    'Aguardando Pagamento': 'purple',
    'Finalizada':           'default',
    'Cancelada':            'danger',
    'No-Show':              'danger',
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-24">
        <h2 className="text-xl font-bold text-slate-800">📅 Minhas Reservas</h2>

        <TabBar
          tabs={[
            { id: 'ativas',    label: `Ativas (${ativas.length})`    },
            { id: 'historico', label: `Histórico (${historico.length})` },
          ]}
          active={tab}
          onChange={setTab}
        />

        {lista.length === 0 ? (
          <Card className="p-10 text-center text-slate-400">
            {tab === 'ativas' ? 'Nenhuma reserva ativa' : 'Nenhum histórico ainda'}
          </Card>
        ) : (
          lista.map(item => {
            // ── Card de reserva ────────────────────────────────────────────
            if (item._tipo === 'reserva') {
              const recurso = getRecurso(item.recursoId)
              const modulo  = getModulo(item.recursoId)
              return (
                <Card key={'r' + item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{modulo?.icone}</span>
                      <div>
                        <h4 className="font-semibold text-slate-800">{recurso?.nome}</h4>
                        <p className="text-sm text-slate-500">{modulo?.nome}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant[item.status] || 'default'}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Data:</span>
                      <span className="font-medium">{formatDateBR(item.data)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Horário:</span>
                      <span className="font-medium">{item.horaInicio} – {item.horaFim}</span>
                    </div>
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

            // ── Card de fila ───────────────────────────────────────────────
            const modulo  = modulos.find(m => m.id === item.moduloId)
            const recurso = item.recursoId ? recursos.find(r => r.id === item.recursoId) : null
            const posicao = filas
              .filter(f => f.moduloId === item.moduloId && f.status === 'Aguardando')
              .sort((a, b) => new Date(a.entradaEm) - new Date(b.entradaEm))
              .findIndex(f => f.id === item.id) + 1

            return (
              <Card key={'f' + item.id} className="p-4 border-l-4 border-l-purple-400 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">
                      {posicao}º
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{modulo?.icone} {modulo?.nome}</h4>
                      <p className="text-sm text-slate-500">{recurso?.nome || 'Qualquer quadra'}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'Aguardando' ? 'purple' : 'default'}>
                    {item.status === 'Aguardando' ? 'Na fila' : item.status}
                  </Badge>
                </div>

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
