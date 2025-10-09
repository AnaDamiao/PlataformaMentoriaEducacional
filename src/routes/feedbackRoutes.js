const express = require("express");
const router = express.Router();
const { evaluateMentor, feedbackStudent, listFeedbacks } = require("../controllers/feedbackController");

// Estudante avalia mentor
router.post("/evaluate", evaluateMentor);

// Mentor avalia estudante
router.post("/student", feedbackStudent);

router.get("/", listFeedbacks);

module.exports = router;