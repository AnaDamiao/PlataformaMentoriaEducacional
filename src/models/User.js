const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");


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

  static async findOne({ where }) {
    if (where.email) {
      return users.find(u => u.email === where.email) || null;
    }
    if (where.id) {
      return users.find(u => u.id === where.id) || null;
    }
    return null;
  }

  static async findAll() {
    return users.map(u => ({ ...u }));
  }
}

module.exports = UserMock;
