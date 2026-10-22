import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { config } from "./config.js";
import { ask } from "./rag/agent.js";
import { addDocuments } from "./rag/vectorstore.js";
import { loadAndChunkFile, SUPPORTED_EXTENSIONS } from "./services/ingestion.js";
import { writeAudit } from "./services/audit.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ensure uploads dir
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Enterprise HR Policy Agentic RAG Copilot (Node.js)",
    model: config.groqModel,
    embeddings: config.embeddingModel,
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== "string" || question.trim().length < 2) {
      return res.status(400).json({ error: "Question must be at least 2 characters long." });
    }

    const result = await ask(question.trim());
    writeAudit(question, result.source_used, result.trace);

    res.json({
      answer: result.answer,
      source_used: result.source_used,
      trace: result.trace,
      citations: result.citations,
      rewritten_query: result.rewritten_query,
    });
  } catch (err) {
    console.error("[API Error /api/chat]:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Document ingestion endpoint
app.post("/api/ingest", upload.single("file"), async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"] || "";
    if (adminKey !== config.adminApiKey) {
      return res.status(401).json({ error: "Invalid admin key" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return res.status(400).json({
        error: `Supported formats: ${Array.from(SUPPORTED_EXTENSIONS).join(", ")}`,
      });
    }

    const chunks = await loadAndChunkFile(req.file.path);
    const ids = await addDocuments(chunks);

    res.json({
      message: "Document indexed successfully",
      file: req.file.originalname,
      chunks: chunks.length,
      ids_created: ids.length,
    });
  } catch (err) {
    console.error("[API Error /api/ingest]:", err);
    res.status(500).json({ error: err.message || "Ingestion failed" });
  }
});

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 HR Agentic RAG Node.js Server listening on port ${config.port}`);
  console.log(`Health: http://localhost:${config.port}/api/health`);
  console.log(`=======================================================`);
});
