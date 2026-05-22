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

  const { modulos, recursos, aulas, reservas, config } = state

  const modulosAtivos = modulos.filter(m => m.ativo)

  const getStats = (moduloId) => {
    const recs = recursos.filter(r => r.moduloId === moduloId)
    const livres = recs.filter(r => getStatusEmTempoReal(r, aulas, reservas).status === 'Livre').length
    return { total: recs.length, livres }
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
            const { total, livres } = getStats(modulo.id)
            return (
              <Card
                key={modulo.id}
                className={`p-4 text-center ${estaBloqueado ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={estaBloqueado ? undefined : () => navigate(`/socio/reserva/${modulo.id}`)}
              >
                <span className="text-4xl mb-2 block">{modulo.icone}</span>
                <h3 className="font-semibold text-slate-800 text-sm">{modulo.nome}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}
                </p>

                {total > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className={`w-2 h-2 rounded-full ${livres > 0 ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    <span className="text-xs text-slate-500">{livres}/{total} livres</span>
                  </div>
                )}

                {modulo.fila_habilitada && (
                  <div className="mt-2">
                    <Badge variant="purple" size="sm">⏳ Fila disponível</Badge>
                  </div>
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
