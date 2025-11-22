// ----------------------------
// SISTEMA DE AGENDAMENTOS
// ----------------------------

// Obtém todos os agendamentos
function getAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
}

// Salva lista no localStorage
function salvarAgendamentos(lista) {
    localStorage.setItem("agendamentos", JSON.stringify(lista));
}

// Função para gerar um link de Google Meet “fake” único
function gerarLinkMeet() {
    const codigo = Math.random().toString(36).substring(2, 12);
    return `https://meet.google.com/${codigo}`;
}

// Cria novo agendamento
function criarAgendamento(mentorEmail, mentorNome, alunoEmail, alunoNome, data, hora) {
    const lista = getAgendamentos();

    const novo = {
        id: Date.now(),
        mentorEmail,
        mentorNome,
        alunoEmail,
        alunoNome,
        data,
        hora,
        linkMeet: gerarLinkMeet()
    };

    lista.push(novo);
    salvarAgendamentos(lista);

    return novo;
}

// Cancela agendamento
function cancelarAgendamento(id) {
    let lista = getAgendamentos();
    lista = lista.filter(a => a.id !== id);
    salvarAgendamentos(lista);
}

// Lista agendamentos por mentor
function getAgendamentosMentor(emailMentor) {
    return getAgendamentos().filter(a => a.mentorEmail === emailMentor);
}

// Lista agendamentos por aluno
function getAgendamentosAluno(emailAluno) {
    return getAgendamentos().filter(a => a.alunoEmail === emailAluno);
}
