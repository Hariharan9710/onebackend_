import { pool as db } from "../../../../config/db.js";
import nodemailer from "nodemailer";

export const getSelectedCandidates = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ct.test_id,
        c.id AS candidate_id,
        c.candidate_name AS name,
        c.candidate_email AS email,
        ct.score,
        CASE 
          WHEN ct.score >= 20 THEN 'PASSED'
          ELSE 'FAILED'
        END AS result
      FROM candidate_tests ct
      JOIN candidates c ON ct.candidate_id = c.id
      WHERE ct.test_status = 'COMPLETED' 
        AND ct.score >= 20
      ORDER BY ct.test_id DESC
    `);

    console.log("🏆 Passed Candidates:", rows.length);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching passed candidates:", err.message);
    res.status(500).json({ error: "Database Error", details: err.message });
  }
};

// ✅ Send onboarding email
export const sendOnboardingMail = async (req, res) => {
  const { email, username } = req.body;

  if (!email || !username) {
    return res.status(400).json({ error: "Email and username are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hariprasath07587@gmail.com", // 👈 replace
        pass: "uzgf zndm nxhg lcub", // 👈 app-specific password
      },
    });

    const googleFormLink =
      "https://docs.google.com/forms/d/e/1FAIpQLSfxVAMtEQ-ydFRQPJ3kdd9fHyHgleeYDtLQ4feQkJBesA5CAA/viewform?usp=dialog";

    const mailOptions = {
      from: '"HR Team" <hariprasath07587@gmail.com>',
      to: email,
      subject: "🎉 Congratulations! Onboarding Document Verification",
      html: `
        <h3>Hello ${username},</h3>
        <p>Congratulations! 🎉 You have been selected for the next round of onboarding.</p>
        <p>Please complete the following Google Form for document verification:</p>
        <a href="${googleFormLink}" target="_blank" style="color:#1a73e8;">${googleFormLink}</a>
        <p>Best Regards,<br/>HR Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Onboarding email sent to ${email}`);
    res.json({ message: `✅ Onboarding email sent to ${email}` });
  } catch (error) {
    console.error("❌ Error sending onboarding email:", error.message);
    res.status(500).json({ error: "Failed to send onboarding email" });
  }
};
