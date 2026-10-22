import React from "react";
import { PlusCircle, ShieldCheck, Cpu } from "lucide-react";

export function Sidebar({ onOpenUpload, activeStep }) {
  const steps = [
    { num: 1, text: "Route question" },
    { num: 2, text: "Retrieve private KB" },
    { num: 3, text: "Grade evidence" },
    { num: 4, text: "Web fallback if weak" },
    { num: 5, text: "Rewrite & retry" },
    { num: 6, text: "Grounded answer" },
  ];

  return (
    <aside
      id="app-sidebar"
      className="hidden md:flex flex-col justify-between w-72 bg-[#0c111c] border-r border-slate-800/80 p-6 overflow-y-auto shrink-0 select-none"
    >
      <div className="flex flex-col gap-5">
        {/* Brand Header */}
        <div className="flex flex-col gap-2.5">
          <div
            id="brand-badge"
            className="self-start inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            <ShieldCheck size={13} />
            <span>FDE Project</span>
          </div>

          <h1 id="brand-title" className="text-2xl font-black text-white leading-tight tracking-tight">
            HR Policy<br />
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Agentic RAG
            </span>
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed">
            Private company HR knowledge first. External web only when evidence is insufficient or weak.
          </p>
        </div>

        {/* Workflow Card */}
        <div id="workflow-card" className="bg-[#111726] border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Cpu size={14} className="text-emerald-400" />
            <span>Agentic Workflow</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {steps.map((s) => {
              const isActive = activeStep === s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-2.5 text-[12.5px] px-2.5 py-1.5 rounded transition-all border-l-2 ${
                    isActive
                      ? "border-emerald-400 bg-emerald-500/10 text-white font-medium"
                      : "border-slate-700/80 bg-white/[0.02] text-slate-300"
                  }`}
                >
                  <span className="text-slate-400 font-mono text-[11px]">{s.num}.</span>
                  <span>{s.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upload Trigger */}
      <button
        id="openUploadBtn"
        type="button"
        onClick={onOpenUpload}
        className="mt-6 flex items-center justify-center gap-2 bg-[#141c2c] hover:bg-[#1a253a] hover:border-emerald-500/50 hover:text-white border border-slate-700/80 text-slate-200 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer"
      >
        <PlusCircle size={16} className="text-emerald-400" />
        <span>Add HR Document</span>
      </button>
    </aside>
  );
}
