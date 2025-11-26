const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");

const {
  addAvailability,
  scheduleSession,
  confirmSession,
  completeSession,
  listSessions,
  createMeet
} = require("../controllers/sessionController");

router.post("/availability", auth, addAvailability);
router.post("/schedule", auth, scheduleSession);
router.post("/confirm", auth, confirmSession);
router.post("/complete", auth, completeSession);

router.post("/create-meet", auth, createMeet); // ✅ ROTA CORRETA

router.get("/", auth, listSessions);

module.exports = router;
