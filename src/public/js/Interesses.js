// Seleção dos elementos
const btnSalvar = document.querySelector(".btn");
const statusModal = document.getElementById("statusModal");
const modalContent = statusModal.querySelector(".modal-content");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalIcon = statusModal.querySelector(".modal-icon");
const modalBtn = document.getElementById("modalBtn");

// Função para exibir o modal com a mensagem correta
function showModal(title, message, isSuccess, redirectPath) {
    // 1. Limpa a classe de erro (para não herdar de um erro anterior)
    modalContent.classList.remove('error-modal');

    // 2. Define o estilo e o ícone com base no status (Sucesso ou Erro)
    if (!isSuccess) {
        modalContent.classList.add('error-modal');
        // Ícone de Erro (X)
        modalIcon.innerHTML = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>`;
    } else {
        // Ícone de Sucesso (Checkmark)
        modalIcon.innerHTML = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>`;
    }

    // 3. Atualiza o conteúdo de texto
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // 4. Exibe o modal
    statusModal.classList.add('active');

    // 5. Configura a ação do botão
    modalBtn.onclick = () => {
        statusModal.classList.remove('active'); // Oculta o modal
        if (redirectPath) {
            window.location.href = redirectPath; // Redireciona se houver um caminho
        }
    };
}


// Event Listener para o botão Salvar
btnSalvar.addEventListener("click", async () => {
    const userData = JSON.parse(localStorage.getItem("cadastro-parcial"));
    if (!userData) {
        showModal(
            "Erro de Dados", 
            "Dados do cadastro não encontrados. Volte e preencha novamente.", 
            false, 
            "Cadastro.html" // Redireciona para o cadastro
        );
        return;
    }

    const interesses = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map((checkbox) => checkbox.value);

    userData.areaInteresse = interesses;

    try {
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem("cadastro-parcial");
            // *** MUDANÇA AQUI: Redireciona para MeuPerfil.html ***
            showModal(
                "Cadastro Concluído!", 
                "Seus interesses foram salvos com sucesso. Clique em Continuar para ver seu Perfil.", 
                true, 
                "MeuPerfil.html" // Caminho de redirecionamento para o perfil do usuário
            );
        } else {
            // Exibe modal de erro do servidor
            showModal(
                "Erro de Cadastro", 
                "Erro: " + (data.error || "Falha ao cadastrar usuário."), 
                false, 
                null // Não redireciona
            );
        }
    } catch (err) {
        console.error("Erro ao cadastrar:", err);
        // Exibe modal de erro de conexão
        showModal(
            "Erro de Conexão", 
            "Erro ao conectar com o servidor. Verifique sua conexão ou tente novamente mais tarde.", 
            false, 
            null // Não redireciona
        );
    }
});
// ... (código showModal inalterado)

// Event Listener para o botão Salvar
btnSalvar.addEventListener("click", async () => {
    const userData = JSON.parse(localStorage.getItem("cadastro-parcial"));
    if (!userData) {
        // ... (erro de dados)
        return;
    }

    const interesses = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map((checkbox) => checkbox.value);

    userData.areaInteresse = interesses;

    try {
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            // 1. SALVA APENAS OS DADOS NECESSÁRIOS PARA O PERFIL ANTES DE LIMPAR
            const perfilData = {
                nome: userData.nome || "Usuário", // Assumindo que 'nome' existe no userData
                anoEscolar: userData.anoEscolar || "Não informado", // Assumindo 'anoEscolar'
                areasInteresse: userData.areaInteresse.join(', ')
            };
            
            // Salva os dados do perfil no localStorage
            localStorage.setItem("perfil-logado", JSON.stringify(perfilData));

            // 2. Limpa o cadastro parcial
            localStorage.removeItem("cadastro-parcial"); 
            
            // 3. Exibe modal e redireciona
            showModal(
                "Cadastro Concluído!", 
                "Seus interesses foram salvos com sucesso. Clique em Continuar para ver seu Perfil.", 
                true, 
                "MeuPerfil.html" // Redireciona para o perfil do usuário
            );
        } else {
            // ... (erro de cadastro)
        }
    } catch (err) {
        // ... (erro de conexão)
    }
});