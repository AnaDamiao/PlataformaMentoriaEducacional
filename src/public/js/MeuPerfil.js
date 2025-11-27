// MeuPerfil.js (versão revisada)

// ------------------------------ 
// VARIÁVEIS GLOBAIS / CONSTANTES DO MODAL
// ------------------------------ 
const modal = document.getElementById("avaliacaoModal");
const closeModal = document.getElementById("closeAvaliacaoModal");
const submitAvaliacao = document.getElementById("submitAvaliacao");

let idParaExcluir = null;
let userGlobal = null;

// ------------------------------ 
// 1. UTILIDADES DO LOCAL STORAGE
// ------------------------------ 
function getAgendamentos() {
    return JSON.parse(localStorage.getItem("agendamentos")) || [];
}

function salvarAgendamentos(lista) {
    localStorage.setItem("agendamentos", JSON.stringify(lista));
}

function cancelarAgendamento(id) {
    let lista = getAgendamentos();
    lista = lista.filter(a => a.id !== id);
    salvarAgendamentos(lista);
}

function excluirHistorico(id, user) {
    let lista = getAgendamentos();
    lista = lista.filter(a => a.id !== id);
    salvarAgendamentos(lista);
    carregarHistorico(user);
}

// ------------------------------ 
// 2. FUNÇÕES DE PERFIL E CARREGAMENTO
// ------------------------------ 
async function carregarUsuario() {
    const response = await fetch("/auth/me", { credentials: "include" });

    if (!response.ok) {
        window.location.href = "/login";
        return;
    }

    const { user } = await response.json();
    userGlobal = user; 
    
    // Salva o email logado
    localStorage.setItem("usuario-logado-email", user.email); 
    localStorage.setItem("usuario-logado-nome", user.nome); 
    
    preencherPerfil(user);
    carregarAgendamentos(user);
    carregarHistorico(user);
}

function preencherPerfil(user) {
    document.getElementById("nomeUsuario").textContent = user.nome; 
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

    const labelArea = user.role === "estudante" ? "Áreas de Interesse:" : "Áreas de Conhecimento:";
    document.getElementById("labelAreaInteresse").textContent = labelArea;
    const areas = user.role === "estudante" ? user.areaInteresse : user.areaConhecimento;
    document.getElementById("areaInteresse").textContent = areas?.join(", ") || "Nenhuma selecionada";

    const botao = document.getElementById("acaoPerfilBtn");
    if (user.role === "mentor") {
        botao.style.display = "none";
    } else {
        botao.style.display = "inline-block";
        botao.textContent = "Explorar Mentores";
        botao.href = "/listaMentores";
    }
}


// ------------------------------ 
// 3. CARREGAMENTO DE AGENDAMENTOS E HISTÓRICO
// ------------------------------ 
function carregarAgendamentos(user) {
    const listaEl = document.getElementById("lista-agendamentos");
    listaEl.innerHTML = '';

    let agendamentos = getAgendamentos().filter(
        a => !a.avaliacao && (user.role === "mentor" ? a.mentorEmail === user.email : a.alunoEmail === user.email)
    );

    if (!agendamentos.length) {
        listaEl.innerHTML = `<li class="sessao-vazia">Nenhum agendamento futuro.</li>`;
        return;
    }

    agendamentos.forEach(a => {
        const li = document.createElement("li");
        li.className = "item-agendamento";

        const infoDiv = document.createElement("div");
        infoDiv.className = "info-sessao";
        infoDiv.innerHTML = `Sessão com ${user.role === "mentor" ? "aluno" : "mentor"} 
            "<strong>${user.role === "mentor" ? a.alunoNome : a.mentorNome}</strong>" - ${a.data} às ${a.hora}`;

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "sessao-actions";

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "cancel-btn btn-cancel-schedule";
        cancelBtn.textContent = "Cancelar";
        cancelBtn.dataset.id = a.id;
        cancelBtn.addEventListener("click", () => {
            cancelarAgendamento(Number(cancelBtn.dataset.id));
            carregarAgendamentos(user);
        });

        const entrarBtn = document.createElement("button");
        entrarBtn.className = "session-enter-btn";
        entrarBtn.textContent = "Entrar";
        entrarBtn.addEventListener("click", () => {
            const meetLink = a.meetLink || "https://meet.google.com/ziv-kkmn-ggp";
            const win = window.open(meetLink, "_blank", "width=800,height=600");

            if (user.role === "estudante") {
                const timer = setInterval(() => {
                    if (win.closed) {
                        clearInterval(timer);
                        if (!a.avaliacao) abrirModalAvaliacao(a, user);
                    }
                }, 500);
            }
        });

        actionsDiv.appendChild(cancelBtn);
        actionsDiv.appendChild(entrarBtn);

        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
        listaEl.appendChild(li);
    });
}

function carregarHistorico(user) {
    const listaEl = document.getElementById("lista-historico");
    listaEl.innerHTML = '';

    let agendamentos = getAgendamentos().filter(
        a => a.avaliacao && (user.role === "mentor" ? a.mentorEmail === user.email : a.alunoEmail === user.email)
    );

    if (!agendamentos.length) {
        listaEl.innerHTML = `<li class="sessao-vazia">Nenhuma sessão finalizada.</li>`;
        return;
    }

    agendamentos.forEach(a => {
        const li = document.createElement("li");
        li.className = "item-agendamento";

        const infoDiv = document.createElement("div");
        infoDiv.className = "info-sessao";
        infoDiv.innerHTML = `
            Sessão com ${user.role === "mentor" ? "aluno" : "mentor"} 
            "<strong>${user.role === "mentor" ? a.alunoNome : a.mentorNome}</strong>" 
            - ${a.data} às ${a.hora}<br> 
            Avaliação: ${a.avaliacao} ⭐<br> 
            Comentário: ${a.comentario}
        `;

        // botão excluir do histórico (separado)
        const excluirBtn = document.createElement("button");
        excluirBtn.className = "hist-delete-btn";
        excluirBtn.textContent = "Excluir";
        excluirBtn.addEventListener("click", () => {
            abrirModalExcluir(a.id);
        });

        li.appendChild(infoDiv);
        li.appendChild(excluirBtn);
        listaEl.appendChild(li);
    });
}


// ------------------------------ 
// 4. LÓGICA DO MODAL (FORÇAR AVALIAÇÃO)
// ------------------------------ 
function abrirModalExcluir(id) {
    idParaExcluir = id;
    const modalConfirm = document.getElementById("modalConfirmarExclusao");
    if (modalConfirm) modalConfirm.style.display = "flex";
}

function fecharModalExcluir() {
    const modalConfirm = document.getElementById("modalConfirmarExclusao");
    if (modalConfirm) modalConfirm.style.display = "none";
}

function confirmarExcluir() {
    if (idParaExcluir == null) return;
    excluirHistorico(idParaExcluir, userGlobal);
    idParaExcluir = null;
    fecharModalExcluir();
}

function abrirModalAvaliacao(agendamento, user) {
    document.getElementById("avaliacaoEstrelas").value = "5";
    document.getElementById("avaliacaoComentario").value = "";
    modal.style.display = "flex";

    closeModal.style.display = 'none';

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


// ------------------------------ 
// 5. CARREGAMENTO E UPLOAD DE FOTO (FINALIZADO COM ISOLAMENTO DE SOBRESCRITA)
// ------------------------------ 
document.addEventListener("DOMContentLoaded", () => {
    // vincula botões do modal de exclusão AQUI para garantir que os elementos existem
    const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");
    const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");

    if (btnCancelarExcluir) {
        btnCancelarExcluir.onclick = () => fecharModalExcluir();
    }
    if (btnConfirmarExcluir) {
        btnConfirmarExcluir.onclick = () => confirmarExcluir();
    }

    const foto = document.getElementById("fotoPerfil");
    const fileInput = document.getElementById("fileInput");
    const emailLogado = localStorage.getItem("usuario-logado-email");
    let fotoCarregada = false;

    if (emailLogado) {
        const savedPhoto = localStorage.getItem(`profile-picture-${emailLogado}`);
        if (savedPhoto) {
            foto.src = savedPhoto;
            fotoCarregada = true;
        }
    }

    if (!fotoCarregada) {
        foto.src = "./img/defaultUser.png";
    }

    foto.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (e) {
            const imageBase64 = e.target.result;
            foto.src = imageBase64;

            try {
                await fetch("/auth/update-photo", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ imageBase64 })
                });
                if (emailLogado) localStorage.setItem(`profile-picture-${emailLogado}`, imageBase64);
            } catch (err) {
                console.error("Erro ao atualizar foto:", err);
            }
        };
        reader.readAsDataURL(file);
    });

    carregarUsuario();
});
