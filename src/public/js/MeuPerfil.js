document.addEventListener("DOMContentLoaded", () => {
    // 1. Recupera os dados do perfil salvos no localStorage
    const perfilDataString = localStorage.getItem("perfil-logado");

    // 2. Verifica se os dados existem
    if (perfilDataString) {
        try {
            const perfilData = JSON.parse(perfilDataString);

            // 3. Seleciona os elementos no DOM
            const nomeElement = document.getElementById("perfilNome");
            const anoEscolarElement = document.getElementById("perfilAnoEscolar");
            const areasElement = document.getElementById("perfilAreas");

            // 4. Preenche os elementos com os dados reais
            if (nomeElement) {
                // Preenche o nome, usando um fallback se a propriedade não existir
                nomeElement.textContent = perfilData.nome || "Nome não encontrado";
            }
            if (anoEscolarElement) {
                // Preenche o ano escolar
                anoEscolarElement.textContent = perfilData.anoEscolar || "Não informado";
            }
            if (areasElement) {
                // Preenche as áreas de interesse
                areasElement.textContent = perfilData.areasInteresse || "Nenhuma área selecionada";
            }

        } catch (error) {
            console.error("Erro ao fazer parse dos dados do perfil:", error);
            // Opcional: mostrar uma mensagem de erro na tela
        }
    } else {
        console.warn("Nenhum dado de perfil encontrado no localStorage.");
        // Opcional: Redirecionar o usuário de volta para o cadastro/login
    }
});