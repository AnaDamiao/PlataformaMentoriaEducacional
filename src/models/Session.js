let sessions = [];

class SessionMock {
  static async create({ mentorId, estudanteId, horario, status }) {
    const newSession = {
      id: sessions.length + 1,
      mentorId,
      estudanteId,
      horario,
      status: status || "disponivel"
    };
    sessions.push(newSession);
    return { ...newSession };
  }

  static async findAll() {
    return sessions.map(s => ({ ...s }));
  }

  static async findById(id) {
    return sessions.find(s => s.id === parseInt(id)) || null;
  }

  static async updateStatus(id, status) {
    const session = sessions.find(s => s.id === parseInt(id));
    if (session) {
      session.status = status;
      return { ...session };
    }
    return null;
  }

  static async findByMentor(mentorId) {
    return sessions.filter(s => s.mentorId === mentorId);
  }

  static async findByEstudante(estudanteId) {
    return sessions.filter(s => s.estudanteId === estudanteId);
  }
}

module.exports = SessionMock;
