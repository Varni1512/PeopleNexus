# Enterprise HR Policy & Employee Support Agentic RAG Copilot

An end-to-end Forward Deployed Engineer (FDE) project that converts an Agentic RAG workflow into a modern, production-ready enterprise HR product using **React.jsx**, **Tailwind CSS v4**, **Node.js (Express)**, **Groq**, **Pinecone**, **Xenova BGE Embeddings**, and **Tavily**.

---

## 1. Business Problem

### Customer
**PeoplePrime Technologies & NovaRetail**, an enterprise retail and technology company with 3,000+ employees.

### Problem
The HR team maintains dozens of internal documents: leave policies, remote-work guidelines, payroll rules, health insurance benefits, onboarding procedures, POSH conduct guidelines, and HR operations runbooks.

Employees frequently ask repetitive questions because they do not know which policy applies, generic chatbots hallucinate company rules, and certain queries require up-to-date public statutory regulations (e.g., regional public holidays or government maternity laws).

### Business Goals
Build a secure, enterprise-grade HR Policy Copilot that:
1. **Prioritizes Private Company Knowledge:** Searches trusted private HR documents first.
2. **Evaluates Evidence Quality:** Grades retrieved evidence before generating answers.
3. **Uses Fallback Search for External Employment Laws:** Leverages Tavily web search only when private documents are insufficient and the query concerns legitimate employment/statutory matters.
4. **Enforces Domain Guardrails:** Automatically blocks non-HR, out-of-scope topics (e.g., cricket, coding, cooking, entertainment) with a professional corporate disclaimer.
5. **Visualizes Agent Decisions:** Displays a real-time decision trace timeline (Routing → Retrieval → Grading → Fallback → Answer) directly in the user interface.
6. **Empowers HR Ingestion:** Lets HR staff upload and index new documents (.pdf, .docx, .md, .txt) directly via the web portal or CLI.

---

## 2. Solution Architecture

```text
       Employee / HR User
               ↓
    React.jsx + Tailwind CSS v4 UI (Vite: Port 5173)
               ↓ POST /api/chat
    Node.js Express API Server (Port 8000)
               ↓
    Agentic RAG Engine (with Domain Guardrails)
               ↓
 ┌──────────────────────┬────────────────────────┐
 ↓                      ↓                        ↓
[1] Private HR KB      [2] External Search      [3] Domain Guardrail
    Pinecone Vector DB     Tavily Search             (Blocks non-HR topics)
    (Xenova BGE 384-dim)   (Employment/Holidays)
 └──────────┬───────────┴────────────────────────┘
            ↓
       Groq Engine (openai/gpt-oss-120b)
            ↓
     Grounded Answer + Real-Time Decision Trace
```

---

## 3. Agentic Workflow & Domain Guardrails

```text
User Question
    │
[1] Domain Router
    ├── Out-of-Scope (Non-HR query) ──────→ Guardrail Blocked (Polite refusal)
    ├── Greeting / Casual Chat ───────────→ Direct Warm Response
    ├── Public Employment / Holiday Law ──→ External Tavily Search
    │
    └── Internal HR Policy Question
             │
[2] Retrieve from Private Pinecone KB (Xenova BGE-small-en-v1.5)
             │
[3] Grade Private Evidence
         ├── GOOD ───────────────────────→ Generate from Private KB
         │
         └── WEAK
                 │
[4] Web Fallback Search (with HR context)
                 │
[5] Grade Web Evidence
         ├── GOOD ───────────────────────→ Generate from Web (with HR Disclaimer)
         │
         └── WEAK
                 │
[6] Query Rewrite & Retry Private KB
                 │
         Max Retries Reached?
                 ├── Yes ────────────────→ Insufficient Evidence (Contact HR Support)
                 └── No  ────────────────→ Retry Step 2
```

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 (`.jsx`), Vite | Interactive component-based UI |
| **Styling** | Tailwind CSS v4 | Sleek, responsive, dark-mode design |
| **Backend** | Node.js (v20+), Express.js | High-performance REST API |
| **LLM Inference** | Groq SDK (`openai/gpt-oss-120b`) | Fast agent routing, grading & grounded answer generation |
| **Embeddings** | `@xenova/transformers` (`Xenova/bge-small-en-v1.5`) | Free, local 384-dimensional vector embeddings (no API quota limits) |
| **Vector DB** | Pinecone (`@pinecone-database/pinecone`) | Enterprise serverless vector database |
| **External Search**| Tavily Search API | Real-time statutory labour and holiday search fallback |
| **Document Ingestion**| `pdf-parse`, `mammoth`, Node.js `fs` | Parsing PDF, DOCX, TXT, and Markdown files |
| **Audit Trail** | JSON Logger (`data/audit.json`) | Enterprise compliance and decision trace logging |

---

## 5. Project Directory Structure

```text
Enterprise-HR-Policy-Agentic-RAG-Copilot/
├── client/                               # ⚛️ React.jsx Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx               # Brand badge, workflow diagram, add doc button
│   │   │   ├── TopBar.jsx                # Service name & pulsing status indicator
│   │   │   ├── ChatArea.jsx              # Message bubbles, source tags, citations
│   │   │   ├── Composer.jsx              # Clickable prompt starters & auto-expand input
│   │   │   ├── TracePanel.jsx            # Real-time Agent Decision Trace timeline
│   │   │   └── UploadModal.jsx           # PDF/DOCX/MD/TXT document ingestion modal
│   │   ├── App.jsx                       # Master application state & API integration
│   │   └── index.css                     # Tailwind CSS v4 styling
│   ├── vite.config.js                    # Vite configuration with /api proxy to port 8000
│   └── package.json
│
├── server/                               # 🟢 Node.js Express Backend
│   ├── config.js                         # Centralized environment configurations
│   ├── index.js                          # Express server (/api/chat, /api/ingest, /api/health)
│   ├── rag/
│   │   ├── agent.js                      # Agentic RAG core with strict domain guardrails
│   │   ├── embeddings.js                 # Local 384-dim Xenova BGE embeddings
│   │   └── vectorstore.js                # Pinecone vector store operations
│   ├── services/
│   │   ├── ingestion.js                  # Document parsing & paragraph-based chunker
│   │   ├── websearch.js                  # Tavily API search integration
│   │   └── audit.js                      # Audit trail recorder (data/audit.json)
│   └── scripts/
│       └── ingest_sample_kb.js           # CLI script to index sample HR docs into Pinecone
│
├── data/
│   ├── sample_kb/                        # Enterprise HR Policy documents
│   │   ├── company_hr_handbook.md        # Comprehensive 10-section HR policy
│   │   ├── benefits_and_compensation_guide.md # Medical, wellness & L&D benefits
│   │   └── hr_operations_runbook.md      # Onboarding, payroll, offboarding runbooks
│   └── audit.json                        # Request & execution trace history
│
├── Dockerfile                            # Production Node.js 20 Dockerfile
├── package.json                          # Root npm scripts
└── .env                                  # API keys & configuration
```

---

## 6. Setup & Installation

### Step 1 — Prerequisites
Ensure you have **Node.js (v18 or higher)** and **npm** installed:
```bash
node -v
npm -v
```

### Step 2 — Install Dependencies
Install dependencies for both backend and frontend:
```bash
# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### Step 3 — Configure Environment Variables
Create a `.env` file in the project root:
```env
GROQ_API_KEY="your_groq_api_key_here"
GROQ_MODEL="openai/gpt-oss-120b"
PINECONE_API_KEY="your_pinecone_api_key_here"
PINECONE_INDEX_NAME="fde-hr-policy-rag"
PINECONE_NAMESPACE="company-hr-kb"
TAVILY_API_KEY="your_tavily_api_key_here"
ADMIN_API_KEY="change-me-in-production"
EMBEDDING_MODEL="Xenova/bge-small-en-v1.5"
APP_ENV="development"
```

### Step 4 — Ingest Sample Knowledge Base
Index the enterprise HR policy documents into your Pinecone vector database:
```bash
npm run ingest
```
*Output: `✅ Success! Indexed 3 files -> 41 chunks -> 41 Pinecone vectors.`*

---

## 7. Running the Application

You can run the backend and frontend independently in separate terminal windows:

### Terminal 1 — Start Backend Server (Node.js)
```bash
npm run server
```
> Server will start at: `http://localhost:8000`  
> Health check: `http://localhost:8000/api/health`

### Terminal 2 — Start Frontend Client (React + Vite)
```bash
npm run client
```
> Web UI will start at: `http://localhost:5173`

---

## 8. Verification & Demo Scenarios

### Scenario 1 — Private Company Policy (Internal KB)
- **Question:** *"What is our WFH setup allowance and broadband reimbursement?"*
- **Execution Path:**
  ```text
  Router → KB (Company Knowledge Base)
  Private KB retrieval → 4 chunks
  KB evidence grade → GOOD
  Answer generation → PRIVATE KB
  ```
- **Result:** Exact figures provided from the handbook (₹25,000 WFH setup, ₹1,500 monthly broadband) with `PRIVATE COMPANY KB` tag.

### Scenario 2 — Notice Period Policy
- **Question:** *"What is the notice period policy during and after probation?"*
- **Result:** Explains the 30-day notice during probation and 60-day notice for confirmed employees, citing `company_hr_handbook.md`.

### Scenario 3 — External Labor Regulations (Tavily Fallback)
- **Question:** *"What are the statutory public holiday rules in Maharashtra India?"*
- **Execution Path:**
  ```text
  Router → HR_EXTERNAL (Public Labor/Holiday query)
  External web search → Tavily
  Answer generation → WEB SEARCH (External HR Law)
  ```
- **Result:** Returns Maharashtra Shops and Establishments Act holiday entitlements with `EXTERNAL WEB (TAVILY)` badge and external citations.

### Scenario 4 — Out-of-Scope Domain Guardrail
- **Question:** *"Who won the cricket world cup?"* or *"Recipe for chocolate cake"*
- **Execution Path:**
  ```text
  Router → OUT_OF_SCOPE (Domain Guardrail)
  Blocked → Question outside HR & Employee Support scope
  ```
- **Result:** Politely refuses to answer non-HR questions, keeping the assistant 100% focused on corporate HR policies.

---

## 9. Security & Compliance
- **Audit Trails:** All employee interactions, classified routes, and agent execution traces are recorded in `data/audit.json`.
- **Zero API Embedding Quota Limits:** Embeddings are generated locally via `@xenova/transformers`, avoiding third-party rate limits and external privacy leaks.
- **Admin Authentication:** Uploading company documents via `/api/ingest` requires an authorized `x-admin-key` header.
