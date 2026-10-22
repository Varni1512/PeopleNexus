import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load root .env
dotenv.config({ path: path.join(rootDir, ".env") });

export const config = {
  port: process.env.PORT || 8000,
  rootDir,
  groqApiKey: process.env.GROQ_API_KEY || (process.env.OPENAI_API_KEY?.startsWith("gsk_") ? process.env.OPENAI_API_KEY : ""),
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  pineconeApiKey: process.env.PINECONE_API_KEY || "",
  pineconeIndexName: process.env.PINECONE_INDEX_NAME || "fde-hr-policy-rag",
  pineconeNamespace: process.env.PINECONE_NAMESPACE || "company-hr-kb",
  tavilyApiKey: process.env.TAVILY_API_KEY || "",
  adminApiKey: process.env.ADMIN_API_KEY || "change-me-in-production",
  embeddingModel: "Xenova/bge-small-en-v1.5",
  embeddingDimension: 384,
  topK: 4,
  maxRetries: 1,
  sampleKbDir: path.join(rootDir, "data", "sample_kb"),
  uploadDir: path.join(rootDir, "uploads"),
  auditLogPath: path.join(rootDir, "data", "audit.json"),
};
