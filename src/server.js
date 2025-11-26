const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const authMiddleware = require("./middlewares/authMiddleware");
const authController = require("./controllers/authController");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const User = require("./models/User");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);

const pages = {
  "/": "HomePage.html",
  "/cadastro": "Cadastro.html",
  "/login": "Entrar.html",
  "/interesse": "Interesses.html",
  "/meu-perfil": "MeuPerfil.html",
  "/perfilMentor": "PerfilMentor.html",
  "/listaMentores": "ListaMentores.html"
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, "public", file));
  });
});

app.get("/mentores", async (req, res) => {
  try {
    const users = await User.findAll();
    const mentores = users.filter(u => u.role === "mentor");
    res.json(mentores);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar mentores" });
  }
});

app.get("/mentores/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const users = await User.findAll();

    const mentor = users.find(
      u => u.role === "mentor" && String(u.id) === String(id)
    );

    if (!mentor) {
      return res.status(404).json({ error: "Mentor não encontrado" });
    }

    res.json(mentor);

  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar mentor por ID" });
  }
});

app.put("/auth/update-photo", authMiddleware, authController.updatePhoto);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));

