// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const sanitizeUser = (user) => {
  if (!user) return null;
  const { senha, ...rest } = user;
  return rest;
};

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, role, serieEscolar, areaInteresse, areaConhecimento, disponibilidade } = req.body;

    if (!["estudante", "mentor"].includes(role)) {
      return res.status(400).json({ error: 'Role inválida. Use "estudante" ou "mentor".' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    if (role === "estudante") {
      if (!serieEscolar || !areaInteresse) {
        return res.status(400).json({ error: "Estudante precisa enviar serieEscolar e areaInteresse." });
      }
    } else {
      if (!areaConhecimento || !disponibilidade) {
        return res.status(400).json({ error: "Mentor precisa enviar areaConhecimento e disponibilidade." });
      }
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const created = await User.create({
      nome,
      email,
      senha: hashedPassword,
      role,
      serieEscolar,
      areaInteresse,
      areaConhecimento,
      disponibilidade
    });

    res.status(201).json({ message: "Usuário registrado com sucesso", user: sanitizeUser(created) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) return res.status(401).json({ error: "Senha inválida" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "segredo_teste",
      { expiresIn: "1d" }
    );

    res.json({ message: "Login realizado com sucesso", token, user: sanitizeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no login" });
  }
};
