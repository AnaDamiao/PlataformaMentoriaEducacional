// ------------------------------ 
// VARIÁVEIS GLOBAIS / CONSTANTES DO MODAL
// ------------------------------ 
const modal = document.getElementById("avaliacaoModal");
const closeModal = document.getElementById("closeAvaliacaoModal");
const submitAvaliacao = document.getElementById("submitAvaliacao");

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
    // Busca os dados do usuário logado
    const response = await fetch("/auth/me", { credentials: "include" });

    if (!response.ok) {
        window.location.href = "/login";
        return;
    }

    const { user } = await response.json();
    
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

    // Lógica para dados específicos (Série/Disponibilidade)
    if (user.role === "mentor") {
        document.getElementById("labelInfoEspecifica").textContent = "Disponibilidade";
        document.getElementById("infoEspecifica").textContent = user.disponibilidade
            ? `${user.disponibilidade.dias.join(", ")} ${user.disponibilidade.horaInicio}-${user.disponibilidade.horaFim}`
            : "Não cadastrada";
    } else {
        document.getElementById("labelInfoEspecifica").textContent = "Série Escolar";
        document.getElementById("infoEspecifica").textContent = user.serieEscolar;
    }

    // Lógica para Áreas de Interesse/Conhecimento
    const labelArea = user.role === "estudante" ? "Áreas de Interesse:" : "Áreas de Conhecimento:";
    document.getElementById("labelAreaInteresse").textContent = labelArea;
    const areas = user.role === "estudante" ? user.areaInteresse : user.areaConhecimento;
    document.getElementById("areaInteresse").textContent = areas?.join(", ") || "Nenhuma selecionada";

    // Lógica do botão
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
        li.innerHTML = `Sessão com ${user.role === "mentor" ? "aluno" : "mentor"} "${user.role === "mentor" ? a.alunoNome : a.mentorNome}" - ${a.data} às ${a.hora} 
            <button class="btn-vermelho cancel-btn" data-id="${a.id}">Cancelar</button>`;
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
        li.innerHTML = `Sessão com ${user.role === "mentor" ? "aluno" : "mentor"} "${user.role === "mentor" ? a.alunoNome : a.mentorNome}" - ${a.data} às ${a.hora}<br> 
            Avaliação: ${a.avaliacao} ⭐<br> 
            Comentário: ${a.comentario}`;

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


// ------------------------------ 
// 4. LÓGICA DO MODAL (FORÇAR AVALIAÇÃO)
// ------------------------------ 
function criarBotaoEntrarEAvaliar(agendamento, container, user) {
    const btn = document.createElement("button");
    btn.className = "join-session-btn btn-entrar";
    btn.textContent = "Entrar";
    container.appendChild(btn);

    btn.addEventListener("click", () => {
        const meetLink = agendamento.meetLink || "https://meet.google.com/ziv-kkmn-ggp";
        const win = window.open(meetLink, "_blank", "width=800,height=600");

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

function abrirModalAvaliacao(agendamento, user) {
    document.getElementById("avaliacaoEstrelas").value = "5";
    document.getElementById("avaliacaoComentario").value = "";
    modal.style.display = "flex";

    // IMPEDE o fechamento do modal por qualquer meio, exceto o submit
    closeModal.onclick = null;
    closeModal.style.display = 'none'; 
    window.onclick = e => {
        if (e.target === modal) {
            // Não faz nada, forçando o submit.
        }
    };

    submitAvaliacao.onclick = () => {
        const estrelas = document.getElementById("avaliacaoEstrelas").value;
        const comentario = document.getElementById("avaliacaoComentario").value;

        // Salva a avaliação
        agendamento.avaliacao = estrelas;
        agendamento.comentario = comentario;

        let lista = getAgendamentos();
        lista = lista.map(a => a.id === agendamento.id ? agendamento : a);
        salvarAgendamentos(lista);

        // Fecha o modal e restaura o comportamento do clique fora
        modal.style.display = "none";
        window.onclick = e => { 
            if (e.target === modal) modal.style.display = "none"; 
        };
        
        carregarAgendamentos(user);
        carregarHistorico(user);
    };
}


// ------------------------------ 
// 5. CARREGAMENTO E UPLOAD DE FOTO (FINALIZADO COM ISOLAMENTO DE SOBRESCRITA)
// ------------------------------ 
document.addEventListener("DOMContentLoaded", () => {
    const foto = document.getElementById("fotoPerfil");
    const fileInput = document.getElementById("fileInput");

    // 1. Tenta obter o email
    const emailLogado = localStorage.getItem("usuario-logado-email");
    let fotoCarregada = false;

    // A. Tenta carregar a foto salva do localStorage (PRIORIDADE MÁXIMA)
    if (emailLogado) {
        const savedPhoto = localStorage.getItem(`profile-picture-${emailLogado}`);
        if (savedPhoto) {
            foto.src = savedPhoto;
            fotoCarregada = true;
        }
    }
    
    // B. Se a foto não foi carregada do storage, aplica a imagem padrão
    if (!fotoCarregada) {
        foto.src = "./img/defaultUser.png"; 
    }
    // =========================================================================

    // C. Configura o evento de clique para upload
    foto.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (e) {
            const imageBase64 = e.target.result;
            foto.src = imageBase64; // Atualiza visualmente imediatamente

            // 1. Envia para o servidor
            const response = await fetch("/auth/update-photo", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ imageBase64 })
            });

            // 2. Se o servidor confirmar, salva no localStorage
            if (response.ok) {
                const emailAtualizado = localStorage.getItem("usuario-logado-email"); 
                if (emailAtualizado) { 
                    localStorage.setItem(`profile-picture-${emailAtualizado}`, imageBase64);
                    console.log("Foto de perfil salva no servidor e no localStorage.");
                }
            } else {
                 console.error("Falha ao salvar a foto no servidor.");
            }
        };
        reader.readAsDataURL(file);
    });

    // D. Carrega o restante dos dados do usuário
    carregarUsuario();
});