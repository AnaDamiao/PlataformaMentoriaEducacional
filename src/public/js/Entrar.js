document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim().toLowerCase();
            const senha = document.getElementById("senha").value.trim();

            if (!email || !senha) {
                alert("Preencha todos os campos!");
                return;
            }

            const userKey = `user-data-${email}`;
            const usuarioString = localStorage.getItem(userKey);

            if (!usuarioString) {
                alert("E-mail não cadastrado.");
                return;
            }

            const usuarioCadastrado = JSON.parse(usuarioString);

            if (usuarioCadastrado.senha !== senha) {
                alert("Senha incorreta.");
                return;
            }

            localStorage.setItem("usuario-logado", JSON.stringify(usuarioCadastrado));
            window.location.href = "MeuPerfil.html";
        });
    }
});
