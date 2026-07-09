import React from "react";
import { useMemoryStore } from "../stores/memoryStore.js";
import { Coins, Zap, ShieldAlert, Cpu } from "lucide-react";

export default function TokenBudgetCard() {
  const { budget, fetchBudget } = useMemoryStore();

  React.useEffect(() => {
    fetchBudget();
    const interval = setInterval(() => {
      fetchBudget();
    }, 15000); // Poll occasionally if socket falls back
    return () => clearInterval(interval);
  }, []);

  if (!budget) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-2/3"></div>
      </div>
    );
  }

  const pct = budget.usagePercentage || 0;
  
  // Status color helpers
  let statusColor = "bg-emerald-500 text-emerald-100 shadow-emerald-900/40";
  let textColor = "text-emerald-400";
  let progressColor = "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]";
  let labelText = "Nominal System Budget";
  let statusIcon = <Coins className="w-4 h-4" />;

  if (pct >= 80) {
    statusColor = "bg-rose-500 text-rose-100 shadow-rose-900/40";
    textColor = "text-rose-400";
    progressColor = "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]";
    labelText = "Critical Budget Exhaustion";
    statusIcon = <ShieldAlert className="w-4 h-4" />;
  } else if (pct >= 50) {
    statusColor = "bg-amber-500 text-amber-100 shadow-amber-900/40";
    textColor = "text-amber-400";
    progressColor = "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]";
    labelText = "Sustained Usage Warning";
    statusIcon = <Zap className="w-4 h-4" />;
  }

  return (
    <div className="relative bg-slate-900/85 border border-slate-800 rounded-xl p-5 shadow-xl overflow-hidden group">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
            <h3 className="font-semibold text-slate-200 tracking-tight text-sm">Token Budget</h3>
          </div>
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase ${statusColor}`}>
            {statusIcon}
            {pct}% Used
          </span>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-white">
              {budget.remainingTokens.toLocaleString()}
            </span>
            <span className="text-slate-500 text-xs">/ {budget.totalTokens.toLocaleString()} RMT</span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${pct >= 85 ? 'bg-rose-500' : pct >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            {labelText} — Consumed: <strong className="font-mono">{budget.usedTokens.toLocaleString()}</strong>
          </p>
        </div>

        {/* Progress tracks */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% CAP</span>
            <span>50% WARN</span>
            <span>100% LIMIT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
