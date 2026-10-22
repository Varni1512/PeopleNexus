import React from "react";
import { Sparkles } from "lucide-react";

export function TopBar({ serviceName = "Employee Knowledge Copilot" }) {
  return (
    <header
      id="app-topbar"
      className="h-16 border-b border-slate-800/80 flex items-center justify-between px-6 md:px-8 bg-[#0c111c]/60 backdrop-blur-md sticky top-0 z-10 shrink-0"
    >
      <div id="status-indicator" className="flex items-center gap-2.5 text-sm font-semibold text-slate-100">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span>{serviceName}</span>
      </div>
    </header>
  );
}
