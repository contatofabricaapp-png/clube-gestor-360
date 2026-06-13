// QuadraRadioCard — substitui <select> na ReservaPage
// Props: recurso, statusReal, selected, disabled, onClick

const STATUS_COLOR = {
  Livre:       { dot: 'bg-emerald-500', label: 'Livre',        bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Ocupada:     { dot: 'bg-blue-500',    label: 'Ocupada',      bg: 'bg-blue-50',    text: 'text-blue-700'    },
  Manutencao:  { dot: 'bg-amber-400',   label: 'Manutenção',   bg: 'bg-amber-50',   text: 'text-amber-700'   },
  Interditada: { dot: 'bg-red-500',     label: 'Interditada',  bg: 'bg-red-50',     text: 'text-red-700'     },
  Limpeza:     { dot: 'bg-slate-400',   label: 'Limpeza',      bg: 'bg-slate-100',  text: 'text-slate-600'   },
  Reservada:   { dot: 'bg-purple-500',  label: 'Reservada',    bg: 'bg-purple-50',  text: 'text-purple-700'  },
}

export default function QuadraRadioCard({ recurso, statusReal, selected, disabled, onClick, aulasHoje = [] }) {
  const s = STATUS_COLOR[statusReal?.status] ?? STATUS_COLOR['Livre']
  const livre = statusReal?.status === 'Livre'

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={`
        w-full text-left rounded-2xl border-2 p-4 transition-all duration-150
        ${disabled
          ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
          : selected
            ? 'border-teal-500 bg-teal-50 shadow-md'
            : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm cursor-pointer'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Nome + módulo */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{recurso.nome}</p>
          {aulasHoje.length > 0 && (
            <p className="text-xs text-purple-600 mt-0.5 truncate">
              📚 Aula: {aulasHoje.map(a => `${a.horaInicio}-${a.horaFim}`).join(', ')}
            </p>
          )}
        </div>

        {/* Badge de status */}
        <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      {/* Motivo (se houver) */}
      {statusReal?.motivo && (
        <p className="text-xs text-slate-400 mt-1.5 truncate">{statusReal.motivo}</p>
      )}

      {/* Indicador de seleção */}
      {!disabled && (
        <div className={`mt-3 flex items-center gap-2 text-xs font-medium ${
          selected ? 'text-teal-700' : 'text-slate-400'
        }`}>
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            selected ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
          }`}>
            {selected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
          </span>
          {selected ? 'Selecionada' : livre ? 'Selecionar' : 'Indisponível'}
        </div>
      )}
    </button>
  )
}
