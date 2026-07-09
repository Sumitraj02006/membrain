import React, { useState, useEffect } from "react";
import { useMemoryStore } from "../stores/memoryStore.js";
import { 
  BarChart3, 
  Search, 
  Trash, 
  ShieldAlert, 
  TrendingDown, 
  Database,
  History,
  Info,
  Network,
  ListFilter
} from "lucide-react";
import axios from "axios";
import MemoryTree from "../components/MemoryTree/MemoryTree.js";
import { type Memory } from "../types.js";

export default function Dashboard() {
  const {
    stats,
    activeMemories,
    obituaries,
    searchQuery,
    isLoadingStats,
    isLoadingMemories,
    fetchStats,
    fetchMemories,
    fetchObituaries,
    setSearchQuery
  } = useMemoryStore();

  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [semanticQuery, setSemanticQuery] = useState("");
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);
  const [currentTab, setCurrentTab] = useState<"tree" | "active" | "deleted">("tree");
  const [selectedNode, setSelectedNode] = useState<Memory | null>(null);

  useEffect(() => {
    fetchStats();
    fetchMemories();
    fetchObituaries();
  }, []);

  const handleTextSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchMemories(q);
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) return;

    setIsSearchingSemantic(true);
    try {
      const res = await axios.post("/api/memory/search", { query: semanticQuery });
      setSemanticResults(res.data);
    } catch (err) {
      console.error("Semantic search failed", err);
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  const clearSemanticSearch = () => {
    setSemanticQuery("");
    setSemanticResults([]);
  };

  const handleSelectNodeFromTree = (node: Memory) => {
    setSelectedNode(node);
  };

  const handleManualDelete = async (id: string) => {
    if (confirm("Are you sure you want to manually delete this cognitive shard? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/memory/${id}`);
        setSelectedNode(null);
        fetchStats();
        fetchMemories();
        fetchObituaries();
      } catch (err) {
        console.error("Manual delete failed", err);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950 text-slate-100 min-h-[90vh]">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Collective Memory Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, radial tree graph, and semantic indexing overview of recorded cognitive shards.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500 bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Local decay loop active: Alpha=0.3, Beta=0.3, Gamma=0.4</span>
        </div>
      </div>

      {/* STATS BENTO GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
            <Database className="w-8 h-8 text-indigo-400" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase leading-none block">Total Tracked</span>
          <span className="text-2xl font-bold font-mono tracking-tight text-white block mt-2">
            {isLoadingStats ? "..." : stats?.totalMemories ?? 0}
          </span>
          <span className="text-[9px] text-slate-400 block mt-1">Cognitive nodes</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
            <Database className="w-8 h-8 text-emerald-450" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase leading-none block">Active Nodes</span>
          <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400 block mt-2">
            {isLoadingStats ? "..." : stats?.activeMemories ?? 0}
          </span>
          <span className="text-[9px] text-slate-400 block mt-1">Retrievable indices</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase leading-none block">Forget Queue</span>
          <span className="text-2xl font-bold font-mono tracking-tight text-amber-400 block mt-2">
            {isLoadingStats ? "..." : stats?.forgetQueueCount ?? 0}
          </span>
          <span className="text-[9px] text-slate-400 block mt-1">Pending Human-in-Loop</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
            <Trash className="w-8 h-8 text-rose-400" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase leading-none block">Forgotten/Obits</span>
          <span className="text-2xl font-bold font-mono tracking-tight text-rose-400 block mt-2">
            {isLoadingStats ? "..." : stats?.deletedMemoriesCount ?? 0}
          </span>
          <span className="text-[9px] text-slate-400 block mt-1">Purged obituaries</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden group col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
            <TrendingDown className="w-8 h-8 text-indigo-400" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase leading-none block">Average TID</span>
          <span className="text-2xl font-bold font-mono tracking-tight text-indigo-400 block mt-2">
            {isLoadingStats ? "..." : (stats?.averageTidScore ?? 1.0).toFixed(3)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-1">Brain-forgetting index</span>
        </div>

      </div>

      {/* WORKSPACE AREA: TWO COLUMN VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TABS AND PRIMARY VIEW */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-800/80 gap-4">
            <button
              onClick={() => setCurrentTab("tree")}
              className={`pb-3 text-xs font-mono tracking-wider uppercase border-b-2 font-semibold transition-all outline-none cursor-pointer flex items-center gap-1.5 ${
                currentTab === "tree" 
                  ? "border-indigo-500 text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-200"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Radial Memory Tree
            </button>
            <button
              onClick={() => setCurrentTab("active")}
              className={`pb-3 text-xs font-mono tracking-wider uppercase border-b-2 font-semibold transition-all outline-none cursor-pointer flex items-center gap-1.5 ${
                currentTab === "active" 
                  ? "border-indigo-500 text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-200"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Active Nodes ({activeMemories.length})
            </button>
            <button
              onClick={() => setCurrentTab("deleted")}
              className={`pb-3 text-xs font-mono tracking-wider uppercase border-b-2 font-semibold transition-all outline-none cursor-pointer flex items-center gap-1.5 ${
                currentTab === "deleted" 
                  ? "border-indigo-500 text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-200"
              }`}
            >
              <Trash className="w-3.5 h-3.5" />
              Obituaries ({obituaries.length})
            </button>
          </div>

          {/* D3.js Radial Tree View */}
          {currentTab === "tree" && (
            <div className="h-[550px] w-full relative">
              {activeMemories.length === 0 ? (
                <div className="h-full flex items-center justify-center border border-slate-800 border-dashed rounded-2xl text-slate-500 text-xs">
                  No active cognitive shards. Input memories inside Chat first!
                </div>
              ) : (
                <MemoryTree memories={activeMemories} onSelectNode={handleSelectNodeFromTree} />
              )}
            </div>
          )}

          {/* Active Memories List */}
          {currentTab === "active" && (
            <div className="space-y-4">
              
              {/* Text Filter Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleTextSearch}
                  placeholder="Filter active memory content..."
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              {isLoadingMemories ? (
                <div className="text-center font-mono py-12 text-slate-500 text-xs animate-pulse">
                  Re-indexing operator database...
                </div>
              ) : activeMemories.length === 0 ? (
                <div className="text-center py-12 border border-slate-800 border-dashed rounded-xl text-slate-500 text-xs text-slate-400">
                  No active cognitive shards match the filter query.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeMemories.map((mem) => (
                    <div 
                      key={mem.id} 
                      onClick={() => setSelectedNode(mem)}
                      className={`bg-slate-900/30 border p-5 rounded-xl flex flex-col justify-between hover:bg-slate-900/60 transition-all duration-150 relative cursor-pointer group ${
                        selectedNode?.id === mem.id ? "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono tracking-wider font-bold text-slate-500 uppercase block">
                          NODE_{mem.id.toUpperCase()}
                        </span>
                        <p className="text-slate-200 text-xs leading-normal font-sans tracking-wide line-clamp-3 block">
                          {mem.content}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-800/40 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">TID STABILITY</span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                              <div 
                                className={`h-full rounded-full ${
                                  mem.tidScore < 0.15 ? "bg-rose-500" : mem.tidScore < 0.4 ? "bg-amber-500" : "bg-indigo-500"
                                }`} 
                                style={{ width: `${mem.tidScore * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 tracking-tight leading-none font-bold">
                              {mem.tidScore.toFixed(3)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">TOUCH INDEX</span>
                          <span className="text-xs font-mono font-bold text-slate-300 block mt-1">
                            {mem.accessCount} accesses
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Obituaries List */}
          {currentTab === "deleted" && (
            <div className="space-y-4">
              {obituaries.length === 0 ? (
                <div className="text-center py-12 border border-slate-850 border-dashed rounded-xl text-slate-500 text-xs text-slate-450">
                  No memory obituaries registered yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {obituaries.map((ob) => (
                    <div 
                      key={ob.id} 
                      className="bg-slate-900/35 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            OBITUARY RECORD
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            ID: {ob.id.toUpperCase()} • Parent: {ob.memoryId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans tracking-wide italic">
                          "{ob.summary}"
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans leading-none mt-1">
                          Original: <strong className="font-normal text-slate-400 truncate max-w-md inline-block align-bottom">{ob.originalContent}</strong>
                        </p>
                      </div>

                      <div className="text-right font-mono text-[9px] text-slate-500">
                        <span>Purged at:</span>
                        <div className="text-slate-400 font-semibold mt-1">
                          {new Date(ob.deletedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INSPECTOR & AI SEARCH */}
        <div className="space-y-6">
          
          {/* Node Inspector */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              <Network className="w-4 h-4 text-indigo-400" />
              Node Inspector
            </h3>
            
            {selectedNode ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2 relative">
                  <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block font-semibold">
                    SHARD_CONTENT
                  </span>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    "{selectedNode.content}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10.5px] font-mono">
                  <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl">
                    <span className="text-slate-500 block uppercase text-[8px] tracking-wider">TID score</span>
                    <span className={`font-bold text-xs ${
                      selectedNode.tidScore < 0.15 ? "text-rose-450 text-rose-400" : selectedNode.tidScore < 0.4 ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {selectedNode.tidScore.toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 border border-slate-850 rounded-xl">
                    <span className="text-slate-500 block uppercase text-[8px] tracking-wider">Access Index</span>
                    <span className="font-bold text-xs text-indigo-400">
                      {selectedNode.accessCount} touches
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl font-mono text-[9.5px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Touched: {new Date(selectedNode.lastAccessedAt).toLocaleDateString()} {new Date(selectedNode.lastAccessedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-500" />
                    <span>Created: {new Date(selectedNode.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleManualDelete(selectedNode.id)}
                  className="w-full py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/25 hover:border-rose-500 text-rose-400 hover:text-white font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all outline-none cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Manual Node Deletion</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-10 border border-slate-850 border-dashed rounded-xl text-slate-500 text-xs">
                Select a memory circle or list card to load telemetry breakdown.
              </div>
            )}
          </div>

          {/* AI Semantic Search */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-slate-100 text-sm tracking-tight">AI Semantic Vector Search</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Convert queries into vector space matching parameters using cosine similarity calculations to locate conceptually matching memory arrays.
            </p>

            <form onSubmit={handleSemanticSearch} className="space-y-3">
              <input
                type="text"
                required
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                placeholder="concept matching inquiry..."
                className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-slate-200 outline-none transition-colors placeholder-slate-700 font-sans"
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSearchingSemantic || !semanticQuery.trim()}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer outline-none"
                >
                  {isSearchingSemantic ? (
                    <div className="w-3 h-3 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Initiate Vector Match</span>
                  )}
                </button>
                
                {semanticResults.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSemanticSearch}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs tracking-wide rounded-lg transition-colors cursor-pointer outline-none"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Semantic Search Outcomes */}
            {semanticResults.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block font-semibold">
                  Match Matrix Outcomes
                </span>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {semanticResults.map((result) => (
                    <div 
                      key={result.id} 
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 hover:border-slate-750 transition-colors"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-1 rounded font-bold">
                          SIM: {(result.similarity * 100).toFixed(1)}%
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          TID: {result.tidScore.toFixed(3)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {result.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
