# Project Architecture: Enterprise HR Policy Agentic RAG Copilot (React + Node.js)

1. **`.env`** — Configuration for API keys (Groq, Pinecone, Tavily), index settings, and credentials.
2. **`package.json`** — Root package script orchestration (`npm run dev`, `npm run server`, `npm run client`, `npm run ingest`).
3. **`data/sample_kb/`** — Private enterprise HR documents (handbooks, runbooks, leave policy, benefits).
4. **`server/config.js`** — Central configuration loader for the Node.js backend.
5. **`server/services/ingestion.js`** — Document parser (PDF, DOCX, Markdown, TXT) and recursive chunker.
6. **`server/rag/embeddings.js`** — 384-dimensional local BGE embeddings via `@xenova/transformers`.
7. **`server/rag/vectorstore.js`** — Pinecone vector database integration for vector storage and semantic retrieval.
8. **`server/services/websearch.js`** — Real-time Tavily search integration for external holiday & employment regulations.
9. **`server/rag/agent.js`** — Agentic RAG engine: **Route → Retrieve → Grade → Web Fallback → Query Rewrite → Grounded Answer**.
10. **`server/services/audit.js`** — Audit trail logger for questions, source types, and decision traces.
11. **`server/index.js`** — Express.js REST API providing `/api/chat`, `/api/ingest`, and `/api/health`.
12. **`server/scripts/ingest_sample_kb.js`** — CLI tool to index sample documents into Pinecone (`npm run ingest`).
13. **`client/`** — Modern React.jsx Frontend (built with Vite):
    - `Sidebar.jsx`: Brand badge, workflow diagram, document upload trigger.
    - `TopBar.jsx`: Real-time status indicator and Copilot title.
    - `ChatArea.jsx`: Interactive message bubbles, citations, and source badges.
    - `Composer.jsx`: Clickable prompt chips, multi-line auto-expand textarea, send button.
    - `TracePanel.jsx`: Visual real-time agent decision trace timeline.
    - `UploadModal.jsx`: Modal for HR document uploads with real-time feedback.
