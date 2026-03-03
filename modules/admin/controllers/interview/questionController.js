import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../../data/interview");
const questionsFile = path.join(dataDir, "questions.json");
const lastGeneratedFile = path.join(dataDir, "lastGeneratedTest.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export function loadQuestions() {
  ensureDataDir();
  if (!fs.existsSync(questionsFile)) return [];
  try {
    const raw = fs.readFileSync(questionsFile, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading questions.json:", err.message);
    return [];
  }
}

export function saveQuestions(qs) {
  ensureDataDir();
  fs.writeFileSync(questionsFile, JSON.stringify(qs, null, 2));
}

export function saveLastGenerated(test) {
  ensureDataDir();
  fs.writeFileSync(lastGeneratedFile, JSON.stringify(test, null, 2));
}

export function loadLastGenerated() {
  ensureDataDir();
  if (!fs.existsSync(lastGeneratedFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(lastGeneratedFile, "utf8"));
  } catch (err) {
    console.error("Error reading lastGeneratedTest.json:", err.message);
    return null;
  }
}

// Admin: add question
export const addQuestion = (req, res) => {
  try {
    const { question, options, correct, category, questionType, code } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ error: "Invalid question format (4 options required)" });
    }
    if (!category) return res.status(400).json({ error: "Category required" });
    if (!questionType) return res.status(400).json({ error: "questionType required" });

    const qs = loadQuestions();
    const newId = qs.length > 0 ? qs[qs.length - 1].id + 1 : 1;
    const newQ = { id: newId, question, options, correct, category, questionType };
    if (code) newQ.code = code;

    qs.push(newQ);
    saveQuestions(qs);
    res.json({ message: "Question added", question: newQ });
  } catch (err) {
    console.error("Error addQuestion:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin: delete question
export const deleteQuestion = (req, res) => {
  try {
    const id = Number(req.params.id);
    const qs = loadQuestions();
    const filtered = qs.filter((q) => q.id !== id);
    saveQuestions(filtered);
    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error("Error deleteQuestion:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Admin: view all
export const getQuestions = (req, res) => {
  const qs = loadQuestions();
  res.json(qs);
};

// Admin: generate test by category counts
export const generateTest = (req, res) => {
  try {
    // Expect body like { java:2, sql:3, react:3, spring:2 }
    const counts = req.body || {};
    const all = loadQuestions();

    const final = [];

    for (const [category, cnt] of Object.entries(counts)) {
      const count = Number(cnt || 0);
      if (count <= 0) continue;
      const pool = all.filter((q) => q.category === category);
      const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
      final.push(...shuffled);
    }

    // Final shuffle
    final.sort(() => Math.random() - 0.5);

    // Save generated test (admin action) so later candidate start uses the same
    saveLastGenerated({ generatedAt: Date.now(), questions: final });

    res.json({ message: "Generated test saved", questions: final });
  } catch (err) {
    console.error("Error generateTest:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// GET /api/questions/count
export const getQuestionCount = (req, res) => {
  try {
    const qs = loadQuestions();

    // Total count
    const total = qs.length;

    // Category-wise count
    const categoryCounts = {};
    qs.forEach((q) => {
      if (!categoryCounts[q.category]) {
        categoryCounts[q.category] = 0;
      }
      categoryCounts[q.category]++;
    });

    res.json({
      total,
      categoryCounts
    });

  } catch (err) {
    console.error("Error getQuestionCount:", err);
    res.status(500).json({ error: "Server error" });
  }
};
