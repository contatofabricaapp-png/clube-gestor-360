import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useStore } from '../../store/useStore.jsx'
import { Card, Badge } from '../../components/ui/index.jsx'
import Header from '../../components/layout/Header.jsx'
import BottomNav from '../../components/layout/BottomNav.jsx'
import { getStatusEmTempoReal, formatDateBR } from '../../lib/utils.js'

export default function SocioHome() {
  const { user } = useAuth()
  const { state } = useStore()
  const navigate = useNavigate()

  const { modulos, recursos, aulas, reservas, filas, config } = state

  const modulosAtivos = modulos.filter(m => m.ativo)

  const getFilaCount = (moduloId) =>
    filas.filter(f => f.moduloId === moduloId && f.status === 'Aguardando').length

  const getStats = (moduloId) => {
    const recs = recursos.filter(r => r.moduloId === moduloId)
    const statuses = recs.map(r => ({ recurso: r, real: getStatusEmTempoReal(r, aulas, reservas) }))
    const livres = statuses.filter(s => s.real.status === 'Livre').length

    // Detecta se TODAS estão indisponíveis por status manual (não por reserva/aula)
    const naoLivres = statuses.filter(s => s.real.status !== 'Livre')
    const todasBloqueadas = livres === 0 && recs.length > 0 &&
      naoLivres.every(s => ['Manutencao', 'Interditada', 'Limpeza'].includes(s.real.status))

    const statusBloqueio = todasBloqueadas
      ? (naoLivres.some(s => s.real.status === 'Interditada') ? 'Interditada' :
         naoLivres.some(s => s.real.status === 'Manutencao')  ? 'Manutencao'  : 'Limpeza')
      : null
    const motivoBloqueio = todasBloqueadas
      ? (naoLivres.find(s => s.real.motivo)?.real.motivo ?? null)
      : null

    return { total: recs.length, livres, todasBloqueadas, statusBloqueio, motivoBloqueio }
  }

  // Busca dados atualizados do usuário logado no store (pode ter sido bloqueado)
  const usuarioAtual = state.usuarios.find(u => u.matricula === user?.matricula) || user
  const estaBloqueado = usuarioAtual.bloqueado_ate && new Date(usuarioAtual.bloqueado_ate) > new Date()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 space-y-4 pb-24">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Olá, {usuarioAtual.nome?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 text-sm">O que você quer fazer hoje?</p>
        </div>

        {/* Aviso: conta bloqueada */}
        {estaBloqueado && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚫</span>
              <div>
                <p className="font-semibold text-red-800">Conta Bloqueada</p>
                <p className="text-sm text-red-600">
                  Você está bloqueado até {formatDateBR(usuarioAtual.bloqueado_ate)} devido a {config.punicao_noshow_limite} no-shows.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Aviso: no-shows acumulados */}
        {!estaBloqueado && usuarioAtual.noshow_count > 0 && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">Atenção</p>
                <p className="text-sm text-amber-600">
                  Você tem {usuarioAtual.noshow_count}/{config.punicao_noshow_limite} no-shows.
                  Mais {config.punicao_noshow_limite - usuarioAtual.noshow_count} e será bloqueado por {config.punicao_dias_bloqueio} dias.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Grid de módulos */}
        <div className="grid grid-cols-2 gap-3">
          {modulosAtivos.map(modulo => {
            const { total, livres, todasBloqueadas, statusBloqueio, motivoBloqueio } = getStats(modulo.id)
            const naFila = getFilaCount(modulo.id)

            const corBloqueio = statusBloqueio === 'Interditada' ? 'red'
              : statusBloqueio === 'Manutencao' ? 'amber' : 'slate'
            const iconeBloqueio = statusBloqueio === 'Interditada' ? '🔴'
              : statusBloqueio === 'Manutencao' ? '🟡' : '⚪'
            const labelBloqueio = statusBloqueio === 'Interditada' ? 'Interditado'
              : statusBloqueio === 'Manutencao' ? 'Em Manutenção' : 'Em Limpeza'

            return (
              <Card
                key={modulo.id}
                className={`p-4 text-center overflow-hidden ${
                  estaBloqueado || todasBloqueadas ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                onClick={estaBloqueado || todasBloqueadas ? undefined : () => navigate(`/socio/reserva/${modulo.id}`)}
              >
                <span className={`text-4xl mb-2 block ${todasBloqueadas ? 'grayscale opacity-60' : ''}`}>
                  {modulo.icone}
                </span>
                <h3 className="font-semibold text-slate-800 text-sm">{modulo.nome}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}
                </p>

                {todasBloqueadas ? (
                  <div className={`mt-2 rounded-lg px-2 py-1.5 ${
                    corBloqueio === 'red'   ? 'bg-red-50'   :
                    corBloqueio === 'amber' ? 'bg-amber-50' : 'bg-slate-100'
                  }`}>
                    <p className={`text-xs font-semibold ${
                      corBloqueio === 'red'   ? 'text-red-700'   :
                      corBloqueio === 'amber' ? 'text-amber-700' : 'text-slate-600'
                    }`}>
                      {iconeBloqueio} {labelBloqueio}
                    </p>
                    {motivoBloqueio && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate" title={motivoBloqueio}>
                        {motivoBloqueio}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {total > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <span className={`w-2 h-2 rounded-full ${livres > 0 ? 'bg-emerald-500' : 'bg-red-400'}`} />
                        <span className="text-xs text-slate-500">{livres}/{total} livres</span>
                      </div>
                    )}
                    {naFila > 0 && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xs text-purple-500">⏳ {naFila} na fila</span>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )
          })}
        </div>

      </main>

      <BottomNav />
    </div>
  )
}
