import express from "express";
import { getSelectedCandidates, sendOnboardingMail } from "../../controllers/interview/onboardingController.js";

const router = express.Router();

// ✅ Fetch selected candidates
router.get("/selected", getSelectedCandidates);

// ✅ Send onboarding email
router.post("/send-email", sendOnboardingMail);

export default router;
