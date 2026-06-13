import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { useNotificacaoPush } from '../../hooks/useNotificacaoPush.js'
import { Card, Button, Badge, EmptyState } from '../../components/ui/index.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import { calcularPrevisaoFila } from '../../lib/utils.js'

export default function FilaPage() {
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const { filas, modulos, recursos, reservas } = state
  const { permissao, solicitarPermissao, notificarLocal } = useNotificacaoPush()
  const jaNotificou = useRef(new Set())

  const usuarioStore = state.usuarios.find(u => u.matricula === user?.matricula)
  const minhaFila = filas.filter(f => f.usuarioId === usuarioStore?.id && f.status === 'Aguardando')

  // Notifica quando o sócio chega à primeira posição
  useEffect(() => {
    minhaFila.forEach(f => {
      const posicao = getPosicao(f)
      if (posicao === 1 && !jaNotificou.current.has(f.id)) {
        jaNotificou.current.add(f.id)
        notificarLocal('Sua vez chegou! 🎾', 'Dirija-se à quadra agora.')
      }
    })
  }, [filas])

  const getPosicao = (f) =>
    filas
      .filter(x => x.moduloId === f.moduloId && x.status === 'Aguardando')
      .sort((a, b) => new Date(a.entradaEm) - new Date(b.entradaEm))
      .findIndex(x => x.id === f.id) + 1

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">⏳ Fila de Espera</h2>
          {permissao === 'default' && (
            <button
              onClick={solicitarPermissao}
              className="text-xs px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors"
            >
              🔔 Ativar alertas
            </button>
          )}
          {permissao === 'granted' && (
            <span className="text-xs text-emerald-600 font-medium">🔔 Alertas ativos</span>
          )}
        </div>

        {minhaFila.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="Você não está em nenhuma fila"
            description="Faça check-in em um módulo para entrar na fila de espera."
            actionLabel="Ir ao início"
            onAction={() => navigate('/socio')}
          />
        ) : (
          minhaFila.map(f => {
            const modulo  = modulos.find(m => m.id === f.moduloId)
            const recurso = f.recursoId ? recursos.find(r => r.id === f.recursoId) : null
            const posicao = getPosicao(f)
            const totalNaFila = filas.filter(x => x.moduloId === f.moduloId && x.status === 'Aguardando').length
            const duracaoMin  = typeof modulo?.duracao === 'number' ? modulo.duracao + 5 : 65
            const previsao    = calcularPrevisaoFila(f.moduloId, posicao, reservas, recursos, duracaoMin)
            const ehPrimeiro  = posicao === 1

            return (
              <Card key={f.id} className="p-4 border-l-4 border-l-purple-400 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Badge de posição — pulsa quando é o 1º */}
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                      ehPrimeiro
                        ? 'bg-emerald-100 ring-2 ring-emerald-400 ring-offset-2 animate-pulse'
                        : 'bg-purple-100'
                    }`}>
                      <span className={`text-2xl font-bold ${ehPrimeiro ? 'text-emerald-700' : 'text-purple-700'}`}>
                        {posicao}º
                      </span>
                      <span className={`text-xs ${ehPrimeiro ? 'text-emerald-500' : 'text-purple-500'}`}>lugar</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{modulo?.icone} {modulo?.nome}</h3>
                      <p className="text-sm text-slate-500">{recurso?.nome || 'Qualquer quadra'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{totalNaFila} pessoa{totalNaFila !== 1 ? 's' : ''} na fila</p>
                    </div>
                  </div>
                  <Badge variant={ehPrimeiro ? 'success' : 'purple'}>
                    {ehPrimeiro ? 'Sua vez!' : 'Aguardando'}
                  </Badge>
                </div>

                {ehPrimeiro ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-emerald-700 font-semibold text-sm">
                      🎯 Você é o próximo! Aguarde ser chamado pelo funcionário.
                    </p>
                  </div>
                ) : previsao ? (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-teal-600 text-xs">Previsão de chamada</p>
                      <p className="text-teal-700 font-bold text-lg">{previsao}</p>
                    </div>
                    <span className="text-2xl">⏱️</span>
                  </div>
                ) : null}

                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => dispatch({ type: 'SAIR_FILA', payload: { filaId: f.id } })}
                >
                  Sair da fila
                </Button>
              </Card>
            )
          })
        )}
      </main>

      <BottomNav />
    </div>
  )
}
