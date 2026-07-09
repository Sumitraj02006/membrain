import React, { useEffect } from "react";
import { useMemoryStore } from "../stores/memoryStore.js";
import { 
  ShieldAlert, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle,
  Info
} from "lucide-react";

export default function Checkpoints() {
  const {
    pendingCheckpoints,
    isProcessingAction,
    isLoadingCheckpoints,
    fetchCheckpoints,
    approveCheckpoint,
    rejectCheckpoint,
    approveAllCheckpoints
  } = useMemoryStore();

  useEffect(() => {
    fetchCheckpoints();
  }, []);

  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to forget and scrub this memory? A compressed Memory Obituary summary will be generated first.")) {
      await approveCheckpoint(id);
    }
  };

  const handleReject = async (id: string) => {
    await rejectCheckpoint(id);
  };

  const handleApproveAll = async () => {
    if (confirm("Are you sure you want to forget ALL pending items?")) {
      await approveAllCheckpoints();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950 text-slate-100 min-h-[90vh]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Human-in-the-Loop Checkpoint
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Validate pending deletion alerts from the Temporal Importance Decay (TID) engine.
          </p>
        </div>

        {pendingCheckpoints.length > 0 && (
          <button
            onClick={handleApproveAll}
            disabled={isProcessingAction}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all outline-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Forget All Pending Checkpoints ({pendingCheckpoints.length})</span>
          </button>
        )}
      </div>

      {/* REACTION EXPLAINER BAR */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs text-slate-200 font-semibold font-sans tracking-wide">
            Understanding Deletion Actions
          </p>
          <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1 leading-relaxed">
            <li>
              Choosing <strong className="text-rose-400">Forget</strong> triggers Qwen-Max to compress the context into a simplified obituary summary, then wipes/scrubs the embedding vector, saving cognitive resources.
            </li>
            <li>
              Choosing <strong className="text-emerald-400">Keep Memory</strong> intercepts deletion, boosts the node's TID Score back to <strong className="text-emerald-400">0.85</strong>, and updates recency parameters to re-stabilize the memory traces.
            </li>
          </ul>
        </div>
      </div>

      {/* MAIN CHECKPOINT SHARDS STREAM */}
      {isLoadingCheckpoints ? (
        <div className="text-center font-mono py-12 text-slate-500 text-xs animate-pulse">
          Validating neural gates...
        </div>
      ) : pendingCheckpoints.length === 0 ? (
        <div className="text-center py-16 border border-slate-850/80 border-dashed rounded-2xl max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto shadow-inner shadow-emerald-900/10">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">System Trace Equilibrium Achieved</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All memory elements are firmly indexable with score parameters above 0.15 threshold. No pending deletion operations registered.
            </p>
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            Current Operator Scope: SAFE
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingCheckpoints.map((cp) => (
            <div 
              key={cp.id}
              className="bg-slate-900/25 border border-slate-800 hover:border-slate-750 p-6 rounded-2xl grid grid-cols-1 lg:grid-cols-4 gap-6 hover:bg-slate-900/40 transition-colors relative"
            >
              
              {/* CONTENT & GENERAL */}
              <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                      DECAY ALERT
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      SHARD_ID: {cp.id.toUpperCase()} • Original Memory: {cp.memoryId}
                    </span>
                  </div>
                  
                  <p className="text-slate-100 text-xs leading-relaxed font-sans tracking-wide">
                    "{cp.content}"
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex gap-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">DECAY ENGINE ANALYSIS REASON</span>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 leading-normal">
                      {cp.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* STATS & ACTIONS BORDER CARD */}
              <div className="lg:col-span-1 bg-slate-950/80 border border-slate-800/60 p-4 rounded-xl flex flex-col justify-between space-y-4">
                
                {/* Stats */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider uppercase">TID Durability Score</span>
                    <div className="text-xl font-bold font-mono text-rose-450 text-rose-400 mt-0.5">
                      {cp.tidScore.toFixed(4)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider uppercase">Enqueued At</span>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {new Date(cp.createdAt).toLocaleDateString()} {new Date(cp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(cp.id)}
                    disabled={isProcessingAction}
                    className="w-full py-2 px-3 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Forget & Obituary</span>
                  </button>

                  <button
                    onClick={() => handleReject(cp.id)}
                    disabled={isProcessingAction}
                    className="w-full py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Keep Memory Docs</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
