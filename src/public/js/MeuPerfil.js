// ------------------------------
// Sistema de Agendamentos
// ------------------------------
function getAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
}

function salvarAgendamentos(lista) {
    localStorage.setItem("agendamentos", JSON.stringify(lista));
}

// ------------------------------
// Carregar dados do usuário
// ------------------------------
async function carregarUsuario() {
    const response = await fetch("/auth/me", { credentials: "include" });
    if (!response.ok) { window.location.href = "/login"; return; }

    const { user } = await response.json();
    preencherPerfil(user);
    carregarAgendamentos(user);
    carregarHistorico(user);
}

// ------------------------------
// Preencher perfil
// ------------------------------
function preencherPerfil(user) {
    document.getElementById("nomePerfil").textContent = user.nome;
    document.getElementById("emailPerfil").textContent = user.email;
    document.getElementById("tipoUsuario").textContent = user.role === "mentor" ? "Mentor" : "Estudante";

    if (user.role === "mentor") {
        document.getElementById("labelInfoEspecifica").textContent = "Disponibilidade";
        document.getElementById("infoEspecifica").textContent = user.disponibilidade
            ? `${user.disponibilidade.dias.join(", ")} ${user.disponibilidade.horaInicio}-${user.disponibilidade.horaFim}`
            : "Não cadastrada";
    } else {
        document.getElementById("labelInfoEspecifica").textContent = "Série Escolar";
        document.getElementById("infoEspecifica").textContent = user.serieEscolar;
    }

    if (user.role === "estudante") {
        document.getElementById("labelAreaInteresse").textContent = "Áreas de Interesse:";
        document.getElementById("areaInteresse").textContent = user.areaInteresse?.join(", ") || "Nenhuma selecionada";
    } else {
        document.getElementById("labelAreaInteresse").textContent = "Áreas de Conhecimento:";
        document.getElementById("areaInteresse").textContent = user.areaConhecimento?.join(", ") || "Nenhuma selecionada";
    }

    const botao = document.getElementById("acaoPerfilBtn");
    if (user.role === "mentor") {
        botao.style.display = "none"; // Mentores não terão botão
    } else {
        botao.style.display = "inline-block";
        botao.textContent = "Explorar Mentores";
        botao.href = "/listaMentores";
    }

    localStorage.setItem("usuario-logado-email", user.email);
}

// ------------------------------
// Carregar agendamentos futuros
// ------------------------------
function carregarAgendamentos(user) {
    const listaEl = document.getElementById("lista-agendamentos");
    listaEl.innerHTML = '';

    let agendamentos = getAgendamentos().filter(a => 
        !a.avaliacao && 
        (user.role === "mentor" ? a.mentorEmail === user.email : a.alunoEmail === user.email)
    );

    if (!agendamentos.length) { 
        listaEl.innerHTML = `<li class="sessao-vazia">Nenhum agendamento futuro.</li>`;
        return; 
    }

    agendamentos.forEach(a => {
        const li = document.createElement("li");
        li.className = "item-agendamento";
        li.innerHTML = `
            Sessão com ${user.role === "mentor" ? "aluno" : "mentor"} "${user.role === "mentor" ? a.alunoNome : a.mentorNome}" - ${a.data} às ${a.hora}
            <button class="btn-vermelho cancel-btn" data-id="${a.id}">Cancelar</button>
        `;
        listaEl.appendChild(li);

        criarBotaoEntrarEAvaliar(a, li, user);
    });

    document.querySelectorAll(".cancel-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            cancelarAgendamento(id);
            carregarAgendamentos(user);
        });
    });
}

// ------------------------------
// Botão Entrar + modal ao fechar a call
// ------------------------------
function criarBotaoEntrarEAvaliar(agendamento, container, user) {
    const btn = document.createElement("button");
    btn.className = "join-session-btn btn-entrar";
    btn.textContent = "Entrar";
    container.appendChild(btn);

    btn.addEventListener("click", () => {
        const meetLink = agendamento.meetLink || "https://meet.google.com/ziv-kkmn-ggp";
        const win = window.open(meetLink, "_blank", "width=800,height=600");

        // Modal de avaliação só para alunos
        if (user.role === "estudante") {
            const timer = setInterval(() => {
                if (win.closed) {
                    clearInterval(timer);
                    if (!agendamento.avaliacao) abrirModalAvaliacao(agendamento, user);
                }
            }, 500);
        }
    });
}

// ------------------------------
// Modal de Avaliação
// ------------------------------
const modal = document.getElementById("avaliacaoModal");
const closeModal = document.getElementById("closeAvaliacaoModal");
const submitAvaliacao = document.getElementById("submitAvaliacao");

function abrirModalAvaliacao(agendamento, user) {
    document.getElementById("avaliacaoEstrelas").value = "5";
    document.getElementById("avaliacaoComentario").value = "";

    modal.style.display = "flex";

    submitAvaliacao.onclick = () => {
        const estrelas = document.getElementById("avaliacaoEstrelas").value;
        const comentario = document.getElementById("avaliacaoComentario").value;

        agendamento.avaliacao = estrelas;
        agendamento.comentario = comentario;

        let lista = getAgendamentos();
        lista = lista.map(a => a.id === agendamento.id ? agendamento : a);
        salvarAgendamentos(lista);

        modal.style.display = "none";

        carregarAgendamentos(user);
        carregarHistorico(user);
    };
}

// Fechar modal
closeModal.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// ------------------------------
// Histórico de sessões + botão excluir
// ------------------------------
function carregarHistorico(user) {
    const listaEl = document.getElementById("lista-historico");
    listaEl.innerHTML = '';

    let agendamentos = getAgendamentos().filter(a => a.avaliacao &&
        (user.role === "mentor" ? a.mentorEmail === user.email : a.alunoEmail === user.email)
    );

    if (!agendamentos.length) {
        listaEl.innerHTML = `<li class="sessao-vazia">Nenhuma sessão finalizada.</li>`;
        return;
    }

    agendamentos.forEach(a => {
        const li = document.createElement("li");
        li.className = "item-agendamento";
        li.innerHTML = `
            Sessão com ${user.role === "mentor" ? "aluno" : "mentor"} "${user.role === "mentor" ? a.alunoNome : a.mentorNome}" - ${a.data} às ${a.hora}<br>
            Avaliação: ${a.avaliacao} ⭐<br>
            Comentário: ${a.comentario}
        `;

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn-vermelho btn-excluir";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => {
            excluirHistorico(a.id, user);
        });

        li.appendChild(btnExcluir);
        listaEl.appendChild(li);
    });
}

function excluirHistorico(id, user) {
    let lista = getAgendamentos();
    lista = lista.filter(a => a.id !== id);
    salvarAgendamentos(lista);
    carregarHistorico(user);
}

// ------------------------------
// Cancelar agendamento
// ------------------------------
function cancelarAgendamento(id) {
    let lista = getAgendamentos();
    lista = lista.filter(a => a.id !== id);
    salvarAgendamentos(lista);
}

// ------------------------------
// Upload de foto
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const foto = document.getElementById("fotoPerfil");
    const fileInput = document.getElementById("fileInput");

    foto.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (e) {
            const imageBase64 = e.target.result;
            foto.src = imageBase64;

            await fetch("/auth/update-photo", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ imageBase64 })
            });
        };

        reader.readAsDataURL(file);
    });

    const email = localStorage.getItem("usuario-logado-email");
    if (email) {
        const savedPhoto = localStorage.getItem(`profile-picture-${email}`);
        if (savedPhoto) foto.src = savedPhoto;
    }

    carregarUsuario();
});
