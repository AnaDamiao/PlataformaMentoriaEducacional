const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

// TODO: USAR BANCO QUANDO ESTIVER PRONTO
// const User = sequelize.define("User", {
//   nome: { type: DataTypes.STRING, allowNull: false },
//   email: { type: DataTypes.STRING, unique: true, allowNull: false },
//   senha: { type: DataTypes.STRING, allowNull: false },
//   role: { type: DataTypes.ENUM("estudante", "mentor"), allowNull: false }
// });

let users = [];

class UserMock {
  static async create({ nome, email, senha, role, serieEscolar, areaInteresse, areaConhecimento, disponibilidade }) {
    const newUser = {
      id: users.length + 1,
      nome,
      email,
      senha,
      role,
      serieEscolar: role === "estudante" ? (serieEscolar || null) : null,
      areaInteresse: role === "estudante" ? (areaInteresse || null) : null,
      areaConhecimento: role === "mentor" ? (areaConhecimento || null) : null,
      disponibilidade: role === "mentor" ? (disponibilidade || null) : null
    };
    users.push(newUser);
    return { ...newUser }; 
  }

  static async findOne({ where: { email } }) {
    return users.find(u => u.email === email) || null;
  }

  static async findAll() {
    return users.map(u => ({ ...u }));
  }
}

module.exports = UserMock;


// module.exports = User;