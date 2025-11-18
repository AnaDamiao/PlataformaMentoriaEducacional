document.addEventListener('DOMContentLoaded', () => {
    const nomePerfilEl = document.getElementById("nomePerfil");
    const emailPerfilEl = document.getElementById("emailPerfil");
    const labelInfoEspecificaEl = document.getElementById("labelInfoEspecifica");
    const infoEspecificaEl = document.getElementById("infoEspecifica");
    const labelAreaInteresseEl = document.getElementById("labelAreaInteresse");
    const areaInteresseEl = document.getElementById("areaInteresse"); 
    const listaAgendamentosEl = document.getElementById("lista-agendamentos");
    const fotoPerfilEl = document.getElementById("fotoPerfil");
    const fileInputEl = document.getElementById("fileInput");

    let usuarioLogado = null;
    let profileKey = null;

    if (fotoPerfilEl) {
        fotoPerfilEl.addEventListener('click', () => fileInputEl?.click());
    }

    function loadProfilePicture() {
        if (!profileKey || !fotoPerfilEl) return;
        const savedImage = localStorage.getItem(profileKey);
        fotoPerfilEl.src = savedImage || "./img/defaultUser.png";
    }

    if (fileInputEl) {
        fileInputEl.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const imageUrl = ev.target.result;
                    fotoPerfilEl.src = imageUrl;
                    localStorage.setItem(profileKey, imageUrl);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function carregarDadosPerfil() {
        const usuarioString = localStorage.getItem("usuario-logado");
        if (!usuarioString) {
            window.location.href = "Cadastro.html";
            return;
        }

        usuarioLogado = JSON.parse(usuarioString);
        profileKey = 'profile-picture-' + usuarioLogado.email;

        nomePerfilEl.textContent = usuarioLogado.nome || 'Não Informado';
        emailPerfilEl.textContent = usuarioLogado.email || 'Não Informado';
        document.getElementById("tipoUsuario").textContent = `(${usuarioLogado.role === 'estudante' ? 'Estudante' : 'Mentor'})`;

        if (usuarioLogado.role === "mentor") {
            const disp = usuarioLogado.disponibilidade || {};
            const areas = usuarioLogado.perfil?.areaConhecimento || [];
            labelInfoEspecificaEl.textContent = 'Disponibilidade';
            labelAreaInteresseEl.textContent = 'Áreas de Conhecimento';
            infoEspecificaEl.textContent = disp.dias ? `${disp.dias.join(', ')} das ${disp.horaInicio} às ${disp.horaFim}` : 'Não definida';
            areaInteresseEl.textContent = areas.join(', ') || 'Nenhuma área selecionada';
        } else {
            labelInfoEspecificaEl.textContent = 'Série Escolar';
            labelAreaInteresseEl.textContent = 'Áreas de Interesse';
            infoEspecificaEl.textContent = usuarioLogado.serieEscolar || 'Não Informada';
            areaInteresseEl.textContent = usuarioLogado.perfil?.areaInteresse?.join(', ') || 'Nenhuma área selecionada';
        }

        loadProfilePicture();
        carregarDadosMockados();
    }

    function carregarDadosMockados() {
        if (!usuarioLogado || !listaAgendamentosEl) return;
        listaAgendamentosEl.innerHTML = '';

        listaAgendamentosEl.innerHTML += `
            <li class="sessao-card">
                <span class="sessao-info">
                    Sessão com **${usuarioLogado.role === 'estudante' ? 'Mentor Teste' : 'Aluno Teste'}** - 
                    Revisão de ${usuarioLogado.perfil?.areaInteresse?.[0] || 'Tópico Geral'} (15/12/2025 às 10:00)
                </span>
                <button onclick="entrarSessao()" class="btn-entrar">Entrar</button>
                <button onclick="cancelarSessao(this)" class="btn-cancelar">Cancelar</button>
            </li>
        `;
    }

    carregarDadosPerfil();
});

document.addEventListener('DOMContentLoaded', () => {
    const btnExplorar = document.querySelector(".btn-explorar");

    if (btnExplorar) {
        btnExplorar.addEventListener("click", () => {
            window.location.href = "ListaMentores.html";
        });
    }
});
