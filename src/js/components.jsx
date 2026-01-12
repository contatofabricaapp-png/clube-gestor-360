/* =============================================
   CLUBE GESTOR 360 - COMPONENTES DE UI
   
   Componentes reutilizáveis:
   - Card, Button, Badge, Toggle
   - Input, Select, Textarea
   - Modal, TabBar, Notification
   - StatusRecursoBadge, StatusReservaBadge
   - Header, BottomNav
   ============================================= */

// Usa React do window (carregado via CDN)
const { useState, useEffect } = React;

// =============================================
// COMPONENTES BASE
// =============================================

const Card = ({ children, className = '', onClick }) => (
    <div 
        className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`} 
        onClick={onClick}
    >
        {children}
    </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const variants = {
        primary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        ghost: 'hover:bg-slate-100 text-slate-600',
        purple: 'bg-purple-500 hover:bg-purple-600 text-white',
        blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base'
    };
    return (
        <button 
            className={`font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, variant = 'default', size = 'md' }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        blue: 'bg-blue-100 text-blue-700',
        amber: 'bg-amber-100 text-amber-700',
        red: 'bg-red-100 text-red-700',
        slate: 'bg-slate-200 text-slate-600'
    };
    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs'
    };
    return (
        <span className={`font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)} 
                className="sr-only" 
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-6' : ''}`} />
            </div>
        </div>
        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </label>
);

// =============================================
// INPUTS
// =============================================

const Input = ({ label, error, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <input 
            className={`w-full px-4 py-2.5 rounded-xl border ${error ? 'border-red-300' : 'border-slate-200'} focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800`} 
            {...props} 
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
);

const Select = ({ label, options, ...props }) => (
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
);

const Textarea = ({ label, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
        <textarea 
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-800 resize-none" 
            rows={3} 
            {...props} 
        />
    </div>
);

// =============================================
// MODAL E OVERLAYS
// =============================================

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden animate-modal-in`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const TabBar = ({ tabs, active, onChange }) => (
    <div className="flex bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
            <button 
                key={tab.id} 
                onClick={() => onChange(tab.id)} 
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    active === tab.id 
                        ? 'bg-white text-teal-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                }`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);
    
    const colors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    return (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl text-white font-medium shadow-lg animate-slide-down ${colors[type] || colors.info}`}>
            {message}
        </div>
    );
};

// =============================================
// BADGES DE STATUS
// =============================================

const StatusRecursoBadge = ({ status, size = 'md' }) => {
    const { STATUS_RECURSOS } = window.ClubeGestor;
    const cfg = STATUS_RECURSOS[status] || STATUS_RECURSOS['Livre'];
    return <Badge variant={cfg.cor} size={size}>{cfg.icone} {cfg.label}</Badge>;
};

const StatusReservaBadge = ({ status }) => {
    const config = {
        'Pendente': { variant: 'warning', label: 'Aguardando Check-in' },
        'Confirmada': { variant: 'info', label: 'Confirmada' },
        'Em Andamento': { variant: 'success', label: 'Em Andamento' },
        'Finalizada': { variant: 'default', label: 'Finalizada' },
        'Cancelada': { variant: 'danger', label: 'Cancelada' },
        'No-Show': { variant: 'danger', label: 'No-Show' },
        'Aguardando Pagamento': { variant: 'purple', label: 'Aguardando Pagamento' },
    };
    const { variant, label } = config[status] || { variant: 'default', label: status };
    return <Badge variant={variant}>{label}</Badge>;
};

// =============================================
// HEADER E NAVEGAÇÃO
// =============================================

const Header = ({ user, onLogout }) => (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    C
                </div>
                <div>
                    <h1 className="font-bold text-slate-800 leading-tight">Clube Gestor 360</h1>
                    <p className="text-xs text-slate-500">{user.nome}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={user.role === 'Admin' ? 'purple' : user.role === 'Funcionario' ? 'info' : 'success'}>
                    {user.role}
                </Badge>
                <button 
                    onClick={onLogout} 
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500" 
                    title="Sair"
                >
                    🚪
                </button>
            </div>
        </div>
    </header>
);

const BottomNav = ({ view, onNavigate, role }) => {
    const items = [
        { id: 'home', icon: '🏠', label: 'Início' },
        { id: 'reservas', icon: '📅', label: 'Minhas Reservas' },
        { id: 'fila', icon: '⏳', label: 'Fila' },
        ...(role !== 'Socio' ? [{ id: 'lousa', icon: '📋', label: 'Lousa' }] : []),
        ...(role === 'Admin' || role === 'Funcionario' ? [{ id: 'config', icon: '⚙️', label: 'Config' }] : []),
    ];
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-40">
            <div className="flex justify-around py-2">
                {items.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => onNavigate(item.id)} 
                        className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors ${
                            view === item.id 
                                ? 'text-teal-600' 
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

// Exporta para window
window.ClubeGestor = window.ClubeGestor || {};
Object.assign(window.ClubeGestor, {
    Card,
    Button,
    Badge,
    Toggle,
    Input,
    Select,
    Textarea,
    Modal,
    TabBar,
    Notification,
    StatusRecursoBadge,
    StatusReservaBadge,
    Header,
    BottomNav
});
