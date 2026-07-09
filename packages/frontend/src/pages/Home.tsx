import React, { useState, useEffect } from "react";
import { 
  Brain, 
  ShieldAlert, 
  Cpu, 
  Network, 
  ArrowRight, 
  Zap, 
  FolderSync, 
  Play, 
  Check, 
  Plus, 
  Minus,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Clock,
  Globe,
  Star,
  ChevronDown
} from "lucide-react";

interface HomeProps {
  onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
  // Testimonials state
  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Lead Platform Engineer",
      rating: 5,
      comment: "MemBrain completely solved our context overflow issues. Qwen-Max's obituaries are incredibly precise.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      name: "Hiroshi Sato",
      role: "AI Architecture Lead",
      rating: 5,
      comment: "The D3.js radial memory tree gives us unmatched visibility into our agent's engram decay layers.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      name: "Sarah Jenkins",
      role: "Compliance & Security Director",
      rating: 5,
      comment: "Archiving to Alibaba OSS keeps our records secure while freeing up hot cache memory automatically.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Auto sliding testimonial carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    {
      q: "How does the Temporal Importance Decay (TID) formula work?",
      a: "TID calculates the durability of a memory based on four weighted parameters: Recency touches (Alpha), Age since creation (Beta), Goal relevance (Gamma), and Redundant Noise deduction (Delta). When the score falls below 0.15, it enters the forgetting queue."
    },
    {
      q: "Is my memory data secure?",
      a: "Yes. All memory engrams are securely encrypted and protected in PostgreSQL using pgvector. Forgotten engrams are compressed and archived in private, immutable Alibaba Cloud OSS buckets."
    },
    {
      q: "Can I customize the decay variables?",
      a: "Yes, developers can adjust the Alpha, Beta, Gamma, and Delta weights directly inside the settings dashboard to align with specific domain requirements."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Decorative Grid & Aurora lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none"></div>
      <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none"></div>

      {/* STICKY HEADER */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 text-indigo-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-sm font-mono uppercase">
              MEMBRAIN
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#why-choose-us" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <button
            onClick={onStart}
            className="px-4 py-2 text-xs font-bold font-mono tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg shadow-lg shadow-indigo-900/35 transition-all outline-none cursor-pointer"
          >
            Access Console
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col items-center text-center space-y-8">
        
        {/* Trust Badges Bar */}
        <div className="flex flex-wrap justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /> Fast
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" /> AI Powered
          </span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.05] font-sans">
          Forget Outdated Context. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Automate Memory Decay.
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          MemBrain is the first Strategic Forgetting Agent that calculates Time-Importance Decay (TID) metrics, freeing hot context using Qwen-Max AI and cold-archiving obituaries to Alibaba OSS.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs tracking-wider uppercase text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5 active:translate-y-px transition-all outline-none cursor-pointer"
          >
            <span>Get Started Console</span>
            <ArrowRight className="w-4 h-4 text-indigo-200" />
          </button>
          
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 font-semibold text-xs tracking-wider uppercase text-slate-350 rounded-xl flex items-center justify-center gap-2 transition-all outline-none cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-slate-400 fill-current" />
            <span>Watch Demo Flow</span>
          </button>
        </div>

        {/* Browser Mockup */}
        <div className="w-full max-w-5xl pt-16 animate-float">
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden relative group">
            
            {/* Browser Header Mac style */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-850/80 mb-3 px-1">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <div className="bg-slate-950/80 border border-slate-850 px-8 py-1 rounded-lg text-[9px] font-mono text-slate-500 select-all tracking-wide">
                https://membrain.agency.gov/console/dashboard
              </div>
              <div className="w-8"></div>
            </div>

            {/* Mock Dashboard Preview */}
            <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-6 grid grid-cols-3 gap-4 text-left">
              <div className="col-span-2 space-y-4">
                <div className="h-6 w-36 bg-slate-850 rounded-md"></div>
                <div className="h-44 bg-slate-900/80 border border-slate-850 rounded-xl flex items-center justify-center text-slate-600 text-xs font-mono">
                  [ D3.js Radial Engram Map Preview ]
                </div>
              </div>
              <div className="col-span-1 space-y-3">
                <div className="h-24 bg-slate-900/80 border border-slate-850 rounded-xl p-3 space-y-2">
                  <div className="h-4 w-20 bg-slate-850 rounded-md"></div>
                  <div className="h-6 w-12 bg-indigo-500/20 rounded-md"></div>
                </div>
                <div className="h-28 bg-slate-900/80 border border-slate-850 rounded-xl p-3 space-y-2">
                  <div className="h-4 w-28 bg-slate-850 rounded-md"></div>
                  <div className="h-4 w-12 bg-rose-500/20 rounded-md"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* STATISTICS SECTION */}
      <section className="bg-slate-950/80 border-y border-slate-900/80 py-16 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">10K+</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Decayed Engrams</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono">99.99%</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Uptime Telemetry</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-violet-400 font-mono">24/7</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Scoring Engine</div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">100+</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Cloud Deployments</div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 relative z-10 space-y-16">
        
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
            SaaS Memory Optimization Stack
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Everything you need to automate time-decay scoring, run semantic vector searches, and keep memory buffers lightweight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-6 rounded-2xl space-y-4 hover:-translate-y-1 transition-all duration-200 group relative">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Qwen-Max Core</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leverage custom fine-tuned Qwen prompts to run semantic evaluations, extract noise indices, and summarize memory obituaries in one sentence.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-6 rounded-2xl space-y-4 hover:-translate-y-1 transition-all duration-200 group relative">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">D3.js Memory Visualizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore memory hierarchies using an interactive, color-coded radial graph that visually distinguishes active engrams from decaying nodes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-800 p-6 rounded-2xl space-y-4 hover:-translate-y-1 transition-all duration-200 group relative">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <FolderSync className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">Alibaba OSS Archive</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically serialize and compress expired memory objects to immutable, cold-storage Alibaba Cloud Object Storage Service (OSS) buckets.
            </p>
          </div>

        </div>

      </section>

      {/* WHY CHOOSE US (TIMELINE / COMPARISON) */}
      <section id="why-choose-us" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Architectural Comparison</h2>
          <p className="text-xs text-slate-500">Why leading platforms integrate MemBrain engram managers</p>
        </div>

        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Standard Agents</span>
              <ul className="space-y-2.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Infinite context accumulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>High token budget overhead</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>No visual engram tree mapping</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 md:border-x md:border-slate-850 md:px-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-450 text-indigo-400 font-bold">MemBrain Engine</span>
              <ul className="space-y-2.5 text-slate-350">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Dynamic scoring (TID variables)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Automatic background decay</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>D3.js radial hierarchy visualizer</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Data Compliance</span>
              <ul className="space-y-2.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Archived obituaries in OSS</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Wiped active database vectors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Human-in-the-Loop review gates</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS (AUTO SLIDER CAROUSEL) */}
      <section className="mx-auto max-w-4xl px-4 py-20 relative z-10">
        
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-8 sm:p-12 relative overflow-hidden text-center space-y-6">
          <div className="flex justify-center text-amber-500 gap-1">
            {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
            "{testimonials[activeTestimonial].comment}"
          </p>

          <div className="flex items-center justify-center gap-3">
            <img 
              src={testimonials[activeTestimonial].avatar} 
              alt={testimonials[activeTestimonial].name} 
              className="w-10 h-10 rounded-full border border-slate-800 object-cover"
            />
            <div className="text-left font-mono">
              <div className="text-xs font-bold text-white">{testimonials[activeTestimonial].name}</div>
              <div className="text-[10px] text-slate-500">{testimonials[activeTestimonial].role}</div>
            </div>
          </div>

          {/* Slider Dots */}
          <div className="flex justify-center gap-1.5 pt-4">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all outline-none cursor-pointer ${
                  idx === activeTestimonial ? "bg-indigo-500 w-4" : "bg-slate-800"
                }`}
              ></button>
            ))}
          </div>

        </div>

      </section>

      {/* PRICING PREVIEW */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 relative z-10 space-y-16">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
            Transparent Pricing Plans
          </h2>
          <p className="text-xs text-slate-500">Choose the ideal cognitive scale for your agent network</p>
          
          {/* Toggle Period */}
          <div className="inline-flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg mt-4 font-mono text-[10px]">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-3 py-1.5 rounded-md transition-all outline-none cursor-pointer uppercase ${
                billingPeriod === "monthly" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-3 py-1.5 rounded-md transition-all outline-none cursor-pointer uppercase flex items-center gap-1 ${
                billingPeriod === "yearly" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400"
              }`}
            >
              <span>Yearly</span>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded">20% OFF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Plan 1 */}
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Starter</span>
              <div className="text-2xl font-bold font-mono text-white">$0</div>
              <ul className="text-[11.5px] text-slate-400 space-y-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 100 engrams limit</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Standard Qwen-Max access</li>
              </ul>
            </div>
            <button onClick={onStart} className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 font-mono text-[10px] tracking-wider uppercase text-white rounded-lg cursor-pointer">
              Deploy Free
            </button>
          </div>

          {/* Plan 2 */}
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Basic</span>
              <div className="text-2xl font-bold font-mono text-white">
                {billingPeriod === "monthly" ? "$29" : "$23"}
                <span className="text-xs text-slate-500 font-normal">/mo</span>
              </div>
              <ul className="text-[11.5px] text-slate-400 space-y-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 1,000 engrams</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> High-frequency time decay</li>
              </ul>
            </div>
            <button onClick={onStart} className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 font-mono text-[10px] tracking-wider uppercase text-white rounded-lg cursor-pointer">
              Provision Node
            </button>
          </div>

          {/* Plan 3 - Most Popular */}
          <div className="bg-indigo-950/20 border-2 border-indigo-500 p-6 rounded-2xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-indigo-500 text-[8px] font-mono font-bold uppercase tracking-wider text-white">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Pro</span>
              <div className="text-2xl font-bold font-mono text-white">
                {billingPeriod === "monthly" ? "$79" : "$63"}
                <span className="text-xs text-slate-500 font-normal">/mo</span>
              </div>
              <ul className="text-[11.5px] text-slate-350 space-y-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 10,000 engrams</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Priority API support</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Auto-archiving to custom OSS</li>
              </ul>
            </div>
            <button onClick={onStart} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-mono text-[10px] tracking-wider uppercase rounded-lg shadow-lg shadow-indigo-950/80 cursor-pointer">
              Deploy Pro Shard
            </button>
          </div>

          {/* Plan 4 */}
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Enterprise</span>
              <div className="text-2xl font-bold font-mono text-white">Custom</div>
              <ul className="text-[11.5px] text-slate-400 space-y-2">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Unlimited engrams scale</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Multi-region deployment</li>
              </ul>
            </div>
            <button onClick={onStart} className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 font-mono text-[10px] tracking-wider uppercase text-white rounded-lg cursor-pointer">
              Contact Agency
            </button>
          </div>

        </div>

      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="mx-auto max-w-4xl px-4 py-20 relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Frequently Answered Queries</h2>
          <p className="text-xs text-slate-500">Understand the underlying mechanics of memory decay</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-slate-900/30 border border-slate-900 hover:border-slate-850 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-xs font-semibold tracking-wide text-slate-200 outline-none cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-4 text-xs text-slate-450 leading-relaxed border-t border-slate-950 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-4xl px-4 py-16 relative z-10">
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full"></div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-white">Join the Forgetting Registry</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Stay updated with the latest time-importance decay algorithms and Qwen model releases.
          </p>

          {subscribed ? (
            <div className="text-xs text-emerald-400 font-mono">
              ✓ Address registered successfully. Welcome to the registry.
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="operator@agency.gov"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-350 outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold tracking-wider uppercase text-white rounded-xl cursor-pointer outline-none"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 relative z-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-mono">
              <Brain className="w-5 h-5 text-indigo-400" />
              <span className="font-extrabold tracking-tight">MEMBRAIN</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
              SaaS engram management built for scale. Freeing active contexts, optimizing token allocations.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Company</span>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-slate-300">About Us</a></li>
              <li><a href="#" className="hover:text-slate-300">Careers</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Resources</span>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-slate-300">Documentation</a></li>
              <li><a href="#" className="hover:text-slate-300">API Status</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Legal</span>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-slate-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-300">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-900/60 text-center text-[10px] font-mono">
          <span>© 2026 MemBrain Inc. All Rights Reserved. FIPS 140-2 Cryptographic Engine.</span>
        </div>
      </footer>

    </div>
  );
}
