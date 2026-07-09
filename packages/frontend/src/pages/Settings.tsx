import React, { useState } from "react";
import { useMemoryStore } from "../stores/memoryStore.js";
import { 
  Sliders, 
  Play, 
  CheckCircle,
  Brain,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";

export default function Settings() {
  const { forceDecayCalculation, isProcessingAction, fetchStats } = useMemoryStore();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSimulateDecay = async () => {
    setShowSuccessAlert(false);
    try {
      await forceDecayCalculation();
      setShowSuccessAlert(true);
      fetchStats();
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      console.error("Simulation failed", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950 text-slate-100 min-h-[90vh]">
      
      {/* HEADER */}
      <div className="border-b border-slate-800/60 pb-6">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          TID Scoring Configuration
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Regulate and simulate the Temporal Importance Decay algorithms of the strategic forgetter client.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1 & 2: PARAMETERS AND DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SANDBOX SIMULATOR WORKBENCH */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5 text-indigo-350">
              <Activity className="w-4 h-4 text-indigo-450 text-indigo-400" />
              Decay Simulation Workshop
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Memories naturally decay with inactivity. Instead of waiting for 24h intervals, trigger the decay scheduler manually to force a decay step immediately. Any items falling below the <strong className="text-rose-400">0.15 score threshold</strong> will enter the checkpoint queue.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleSimulateDecay}
                disabled={isProcessingAction}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold text-xs tracking-wide text-white rounded-xl flex items-center justify-center gap-2 transition-all outline-none cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate 24-Hour Time Decay Step</span>
              </button>

              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Worker Scheduler Ready</span>
              </div>
            </div>

            {showSuccessAlert && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Decay recalculation cycle completed! Metrics updated on memory dashboard. Re-check the <strong>Forgetting Queue</strong> for alerts!</span>
              </div>
            )}
          </div>

          {/* PARAMETER READOUTS */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-slate-100 text-sm tracking-tight">TID Variable Constants</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between font-mono text-[10.5px]">
                  <span className="text-slate-400 font-semibold">α (Alpha) - Recency Rate</span>
                  <span className="text-indigo-400 font-bold">0.30</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Weights how frequently you touch/access a memory trace. Frequent access fully overrides age-based decay parameters.
                </p>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between font-mono text-[10.5px]">
                  <span className="text-slate-400 font-semibold">β (Beta) - Age Base</span>
                  <span className="text-indigo-400 font-bold">0.30</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Governs raw base exponential decay scale of memories. It starts decaying from the precise timestamp of memory creation.
                </p>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between font-mono text-[10.5px]">
                  <span className="text-slate-400 font-semibold">γ (Gamma) - Goal Aligner</span>
                  <span className="text-indigo-400 font-bold">0.40</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Weights core importance criteria evaluated by Qwen relative to operational requirements. Highly relevant topics stay persistent.
                </p>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between font-mono text-[10.5px]">
                  <span className="text-slate-400 font-semibold">δ (Delta) - Repetitive Noise</span>
                  <span className="text-indigo-400 font-bold">0.20</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Reduces score of elements identified as redundant trivia or semantic chatter. Heavily penalizes memory clusters of repeating patterns.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* COL 3: MATHEMATICAL SPECIFICATIONS */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" />
              Mathematical Formula
            </h3>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-xs font-mono font-extrabold text-indigo-300 select-all">
                I(M,t) = αR(M) + βe^(-λΔt) + γG(M) - δN(M)
              </span>
            </div>

            <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed font-sans">
              <p>
                The decay matrix computes score indices dynamically on every transaction request:
              </p>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-semibold shrink-0">R(M) :</span>
                  <span>Recency touches booster (e^-0.15*Δt_access)</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-semibold shrink-0">Δt :</span>
                  <span>Days elapsed since node creation</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-semibold shrink-0">G(M) :</span>
                  <span>Semantically analyzed focus alignment</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-semibold shrink-0">N(M) :</span>
                  <span>Repetitive pattern noise profile deduction</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block font-semibold">
                Operational Protocols
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-350">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Human Moderation Locks Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-350">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Vectored Embeddings via Qwen</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
