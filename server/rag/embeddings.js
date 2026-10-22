import { pipeline } from "@xenova/transformers";
import { config } from "../config.js";

let extractor = null;

export async function getExtractor() {
  if (!extractor) {
    console.log(`[Embeddings] Loading ${config.embeddingModel}...`);
    extractor = await pipeline("feature-extraction", config.embeddingModel);
    console.log(`[Embeddings] Model loaded.`);
  }
  return extractor;
}

export async function embedQuery(text) {
  const pipe = await getExtractor();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

export async function embedDocuments(texts) {
  const pipe = await getExtractor();
  const results = [];
  for (const text of texts) {
    const output = await pipe(text, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data));
  }
  return results;
}
