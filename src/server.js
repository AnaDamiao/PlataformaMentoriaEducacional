const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// === Rotas de API ===
app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/feedback", feedbackRoutes);

// === Rotas das telas (frontend) ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HomePage.html"));
});

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Cadastro.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Entrar.html"));
});

app.get("/interesse", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Interesses.html"));
});

app.get("/sessao", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Sessao.html"));
});

app.get("/perfil", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "PerfilNovo.html"));
});

app.get("/perfil/Mentor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "PerfilMentor.html"));
});

app.get("/meu-perfil", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "MeuPerfil.html"));
});

app.get("/agendamento", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Agendamento.html"));
});


app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
