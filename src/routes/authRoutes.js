const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const User = require("../models/User");

router.post("/register", register);
router.post("/login", login);

router.get("/users", async (req, res) => {
  const users = await User.findAll();
  const sanitized = users.map(u => {
    const { senha, ...rest } = u;
    return rest;
  });
  res.json(sanitized);
});

module.exports = router;
