const btnSalvar = document.getElementById("btnSalvar");
const checkboxes = document.querySelectorAll(".card-checkbox input");
const cards = document.querySelectorAll(".card-checkbox");

const authToken = document.cookie
  .split("; ")
  .find(row => row.startsWith("authToken="))
  ?.split("=")[1];

let modoEdicao = false;
let usuario = null;

async function carregarUsuario() {
  if (!authToken) return; 

  const res = await fetch("/auth/me", {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!res.ok) return;

  usuario = await res.json();
  modoEdicao = true;

  const interessesAtuais =
    usuario.role === "estudante"
      ? usuario.areaInteresse
      : usuario.areaConhecimento;

  checkboxes.forEach(cb => {
    if (interessesAtuais.includes(cb.value)) {
      cb.checked = true;
      cb.parentElement.classList.add("selecionado");
    }
  });
}

carregarUsuario();

cards.forEach(card => {
  const checkbox = card.querySelector("input");

  card.addEventListener("click", (e) => {
    e.preventDefault();
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
      card.classList.add("selecionado");
    } else {
      card.classList.remove("selecionado");
    }
  });
});

btnSalvar.addEventListener("click", async () => {
  const selecionados = Array.from(checkboxes)
    .filter(c => c.checked)
    .map(c => c.value);

  if (selecionados.length === 0) {
    alert("Selecione ao menos uma área.");
    return;
  }

  let dadosParciais = JSON.parse(localStorage.getItem("cadastro-parcial"));

  if (!modoEdicao && dadosParciais) {
    if (dadosParciais.role === "estudante") {
      dadosParciais.areaInteresse = selecionados;
    } else {
      dadosParciais.areaConhecimento = selecionados;
    }

    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosParciais)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao registrar.");
      return;
    }

    localStorage.removeItem("cadastro-parcial");
    window.location.href = "/login";
    return;
  }

  if (modoEdicao) {
    const body =
      usuario.role === "estudante"
        ? { areaInteresse: selecionados }
        : { areaConhecimento: selecionados };

    const res = await fetch("/users/interesses", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao atualizar interesses.");
      return;
    }

    alert("Interesses atualizados com sucesso!");
    window.location.href = "/meu-perfil";
    return;
  }

});
