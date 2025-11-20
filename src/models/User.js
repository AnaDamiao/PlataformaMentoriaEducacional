const db = require("../utils/localDB");

class User {
  static async create(data) {
    const database = db.getData();

    const newUser = {
      id: Date.now(),
      foto: data.foto || null,
      ...data
    };

    database.users.push(newUser);
    db.saveData(database);
    return newUser;
  }

  static async findOne({ where }) {
    const database = db.getData();

    if (where.email) {
      return database.users.find(u => u.email === where.email) || null;
    }

    if (where.id) {
      return database.users.find(u => u.id === where.id) || null;
    }

    return null;
  }

  static async findAll() {
    return db.getData().users;
  }
}

module.exports = User;
