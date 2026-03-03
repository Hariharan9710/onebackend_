


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool as db } from "../../../../config/db.js";
import { loadLastGenerated } from "./questionController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------------------
   START TEST  (FINAL FIXED)
--------------------------------*/
export const startTest = async (req, res) => {
  try {
    const { candidate_id } = req.body;

    if (!candidate_id)
      return res.status(400).json({ error: "Candidate ID is required" });

    console.log("Candidate starting test:", candidate_id);

    // Load last generated data
    const last = loadLastGenerated();
    if (!last || !last.questions) {
      return res.status(400).json({
        error: "No generated test found. Admin must generate test first."
      });
    }

    // FIX: extract ONLY questions array (ignore generatedAt)
    let questions = last.questions;

    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: "Invalid test format in JSON file" });
    }

    const questionsJSON = JSON.stringify(questions);

    // Insert test row
    const [result] = await db.query(
      `INSERT INTO candidate_tests 
       (candidate_id, test_status, questions_json, start_time)
       VALUES (?, 'IN_PROGRESS', ?, NOW())`,
      [candidate_id, questionsJSON]
    );

    return res.json({
      message: "Test started",
      test_id: result.insertId,
      questions
    });

  } catch (err) {
    console.error("startTest error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};
/* -------------------------------
   SUBMIT TEST  (FINAL FIXED)
--------------------------------*/
export const submitTest = async (req, res) => {
  try {
    const { test_id, answers } = req.body;

    console.log("📥 SUBMIT TEST ID =", test_id);
    console.log("📥 RECEIVED ANSWERS =", answers);

    if (!test_id || !answers)
      return res.status(400).json({ error: "Missing test_id or answers" });

    const [rows] = await db.query(
      `SELECT candidate_id, questions_json 
       FROM candidate_tests 
       WHERE test_id = ?`,
      [test_id]
    );

    if (rows.length === 0)
      return res.status(400).json({ error: "Test not found" });

    const candidate_id = rows[0].candidate_id;

    // ✅ FIX: handle both string + already-parsed JSON
    let rawQuestions = rows[0].questions_json;
    let questions;

    // If DB driver already parsed JSON → it's an array/object
    if (typeof rawQuestions === "string") {
      // string → parse
      try {
        rawQuestions = JSON.parse(rawQuestions);
      } catch (e) {
        console.log("❌ Cannot parse questions_json string:", rawQuestions);
        return res.status(500).json({ error: "Invalid JSON stored in DB" });
      }
    }

    // Support both formats:
    // 1) { generatedAt, questions: [...] }
    // 2) [ ...questions ]
    if (Array.isArray(rawQuestions)) {
      questions = rawQuestions;
    } else if (rawQuestions && Array.isArray(rawQuestions.questions)) {
      questions = rawQuestions.questions;
    } else {
      console.log("❌ questions_json is not array or {questions: []}", rawQuestions);
      return res.status(500).json({ error: "Invalid questions format in DB" });
    }

    let score = 0;

    // ✅ Insert each answer + calculate score
    for (const q of questions) {
      const selected = answers[q.id] || null;
      const is_correct = selected === q.correct ? 1 : 0;

      if (is_correct) score += 10;

      await db.query(
        `INSERT INTO candidate_test_answers 
         (test_id, candidate_id, question_id, selected_answer, correct_answer, is_correct)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [test_id, candidate_id, q.id, selected, q.correct, is_correct]
      );
    }

    console.log("⚡ UPDATING STATUS → COMPLETED for test =", test_id);

    await db.query(
      `UPDATE candidate_tests 
       SET score = ?, test_status = 'COMPLETED', end_time = NOW()
       WHERE test_id = ?`,
      [score, test_id]
    );

    return res.json({ message: "Test submitted", score });

  } catch (err) {
    console.error("submitTest error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};


// /* -------------------------------
//    GET RESULTS (HR PANEL)
// --------------------------------*/
// export const results = async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         ct.test_id,
//         c.candidate_name AS name,
//         ct.score,
//         CASE WHEN ct.score >= 5 THEN 'PASSED' ELSE 'FAILED' END AS result,
//         ct.start_time,
//         ct.end_time,
//         ct.test_status
//       FROM candidate_tests ct
//       LEFT JOIN candidates c ON ct.candidate_id = c.id
//       ORDER BY ct.test_id DESC
//     `);

//     return res.json(rows);

//   } catch (err) {
//     console.error("results error:", err);
//     return res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

/* -------------------------------
   GET RESULTS (HR PANEL WITH FILTERS)
--------------------------------*/
export const results = async (req, res) => {
  try {
    const { name, minScore, fromDate, toDate } = req.query;

    let query = `
      SELECT 
        ct.test_id,
        c.candidate_name AS name,
        ct.score,
        CASE WHEN ct.score >= 5 THEN 'PASSED' ELSE 'FAILED' END AS result,
        ct.start_time,
        ct.end_time,
        ct.test_status,
        crd.skills
      FROM candidate_tests ct
      LEFT JOIN candidates c ON ct.candidate_id = c.id
      LEFT JOIN candidate_register_details crd ON ct.candidate_id = crd.candidate_id
      WHERE 1 = 1
    `;

    let params = [];

    // 🔍 Search by Candidate Name
    if (name) {
      query += ` AND c.candidate_name LIKE ? `;
      params.push(`%${name}%`);
    }

    // 🎯 Min Score Filter
    if (minScore) {
      query += ` AND ct.score >= ? `;
      params.push(Number(minScore));
    }

    // 📅 Date Range Filter
    if (fromDate) {
      query += ` AND DATE(ct.start_time) >= ? `;
      params.push(fromDate);
    }

    if (toDate) {
      query += ` AND DATE(ct.start_time) <= ? `;
      params.push(toDate);
    }

    query += ` ORDER BY ct.test_id DESC `;

    const [rows] = await db.query(query, params);

    return res.json(rows);

  } catch (err) {
    console.error("results error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};



export const getTestAnswers = async (req, res) => {
  try {
    const { testId } = req.params;

    const [testRow] = await db.query(
      `SELECT questions_json FROM candidate_tests WHERE test_id = ?`,
      [testId]
    );

    if (testRow.length === 0)
      return res.status(404).json({ error: "Test not found" });

    let questions;

    // FIX: MySQL JSON field sometimes returns JS object, not string
    if (typeof testRow[0].questions_json === "string") {
      try {
        questions = JSON.parse(testRow[0].questions_json);
      } catch (e) {
        console.log("❌ JSON parse failed:", testRow[0].questions_json);
        return res.status(500).json({ error: "Invalid JSON stored in DB" });
      }
    } else {
      // Already parsed by MySQL → use directly
      questions = testRow[0].questions_json;
    }

    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: "Questions must be an array" });
    }

    // Fetch answers
    const [answersRows] = await db.query(
      `SELECT question_id, selected_answer, correct_answer, is_correct
       FROM candidate_test_answers
       WHERE test_id = ?`,
      [testId]
    );

    const merged = questions.map(q => {
      const ans = answersRows.find(a => a.question_id === q.id) || {};
      return {
        question_id: q.id,
        question: q.question,
        options: q.options || [],
        selected_answer: ans.selected_answer || null,
        correct_answer: ans.correct_answer || q.correct,
        is_correct: ans.is_correct || 0
      };
    });

    return res.json(merged);

  } catch (err) {
    console.error("getTestAnswers error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

