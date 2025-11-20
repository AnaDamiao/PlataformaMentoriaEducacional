const db = require("../utils/localDB");

class Session {
  static async create(data) {
    const database = db.getData();

    const newSession = {
      id: Date.now(),
      ...data
    };

    database.sessions.push(newSession);
    db.saveData(database);

    return newSession;
  }

  static async findAll() {
    return db.getData().sessions;
  }

  static async findById(id) {
    return db.getData().sessions.find(s => s.id === parseInt(id)) || null;
  }

  static async updateStatus(id, status) {
    const database = db.getData();
    const session = database.sessions.find(s => s.id === parseInt(id));

    if (!session) return null;

    session.status = status;
    db.saveData(database);

    return session;
  }

  static async findByMentor(mentorId) {
    return db.getData().sessions.filter(s => s.mentorId === mentorId);
  }

  static async findByEstudante(estudanteId) {
    return db.getData().sessions.filter(s => s.estudanteId === estudanteId);
  }
}

module.exports = Session;
