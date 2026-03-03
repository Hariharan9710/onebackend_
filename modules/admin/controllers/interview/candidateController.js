
import { pool as db } from "../../../../config/db.js";

// ✅ Candidate Login
export const candidateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [rows] = await db.query(
      "SELECT * FROM candidates WHERE candidate_email = ? AND password = ?",
      [email, password]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const candidate = rows[0];

    await db.query("UPDATE candidates SET status = 'REGISTER_PENDING' WHERE id = ?", [
      candidate.id,
    ]);

    res.status(200).json({ message: "✅ Login successful", candidate });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// ✅ Register Candidate Details
export const registerCandidateDetails = async (req, res) => {
  try {
    const {
      candidate_id,
      full_name,
      phone,
      gender,
      dob,
      address,
      education,
      experience,
      skills,
      resume_link,
    } = req.body;

    if (!candidate_id || !full_name || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = `
      INSERT INTO candidate_register_details 
      (candidate_id, full_name, phone, gender, dob, address, education, experience, skills, resume_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      candidate_id,
      full_name,
      phone,
      gender,
      dob,
      address,
      education,
      experience,
      skills,
      resume_link,
    ]);

    await db.query("UPDATE candidates SET status = 'REGISTER_COMPLETED' WHERE id = ?", [
      candidate_id,
    ]);

    res.json({ message: "✅ Registration details saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving details:", err.message);
    res.status(500).json({ message: "Database Error", error: err.message });
  }
};
