import React, { useState, useEffect } from "react";
import { useAuthStore } from "./stores/authStore.js";
import { useMemoryStore } from "./stores/memoryStore.js";
import Navigation from "./components/Navigation.js";
import Home from "./pages/Home.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Chat from "./pages/Chat.js";
import Dashboard from "./pages/Dashboard.js";
import Checkpoints from "./pages/Checkpoints.js";
import Settings from "./pages/Settings.js";
import Billing from "./pages/Billing.js";
import AdminDashboard from "./pages/AdminDashboard.js";
import { Brain } from "lucide-react";

export default function App() {
  const { isAuthenticated, isLoading, checkMe } = useAuthStore();
  const { fetchCheckpoints, fetchBudget } = useMemoryStore();
  const [currentPage, setCurrentPage] = useState<string>("chat"); // Default view
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [showAuthGate, setShowAuthGate] = useState<boolean>(false);

  // Verify token on mount
  useEffect(() => {
    checkMe();
  }, []);

  // Sync auxiliary statistics when user status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCheckpoints();
      fetchBudget();
    }
  }, [isAuthenticated]);

  // Handle loading state gracefully
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-pulse">
          <Brain className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono tracking-wider text-slate-500 uppercase">
          Synthesizing Operator Node...
        </p>
      </div>
    );
  }

  // Handle Unauthenticated Gate
  if (!isAuthenticated) {
    if (!showAuthGate) {
      return <Home onStart={() => setShowAuthGate(true)} />;
    }

    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        
        {/* Simple navigation to return to Home page */}
        <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setShowAuthGate(false)}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 text-indigo-400">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-base font-mono">
                MEMBRAIN
              </span>
            </div>

            <button
              onClick={() => setShowAuthGate(false)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </header>

        {authView === "login" ? (
          <Login onToggleSignUp={() => setAuthView("register")} />
        ) : (
          <Register onToggleSignIn={() => setAuthView("login")} />
        )}
      </div>
    );
  }

  // Render Authenticated Dashboard view
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navigation currentPage={currentPage} setPage={setCurrentPage} />
      
      <main className="relative">
        <div className="transition-opacity duration-300">
          {currentPage === "chat" && <Chat />}
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "checkpoints" && <Checkpoints />}
          {currentPage === "settings" && <Settings />}
          {currentPage === "billing" && <Billing />}
          {currentPage === "admin" && user?.email === "admin@membrain.co" && <AdminDashboard />}
        </div>
      </main>
    </div>
  );
}
