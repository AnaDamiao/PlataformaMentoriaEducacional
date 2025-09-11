const express = require("express");
const router = express.Router();
const {
  addAvailability,
  scheduleSession,
  confirmSession,
  completeSession,
  listSessions
} = require("../controllers/sessionController");

router.post("/availability", addAvailability);

router.post("/schedule", scheduleSession);

router.post("/confirm", confirmSession);

router.post("/complete", completeSession);

//lista todos
router.get("/", listSessions);

module.exports = router;
