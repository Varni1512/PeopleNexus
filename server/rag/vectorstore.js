import { Pinecone } from "@pinecone-database/pinecone";
import { config } from "../config.js";
import { embedQuery, embedDocuments } from "./embeddings.js";

let pineconeClient = null;

export function getPineconeClient() {
  if (!pineconeClient) {
    if (!config.pineconeApiKey) {
      throw new Error("PINECONE_API_KEY is missing in environment");
    }
    pineconeClient = new Pinecone({ apiKey: config.pineconeApiKey });
  }
  return pineconeClient;
}

export async function ensureIndex() {
  const pc = getPineconeClient();
  const indexes = await pc.listIndexes();
  const indexNames = indexes.indexes ? indexes.indexes.map((i) => i.name) : [];

  if (!indexNames.includes(config.pineconeIndexName)) {
    console.log(`[Pinecone] Creating index ${config.pineconeIndexName}...`);
    await pc.createIndex({
      name: config.pineconeIndexName,
      dimension: config.embeddingDimension,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    let isReady = false;
    while (!isReady) {
      await new Promise((r) => setTimeout(r, 1000));
      const desc = await pc.describeIndex(config.pineconeIndexName);
      isReady = desc.status?.ready;
    }
    console.log(`[Pinecone] Index ready.`);
  }

  return pc.index(config.pineconeIndexName);
}

export async function getVectorStore() {
  await ensureIndex();
  const pc = getPineconeClient();
  return pc.index(config.pineconeIndexName).namespace(config.pineconeNamespace);
}

export async function addDocuments(chunks) {
  const namespace = await getVectorStore();
  const texts = chunks.map((c) => c.pageContent);
  const vectors = await embedDocuments(texts);

  const records = chunks.map((chunk, i) => ({
    id: `doc_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
    values: vectors[i],
    metadata: {
      text: chunk.pageContent,
      source: chunk.metadata?.source || "unknown",
      ...chunk.metadata,
    },
  }));

  // Pinecone batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await namespace.upsert({ records: batch });
  }

  return records.map((r) => r.id);
}

export async function queryIndex(queryText, topK = config.topK) {
  const namespace = await getVectorStore();
  const queryVector = await embedQuery(queryText);

  const queryResponse = await namespace.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return (queryResponse.matches || []).map((match) => ({
    pageContent: match.metadata?.text || "",
    metadata: {
      source: match.metadata?.source || "Private KB",
      score: match.score,
      ...match.metadata,
    },
  }));
}
