export const Input = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-red-300' : 'border-slate-200'} focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800`}
      {...props}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
)

export const Select = ({ label, options = [], ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <select
      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 bg-white"
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

export const Textarea = ({ label, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <textarea
      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 resize-none"
      rows={3}
      {...props}
    />
  </div>
)
