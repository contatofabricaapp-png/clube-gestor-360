/* =============================================
   CLUBE GESTOR 360 - TELAS
   
   Telas principais:
   - TelaLogin
   - HomeSocio
   - TelaReserva
   - MinhasReservas
   - TelaEntrarFila
   - TelaFilaEspera
   - LousaDigital
   - PainelConfig
   ============================================= */

const { useState, useEffect } = React;

// Importa do namespace global
const {
    // Config
    STATUS_RECURSOS, TEMPO_AQUECIMENTO, TEMPO_EXTENSAO, DIAS_SEMANA,
    // Utils
    formatDate, hoje, formatDateBR, formatarTempo, gerarHorarios,
    getHoraAtualArredondada, getHoraAtualExata, calcularHoraFim,
    addDays, temConflitoHorario, formatDiasSemana, getStatusEmTempoReal,
    // Components
    Card, Button, Badge, Toggle, Input, Select, Textarea,
    Modal, TabBar, Notification, StatusRecursoBadge, StatusReservaBadge,
    Header, BottomNav
} = window.ClubeGestor;

// =============================================
// TELA DE LOGIN
// =============================================
const TelaLogin = ({ usuarios, onLogin }) => {
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const handleLogin = () => {
        const user = usuarios.find(u => 
            u.matricula.toLowerCase() === matricula.toLowerCase() && u.senha === senha
        );
        if (user) {
            if (user.status === 'Cancelado') {
                setErro('Acesso revogado. Contate a administração.');
                return;
            }
            if (user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date()) {
                setErro(`Usuário bloqueado até ${formatDateBR(user.bloqueado_ate)}`);
                return;
            }
            onLogin(user);
        } else {
            setErro('Matrícula ou senha inválidos');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                        C
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Clube Gestor 360</h1>
                    <p className="text-sm text-slate-500">Entre com sua matrícula</p>
                </div>
                
                <div className="space-y-4">
                    <Input 
                        label="Matrícula" 
                        placeholder="Ex: SOC001" 
                        value={matricula} 
                        onChange={(e) => { setMatricula(e.target.value.toUpperCase()); setErro(''); }} 
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
                    />
                    <Input 
                        type="password" 
                        label="Senha" 
                        placeholder="••••" 
                        value={senha} 
                        onChange={(e) => { setSenha(e.target.value); setErro(''); }} 
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
                    />
                    
                    {erro && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm text-center">{erro}</p>
                        </div>
                    )}
                    
                    <Button className="w-full" onClick={handleLogin}>Entrar</Button>
                </div>
                
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 text-center mb-2 font-semibold">
                        🔑 Usuários de demonstração:
                    </p>
                    <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                            <span><strong>ADM001</strong></span>
                            <span className="text-purple-600">Admin</span>
                        </div>
                        <div className="flex justify-between">
                            <span><strong>FUNC001</strong></span>
                            <span className="text-blue-600">Funcionário</span>
                        </div>
                        <div className="flex justify-between">
                            <span><strong>SOC001 a SOC005</strong></span>
                            <span className="text-emerald-600">Sócios</span>
                        </div>
                        <p className="text-slate-400 text-center pt-2">
                            Senha para todos: <strong>1234</strong>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// =============================================
// HOME DO SÓCIO
// =============================================
const HomeSocio = ({ modulos, recursos, aulas, reservas, user, config, onSelectModulo }) => {
    const modulosAtivos = modulos.filter(m => m.ativo);
    
    const getStats = (moduloId) => {
        const recs = recursos.filter(r => r.moduloId === moduloId);
        const livres = recs.filter(r => {
            const status = getStatusEmTempoReal(r, aulas, reservas);
            return status.status === 'Livre';
        }).length;
        return { total: recs.length, livres };
    };
    
    const estaBloqueado = user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date();

    return (
        <div className="p-4 space-y-4 pb-24">
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    Olá, {user.nome.split(' ')[0]}! 👋
                </h2>
                <p className="text-slate-500">O que você quer fazer hoje?</p>
            </div>
            
            {estaBloqueado && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚫</span>
                        <div>
                            <p className="font-semibold text-red-800">Conta Bloqueada</p>
                            <p className="text-sm text-red-600">
                                Você está bloqueado até {formatDateBR(user.bloqueado_ate)} devido a {config.punicao_noshow_limite} no-shows.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
            
            {!estaBloqueado && user.noshow_count > 0 && (
                <Card className="p-4 bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-semibold text-amber-800">Atenção</p>
                            <p className="text-sm text-amber-600">
                                Você tem {user.noshow_count}/{config.punicao_noshow_limite} no-shows. 
                                Mais {config.punicao_noshow_limite - user.noshow_count} e será bloqueado por {config.punicao_dias_bloqueio} dias.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
            
            <div className="grid grid-cols-2 gap-3">
                {modulosAtivos.map(modulo => {
                    const { total, livres } = getStats(modulo.id);
                    return (
                        <Card 
                            key={modulo.id} 
                            className={`p-4 text-center ${estaBloqueado ? 'opacity-50' : ''}`} 
                            onClick={estaBloqueado ? undefined : () => onSelectModulo(modulo)}
                        >
                            <span className="text-4xl mb-2 block">{modulo.icone}</span>
                            <h3 className="font-semibold text-slate-800">{modulo.nome}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}
                            </p>
                            <div className="flex items-center justify-center gap-1 mt-2">
                                <span className={`w-2 h-2 rounded-full ${livres > 0 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse-dot`}></span>
                                <span className="text-xs text-slate-500">{livres}/{total} livres</span>
                            </div>
                            {modulo.fila_habilitada && (
                                <div className="mt-2">
                                    <Badge variant="purple" size="sm">⏳ Fila disponível</Badge>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

// ... [As outras telas seguem o mesmo padrão]
// TelaReserva, MinhasReservas, TelaEntrarFila, TelaFilaEspera, LousaDigital, PainelConfig

// Exporta para window
window.ClubeGestor = window.ClubeGestor || {};
Object.assign(window.ClubeGestor, {
    TelaLogin,
    HomeSocio,
    // TelaReserva,
    // MinhasReservas,
    // TelaEntrarFila,
    // TelaFilaEspera,
    // LousaDigital,
    // PainelConfig
});
