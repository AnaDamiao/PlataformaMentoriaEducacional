let feedbacks = [];

class FeedbackMock {
  static async create({ sessionId, estudanteId, mentorId, nota, comentarioEstudante, comentarioMentor }) {
    const newFeedback = {
      id: feedbacks.length + 1,
      sessionId,
      estudanteId,
      mentorId,
      nota: nota || null,
      comentarioEstudante: comentarioEstudante || null,
      comentarioMentor: comentarioMentor || null
    };
    feedbacks.push(newFeedback);
    return { ...newFeedback };
  }

  static async findBySession(sessionId) {
    return feedbacks.find(f => f.sessionId === parseInt(sessionId)) || null;
  }

  static async update(sessionId, data) {
    const feedback = feedbacks.find(f => f.sessionId === parseInt(sessionId));
    if (feedback) {
      Object.assign(feedback, data);
      return { ...feedback };
    }
    return null;
  }

  static async findAll() {
    return feedbacks.map(f => ({ ...f }));
  }
}

module.exports = FeedbackMock;