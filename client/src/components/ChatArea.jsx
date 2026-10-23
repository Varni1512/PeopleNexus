import React, { useEffect, useRef } from "react";
import { ExternalLink, Database, Globe, MessageSquare, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-slate-700/60 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-emerald-400 mt-3.5 mb-2 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-slate-100 mt-3 mb-1.5 first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-2.5 last:mb-0 leading-relaxed text-slate-200">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white tracking-wide">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-emerald-300/90 font-serif">
            {children}
          </em>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-2.5 space-y-1.5 marker:text-emerald-400">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-2.5 space-y-1.5 marker:text-emerald-400">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed pl-1 text-slate-200">
            {children}
          </li>
        ),
        hr: () => <hr className="my-3.5 border-slate-800" />,
        blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-emerald-500/70 pl-3.5 py-1.5 my-2.5 italic text-slate-300 bg-emerald-500/5 rounded-r">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 rounded-xl border border-slate-700/80 bg-[#0b101c]">
            <table className="min-w-full divide-y divide-slate-700/80 text-xs sm:text-[13px]">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-800/80">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3.5 py-2.5 text-left font-bold text-slate-200 tracking-wider">
            {children}
          </th>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-slate-800">{children}</tbody>
        ),
        td: ({ children }) => (
          <td className="px-3.5 py-2.5 text-slate-300 align-top">{children}</td>
        ),
        code: ({ children }) => (
          <code className="bg-slate-800/80 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function ChatArea({ messages, isLoading }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const renderSourceBadge = (source) => {
    if (!source) return null;

    let colorClasses = "bg-slate-800/60 text-slate-300 border-slate-700";
    let icon = <MessageSquare size={12} />;
    let label = source;

    if (source === "private_kb") {
      colorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
      icon = <Database size={12} />;
      label = "Private Company KB";
    } else if (source === "web_search") {
      colorClasses = "bg-sky-500/10 text-sky-400 border-sky-500/25";
      icon = <Globe size={12} />;
      label = "External Web (Tavily)";
    } else if (source === "direct") {
      colorClasses = "bg-amber-500/10 text-amber-400 border-amber-500/25";
      icon = <MessageSquare size={12} />;
      label = "Direct Answer";
    } else if (source === "out_of_scope") {
      colorClasses = "bg-rose-500/10 text-rose-400 border-rose-500/30";
      icon = <ShieldAlert size={12} />;
      label = "Domain Guardrail (Out of Scope)";
    } else if (source === "insufficient_evidence") {
      colorClasses = "bg-purple-500/10 text-purple-400 border-purple-500/25";
      icon = <ShieldAlert size={12} />;
      label = "Insufficient Evidence";
    }

    return (
      <div className="mt-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${colorClasses}`}
        >
          {icon}
          <span>{label}</span>
        </span>
      </div>
    );
  };

  return (
    <div
      ref={scrollRef}
      id="chat-scroll-area"
      className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-6 py-8 flex flex-col gap-6"
    >
      {messages.map((msg, idx) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={idx}
            id={`message-${idx}`}
            className={`flex gap-3.5 w-full ${isUser ? "justify-end" : "justify-start"}`}
          >
            {!isUser && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-emerald-950/40 select-none">
                HR
              </div>
            )}

            <div
              className={`p-4 sm:p-5 text-sm sm:text-[14.5px] leading-relaxed relative ${
                isUser
                  ? "max-w-2xl bg-gradient-to-br from-emerald-900/80 to-emerald-950/90 border border-emerald-500/30 rounded-2xl rounded-br-xs text-slate-100 shadow-md"
                  : "max-w-3xl bg-[#111726] border border-slate-800 rounded-2xl rounded-bl-xs text-slate-200 shadow-md"
              }`}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <MarkdownContent content={msg.content} />
              )}

              {/* Source Badge */}
              {renderSourceBadge(msg.source)}

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
                  <div className="font-semibold text-slate-400 text-[10.5px] uppercase tracking-wider mb-1.5">
                    Sources & Citations:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {msg.citations.map((c, cIdx) => (
                      <div key={cIdx}>
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:text-sky-300 hover:underline inline-flex items-center gap-1.5 break-all"
                          >
                            <ExternalLink size={12} />
                            <span>{c.title || c.url}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <span>📄</span>
                            <span>{c.title}</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div id="loading-message" className="flex gap-3.5 w-full justify-start">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-emerald-950/40">
            HR
          </div>
          <div className="max-w-3xl bg-[#111726] border border-slate-800 rounded-2xl rounded-bl-xs p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-300"></span>
            </div>
            <span className="text-xs text-slate-400">
              Evaluating query against private HR knowledge and domain guardrails...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
