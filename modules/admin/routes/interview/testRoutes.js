import express from "express";
import { startTest, submitTest, results, getTestAnswers } from "../../controllers/interview/testController.js";

const router = express.Router();

router.post("/start", startTest);
router.post("/submit", submitTest);
router.get("/answers/:testId", getTestAnswers);
router.get("/results", results);

export default router;
