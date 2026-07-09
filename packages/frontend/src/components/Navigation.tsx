import { useAuthStore } from "../stores/authStore.js";
import { useMemoryStore } from "../stores/memoryStore.js";
import { MessageSquare, LayoutDashboard, Brain, Sliders, LogOut, ShieldAlert, CreditCard, Settings } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  setPage: (page: string) => void;
}

export default function Navigation({ currentPage, setPage }: NavigationProps) {
  const { user, logout } = useAuthStore();
  const { pendingCheckpoints } = useMemoryStore();

  const menuItems = [
    { id: "chat", label: "Agent Chat", icon: MessageSquare },
    { id: "dashboard", label: "Memory Index", icon: LayoutDashboard },
    { 
      id: "checkpoints", 
      label: "Forgetting Queue", 
      icon: ShieldAlert,
      badge: pendingCheckpoints.length > 0 ? pendingCheckpoints.length : null 
    },
    { id: "settings", label: "TID Settings", icon: Sliders },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  // Only expose the admin operations command panel to the verified root administrator
  if (user?.email === "admin@membrain.co") {
    menuItems.push({ id: "admin", label: "Admin Panel", icon: Settings });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setPage("dashboard")}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
            <Brain className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white font-sans flex items-center gap-1.5 leading-none">
              MemBrain
            </h1>
            <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase leading-none font-semibold">Decay Engine</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="hidden md:flex space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 outline-none ${
                  isActive 
                    ? "text-indigo-400 bg-indigo-500/10 font-semibold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.label}
                {item.badge !== null && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono font-bold text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Stats and Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-slate-400 font-mono font-medium truncate max-w-[150px]">
              {user?.email}
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">
              Operator Node
            </span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-all duration-200 outline-none"
            title="Disconnect Operator"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Disconnect</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Header */}
      <div className="flex md:hidden border-t border-slate-800 bg-slate-900/90 py-1.5 px-4 justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] tracking-wide transition-all duration-200 ${
                isActive 
                  ? "text-indigo-400" 
                  : "text-slate-400"
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-mono font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
