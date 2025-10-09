const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/feedback", feedbackRoutes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
