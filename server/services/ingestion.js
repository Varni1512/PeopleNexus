import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export const SUPPORTED_EXTENSIONS = new Set([".pdf", ".txt", ".md", ".docx"]);

export function recursiveTextSplitter(text, chunkSize = 800, chunkOverlap = 120) {
  const chunks = [];
  if (!text || !text.trim()) return chunks;

  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (!currentChunk) {
      currentChunk = trimmed;
    } else if (currentChunk.length + trimmed.length + 2 <= chunkSize) {
      currentChunk += "\n\n" + trimmed;
    } else {
      chunks.push(currentChunk);
      const overlapText = currentChunk.length > chunkOverlap ? currentChunk.slice(-chunkOverlap) : "";
      currentChunk = (overlapText ? overlapText + "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function parseDocument(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let text = "";

  if (ext === ".txt" || ext === ".md") {
    text = fs.readFileSync(filePath, "utf-8");
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  } else if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    // pdf-parse v2 support
    const pdfParseModule = await import("pdf-parse");
    const pdfFunc = pdfParseModule.default || pdfParseModule;
    try {
      const data = await pdfFunc(buffer);
      text = data.text;
    } catch {
      // Fallback simple string extraction
      text = buffer.toString("utf-8");
    }
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  return text;
}

export async function loadAndChunkFile(filePath, chunkSize = 600, chunkOverlap = 100) {
  const fullText = await parseDocument(filePath);
  const rawChunks = recursiveTextSplitter(fullText, chunkSize, chunkOverlap);
  const fileName = path.basename(filePath);

  return rawChunks.map((content, idx) => ({
    pageContent: content,
    metadata: {
      source: fileName,
      chunkIndex: idx,
      totalChunks: rawChunks.length,
    },
  }));
}
