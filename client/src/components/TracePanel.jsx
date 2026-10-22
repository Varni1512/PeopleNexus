import React from "react";
import { Activity, Compass } from "lucide-react";

export function TracePanel({ trace = [], sourceUsed = "—" }) {
  const formatSourceLabel = (source) => {
    if (source === "private_kb") return "Private Company KB";
    if (source === "web_search") return "External Web (Tavily)";
    if (source === "direct") return "Direct Answer";
    if (source === "out_of_scope") return "Out of Scope (Domain Guardrail)";
    if (source === "insufficient_evidence") return "Insufficient Evidence";
    return source || "—";
  };

  return (
    <aside
      id="trace-panel"
      className="hidden lg:flex flex-col justify-between w-80 bg-[#0c111c] border-l border-slate-800/80 p-6 overflow-y-auto shrink-0 select-none gap-6"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity size={18} className="text-emerald-400" />
            <span>Agent Decision Trace</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Real-time workflow execution path and evaluation steps.
          </p>
        </div>

        {/* Timeline list */}
        <div id="trace-timeline" className="flex flex-col gap-2.5">
          {trace.length === 0 ? (
            <div className="text-slate-500 text-xs py-8 text-center italic">
              No active requests yet. Ask a question to see real-time agent decisions.
            </div>
          ) : (
            trace.map((step, idx) => (
              <div
                key={idx}
                id={`trace-step-${idx}`}
                className="bg-[#111726] border border-slate-800 rounded-xl p-3 font-mono text-[11.5px] leading-relaxed text-slate-300 flex items-start gap-2 shadow-xs transition-all animate-fadeIn"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-xs shadow-emerald-400/50"></div>
                <span>{step}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Final Source Card */}
      <div id="final-source-card" className="bg-[#111726] border border-slate-800 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Compass size={12} className="text-emerald-400" />
          Final Source Used
        </span>
        <strong id="final-source-value" className="text-sm font-semibold text-white">
          {formatSourceLabel(sourceUsed)}
        </strong>
      </div>
    </aside>
  );
}
