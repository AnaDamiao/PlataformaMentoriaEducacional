const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { login, register, me, logout } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.post("/logout", logout);

module.exports = router;
