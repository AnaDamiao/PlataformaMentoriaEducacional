const Feedback = require("../models/Feedback");
const Session = require("../models/Session");

// Estudante avalia mentor
exports.evaluateMentor = async (req, res) => {
  try {
    const { sessionId, estudanteId, nota, comentario } = req.body;
    const session = await Session.findById(sessionId);

    if (!session || session.estudanteId !== estudanteId) {
      return res.status(400).json({ error: "Sessão inválida ou estudante não autorizado" });
    }

    let feedback = await Feedback.findBySession(sessionId);
    if (feedback) {
      feedback = await Feedback.update(sessionId, { nota, comentarioEstudante: comentario });
    } else {
      feedback = await Feedback.create({
        sessionId,
        estudanteId,
        mentorId: session.mentorId,
        nota,
        comentarioEstudante: comentario
      });
    }

    res.json({ message: "Avaliação registrada com sucesso", feedback });
  } catch (error) {
    res.status(500).json({ error: "Erro ao avaliar mentor" });
  }
};

exports.feedbackStudent = async (req, res) => {
  try {
    const { sessionId, mentorId, comentario } = req.body;

    const session = await Session.findById(sessionId);
    if (!session || session.mentorId !== mentorId) {
      return res.status(400).json({ error: "Sessão inválida ou mentor não autorizado" });
    }

    let feedback = await Feedback.findBySession(sessionId);
    if (feedback) {
      feedback = await Feedback.update(sessionId, { comentarioMentor: comentario });
    } else {
      feedback = await Feedback.create({
        sessionId,
        estudanteId: session.estudanteId,
        mentorId,
        comentarioMentor: comentario
      });
    }

    res.json({ message: "Feedback do mentor registrado com sucesso", feedback });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar feedback" });
  }
};

exports.listFeedbacks = async (req, res) => {
  const feedbacks = await Feedback.findAll();
  res.json(feedbacks);
};