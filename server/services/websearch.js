import { config } from "../config.js";

export async function searchWeb(query) {
  if (!config.tavilyApiKey) {
    throw new Error("TAVILY_API_KEY is missing in environment");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: config.tavilyApiKey,
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: true,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily search failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const lines = [];
  const citations = [];

  if (data.answer) {
    lines.push(`Search answer: ${data.answer}`);
  }

  if (Array.isArray(data.results)) {
    for (const item of data.results) {
      const title = item.title || "";
      const url = item.url || "";
      const content = item.content || "";
      lines.push(`Title: ${title}\nURL: ${url}\nContent: ${content}`);
      citations.push({
        title: title || url,
        url: url,
        type: "web",
      });
    }
  }

  return {
    webResults: lines.join("\n\n"),
    citations,
  };
}
