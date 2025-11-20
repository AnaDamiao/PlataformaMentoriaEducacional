const Session = require("../models/Session");
const User = require("../models/User");

exports.addAvailability = async (req, res) => {
  const { mentorId, horario } = req.body;
  const mentor = await User.findOne({ where: { id: mentorId } });
  if (!mentor || mentor.role !== "mentor") {
    return res.status(400).json({ error: "Mentor inválido" });
  }

  const session = await Session.create({
    mentorId,
    estudanteId: null,
    horario,
    status: "disponivel"
  });

  res.json({ message: "Disponibilidade adicionada", session });
};

exports.scheduleSession = async (req, res) => {
  const { sessionId } = req.body;
  const estudanteId = req.user.id;

  const session = await Session.findById(sessionId);

  if (!session || session.status !== "disponivel") {
    return res.status(400).json({ error: "Sessão indisponível" });
  }

  session.estudanteId = estudanteId;
  session.status = "pendente";

  const updated = await Session.updateStatus(sessionId, "pendente");
  res.json({ message: "Sessão agendada", session: updated });
};

exports.confirmSession = async (req, res) => {
  const { sessionId } = req.body;
  const updated = await Session.updateStatus(sessionId, "confirmada");
  res.json({ message: "Confirmada", session: updated });
};

exports.completeSession = async (req, res) => {
  const { sessionId } = req.body;
  const updated = await Session.updateStatus(sessionId, "realizada");
  res.json({ message: "Realizada", session: updated });
};

exports.listSessions = async (req, res) => {
  res.json(await Session.findAll());
};
