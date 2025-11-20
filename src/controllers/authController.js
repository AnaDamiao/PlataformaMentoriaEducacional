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

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "Usuário já existe" });

    const hashed = await bcrypt.hash(senha, 10);

    const created = await User.create({
      nome,
      email,
      senha: hashed,
      role,
      serieEscolar,
      areaInteresse,
      areaConhecimento,
      disponibilidade
    });

    res.json({ message: "Usuário registrado", user: sanitizeUser(created) });
  } catch {
    res.status(500).json({ error: "Erro no registro" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(senha, user.senha);
    if (!valid) return res.status(401).json({ error: "Senha inválida" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "segredo_teste",
      { expiresIn: "1d" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 86400000
    });

    res.json({ message: "Login feito", user: sanitizeUser(user) });

  } catch {
    res.status(500).json({ error: "Erro no login" });
  }
};

exports.me = async (req, res) => {
  const user = await User.findOne({ where: { id: req.user.id } });
  res.json({ user: sanitizeUser(user) });
};

exports.logout = (req, res) => {
  res.clearCookie("authToken");
  res.json({ message: "Logout efetuado" });
};

exports.updatePhoto = async (req, res) => {
  const { imageBase64 } = req.body;
  const user = await User.findOne({ where: { id: req.user.id } });

  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  user.foto = imageBase64;

  const database = db.getData();
  const idx = database.users.findIndex(u => u.id === user.id);
  database.users[idx] = user;
  db.saveData(database);

  res.json({ message: "Foto atualizada", foto: imageBase64 });
};

