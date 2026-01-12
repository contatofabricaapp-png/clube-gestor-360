/* =============================================
   CLUBE GESTOR 360 - TELAS
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

// =============================================
// TELA RESERVA / CHECK-IN
// =============================================
const TelaReserva = ({ modulo, recursos, reservas, aulas, user, config, onReservar, onVoltar, onEntrarFila }) => {
    const [recursoId, setRecursoId] = useState('');
    const [data, setData] = useState(hoje());
    const [horario, setHorario] = useState('');
    const [comprovante, setComprovante] = useState(null);
    const [step, setStep] = useState('selecao'); // selecao, horario, pagamento, confirmar

    const recursosDoModulo = recursos.filter(r => r.moduloId === modulo.id);
    const recursoSelecionado = recursosDoModulo.find(r => r.id === parseInt(recursoId));
    
    // Opções para o Select - mostra status de cada quadra
    const opcoesRecursos = recursosDoModulo.map(r => {
        const statusReal = getStatusEmTempoReal(r, aulas, reservas);
        
        // Função auxiliar para buscar aulas do dia para este recurso
        const diaSemana = new Date().getDay();
        const aulasHoje = aulas.filter(a => a.recursoId === r.id && a.status === 'ativo' && a.diasSemana.includes(diaSemana));

        let sufixo = '';
        if (statusReal.status !== 'Livre') sufixo = ` (${statusReal.status})`;
        else if (aulasHoje.length > 0) sufixo = ` (Aula: ${aulasHoje.map(a => a.horaInicio + '-' + a.horaFim).join(', ')})`;
        
        return { value: r.id, label: r.nome + sufixo, disabled: statusReal.status !== 'Livre' };
    });

    // Função auxiliar para buscar aulas do dia para o recurso selecionado
    const getAulasHojeSelecionado = () => {
        if (!recursoSelecionado) return [];
        const diaSemana = new Date().getDay();
        return aulas.filter(a => a.recursoId === recursoSelecionado.id && a.status === 'ativo' && a.diasSemana.includes(diaSemana));
    };

    // Horários disponíveis (exclui conflitos com reservas e aulas)
    const horariosDisponiveis = recursoSelecionado ? gerarHorarios().filter(h => {
        const duracao = typeof modulo.duracao === 'number' ? modulo.duracao + TEMPO_AQUECIMENTO : 480;
        const hFim = calcularHoraFim(h, duracao);
        if (parseInt(hFim.split(':')[0]) > 22) return false;
        
        // Conflito com reservas
        const conflReserva = reservas.some(r => 
            r.recursoId === recursoSelecionado.id && 
            r.data === data && 
            !['Cancelada', 'No-Show', 'Finalizada'].includes(r.status) && 
            temConflitoHorario(h, hFim, r.horaInicio, r.horaFim)
        );
        if (conflReserva) return false;
        
        // Conflito com aulas
        const dt = new Date(data + 'T12:00:00');
        const diaSemana = dt.getDay();
        const conflAula = aulas.some(a => 
            a.recursoId === recursoSelecionado.id && 
            a.status === 'ativo' && 
            a.diasSemana.includes(diaSemana) && 
            temConflitoHorario(h, hFim, a.horaInicio, a.horaFim)
        );
        return !conflAula;
    }) : [];

    const handleConfirmar = () => {
        const duracao = typeof modulo.duracao === 'number' ? modulo.duracao + TEMPO_AQUECIMENTO : 480;
        onReservar({
            id: Date.now(), 
            recursoId: parseInt(recursoId), 
            usuarioId: user.id, 
            data, 
            horaInicio: horario, 
            horaFim: calcularHoraFim(horario, duracao),
            status: modulo.gratuito ? 'Pendente' : 'Aguardando Pagamento', 
            comprovante_url: comprovante, 
            valor: modulo.valor, 
            iniciadaEm: null, 
            duracaoTotal: duracao, 
            criadaEm: new Date().toISOString()
        });
    };

    // Check-in: entra direto na fila
    const handleCheckin = () => {
        if (!recursoId) return;
        onEntrarFila({
            id: Date.now(), 
            moduloId: modulo.id, 
            recursoId: parseInt(recursoId), 
            usuarioId: user.id, 
            data: hoje(), 
            horario: getHoraAtualExata(), // Usando hora exata do utils
            criadoEm: new Date().toISOString(), 
            status: 'Aguardando', 
            tipoEntrada: 'checkin'
        });
    };

    return (
        <div className="p-4 space-y-4 pb-24">
            <button onClick={onVoltar} className="flex items-center gap-2 text-slate-600 font-medium">← Voltar</button>
            <div className="flex items-center gap-3">
                <span className="text-3xl">{modulo.icone}</span>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{modulo.nome}</h2>
                    <p className="text-sm text-slate-500">{modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`} • {typeof modulo.duracao === 'number' ? `${modulo.duracao}min` : modulo.duracao}</p>
                </div>
            </div>

            {step === 'selecao' && (
                <div className="space-y-4">
                    {/* SELECT PARA QUADRA */}
                    <Select 
                        label="Selecione a quadra:" 
                        options={[{ value: '', label: 'Escolha uma quadra...' }, ...opcoesRecursos]}
                        value={recursoId}
                        onChange={e => setRecursoId(e.target.value)}
                    />

                    {/* Mostra aulas programadas para hoje se houver */}
                    {recursoSelecionado && getAulasHojeSelecionado().length > 0 && (
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                            <p className="text-sm font-medium text-purple-800">📚 Aulas hoje nesta quadra:</p>
                            {getAulasHojeSelecionado().map(a => (
                                <p key={a.id} className="text-sm text-purple-600">{a.horaInicio}-{a.horaFim}: {a.nome} ({a.professor})</p>
                            ))}
                        </div>
                    )}

                    {/* Botões de ação */}
                    {modulo.fila_habilitada && modulo.tipo_fila === 'checkin' ? (
                        <div className="space-y-3">
                            <Card className="p-4 bg-teal-50 border border-teal-200">
                                <h4 className="font-semibold text-teal-800 mb-2">📍 Check-in Presencial</h4>
                                <p className="text-sm text-teal-600 mb-3">Você entra na fila e aguarda ser chamado.</p>
                                <Button className="w-full" disabled={!recursoId} onClick={handleCheckin}>Fazer Check-in</Button>
                            </Card>
                            <div className="text-center text-slate-400 text-sm">ou</div>
                            <Button variant="secondary" className="w-full" disabled={!recursoId} onClick={() => setStep('horario')}>Agendar Horário Específico</Button>
                        </div>
                    ) : (
                        <Button className="w-full" disabled={!recursoId} onClick={() => setStep('horario')}>Continuar</Button>
                    )}
                </div>
            )}

            {step === 'horario' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 font-medium">{recursoSelecionado?.nome}</p>
                    <Input type="date" label="Data:" value={data} onChange={e => setData(e.target.value)} min={hoje()} />
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">Horário:</label>
                        {horariosDisponiveis.length === 0 ? (
                            <p className="text-amber-600 p-4 bg-amber-50 rounded-xl text-center">Sem horários disponíveis.</p>
                        ) : (
                            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                {horariosDisponiveis.map(h => (
                                    <button key={h} onClick={() => setHorario(h)} className={`p-2 rounded-xl text-sm font-medium ${horario === h ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-700'}`}>{h}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setStep('selecao')}>Voltar</Button>
                        <Button className="flex-1" disabled={!horario} onClick={() => setStep(modulo.gratuito ? 'confirmar' : 'pagamento')}>Continuar</Button>
                    </div>
                </div>
            )}

            {step === 'pagamento' && (
                <div className="space-y-4">
                    <Card className="p-4 bg-slate-50"><p className="text-sm text-slate-500">Valor:</p><p className="text-3xl font-bold">R$ {modulo.valor},00</p></Card>
                    <Card className="p-4"><p className="text-sm text-slate-500 mb-2">Chave PIX ({config.pix_tipo}):</p><code className="bg-slate-100 px-3 py-2 rounded-lg text-sm block">{config.pix_chave}</code></Card>
                    <div><label className="text-sm font-medium text-slate-700 block mb-2">Comprovante:</label><div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center"><input type="file" accept="image/*" onChange={e => setComprovante(e.target.files?.[0]?.name)} className="hidden" id="comp" /><label htmlFor="comp" className="cursor-pointer">{comprovante ? <span className="text-emerald-600">✅ {comprovante}</span> : <span className="text-slate-400">📎 Clique para anexar</span>}</label></div></div>
                    <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep('horario')}>Voltar</Button><Button className="flex-1" disabled={!comprovante} onClick={() => setStep('confirmar')}>Continuar</Button></div>
                </div>
            )}

            {step === 'confirmar' && (
                <div className="space-y-4">
                    <Card className="p-4 space-y-2">
                        <div className="flex justify-between"><span className="text-slate-500">Local:</span><span className="font-medium">{recursoSelecionado?.nome}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Data:</span><span className="font-medium">{formatDateBR(data)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Horário:</span><span className="font-medium">{horario} - {calcularHoraFim(horario, (typeof modulo.duracao === 'number' ? modulo.duracao : 60) + TEMPO_AQUECIMENTO)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Valor:</span><span className="font-medium">{modulo.gratuito ? 'Gratuito' : `R$ ${modulo.valor}`}</span></div>
                    </Card>
                    <div className="flex gap-2"><Button variant="secondary" onClick={() => setStep(modulo.gratuito ? 'horario' : 'pagamento')}>Voltar</Button><Button className="flex-1" onClick={handleConfirmar}>✓ Confirmar</Button></div>
                </div>
            )}
        </div>
    );
};

// =============================================
// MINHAS RESERVAS
// =============================================
const MinhasReservas = ({ reservas, fila, recursos, modulos, user, onCancelar, onCancelarFila }) => {
    const [tab, setTab] = useState('ativas');
    const minhasReservas = reservas.filter(r => r.usuarioId === user.id);
    const minhaFila = fila.filter(f => f.usuarioId === user.id);
    
    const ativas = [
        ...minhasReservas.filter(r => !['Cancelada', 'No-Show', 'Finalizada'].includes(r.status)).map(r => ({ ...r, tipo: 'reserva' })),
        ...minhaFila.filter(f => f.status === 'Aguardando').map(f => ({ ...f, tipo: 'fila' }))
    ];
    
    const historico = [
        ...minhasReservas.filter(r => ['Cancelada', 'No-Show', 'Finalizada'].includes(r.status)).map(r => ({ ...r, tipo: 'reserva' })),
        ...minhaFila.filter(f => f.status !== 'Aguardando').map(f => ({ ...f, tipo: 'fila' }))
    ];
    
    const lista = tab === 'ativas' ? ativas : historico;
    const getRecurso = id => recursos.find(r => r.id === id);
    const getModulo = rid => { const rec = getRecurso(rid); return modulos.find(m => m.id === rec?.moduloId); };

    return (
        <div className="p-4 space-y-4 pb-24">
            <h2 className="text-xl font-bold text-slate-800">📅 Minhas Reservas</h2>
            <TabBar tabs={[{ id: 'ativas', label: `Ativas (${ativas.length})` }, { id: 'historico', label: `Histórico (${historico.length})` }]} active={tab} onChange={setTab} />
            {lista.length === 0 ? <Card className="p-8 text-center text-slate-500">Nenhuma reserva</Card> : lista.map(item => {
                if (item.tipo === 'reserva') {
                    const recurso = getRecurso(item.recursoId);
                    const mod = getModulo(item.recursoId);
                    return (
                        <Card key={'r' + item.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2"><span className="text-xl">{mod?.icone}</span><div><h4 className="font-semibold">{recurso?.nome}</h4><p className="text-sm text-slate-500">{mod?.nome}</p></div></div>
                                <Badge variant={item.status === 'Pendente' ? 'warning' : item.status === 'Em Andamento' ? 'success' : item.status === 'Aguardando Pagamento' ? 'purple' : 'default'}>{item.status}</Badge>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1"><div className="flex justify-between"><span>Data:</span><span className="font-medium">{formatDateBR(item.data)}</span></div><div className="flex justify-between"><span>Horário:</span><span className="font-medium">{item.horaInicio} - {item.horaFim}</span></div></div>
                            {tab === 'ativas' && !['Em Andamento'].includes(item.status) && <Button variant="danger" size="sm" className="w-full mt-3" onClick={() => onCancelar(item.id)}>Cancelar</Button>}
                        </Card>
                    );
                } else {
                    const mod = modulos.find(m => m.id === item.moduloId);
                    const recurso = item.recursoId ? getRecurso(item.recursoId) : null;
                    return (
                        <Card key={'f' + item.id} className="p-4 border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><span className="text-xl">{mod?.icone}</span><div><h4 className="font-semibold">{recurso?.nome || 'Qualquer'}</h4><p className="text-sm text-slate-500">Fila • {item.horario}</p></div></div>
                                <Badge variant="purple">Na Fila</Badge>
                            </div>
                            {tab === 'ativas' && <Button variant="danger" size="sm" className="w-full mt-3" onClick={() => onCancelarFila(item.id)}>Sair da Fila</Button>}
                        </Card>
                    );
                }
            })}
        </div>
    );
};

// =============================================
// TELA FILA
// =============================================
const TelaFilaEspera = ({ modulos, fila, recursos, user, onCancelarFila }) => {
    const minhaFila = fila.filter(f => f.usuarioId === user.id && f.status === 'Aguardando');
    // Ajuste para exibir a posição correta na fila global
    const getPosicao = f => fila.filter(x => x.moduloId === f.moduloId && x.status === 'Aguardando').sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm)).findIndex(x => x.id === f.id) + 1;
    
    return (
        <div className="p-4 space-y-4 pb-24">
            <h2 className="text-xl font-bold text-slate-800">⏳ Fila de Espera</h2>
            {minhaFila.length === 0 ? <Card className="p-8 text-center text-slate-500">Você não está em nenhuma fila</Card> : minhaFila.map(f => {
                const mod = modulos.find(m => m.id === f.moduloId);
                const recurso = f.recursoId ? recursos.find(r => r.id === f.recursoId) : null;
                return (
                    <Card key={f.id} className="p-4 border-l-4 border-l-purple-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">{getPosicao(f)}º</div>
                                <div><h3 className="font-semibold">{mod?.nome}</h3><p className="text-sm text-slate-500">{recurso?.nome || 'Qualquer quadra'} • {f.horario}</p></div>
                            </div>
                            <Button variant="danger" size="sm" onClick={() => onCancelarFila(f.id)}>Sair</Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

// =============================================
// LOUSA DIGITAL
// =============================================
const LousaDigital = ({ modulos, recursos, reservas, usuarios, fila, aulas, config, onStart, onEncerrar, onEstender, onNoShow, onAprovarPagamento, onAtribuirFila }) => {
    const [moduloFiltro, setModuloFiltro] = useState(null);
    const [, forceUpdate] = useState(0);
    useEffect(() => { const i = setInterval(() => forceUpdate(n => n + 1), 1000); return () => clearInterval(i); }, []);

    const modulosAtivos = modulos.filter(m => m.ativo);
    const recursosExibidos = moduloFiltro ? recursos.filter(r => r.moduloId === moduloFiltro) : recursos.filter(r => modulosAtivos.some(m => m.id === r.moduloId));
    
    const getModulo = id => modulos.find(m => m.id === id);
    const getUsuario = id => usuarios.find(u => u.id === id);
    const getReservaAtual = recursoId => reservas.find(r => r.recursoId === recursoId && r.data === hoje() && ['Pendente', 'Confirmada', 'Em Andamento', 'Aguardando Pagamento'].includes(r.status));
    const getFilaRecurso = rec => fila.filter(f => f.moduloId === rec.moduloId && f.status === 'Aguardando' && f.data === hoje() && (f.recursoId === null || f.recursoId === rec.id)).sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
    const calcTempoRestante = r => { if (!r.iniciadaEm) return null; return Math.max(0, r.duracaoTotal * 60 - Math.floor((new Date() - new Date(r.iniciadaEm)) / 1000)); };
    const getStatusTempo = r => { if (!r.iniciadaEm) return { fase: 'aguardando', tempo: null }; const passMin = (new Date() - new Date(r.iniciadaEm)) / 60000; return { fase: passMin < TEMPO_AQUECIMENTO ? 'aquecimento' : 'jogo', tempo: calcTempoRestante(r) }; };
    const totalFila = fila.filter(f => f.status === 'Aguardando' && f.data === hoje()).length;

    return (
        <div className="p-4 space-y-4 pb-24">
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-800">📋 Lousa Digital</h2><p className="text-sm text-slate-500">Controle em tempo real</p></div><Badge variant="info">{formatDateBR(hoje())}</Badge></div>
            <div className="flex gap-2 overflow-x-auto pb-2"><Button variant={!moduloFiltro ? 'primary' : 'secondary'} size="sm" onClick={() => setModuloFiltro(null)}>Todos</Button>{modulosAtivos.map(m => <Button key={m.id} variant={moduloFiltro === m.id ? 'primary' : 'secondary'} size="sm" onClick={() => setModuloFiltro(m.id)}>{m.icone}</Button>)}</div>
            {totalFila > 0 && <Card className="p-3 bg-purple-50 border border-purple-200"><div className="flex items-center gap-2"><span>⏳</span><span className="font-medium text-purple-800">{totalFila} pessoa(s) na fila</span></div></Card>}
            
            <div className="space-y-3">
                {recursosExibidos.map(recurso => {
                    const modulo = getModulo(recurso.moduloId);
                    const reserva = getReservaAtual(recurso.id);
                    const usuario = reserva ? getUsuario(reserva.usuarioId) : null;
                    const filaRec = getFilaRecurso(recurso);
                    const statusTempo = reserva ? getStatusTempo(reserva) : null;
                    
                    // Validação de Status em Tempo Real (Aulas e Reservas)
                    const statusReal = getStatusEmTempoReal(recurso, aulas, reservas);
                    const podeUsar = statusReal.status === 'Livre';
                    
                    // Informações de aula se houver
                    const diaSemana = new Date().getDay();
                    const horaAtual = getHoraAtualExata();
                    const aulaAgora = aulas.find(a => a.recursoId === recurso.id && a.status === 'ativo' && a.diasSemana.includes(diaSemana) && a.horaInicio <= horaAtual && a.horaFim > horaAtual);

                    return (
                        <Card key={recurso.id} className={`p-4 ${!podeUsar && !reserva ? 'opacity-70' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{modulo?.icone}</span>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{recurso.nome}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <StatusRecursoBadge status={statusReal.status} />
                                            {filaRec.length > 0 && podeUsar && <Badge variant="purple" size="sm">⏳ {filaRec.length}</Badge>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!podeUsar && !reserva && (
                                <div className="text-center py-4 rounded-xl bg-slate-100">
                                    <p className="text-lg">{STATUS_RECURSOS[statusReal.status]?.icone}</p>
                                    <p className="font-medium text-slate-700">{STATUS_RECURSOS[statusReal.status]?.label}</p>
                                    {statusReal.motivo && <p className="text-xs text-slate-500 mt-1">{statusReal.motivo}</p>}
                                </div>
                            )}

                            {reserva && (
                                <div className="space-y-3">
                                    <div className="bg-slate-50 p-3 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <div><p className="font-semibold text-slate-800">👤 {usuario?.nome}</p><p className="text-sm text-slate-500">{reserva.horaInicio} - {reserva.horaFim}</p></div>
                                            <Badge variant={reserva.status === 'Aguardando Pagamento' ? 'purple' : statusTempo?.fase === 'aquecimento' ? 'warning' : statusTempo?.fase === 'jogo' ? 'success' : 'info'}>
                                                {reserva.status === 'Aguardando Pagamento' ? '💰' : statusTempo?.fase === 'aquecimento' ? '🔥' : statusTempo?.fase === 'jogo' ? '🎾' : '⏸️'}
                                            </Badge>
                                        </div>
                                        {statusTempo?.tempo !== null && (
                                            <div className={`text-center py-3 rounded-xl ${statusTempo.tempo < 300 ? 'bg-red-100 animate-timer-warning' : statusTempo.fase === 'aquecimento' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                                                <p className={`text-3xl font-bold font-mono ${statusTempo.tempo < 300 ? 'text-red-600 animate-timer' : statusTempo.fase === 'aquecimento' ? 'text-amber-600' : 'text-emerald-600'}`}>{formatarTempo(statusTempo.tempo)}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {reserva.status === 'Aguardando Pagamento' && <Button variant="success" size="sm" className="flex-1" onClick={() => onAprovarPagamento(reserva.id)}>💰 Aprovar</Button>}
                                        {reserva.status === 'Pendente' && <><Button variant="success" size="sm" className="flex-1" onClick={() => onStart(reserva.id)}>▶️ START</Button><Button variant="danger" size="sm" onClick={() => onNoShow(reserva.id)}>No-Show</Button></>}
                                        {reserva.status === 'Em Andamento' && <><Button variant="blue" size="sm" onClick={() => onEstender(reserva.id)}>+1h</Button><Button variant="danger" size="sm" className="flex-1" onClick={() => onEncerrar(reserva.id)}>Encerrar</Button></>}
                                    </div>
                                </div>
                            )}

                            {podeUsar && !reserva && (
                                <div className="text-center py-6 bg-emerald-50 rounded-xl">
                                    <p className="text-2xl mb-1">✓</p>
                                    <p className="text-emerald-700 font-medium">Livre</p>
                                    {filaRec.length > 0 && <Button variant="purple" size="sm" className="mt-3" onClick={() => onAtribuirFila(filaRec[0], recurso)}>Chamar da Fila</Button>}
                                </div>
                            )}

                            {filaRec.length > 0 && podeUsar && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-purple-700 mb-2">⏳ Fila:</p>
                                    {filaRec.slice(0, 3).map((f, i) => {
                                        const u = getUsuario(f.usuarioId);
                                        return (
                                            <div key={f.id} className="flex items-center justify-between bg-purple-50 p-2 rounded-lg mb-1">
                                                <div className="flex items-center gap-2 text-sm"><span className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold">{i + 1}</span><span>{u?.nome}</span><span className="text-slate-400">• {f.horario}</span></div>
                                                <Button variant="success" size="sm" onClick={() => onAtribuirFila(f, recurso)}>Chamar</Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

// =============================================
// PAINEL DE CONFIGURAÇÕES
// =============================================
const PainelConfig = ({ currentUser, config, modulos, recursos, usuarios, aulas, onUpdateConfig, onUpdateModulo, onAddRecurso, onUpdateRecurso, onDeleteRecurso, onAddAula, onDeleteAula, onUpdateAula, onAddUsuario, onUpdateUsuario }) => {
    const isAdmin = currentUser.role === 'Admin';
    const [tab, setTab] = useState(isAdmin ? 'recursos' : 'usuarios');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [senha, setSenha] = useState('');
    const [modalRecurso, setModalRecurso] = useState(null);
    const [modalStatus, setModalStatus] = useState(null);
    const [modalAula, setModalAula] = useState(null);
    const [modalUsuario, setModalUsuario] = useState(null);

    if (!isUnlocked) return (
        <div className="p-4 pb-24"><Card className="p-6 text-center max-w-sm mx-auto"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">🔒</div><Input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} onKeyPress={e => e.key === 'Enter' && senha === '1234' && setIsUnlocked(true)} /><Button className="w-full mt-4" onClick={() => senha === '1234' && setIsUnlocked(true)}>Acessar</Button></Card></div>
    );

    const tabsDisponiveis = isAdmin ? [{ id: 'recursos', label: 'Quadras' }, { id: 'aulas', label: 'Aulas' }, { id: 'usuarios', label: 'Usuários' }] : [{ id: 'usuarios', label: 'Sócios' }];

    return (
        <div className="p-4 space-y-4 pb-24">
            <h2 className="text-xl font-bold text-slate-800">⚙️ Configurações</h2>
            <TabBar tabs={tabsDisponiveis} active={tab} onChange={setTab} />

            {isAdmin && tab === 'recursos' && (
                <div className="space-y-3">
                    <div className="flex justify-end"><Button size="sm" onClick={() => setModalRecurso({ id: null, moduloId: modulos[0]?.id, nome: '', capacidade: 4, status: 'Livre', motivo: null })}>+ Novo</Button></div>
                    {recursos.map(r => {
                        const mod = modulos.find(m => m.id === r.moduloId);
                        return (
                            <Card key={r.id} className="p-3">
                                <div className="flex items-center justify-between">
                                    <div><p className="font-semibold">{r.nome}</p><p className="text-sm text-slate-500">{mod?.icone} {mod?.nome}</p></div>
                                    <div className="flex items-center gap-2"><StatusRecursoBadge status={r.status} /><Button variant="ghost" size="sm" onClick={() => setModalStatus(r)}>Status</Button><Button variant="ghost" size="sm" onClick={() => setModalRecurso(r)}>Editar</Button></div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {isAdmin && tab === 'aulas' && (
                <div className="space-y-3">
                    <div className="flex justify-end"><Button size="sm" onClick={() => setModalAula({ id: null, recursoId: recursos[0]?.id, diasSemana: [], horaInicio: '08:00', horaFim: '10:00', professor: '', nome: '', status: 'ativo' })}>+ Nova</Button></div>
                    {aulas.map(a => {
                        const rec = recursos.find(r => r.id === a.recursoId);
                        return (
                            <Card key={a.id} className="p-3">
                                <div className="flex items-center justify-between">
                                    <div><p className="font-semibold">{a.nome}</p><p className="text-sm text-slate-500">{rec?.nome} • {a.professor} • {formatDiasSemana(a.diasSemana)} • {a.horaInicio}-{a.horaFim}</p></div>
                                    <div className="flex gap-2"><Badge variant={a.status === 'ativo' ? 'success' : 'default'}>{a.status}</Badge><Button variant="ghost" size="sm" onClick={() => setModalAula(a)}>Editar</Button></div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {tab === 'usuarios' && (
                <div className="space-y-3">
                    {isAdmin && <div className="flex justify-end"><Button size="sm" onClick={() => setModalUsuario({ id: null, nome: '', matricula: '', senha: '1234', role: 'Socio', status: 'Ativo', noshow_count: 0 })}>+ Novo</Button></div>}
                    {usuarios.filter(u => isAdmin || u.role === 'Socio').map(u => (
                        <Card key={u.id} className="p-3">
                            <div className="flex items-center justify-between">
                                <div><p className="font-semibold">{u.nome}</p><p className="text-sm text-slate-500">{u.matricula} • {u.role}</p></div>
                                <div className="flex items-center gap-2"><Badge variant={u.status === 'Ativo' ? 'success' : u.status === 'Bloqueado' ? 'warning' : 'danger'}>{u.status}</Badge><Button variant="ghost" size="sm" onClick={() => setModalUsuario(u)}>Editar</Button></div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modais */}
            <Modal isOpen={!!modalRecurso} onClose={() => setModalRecurso(null)} title={modalRecurso?.id ? 'Editar Recurso' : 'Novo Recurso'}>
                {modalRecurso && <div className="space-y-4">
                    <Select label="Módulo" options={modulos.map(m => ({ value: m.id, label: `${m.icone} ${m.nome}` }))} value={modalRecurso.moduloId} onChange={e => setModalRecurso({ ...modalRecurso, moduloId: parseInt(e.target.value) })} />
                    <Input label="Nome" value={modalRecurso.nome} onChange={e => setModalRecurso({ ...modalRecurso, nome: e.target.value })} />
                    <Input type="number" label="Capacidade" value={modalRecurso.capacidade} onChange={e => setModalRecurso({ ...modalRecurso, capacidade: parseInt(e.target.value) || 4 })} />
                    <Button className="w-full" onClick={() => { modalRecurso.id ? onUpdateRecurso(modalRecurso.id, modalRecurso) : onAddRecurso({ ...modalRecurso, id: Date.now() }); setModalRecurso(null); }}>Salvar</Button>
                </div>}
            </Modal>

            <Modal isOpen={!!modalStatus} onClose={() => setModalStatus(null)} title={`Status - ${modalStatus?.nome}`}>
                {modalStatus && <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">{Object.entries(STATUS_RECURSOS).map(([k, v]) => <button key={k} onClick={() => setModalStatus({ ...modalStatus, status: k })} className={`p-3 rounded-xl text-left border-2 ${modalStatus.status === k ? 'border-teal-500 bg-teal-50' : 'border-transparent bg-slate-50'}`}>{v.icone} {v.label}</button>)}</div>
                    {['Manutencao', 'Reservada', 'Interditada'].includes(modalStatus.status) && <Textarea label="Motivo" value={modalStatus.motivo || ''} onChange={e => setModalStatus({ ...modalStatus, motivo: e.target.value })} />}
                    <Button className="w-full" onClick={() => { onUpdateRecurso(modalStatus.id, { status: modalStatus.status, motivo: ['Manutencao', 'Reservada', 'Interditada'].includes(modalStatus.status) ? modalStatus.motivo : null }); setModalStatus(null); }}>Salvar</Button>
                </div>}
            </Modal>

            <Modal isOpen={!!modalAula} onClose={() => setModalAula(null)} title={modalAula?.id ? 'Editar Aula' : 'Nova Aula'}>
                {modalAula && <div className="space-y-4">
                    <Input label="Nome" value={modalAula.nome} onChange={e => setModalAula({ ...modalAula, nome: e.target.value })} />
                    <Input label="Professor" value={modalAula.professor} onChange={e => setModalAula({ ...modalAula, professor: e.target.value })} />
                    <Select label="Quadra" options={recursos.map(r => ({ value: r.id, label: r.nome }))} value={modalAula.recursoId} onChange={e => setModalAula({ ...modalAula, recursoId: parseInt(e.target.value) })} />
                    <div><label className="text-sm font-medium text-slate-700 block mb-2">Dias:</label><div className="flex gap-2">{DIAS_SEMANA.map(d => <button key={d.id} onClick={() => setModalAula({ ...modalAula, diasSemana: modalAula.diasSemana?.includes(d.id) ? modalAula.diasSemana.filter(x => x !== d.id) : [...(modalAula.diasSemana || []), d.id] })} className={`w-8 h-8 rounded-full text-xs font-bold ${modalAula.diasSemana?.includes(d.id) ? 'bg-teal-600 text-white' : 'bg-slate-100'}`}>{d.curto[0]}</button>)}</div></div>
                    <div className="flex gap-2"><Input type="time" label="Início" value={modalAula.horaInicio} onChange={e => setModalAula({ ...modalAula, horaInicio: e.target.value })} /><Input type="time" label="Fim" value={modalAula.horaFim} onChange={e => setModalAula({ ...modalAula, horaFim: e.target.value })} /></div>
                    <Select label="Status" options={[{ value: 'ativo', label: 'Ativa' }, { value: 'cancelada', label: 'Cancelada' }]} value={modalAula.status} onChange={e => setModalAula({ ...modalAula, status: e.target.value })} />
                    <Button className="w-full" onClick={() => { modalAula.id ? onUpdateAula(modalAula.id, modalAula) : onAddAula({ ...modalAula, id: Date.now() }); setModalAula(null); }}>Salvar</Button>
                </div>}
            </Modal>

            <Modal isOpen={!!modalUsuario} onClose={() => setModalUsuario(null)} title={modalUsuario?.id ? 'Editar Usuário' : 'Novo Usuário'}>
                {modalUsuario && <div className="space-y-4">
                    <Input label="Nome" value={modalUsuario.nome} onChange={e => setModalUsuario({ ...modalUsuario, nome: e.target.value })} disabled={!isAdmin && modalUsuario.id} />
                    <Input label="Matrícula" value={modalUsuario.matricula} onChange={e => setModalUsuario({ ...modalUsuario, matricula: e.target.value.toUpperCase() })} disabled={!isAdmin && modalUsuario.id} />
                    {isAdmin && <Input label="Senha" value={modalUsuario.senha} onChange={e => setModalUsuario({ ...modalUsuario, senha: e.target.value })} />}
                    {isAdmin && <Select label="Tipo" options={[{ value: 'Socio', label: 'Sócio' }, { value: 'Funcionario', label: 'Funcionário' }, { value: 'Admin', label: 'Admin' }]} value={modalUsuario.role} onChange={e => setModalUsuario({ ...modalUsuario, role: e.target.value })} />}
                    <div><label className="text-sm font-medium text-slate-700 block mb-2">Status:</label><div className="grid grid-cols-3 gap-2"><button onClick={() => setModalUsuario({ ...modalUsuario, status: 'Ativo', bloqueado_ate: null })} className={`p-2 rounded-lg text-sm border-2 ${modalUsuario.status === 'Ativo' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'}`}>Ativo</button><button onClick={() => setModalUsuario({ ...modalUsuario, status: 'Bloqueado', bloqueado_ate: formatDate(addDays(new Date(), 7)) })} className={`p-2 rounded-lg text-sm border-2 ${modalUsuario.status === 'Bloqueado' ? 'border-amber-500 bg-amber-50' : 'border-slate-100'}`}>Bloqueado</button><button onClick={() => setModalUsuario({ ...modalUsuario, status: 'Cancelado' })} className={`p-2 rounded-lg text-sm border-2 ${modalUsuario.status === 'Cancelado' ? 'border-red-500 bg-red-50' : 'border-slate-100'}`}>Cancelado</button></div></div>
                    <Button className="w-full" onClick={() => { modalUsuario.id ? onUpdateUsuario(modalUsuario.id, modalUsuario) : onAddUsuario({ ...modalUsuario, id: Date.now() }); setModalUsuario(null); }}>Salvar</Button>
                </div>}
            </Modal>
        </div>
    );
};

// =============================================
// APP PRINCIPAL
// =============================================
const App = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('home');
    const [selectedModulo, setSelectedModulo] = useState(null);
    const [config, setConfig] = useState(window.ClubeGestor.initialConfig);
    const [modulos, setModulos] = useState(window.ClubeGestor.initialModulos);
    const [recursos, setRecursos] = useState(window.ClubeGestor.initialRecursos);
    const [usuarios, setUsuarios] = useState(window.ClubeGestor.initialUsuarios);
    const [reservas, setReservas] = useState([]);
    const [aulas, setAulas] = useState(window.ClubeGestor.initialAulas);
    const [fila, setFila] = useState([]);
    const [notif, setNotif] = useState(null);
    const notify = (msg, type = 'success') => setNotif({ message: msg, type });

    // HANDLER DE RESERVA ATUALIZADO (IMPEDE MÚLTIPLAS RESERVAS)
    const handleReservar = r => {
        // Validação: Só pode ter uma reserva ou fila ativa
        const temReservaAtiva = reservas.some(res => 
            res.usuarioId === user.id && 
            ['Pendente', 'Confirmada', 'Em Andamento', 'Aguardando Pagamento'].includes(res.status)
        );
        const estaNaFila = fila.some(f => 
            f.usuarioId === user.id && 
            f.status === 'Aguardando'
        );

        if (temReservaAtiva || estaNaFila) {
            notify('Você já tem uma reserva ou fila ativa! Finalize-a antes.', 'warning');
            return;
        }

        setReservas([...reservas, r]); 
        setSelectedModulo(null); 
        notify('Reserva realizada! ✓'); 
        setView('reservas'); 
    };

    const handleCancelarReserva = id => { setReservas(reservas.map(r => r.id === id ? { ...r, status: 'Cancelada' } : r)); notify('Reserva cancelada.', 'warning'); };
    const handleStart = id => { setReservas(reservas.map(r => r.id === id ? { ...r, status: 'Em Andamento', iniciadaEm: new Date().toISOString() } : r)); notify('⏱️ Tempo iniciado!'); };
    const handleEncerrar = id => { setReservas(reservas.map(r => r.id === id ? { ...r, status: 'Finalizada' } : r)); notify('Reserva encerrada.'); };
    const handleEstender = id => { setReservas(reservas.map(r => r.id === id ? { ...r, duracaoTotal: r.duracaoTotal + TEMPO_EXTENSAO, horaFim: calcularHoraFim(r.horaInicio, r.duracaoTotal + TEMPO_EXTENSAO) } : r)); notify(`+${TEMPO_EXTENSAO} min adicionados!`); };
    const handleNoShow = id => { const res = reservas.find(r => r.id === id); if (!res) return; setReservas(reservas.map(r => r.id === id ? { ...r, status: 'No-Show' } : r)); setUsuarios(usuarios.map(u => { if (u.id !== res.usuarioId) return u; const nc = u.noshow_count + 1; return { ...u, noshow_count: nc, bloqueado_ate: nc >= config.punicao_noshow_limite ? formatDate(addDays(new Date(), config.punicao_dias_bloqueio)) : u.bloqueado_ate, status: nc >= config.punicao_noshow_limite ? 'Bloqueado' : u.status }; })); notify('No-Show registrado.', 'warning'); };
    const handleAprovarPagamento = id => { setReservas(reservas.map(r => r.id === id ? { ...r, status: 'Pendente' } : r)); notify('💰 Pagamento aprovado!'); };
    
    // HANDLER DE FILA ATUALIZADO (IMPEDE MÚLTIPLAS RESERVAS)
    const handleEntrarFila = f => { 
        // Validação: Só pode ter uma reserva ou fila ativa
        const temReservaAtiva = reservas.some(res => 
            res.usuarioId === user.id && 
            ['Pendente', 'Confirmada', 'Em Andamento', 'Aguardando Pagamento'].includes(res.status)
        );
        const estaNaFila = fila.some(item => 
            item.usuarioId === user.id && 
            item.status === 'Aguardando'
        );

        if (temReservaAtiva || estaNaFila) {
            notify('Você já tem uma reserva ou fila ativa!', 'warning');
            return;
        }

        setFila([...fila, f]); 
        setSelectedModulo(null); 
        notify('Você entrou na fila! ⏳'); 
        setView('fila'); 
    };

    const handleCancelarFila = id => { setFila(fila.filter(f => f.id !== id)); notify('Saiu da fila.', 'warning'); };
    const handleAtribuirFila = (entradaFila, recurso) => {
        const mod = modulos.find(m => m.id === entradaFila.moduloId);
        const rec = recurso || recursos.find(r => r.id === entradaFila.recursoId) || recursos.find(r => r.moduloId === entradaFila.moduloId && getStatusEmTempoReal(r, aulas, reservas).status === 'Livre');
        if (!rec || getStatusEmTempoReal(rec, aulas, reservas).status !== 'Livre') { notify('Nenhum recurso disponível!', 'error'); return; }
        const duracao = typeof mod.duracao === 'number' ? mod.duracao + TEMPO_AQUECIMENTO : 480;
        setReservas([...reservas, { id: Date.now(), recursoId: rec.id, usuarioId: entradaFila.usuarioId, data: entradaFila.data, horaInicio: entradaFila.horario, horaFim: calcularHoraFim(entradaFila.horario, duracao), status: 'Pendente', valor: 0, iniciadaEm: null, duracaoTotal: duracao, criadaEm: new Date().toISOString() }]);
        setFila(fila.map(f => f.id === entradaFila.id ? { ...f, status: 'Atendido' } : f));
        notify('Reserva criada! ✓');
    };

    const handleUpdateConfig = u => { setConfig({ ...config, ...u }); notify('Configuração atualizada!'); };
    const handleUpdateModulo = (id, u) => setModulos(modulos.map(m => m.id === id ? { ...m, ...u } : m));
    const handleAddRecurso = r => { setRecursos([...recursos, r]); notify('Recurso criado!'); };
    const handleUpdateRecurso = (id, u) => { setRecursos(recursos.map(r => r.id === id ? { ...r, ...u } : r)); notify('Recurso atualizado!'); };
    const handleDeleteRecurso = id => { setRecursos(recursos.filter(r => r.id !== id)); notify('Recurso removido.', 'warning'); };
    const handleAddAula = a => { setAulas([...aulas, a]); notify('Aula programada!'); };
    const handleDeleteAula = id => { setAulas(aulas.filter(a => a.id !== id)); notify('Aula removida.', 'warning'); };
    const handleUpdateAula = (id, u) => { setAulas(aulas.map(a => a.id === id ? { ...a, ...u } : a)); notify('Aula atualizada!'); };
    const handleAddUsuario = u => { setUsuarios([...usuarios, u]); notify('Usuário criado!'); };
    const handleUpdateUsuario = (id, u) => { setUsuarios(usuarios.map(usr => usr.id === id ? { ...usr, ...u } : usr)); notify('Usuário atualizado!'); };

    const handleNavigate = v => { setView(v); setSelectedModulo(null); };

    if (!user) return <TelaLogin usuarios={usuarios} onLogin={setUser} />;
    const userAtualizado = usuarios.find(u => u.id === user.id) || user;

    return (
        <div className="min-h-screen bg-slate-50">
            <Header user={userAtualizado} onLogout={() => { setUser(null); handleNavigate('home'); }} />
            <main className="max-w-7xl mx-auto">
                {view === 'home' && !selectedModulo && <HomeSocio modulos={modulos} recursos={recursos} aulas={aulas} reservas={reservas} user={userAtualizado} config={config} onSelectModulo={setSelectedModulo} />}
                {view === 'home' && selectedModulo && <TelaReserva modulo={selectedModulo} recursos={recursos} reservas={reservas} aulas={aulas} user={userAtualizado} config={config} onReservar={handleReservar} onVoltar={() => setSelectedModulo(null)} onEntrarFila={handleEntrarFila} />}
                {view === 'reservas' && <MinhasReservas reservas={reservas} fila={fila} recursos={recursos} modulos={modulos} user={userAtualizado} onCancelar={handleCancelarReserva} onCancelarFila={handleCancelarFila} />}
                {view === 'fila' && <TelaFilaEspera modulos={modulos} fila={fila} recursos={recursos} user={userAtualizado} onCancelarFila={handleCancelarFila} />}
                {view === 'lousa' && userAtualizado.role !== 'Socio' && <LousaDigital modulos={modulos} recursos={recursos} reservas={reservas} usuarios={usuarios} fila={fila} aulas={aulas} config={config} onStart={handleStart} onEncerrar={handleEncerrar} onEstender={handleEstender} onNoShow={handleNoShow} onAprovarPagamento={handleAprovarPagamento} onAtribuirFila={handleAtribuirFila} />}
                {view === 'config' && ['Admin', 'Funcionario'].includes(userAtualizado.role) && <PainelConfig currentUser={userAtualizado} config={config} modulos={modulos} recursos={recursos} usuarios={usuarios} aulas={aulas} onUpdateConfig={handleUpdateConfig} onUpdateModulo={handleUpdateModulo} onAddRecurso={handleAddRecurso} onUpdateRecurso={handleUpdateRecurso} onDeleteRecurso={handleDeleteRecurso} onAddAula={handleAddAula} onDeleteAula={handleDeleteAula} onUpdateAula={handleUpdateAula} onAddUsuario={handleAddUsuario} onUpdateUsuario={handleUpdateUsuario} />}
            </main>
            <BottomNav view={view} onNavigate={handleNavigate} role={userAtualizado.role} />
            {notif && <Notification {...notif} onClose={() => setNotif(null)} />}
        </div>
    );
};

// Renderização
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
