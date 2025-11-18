document.addEventListener('DOMContentLoaded', () => {
    const btnSalvar = document.getElementById("btnSalvar");
    const tituloInteresses = document.getElementById("tituloInteresses");
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const statusModal = document.getElementById("statusModal");
    const modalBtn = document.getElementById("modalBtn");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const modalIcon = statusModal ? statusModal.querySelector(".modal-icon") : null;
    const modalContent = statusModal ? statusModal.querySelector(".modal-content") : null;

    // --- 1. Carregamento dos dados parciais ---
    const dadosParciaisString = localStorage.getItem("cadastro-parcial");
    if (!dadosParciaisString) {
        window.location.href = "Cadastro.html";
        return;
    }
    const dadosParciais = JSON.parse(dadosParciaisString);
    const role = dadosParciais.role || "estudante";
    const areaLabel = role === "mentor" ? "conhecimento" : "interesse";

    if (tituloInteresses) {
        tituloInteresses.textContent = `Selecione sua área de ${areaLabel}`;
    }

    // --- 2. Estilo dos cards ---
    const updateCardState = (checkbox) => {
        const card = checkbox.closest('.card-checkbox');
        if (card) {
            checkbox.checked ? card.classList.add('selecionado') : card.classList.remove('selecionado');
        }
    };

    checkboxes.forEach(checkbox => {
        updateCardState(checkbox);
        checkbox.addEventListener('change', (e) => updateCardState(e.target));
    });

    // --- 3. Modal ---
    function showModal(title, message, isSuccess, redirectPath) {
        if (!statusModal || !modalContent) return;

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalContent.classList.remove('error-modal');
        if (!isSuccess) {
            modalContent.classList.add('error-modal');
            if (modalIcon) modalIcon.innerHTML = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>`;
        } else {
            if (modalIcon) modalIcon.innerHTML = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>`;
        }

        statusModal.style.display = 'flex';
        setTimeout(() => statusModal.classList.add('active'), 10);

        if (modalBtn) {
            modalBtn.onclick = () => {
                statusModal.classList.remove('active');
                setTimeout(() => statusModal.style.display = 'none', 300);
                if (redirectPath) window.location.href = redirectPath;
            };
        }
    }

    // --- 4. Salvar ---
    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const itensSelecionados = Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.value);

            if (itensSelecionados.length === 0) {
                alert(`Selecione pelo menos uma área de ${areaLabel}.`);
                return;
            }

            if (!dadosParciais.perfil) dadosParciais.perfil = {};

            if (role === "estudante") {
                dadosParciais.perfil.areaInteresse = itensSelecionados;
            } else {
                dadosParciais.perfil.areaConhecimento = itensSelecionados;
            }

            // Salvar permanentemente no localStorage
            const emailLower = dadosParciais.email.trim().toLowerCase();
            const userKey = `user-data-${emailLower}`;
            localStorage.setItem(userKey, JSON.stringify(dadosParciais));
            localStorage.setItem("usuario-logado", JSON.stringify(dadosParciais));
            localStorage.removeItem("cadastro-parcial");

            showModal(
                "Cadastro Concluído!",
                "Seus interesses foram salvos com sucesso. Clique em Continuar para ver seu Perfil.",
                true,
                "MeuPerfil.html"
            );
        });
    }
});
