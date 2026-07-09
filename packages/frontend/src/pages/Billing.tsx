import React, { useState } from "react";
import { 
  CreditCard, 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  FolderSync, 
  FileText, 
  Activity,
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState<"Free" | "Basic" | "Pro" | "Enterprise">("Free");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<"Basic" | "Pro" | "Enterprise" | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "processing" | "success" | "fail">("form");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const plans = [
    { name: "Free", price: 0, limit: "100 engrams", support: "Community support" },
    { name: "Basic", price: 29, limit: "1,000 engrams", support: "Email support" },
    { name: "Pro", price: 79, limit: "10,000 engrams", support: "24/7 Priority support" },
    { name: "Enterprise", price: 299, limit: "Unlimited engrams", support: "Dedicated account manager" }
  ];

  const invoices = [
    { id: "INV-2026-001", date: "2026-07-01", amount: "$0.00", status: "Paid" },
    { id: "INV-2026-002", date: "2026-06-01", amount: "$0.00", status: "Paid" },
    { id: "INV-2026-003", date: "2026-05-01", amount: "$0.00", status: "Paid" }
  ];

  const handleOpenCheckout = (planName: "Basic" | "Pro" | "Enterprise") => {
    setSelectedPlanToBuy(planName);
    setCheckoutStep("form");
    setShowCheckout(true);
  };

  const handleProcessPayment = () => {
    setCheckoutStep("processing");
    setTimeout(() => {
      // Simulate random outcome for validation testing (90% success, 10% fail)
      if (Math.random() > 0.1) {
        setCheckoutStep("success");
        if (selectedPlanToBuy) setCurrentPlan(selectedPlanToBuy);
      } else {
        setCheckoutStep("fail");
      }
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950 text-slate-100 min-h-[90vh]">
      
      {/* HEADER */}
      <div className="border-b border-slate-800/60 pb-6">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          Subscription & Billing Manager
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your cognitive engram limits, upgrade subscription plans, and inspect historical invoice statements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE PLAN & INTERACTIVE PLANS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Plan Bento Shard */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Current Shard Scale</span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {currentPlan} Plan Node
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full">
                  ACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your operator workspace is currently bounded by the {currentPlan} plan specifications. Access limits are tracked automatically in real time.
              </p>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-850/80 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Cognitive Storage</span>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {currentPlan === "Free" ? "100 engrams" : currentPlan === "Basic" ? "1,000 engrams" : currentPlan === "Pro" ? "10,000 engrams" : "Unlimited"}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-900">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Renewal Date</span>
                <div className="text-xs font-mono text-slate-400 mt-0.5">Aug 01, 2026</div>
              </div>
            </div>
          </div>

          {/* Interactive Plans Selector */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-6">
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight">Available Subscription Plans</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.slice(1).map((p) => {
                const isCurrent = currentPlan === p.name;
                return (
                  <div 
                    key={p.name} 
                    className={`bg-slate-950 p-5 border rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors ${
                      isCurrent ? "border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-slate-850"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">{p.name}</span>
                        {isCurrent && (
                          <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                        )}
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        ${p.price}<span className="text-[10px] text-slate-500 font-normal">/mo</span>
                      </div>
                      <ul className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-slate-900">
                        <li className="flex items-center gap-1"><Check className="w-3 h-3 text-indigo-400" /> {p.limit}</li>
                        <li className="flex items-center gap-1"><Check className="w-3 h-3 text-indigo-400" /> {p.support}</li>
                      </ul>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleOpenCheckout(p.name as any)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] tracking-wider uppercase rounded-lg cursor-pointer outline-none transition-colors"
                      >
                        Upgrade Node
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: USAGE TRACKING & INVOICE STATEMENT LOGS */}
        <div className="space-y-6">
          
          {/* Usage Shard Tracker */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Cognitive Limit Telemetry
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-slate-400">Engram limit usage</span>
                <span className="text-indigo-400 font-bold">14% (14 / 100 engrams)</span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-850/80 rounded-full h-2">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: "14%" }}></div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal">
              If your usage exceeds 85%, automatic Context Surgery decay triggers via BullMQ worker queues to keep memory buffers clean.
            </p>
          </div>

          {/* Historical Invoices */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-slate-100 text-sm tracking-tight">Invoice Logs Statements</h3>
            </div>

            <div className="space-y-2.5">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block font-bold">{inv.id}</span>
                    <span className="text-[10px] text-slate-500">{inv.date}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-300 font-bold block">{inv.amount}</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CHECKOUT STRIPE MOCK MODAL OVERLAY */}
      {showCheckout && selectedPlanToBuy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
                Stripe Secure Checkout
              </h3>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-xs font-semibold text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Modal Body depending on step */}
            {checkoutStep === "form" && (
              <div className="space-y-6 pt-4">
                
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Upgrade target</span>
                    <div className="text-sm font-bold text-white">{selectedPlanToBuy} Plan Node</div>
                  </div>
                  <div className="text-lg font-bold font-mono text-indigo-400">
                    ${plans.find(p => p.name === selectedPlanToBuy)?.price}/mo
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                      Cardholder Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue="Sumitra Singh"
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg text-xs text-slate-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                      Card Information
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="4242  4242  4242  4242"
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                        Exp Date
                      </label>
                      <input 
                        type="text" 
                        placeholder="MM / YY"
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg text-xs text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                        CVC
                      </label>
                      <input 
                        type="text" 
                        placeholder="•••"
                        className="block w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Promo code */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                      Promo / Referral Code
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="HACKATHON20"
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg text-xs text-slate-200 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => { if (promoCode.trim()) setPromoApplied(true); }}
                        className="px-3.5 bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg cursor-pointer outline-none"
                      >
                        Apply
                      </button>
                    </div>
                    {promoApplied && (
                      <span className="text-[9px] font-mono text-emerald-450 text-emerald-400 mt-1 block">✓ Promo code HACKATHON20 applied: 20% discount activated!</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleProcessPayment}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer outline-none"
                >
                  <span>Authorize secure transaction</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {checkoutStep === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Processing Payment Shard...</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Contacting Stripe Distributed Gateway Network</p>
                </div>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Transaction Approved!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your operator identity has been upgraded to **{selectedPlanToBuy}**. Limits expanded in the local engram registry.
                  </p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="px-5 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold rounded-lg cursor-pointer outline-none mt-2"
                >
                  Return to Billing Dashboard
                </button>
              </div>
            )}

            {checkoutStep === "fail" && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-450 text-rose-450 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Transaction Rejected</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    The payment gateway could not authorize the card. Please verify credentials or use the mock success template.
                  </p>
                </div>
                <div className="flex gap-2 mt-2 w-full">
                  <button
                    onClick={() => setCheckoutStep("form")}
                    className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-2 bg-slate-950 border border-slate-850 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
