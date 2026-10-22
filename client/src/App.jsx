import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { ChatArea } from "./components/ChatArea";
import { Composer } from "./components/Composer";
import { TracePanel } from "./components/TracePanel";
import { UploadModal } from "./components/UploadModal";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your Enterprise HR Policy & Employee Support Copilot.\n\nI answer queries from the private company knowledge base first, and only use verified external web searches when internal evidence is insufficient.\n\nHow can I help you today?",
      source: "",
      citations: [],
    },
  ]);

  const [trace, setTrace] = useState([]);
  const [sourceUsed, setSourceUsed] = useState("—");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const handleSend = async (question) => {
    if (!question || isLoading) return;

    const newMessages = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setIsLoading(true);
    setTrace(["1. Route question..."]);
    setSourceUsed("—");
    setActiveStep(1);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setTrace(data.trace || []);
      setSourceUsed(data.source_used || "—");

      if (data.source_used === "private_kb") {
        setActiveStep(6);
      } else if (data.source_used === "web_search") {
        setActiveStep(4);
      } else {
        setActiveStep(null);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          source: data.source_used,
          citations: data.citations || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${err.message}`,
          source: "out_of_scope",
          citations: [],
        },
      ]);
      setTrace((prev) => [...prev, `Error: ${err.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="app-root" className="h-screen w-screen flex overflow-hidden bg-gradient-to-b from-[#111a29] to-[#080c14] text-slate-100">
      <Sidebar
        onOpenUpload={() => setIsUploadOpen(true)}
        activeStep={activeStep}
      />

      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <TopBar serviceName="Employee Knowledge Copilot" />
        <ChatArea messages={messages} isLoading={isLoading} />
        <Composer onSend={handleSend} isLoading={isLoading} />
      </main>

      <TracePanel trace={trace} sourceUsed={sourceUsed} />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
