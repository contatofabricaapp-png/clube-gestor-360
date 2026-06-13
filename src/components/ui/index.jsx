import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
)

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary:   'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    danger:    'bg-red-500 hover:bg-red-600 text-white',
    success:   'bg-emerald-500 hover:bg-emerald-600 text-white',
    warning:   'bg-amber-500 hover:bg-amber-600 text-white',
    ghost:     'hover:bg-slate-100 text-slate-600',
    purple:    'bg-purple-500 hover:bg-purple-600 text-white',
    blue:      'bg-blue-500 hover:bg-blue-600 text-white',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      className={`font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger:  'bg-red-100 text-red-700',
    info:    'bg-blue-100 text-blue-700',
    purple:  'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue:    'bg-blue-100 text-blue-700',
    amber:   'bg-amber-100 text-amber-700',
    red:     'bg-red-100 text-red-700',
    slate:   'bg-slate-200 text-slate-600',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }
  return (
    <span className={`font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

export const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </div>
    </div>
    {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
  </label>
)

export const TabBar = ({ tabs, active, onChange }) => (
  <div className="flex bg-slate-100 rounded-xl p-1 overflow-x-auto">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
          active === tab.id ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

export const Notification = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error:   'bg-red-500',
    info:    'bg-blue-500',
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl text-white font-medium shadow-lg animate-slide-down ${colors[type]}`}>
      {message}
    </div>
  )
}

// ── ProgressSteps ────────────────────────────────────────────────────────────
// Uso: <ProgressSteps steps={['Quadra','Horário','Pagamento','Confirmar']} current={1} />
export const ProgressSteps = ({ steps, current }) => (
  <div className="flex items-center w-full px-1">
    {steps.map((label, i) => {
      const done    = i < current
      const active  = i === current
      const future  = i > current
      return (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              done   ? 'bg-emerald-500 text-white' :
              active ? 'bg-teal-600 text-white ring-4 ring-teal-100' :
                       'bg-slate-200 text-slate-400'
            }`}>
              {done ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${
              active ? 'text-teal-700' : done ? 'text-emerald-600' : 'text-slate-400'
            }`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </div>
      )
    })}
  </div>
)

// ── EmptyState ───────────────────────────────────────────────────────────────
// Uso: <EmptyState icon="📅" title="Nenhuma reserva" description="..." actionLabel="Reservar" actionPath="/socio" />
export const EmptyState = ({ icon = '📭', title, description, actionLabel, actionPath, onAction }) => {
  const navigate = useNavigate()
  const handleAction = onAction ?? (actionPath ? () => navigate(actionPath) : null)
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="text-5xl mb-3">{icon}</span>
      <p className="font-semibold text-slate-700 text-base">{title}</p>
      {description && <p className="text-slate-400 text-sm mt-1 max-w-xs">{description}</p>}
      {actionLabel && handleAction && (
        <button
          onClick={handleAction}
          className="mt-4 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
// Uso: <SectionHeader title="Quadras" count={3} action={{ label: '+ Nova', onClick: fn }} />
export const SectionHeader = ({ title, count, action }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-2">
      <h3 className="font-bold text-slate-700 text-sm">{title}</h3>
      {count != null && (
        <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
)
