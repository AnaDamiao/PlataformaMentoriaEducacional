const express = require("express");
const cors = require("cors");
// const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

// sequelize.sync().then(() => {
  app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
// });