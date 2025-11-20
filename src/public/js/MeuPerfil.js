async function carregarUsuario() {
  const response = await fetch("/auth/me", { credentials: "include" });

  if (!response.ok) {
    window.location.href = "/login";
    return;
  }

  const { user } = await response.json();
  preencherPerfil(user);
}

function preencherPerfil(user) {
  document.getElementById("nomePerfil").textContent = user.nome;
  document.getElementById("emailPerfil").textContent = user.email;
  document.getElementById("tipoUsuario").textContent =
    user.role === "mentor" ? "Mentor" : "Estudante";

  if (user.role === "mentor") {
    document.getElementById("labelInfoEspecifica").textContent = "Disponibilidade";
    document.getElementById("infoEspecifica").textContent =
      user.disponibilidade ? `${user.disponibilidade.dias.join(", ")} ${user.disponibilidade.horaInicio}-${user.disponibilidade.horaFim}` : "Não cadastrada";
  } else {
    document.getElementById("labelInfoEspecifica").textContent = "Série Escolar";
    document.getElementById("infoEspecifica").textContent = user.serieEscolar;
  }

    // Áreas de interesse ou conhecimento
    if (user.role === "estudante") {
        document.getElementById("labelAreaInteresse").textContent = "Áreas de Interesse:";
        document.getElementById("areaInteresse").textContent = user.areaInteresse?.join(", ") || "Nenhuma selecionada";
    } else {
        document.getElementById("labelAreaInteresse").textContent = "Áreas de Conhecimento:";
        document.getElementById("areaInteresse").textContent = user.areaConhecimento?.join(", ") || "Nenhuma selecionada";
    }

    localStorage.setItem("usuario-logado-email", user.email);

}

document.addEventListener("DOMContentLoaded", function () {
    const foto = document.getElementById("fotoPerfil");
    const fileInput = document.getElementById("fileInput");

    foto.addEventListener("click", () => {
        fileInput.click();
    });

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
        if (savedPhoto) {
            foto.src = savedPhoto;
        }
    }
});

carregarUsuario();
