import React, { useState } from "react";
import { Send } from "lucide-react";

export function Composer({ onSend, isLoading }) {
  const [text, setText] = useState("");

  const examples = [
    "What is our WFH setup allowance and broadband reimbursement?",
    "How many days of paid maternity & paternity leave are provided?",
    "What is the daily meal per-diem for travel to Tier 1 cities?",
    "What is the notice period policy during and after probation?",
    "What are the latest statutory public holiday rules in India?",
  ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div id="composer-area" className="px-4 sm:px-8 md:px-6 pb-6 flex flex-col gap-3 shrink-0">
      {/* Clickable Example Prompts */}
      <div id="examples-row" className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
        {examples.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSend(ex)}
            disabled={isLoading}
            className="bg-[#111726] hover:bg-[#192336] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs py-1.5 px-3 rounded-full cursor-pointer transition-all duration-150 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        id="chat-form"
        onSubmit={handleSubmit}
        className="flex gap-2.5 bg-[#111726] border border-slate-800 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl p-2.5 transition-all shadow-lg"
      >
        <textarea
          id="question-input"
          placeholder="Ask an HR policy or employee support question... (Enter to send)"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none outline-none text-white text-sm p-2 resize-none min-h-[48px] max-h-36 placeholder:text-slate-500"
        />
        <button
          id="send-question-btn"
          type="submit"
          disabled={!text.trim() || isLoading}
          className="bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed text-[#061e14] font-bold text-[13.5px] px-5 rounded-xl flex items-center gap-1.5 transition-all self-end h-11 cursor-pointer shadow-md shadow-emerald-500/20"
        >
          <Send size={15} />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}
