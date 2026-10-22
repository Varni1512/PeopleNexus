import Groq from "groq-sdk";
import { config } from "../config.js";
import { queryIndex } from "./vectorstore.js";
import { searchWeb } from "../services/websearch.js";

let groqInstance = null;

function getGroq() {
  if (!groqInstance) {
    if (!config.groqApiKey) {
      throw new Error("GROQ_API_KEY is missing in environment");
    }
    groqInstance = new Groq({ apiKey: config.groqApiKey });
  }
  return groqInstance;
}

async function callChat(messages, options = {}) {
  const groq = getGroq();
  const res = await groq.chat.completions.create({
    model: config.groqModel,
    messages,
    temperature: options.temperature ?? 0,
    ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
  });
  return res.choices[0]?.message?.content || "";
}

function parseJsonSafe(text, fallback = {}) {
  try {
    const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return fallback;
  }
}

export async function ask(question) {
  const trace = [];
  let currentQuery = question;
  let retryCount = 0;
  let citations = [];

  // 1. ROUTE QUESTION WITH STRICT HR DOMAIN GUARDRAILS
  trace.push("1. Route question");
  const routePrompt = `You are a strict domain router for an Enterprise HR Policy & Employee Support Copilot.
Classify the user's question into one of the following exact categories:

1. "kb": Questions about internal company policies, leave, attendance, payroll, expenses, remote work, equipment, benefits, health insurance, appraisals, code of conduct, onboarding, offboarding, or employee workplace support.
2. "hr_external": Questions specifically about external statutory employment laws, government public holidays, statutory labor regulations, or workplace rights (e.g., "Maternity Benefit Act in India", "Public holiday rules in Maharashtra").
3. "direct": Simple polite greetings or courtesy (e.g., "hi", "hello", "good morning", "thank you", "who are you").
4. "out_of_scope": ANY question that is NOT related to HR, employee workplace support, company policy, or employment law (e.g. cricket/sports, movie recommendations, software coding problems, cooking recipes, general world trivia, politics, personal relationship advice, math questions).

Question: "${question}"
Respond ONLY in valid JSON format: {"route": "kb" | "hr_external" | "direct" | "out_of_scope"}`;

  const routeResponse = await callChat([
    { role: "system", content: "You output only valid JSON." },
    { role: "user", content: routePrompt },
  ], { jsonMode: true });

  const routeDecision = parseJsonSafe(routeResponse, { route: "kb" });
  const selectedRoute = (routeDecision.route || "kb").toLowerCase();

  // GUARDRAIL 1: OUT OF SCOPE QUESTIONS
  if (selectedRoute === "out_of_scope") {
    trace.push("Router → OUT_OF_SCOPE (Domain Guardrail)");
    trace.push("Blocked → Question outside HR & Employee Support scope");
    return {
      answer: "I am your Enterprise HR Policy & Employee Support Copilot. I am specifically built to assist with company HR policies, employee benefits, leaves, compensation, workplace conduct, and employment regulations.\n\nI cannot answer questions about general knowledge, coding, entertainment, or topics outside of HR and workplace policies. Please feel free to ask any company HR or employment-related questions!",
      source_used: "out_of_scope",
      trace,
      citations: [],
      rewritten_query: currentQuery,
    };
  }

  // GUARDRAIL 2: GREETINGS / COURTESY
  if (selectedRoute === "direct") {
    trace.push("Router → DIRECT");
    trace.push("Direct response → greeting/courtesy");
    const directAnswer = await callChat([
      {
        role: "system",
        content: "You are the Enterprise HR Policy & Employee Support Copilot for PeoplePrime Technologies & NovaRetail. Respond warmly, politely, and mention that you can help with leave policies, benefits, payroll, remote work, expense guidelines, and HR operations.",
      },
      { role: "user", content: `Respond naturally to: "${question}"` },
    ]);
    return {
      answer: directAnswer,
      source_used: "direct",
      trace,
      citations: [],
      rewritten_query: currentQuery,
    };
  }

  // GUARDRAIL 3: EXPLICIT EXTERNAL HR TOPICS (e.g. statutory labor laws / public holidays)
  if (selectedRoute === "hr_external") {
    trace.push("Router → HR_EXTERNAL (Public Labor/Holiday query)");
    trace.push("External web search → Tavily");
    try {
      const searchRes = await searchWeb(`${currentQuery} employment labor HR regulations`);
      if (searchRes.webResults) {
        const generateWebPrompt = `You are an enterprise HR policy and employee support copilot.
Answer the employee's question strictly from the public employment/labor evidence below.
State clearly that this is external statutory/public regulation data and requires HR/Legal validation before being treated as company policy.
Question: "${question}"

Web evidence:
${searchRes.webResults}`;

        const answer = await callChat([
          { role: "system", content: "You are an enterprise HR policy copilot." },
          { role: "user", content: generateWebPrompt },
        ]);

        trace.push("Answer generation → WEB SEARCH (External HR Law)");
        return {
          answer,
          source_used: "web_search",
          trace,
          citations: searchRes.citations,
          rewritten_query: currentQuery,
        };
      }
    } catch (err) {
      trace.push(`Web search error: ${err.message}`);
    }
  }

  // STANDARD KB RETRIEVAL & VERIFICATION
  trace.push("Router → KB (Company Knowledge Base)");
  while (true) {
    // 2. RETRIEVE FROM PRIVATE KB
    trace.push(`Private KB retrieval → query: "${currentQuery}"`);
    const kbDocs = await queryIndex(currentQuery, config.topK);
    trace.push(`Private KB retrieval → ${kbDocs.length} chunks`);

    const context = kbDocs
      .map((d) => `[Source: ${d.metadata?.source || "Private KB"}]\n${d.pageContent}`)
      .join("\n\n");

    // 3. GRADE EVIDENCE
    const gradePrompt = `You grade evidence for an enterprise HR policy assistant.
Question: "${question}"
Private company HR KB evidence:
${context || "No documents found."}

Return "good" only if the evidence is sufficient to answer the question specifically and accurately based on company policy. Otherwise return "weak".
Respond ONLY in valid JSON format: {"grade": "good"} or {"grade": "weak"}`;

    const gradeResponse = await callChat([
      { role: "system", content: "You output only valid JSON." },
      { role: "user", content: gradePrompt },
    ], { jsonMode: true });

    const gradeResult = parseJsonSafe(gradeResponse, { grade: "weak" });
    const kbGrade = (gradeResult.grade || "weak").toLowerCase();
    trace.push(`KB evidence grade → ${kbGrade.toUpperCase()}`);

    // If good, generate answer from Private KB
    if (kbGrade === "good" && kbDocs.length > 0) {
      const generatePrompt = `You are the enterprise HR policy and employee support copilot for PeoplePrime Technologies & NovaRetail.
Answer ONLY from the private company HR KB provided below.
Be concise, practical, professional, and policy-grounded. Format key numbers, eligibility, limits, and timelines clearly with bullet points.
Explicitly mention that this information is drawn from the company's internal HR handbook / policy guide.
Question: "${question}"

Private KB:
${context}`;

      const answer = await callChat([
        { role: "system", content: "You are an enterprise HR policy copilot." },
        { role: "user", content: generatePrompt },
      ]);

      const seen = new Set();
      for (const d of kbDocs) {
        const src = d.metadata?.source || "company_hr_handbook.md";
        if (!seen.has(src)) {
          seen.add(src);
          citations.push({
            title: src.split("/").pop(),
            url: "",
            type: "private_kb",
          });
        }
      }

      trace.push("Answer generation → PRIVATE KB");
      return {
        answer,
        source_used: "private_kb",
        trace,
        citations,
        rewritten_query: currentQuery,
      };
    }

    // 4. WEB FALLBACK (STRICTLY FOR HR/EMPLOYMENT CONTEXT)
    trace.push("Private evidence insufficient → Web fallback (HR Context)");
    let webResults = "";
    let webCitations = [];
    try {
      const searchRes = await searchWeb(`${currentQuery} HR workplace employment law`);
      webResults = searchRes.webResults;
      webCitations = searchRes.citations;
    } catch (err) {
      trace.push(`Web search error: ${err.message}`);
    }

    // 5. GRADE WEB RESULTS
    const gradeWebPrompt = `Question: "${question}"
Web evidence:
${webResults || "No results."}

Return "good" if the evidence contains relevant employment, workplace, or labor information to answer the question; otherwise "weak".
Respond ONLY in valid JSON format: {"grade": "good"} or {"grade": "weak"}`;

    const gradeWebResponse = await callChat([
      { role: "system", content: "You output only valid JSON." },
      { role: "user", content: gradeWebPrompt },
    ], { jsonMode: true });

    const webGradeResult = parseJsonSafe(gradeWebResponse, { grade: "weak" });
    const webGrade = (webGradeResult.grade || "weak").toLowerCase();
    trace.push(`Web evidence grade → ${webGrade.toUpperCase()}`);

    if (webGrade === "good" && webResults) {
      const generateWebPrompt = `You are an enterprise HR policy and employee support copilot.
The private company HR KB was insufficient. Answer ONLY from the web evidence below.
Clearly state that this is external public employment data and requires HR validation before applying as internal company policy.
Question: "${question}"

Web evidence:
${webResults}`;

      const answer = await callChat([
        { role: "system", content: "You are an enterprise HR policy copilot." },
        { role: "user", content: generateWebPrompt },
      ]);

      trace.push("Answer generation → WEB SEARCH");
      return {
        answer,
        source_used: "web_search",
        trace,
        citations: webCitations,
        rewritten_query: currentQuery,
      };
    }

    // 6. RETRY / REWRITE QUERY
    if (retryCount < config.maxRetries) {
      retryCount++;
      const rewritePrompt = `Rewrite this employee HR query to improve retrieval against internal company HR policy documents.
Add relevant HR terms like "policy", "eligibility", "allowance", "handbook", or "entitlement".
Return only the rewritten query.
Question: "${question}"`;

      const rewritten = await callChat([
        { role: "system", content: "Return only the rewritten query." },
        { role: "user", content: rewritePrompt },
      ]);

      currentQuery = rewritten.trim().replace(/^"|"$/g, "");
      trace.push(`Query rewrite → ${currentQuery}`);
      continue;
    }

    // Stopped if still insufficient
    trace.push("Stopped → insufficient reliable evidence");
    return {
      answer: "I couldn't find enough reliable policy evidence in the company HR knowledge base or statutory employment records to answer this confidently.\n\nPlease contact People Support at hr-support@peopleprime.com or speak with your HR Business Partner (HRBP).",
      source_used: "insufficient_evidence",
      trace,
      citations: [],
      rewritten_query: currentQuery,
    };
  }
}
