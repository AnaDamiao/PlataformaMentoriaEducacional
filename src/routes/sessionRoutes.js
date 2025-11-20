const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  addAvailability,
  scheduleSession,
  confirmSession,
  completeSession,
  listSessions
} = require("../controllers/sessionController");

router.post("/availability", auth, addAvailability);
router.post("/schedule", auth, scheduleSession);
router.post("/confirm", auth, confirmSession);
router.post("/complete", auth, completeSession);

router.get("/", auth, listSessions);

module.exports = router;
