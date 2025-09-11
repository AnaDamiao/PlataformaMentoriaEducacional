const Session = require("../models/Session");
const User = require("../models/User");

// Mentor cadastra horários disponíveis
exports.addAvailability = async (req, res) => {
  try {
    const { mentorId, horario } = req.body;
    const mentor = await User.findOne({ where: { id: mentorId } });

    if (!mentor || mentor.role !== "mentor") {
      return res.status(400).json({ error: "Usuário não é um mentor válido" });
    }

    const session = await Session.create({
      mentorId: mentor.id,
      estudanteId: null,
      horario,
      status: "disponivel"
    });

    res.status(201).json({ message: "Horário adicionado com sucesso", session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar horário" });
  }
};

// Estudante agenda sessão
exports.scheduleSession = async (req, res) => {
  try {
    const { estudanteId, sessionId } = req.body;
    const session = await Session.findById(sessionId);

    if (!session || session.status !== "disponivel") {
      return res.status(400).json({ error: "Sessão não disponível para agendamento" });
    }

    session.estudanteId = estudanteId;
    session.status = "pendente";

    res.json({ message: "Sessão agendada, aguardando confirmação do mentor", session });
  } catch (error) {
    res.status(500).json({ error: "Erro ao agendar sessão" });
  }
};

// Mentor confirma sessão
exports.confirmSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.updateStatus(sessionId, "confirmada");
    if (!session) return res.status(404).json({ error: "Sessão não encontrada" });

    res.json({ message: "Sessão confirmada pelo mentor", session });
  } catch (error) {
    res.status(500).json({ error: "Erro ao confirmar sessão" });
  }
};

// Concluir sessão
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.updateStatus(sessionId, "realizada");
    if (!session) return res.status(404).json({ error: "Sessão não encontrada" });

    res.json({ message: "Sessão concluída com sucesso", session });
  } catch (error) {
    res.status(500).json({ error: "Erro ao concluir sessão" });
  }
};

// Listar todas as sessões
exports.listSessions = async (req, res) => {
  const sessions = await Session.findAll();
  res.json(sessions);
};
