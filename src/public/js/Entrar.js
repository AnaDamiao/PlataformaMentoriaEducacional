document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const response = await fetch("/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();
    if (!response.ok) {
      alert(data.error);
      return;
    }

    // ⬇⬇⬇ ALTERAÇÃO AQUI
    window.location.href = "/";
  });
});
