const btnSalvar = document.getElementById("btnSalvar");

let dadosParciais = JSON.parse(localStorage.getItem("cadastro-parcial"));

if (!dadosParciais) {
  alert("Erro: dados do cadastro não encontrados.");
  window.location.href = "/cadastro";
}

let role = dadosParciais.role;
const checkboxes = document.querySelectorAll(".card-checkbox input");

const cards = document.querySelectorAll(".card-checkbox");

cards.forEach(card => {
    const checkbox = card.querySelector("input");

    card.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

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

  if (role === "estudante") {
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
});
