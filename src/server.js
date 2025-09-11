const express = require("express");
const cors = require("cors");
// const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
// sequelize.sync().then(() => {
  app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
// });