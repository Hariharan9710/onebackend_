
import { pool as db } from "../../../../config/db.js";
import { sendCandidateMail } from "../../config/interview/mail.js";

// ✅ Add Candidate + Send Email
export const addCandidate = async (req, res) => {
  try {
    const { candidate_name, candidate_email, position, username, password } = req.body;

    console.log("🟢 Incoming data:", req.body);

    const sql = `
      INSERT INTO candidates 
      (candidate_name, candidate_email, position, username, password, email_sent, status)
      VALUES (?, ?, ?, ?, ?, 1, 'EMAIL_SENT')
    `;

    const [result] = await db.query(sql, [
      candidate_name,
      candidate_email,
      position,
      username,
      password,
    ]);

    // ✅ Send email with credentials + login link
    await sendCandidateMail(candidate_email, username, password);

    res
      .status(201)
      .json({
        message: "✅ Candidate added and email sent successfully!",
        id: result.insertId,
      });
  } catch (err) {
    console.error("❌ Error adding candidate:", err.message);
    res.status(500).json({ message: "Database Error", error: err.message });
  }
};

// ✅ Get All Candidates
export const getCandidates = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM candidates");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching candidates:", err.message);
    res
      .status(500)
      .json({ message: "Database Error", error: err.message });
  }
};

// ✅ View all registered candidates
export const viewRegisteredCandidates = async (req, res) => {
  try {
    // const [rows] = await db.query(`
    //   SELECT 
    //     c.id,
    //     c.candidate_name,
    //     c.candidate_email,
    //     c.position,
    //     c.username,
    //     c.status,
    //     r.full_name,
    //     r.phone,
    //     r.gender,
    //     r.education,
    //     r.experience,
    //     r.skills,
    //     r.resume_link
    //   FROM candidates c
    //   LEFT JOIN candidate_register_details r 
    //     ON c.id = r.candidate_id
    //   WHERE c.status IN ('REGISTER_COMPLETED', 'TEST_PENDING', 'TEST_COMPLETED', 'SELECTED', 'REJECTED')
    //   ORDER BY c.created_at DESC
    // `);

    const [rows] = await db.query(`
      SELECT 
  c.id,
  c.candidate_name,
  c.candidate_email,
  c.position,
  c.username,
  c.status,
  c.created_at,   
  r.full_name,
  r.phone,
  r.gender,
  r.education,
  r.experience,
  r.skills,
  r.resume_link
FROM candidates c
LEFT JOIN candidate_register_details r 
  ON c.id = r.candidate_id
WHERE c.status IN 
 ('REGISTER_COMPLETED','TEST_PENDING','TEST_COMPLETED','SELECTED','REJECTED')
ORDER BY c.created_at DESC

    `);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching registered candidates:", err.message);
    res.status(500).json({ error: "Database Error" });
  }
};

