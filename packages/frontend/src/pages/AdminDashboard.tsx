import React, { useState } from "react";
import { 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Terminal, 
  Tag, 
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([
    { email: "operator1@agency.gov", plan: "Pro", joined: "2026-07-01", status: "Active" },
    { email: "operator2@agency.gov", plan: "Basic", joined: "2026-06-15", status: "Active" },
    { email: "operator3@agency.gov", plan: "Free", joined: "2026-05-20", status: "Inactive" }
  ]);

  const [coupons, setCoupons] = useState([
    { code: "HACKATHON20", discount: "20% OFF", status: "Active" },
    { code: "FREEMEMORY", discount: "100% OFF (1 Month)", status: "Active" }
  ]);

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("10% OFF");
  const [showAddCoupon, setShowAddCoupon] = useState(false);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    setCoupons([
      ...coupons,
      { code: newCouponCode.toUpperCase(), discount: newCouponDiscount, status: "Active" }
    ]);
    setNewCouponCode("");
    setShowAddCoupon(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950 text-slate-100 min-h-[90vh]">
      
      {/* HEADER */}
      <div className="border-b border-slate-800/60 pb-6">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Admin Operations Command Panel
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor system metrics, manage registered developer nodes, configure discount keys, and track live infrastructure.
        </p>
      </div>

      {/* ADMIN BENTO DIAGNOSTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Total Registered Shards</span>
          <div className="text-xl font-bold text-white font-mono">1,402</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Active Subscriptions</span>
          <div className="text-xl font-bold text-indigo-400 font-mono">842 nodes</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Redis Job Velocity</span>
          <div className="text-xl font-bold text-emerald-450 text-emerald-450 text-emerald-400 font-mono">0.02s avg delay</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">API Cluster Health</span>
          <div className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5 mt-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All systems nominal
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: USERS LIST */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Registered Operator Identities
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 text-left">
                  <th className="pb-3 font-semibold uppercase tracking-wider">Email Address</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider">Plan Scale</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider">Joined Date</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={idx} className="border-b border-slate-900/50 hover:bg-slate-900/20">
                    <td className="py-3.5 text-slate-200">{u.email}</td>
                    <td className="py-3.5 text-indigo-400 font-bold">{u.plan}</td>
                    <td className="py-3.5 text-slate-500">{u.joined}</td>
                    <td className="py-3.5 text-right">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        u.status === "Active" ? "bg-emerald-500/10 text-emerald-450 text-emerald-450 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: PROMO CODES MANAGER & SYSTEM LOGS */}
        <div className="space-y-6">
          
          {/* Promo Codes Manager */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-400" />
                Registry Promo Keys
              </h3>
              <button
                onClick={() => setShowAddCoupon(!showAddCoupon)}
                className="p-1 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 transition-all cursor-pointer outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showAddCoupon && (
              <form onSubmit={handleAddCoupon} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <input 
                  type="text"
                  required
                  placeholder="NEWCODE20"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 outline-none uppercase font-mono"
                />
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    required
                    placeholder="10% OFF"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-200 outline-none font-mono"
                  />
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-md text-white cursor-pointer outline-none">
                    Save
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {coupons.map((c) => (
                <div key={c.code} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-200 font-bold block">{c.code}</span>
                    <span className="text-[10px] text-slate-500">{c.discount}</span>
                  </div>

                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Console Logs */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-indigo-400" />
              Real-time Worker Logs
            </h3>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2 font-mono text-[9px] text-slate-400 max-h-[160px] overflow-y-auto">
              <div className="flex items-start gap-1">
                <span className="text-slate-600">[14:10:02]</span>
                <span>BullMQ scoring-queue recalculation finished.</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-slate-600">[14:10:01]</span>
                <span>Decay calculation executed on 14 engrams.</span>
              </div>
              <div className="flex items-start gap-1 text-rose-450 text-rose-400">
                <span className="text-slate-600">[13:58:20]</span>
                <span>Decay candidate registered below 0.15 threshold.</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-slate-600">[13:42:15]</span>
                <span>Redis budget key cached successfully.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
