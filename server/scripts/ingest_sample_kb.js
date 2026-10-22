import fs from "fs";
import path from "path";
import { config } from "../config.js";
import { loadAndChunkFile } from "../services/ingestion.js";
import { addDocuments } from "../rag/vectorstore.js";

async function main() {
  console.log(`[Ingest] Reading files from ${config.sampleKbDir}...`);
  if (!fs.existsSync(config.sampleKbDir)) {
    console.error(`Directory not found: ${config.sampleKbDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(config.sampleKbDir).filter((f) => !f.startsWith("."));
  let allChunks = [];

  for (const file of files) {
    const fullPath = path.join(config.sampleKbDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    console.log(`  Processing ${file}...`);
    const chunks = await loadAndChunkFile(fullPath);
    console.log(`  → ${chunks.length} chunks generated.`);
    allChunks.push(...chunks);
  }

  console.log(`[Ingest] Uploading ${allChunks.length} chunks into Pinecone (${config.pineconeIndexName})...`);
  const ids = await addDocuments(allChunks);
  console.log(`✅ Success! Indexed ${files.length} files -> ${allChunks.length} chunks -> ${ids.length} Pinecone vectors.`);
}

main().catch((err) => {
  console.error("❌ Ingestion error:", err);
  process.exit(1);
});
