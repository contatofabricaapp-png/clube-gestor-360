/* =============================================
   CLUBE GESTOR 360 - FUNÇÕES UTILITÁRIAS
   ============================================= */

// Formatação de data
const formatDate = (date) => date.toISOString().split('T')[0];
const hoje = () => formatDate(new Date());
const formatDateBR = (str) => {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
};

// Formatação de tempo
const formatarTempo = (segundos) => {
    if (segundos <= 0) return '00:00';
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Geração de horários (6h às 22h)
const gerarHorarios = () => {
    const h = [];
    for (let i = 6; i < 22; i++) {
        h.push(`${String(i).padStart(2, '0')}:00`);
        h.push(`${String(i).padStart(2, '0')}:30`);
    }
    return h;
};

// Hora atual arredondada (para sugestão)
const getHoraAtualArredondada = () => {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    if (m > 30) { h += 1; m = 0; }
    else if (m > 0) { m = 30; }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Hora atual exata
const getHoraAtualExata = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Calcular hora de fim baseado em duração
const calcularHoraFim = (horaInicio, duracaoMin) => {
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMin = h * 60 + m + duracaoMin;
    return `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;
};

// Adicionar dias a uma data
const addDays = (date, days) => {
    const r = new Date(date);
    r.setDate(r.getDate() + days);
    return r;
};

// Verificar conflito de horários
const temConflitoHorario = (h1Inicio, h1Fim, h2Inicio, h2Fim) => {
    const [i1H, i1M] = h1Inicio.split(':').map(Number);
    const [f1H, f1M] = h1Fim.split(':').map(Number);
    const [i2H, i2M] = h2Inicio.split(':').map(Number);
    const [f2H, f2M] = h2Fim.split(':').map(Number);
    const minI1 = i1H * 60 + i1M;
    const minF1 = f1H * 60 + f1M;
    const minI2 = i2H * 60 + i2M;
    const minF2 = f2H * 60 + f2M;
    return (minI1 < minF2 && minF1 > minI2);
};

// Formatar dias da semana
const formatDiasSemana = (dias) => {
    const { DIAS_SEMANA } = window.ClubeGestor;
    if (!dias || dias.length === 0) return 'Nenhum dia';
    if (dias.length === 7) return 'Todos os dias';
    if (dias.length === 5 && dias.includes(1) && dias.includes(5) && !dias.includes(0) && !dias.includes(6)) {
        return 'Segunda a Sexta';
    }
    return dias.sort().map(d => DIAS_SEMANA.find(ds => ds.id === d)?.curto).join(', ');
};

// Obter status em tempo real considerando aulas e reservas
const getStatusEmTempoReal = (recurso, aulas, reservas) => {
    // Se já tem status manual (manutenção, interditada, limpeza)
    if (['Manutencao', 'Interditada', 'Limpeza'].includes(recurso.status)) {
        return { status: recurso.status, motivo: recurso.motivo };
    }

    const horaAtual = getHoraAtualExata();
    const diaSemana = new Date().getDay();

    // Verifica se tem aula agora
    const aulaAgora = aulas.find(a =>
        a.recursoId === recurso.id &&
        a.status === 'ativo' &&
        a.diasSemana.includes(diaSemana) &&
        a.horaInicio <= horaAtual &&
        a.horaFim > horaAtual
    );

    if (aulaAgora) {
        return {
            status: 'Reservada',
            motivo: `Aula: ${aulaAgora.nome} (${aulaAgora.professor})`
        };
    }

    // Verifica se tem reserva em andamento
    const reservaAgora = reservas.find(r =>
        r.recursoId === recurso.id &&
        ['Em Andamento', 'Confirmada'].includes(r.status) &&
        r.data === hoje() &&
        r.horaInicio <= horaAtual &&
        r.horaFim > horaAtual
    );

    if (reservaAgora) {
        return { status: 'Ocupada', motivo: 'Em uso' };
    }

    return { status: 'Livre', motivo: null };
};

// Exporta para window
window.ClubeGestor = window.ClubeGestor || {};
Object.assign(window.ClubeGestor, {
    formatDate,
    hoje,
    formatDateBR,
    formatarTempo,
    gerarHorarios,
    getHoraAtualArredondada,
    getHoraAtualExata,
    calcularHoraFim,
    addDays,
    temConflitoHorario,
    formatDiasSemana,
    getStatusEmTempoReal
});
