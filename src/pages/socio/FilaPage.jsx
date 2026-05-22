import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { Card, Button, Badge } from '../../components/ui/index.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'

export default function FilaPage() {
  const { user } = useAuth()
  const { state, dispatch } = useStore()
  const { filas, modulos, recursos } = state

  const usuarioStore = state.usuarios.find(u => u.matricula === user?.matricula)
  const minhaFila = filas.filter(f => f.usuarioId === usuarioStore?.id && f.status === 'Aguardando')

  const getPosicao = (f) =>
    filas
      .filter(x => x.moduloId === f.moduloId && x.status === 'Aguardando')
      .sort((a, b) => new Date(a.entradaEm) - new Date(b.entradaEm))
      .findIndex(x => x.id === f.id) + 1

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-24">
        <h2 className="text-xl font-bold text-slate-800">⏳ Fila de Espera</h2>

        {minhaFila.length === 0 ? (
          <Card className="p-10 text-center space-y-2">
            <p className="text-3xl">🎉</p>
            <p className="text-slate-500 font-medium">Você não está em nenhuma fila</p>
            <p className="text-slate-400 text-sm">Faça check-in em um módulo para entrar na fila</p>
          </Card>
        ) : (
          minhaFila.map(f => {
            const modulo  = modulos.find(m => m.id === f.moduloId)
            const recurso = f.recursoId ? recursos.find(r => r.id === f.recursoId) : null
            const posicao = getPosicao(f)
            const totalNaFila = filas.filter(x => x.moduloId === f.moduloId && x.status === 'Aguardando').length

            return (
              <Card key={f.id} className="p-4 border-l-4 border-l-purple-400 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-purple-700">{posicao}º</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{modulo?.icone} {modulo?.nome}</h3>
                      <p className="text-sm text-slate-500">{recurso?.nome || 'Qualquer quadra'}</p>
                      <p className="text-xs text-slate-400">{totalNaFila} pessoa(s) na fila</p>
                    </div>
                  </div>
                  <Badge variant="purple">Aguardando</Badge>
                </div>

                {posicao === 1 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-emerald-700 font-semibold text-sm">
                      🎯 Você é o próximo! Aguarde ser chamado pelo funcionário.
                    </p>
                  </div>
                )}

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
