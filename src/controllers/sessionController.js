const Session = require("../models/Session");
const User = require("../models/User");

const oauth2Client = require("../google");
const { google } = require("googleapis");
const db = require("../utils/localDB");

const path = require("path");
const fs = require("fs");

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

exports.createMeet = async (req, res) => {
    const { mentorId, estudanteId, data, hora } = req.body;

    try {
        const tokensPath = path.join(process.cwd(), "google-tokens.json");

        if (!fs.existsSync(tokensPath)) {
            throw new Error("google-tokens.json não encontrado: " + tokensPath);
        }

        const tokens = JSON.parse(fs.readFileSync(tokensPath));
        oauth2Client.setCredentials(tokens);

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const event = {
            summary: "Sessão EduMentor",
            start: { dateTime: `${data}T${hora}:00-03:00` },
            end: { dateTime: `${data}T${hora}:00-03:00` },
            conferenceData: {
                createRequest: {
                    requestId: Date.now().toString(),
                    conferenceSolutionKey: { type: "hangoutsMeet" }
                }
            }
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            conferenceDataVersion: 1
        });

        const meetLink = response.data.hangoutLink;

        const session = await Session.create({
            mentorId,
            estudanteId,
            horario: `${data} ${hora}`,
            status: "confirmada",
            meetLink
        });

        res.json({
            message: "Meet criado com sucesso!",
            meetLink,
            session
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Erro ao criar reunião" });
    }
};