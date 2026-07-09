import React, { useState, useEffect, useRef } from "react";
import { useMemoryStore } from "../stores/memoryStore.js";
import { useAuthStore } from "../stores/authStore.js";
import TokenBudgetCard from "../components/TokenBudgetCard.js";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Brain, 
  Sparkles, 
  User, 
  Bot, 
  Zap, 
  AlertCircle 
} from "lucide-react";

export default function Chat() {
  const { user } = useAuthStore();
  const {
    messages,
    sessions,
    currentSessionId,
    isSendingMessage,
    fetchSessions,
    fetchMessages,
    sendMessage,
    setCurrentSession,
    initSocket,
    disconnectSocket
  } = useMemoryStore();

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      initSocket(user.id);
    }
    fetchSessions();
    fetchMessages(currentSessionId);

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSendingMessage) return;
    const txt = inputText;
    setInputText("");
    await sendMessage(txt);
  };

  const handleCreateNewSession = () => {
    const newId = "session_" + Math.random().toString(36).substring(2, 11);
    setCurrentSession(newId);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 h-[88vh] grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-950 text-slate-100">
      
      {/* LEFT COLUMN: Sessions & Stats */}
      <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-y-auto pr-1">
        
        {/* Token Budget */}
        <TokenBudgetCard />

        {/* Sessions Panel */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col flex-1 min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200 text-sm tracking-tight flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Memory Streams
            </h3>
            <button
              onClick={handleCreateNewSession}
              className="p-1.5 text-xs text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-all outline-none cursor-pointer"
              title="Spawn New Stream"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[40vh] pr-0.5">
            {sessions.map((sess) => {
              const isActive = sess.id === currentSessionId;
              return (
                <button
                  key={sess.id}
                  onClick={() => setCurrentSession(sess.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs tracking-wide transition-all truncate block border outline-none cursor-pointer ${
                    isActive
                      ? "bg-slate-800/80 border-slate-700 text-white font-medium shadow-inner"
                      : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono text-[9px] block text-slate-500 leading-none mb-1">
                    STREAM_NODE_{sess.id.substring(0, 5).toUpperCase()}
                  </span>
                  {sess.title || "Empty Stream"}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <p className="text-[10px] font-mono text-slate-500 leading-normal flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
              Each query builds a vector embedding & initiates real-time score decay.
            </p>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Chat Area */}
      <div className="lg:col-span-3 flex flex-col bg-slate-900/30 border border-slate-800 rounded-xl h-full overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight">Active Strategic Agent Prompt</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                Node Connection: Secure / ID: {currentSessionId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Qwen-Max</span>
          </div>
        </div>

        {/* Message Panel */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-lg">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-200">Welcome to MemBrain Operator CLI</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Input a concept or start a conversation. The AI will store semantic insights and score memory durability.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full pt-4">
                {[
                  "Market values peaked in early Q1 2026.",
                  "My current production cluster runs on port 3000.",
                  "Remind me that Docker builds are stable in version 24."
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(demo)}
                    className="text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/60 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    "{demo}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === "user";
              const isOptimistic = msg.id.startsWith("optimistic_");
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                    isUser 
                      ? "bg-slate-800 border-slate-700 text-slate-200" 
                      : "bg-indigo-950/50 border-indigo-500/20 text-indigo-400"
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Body */}
                  <div className="space-y-1">
                    <div className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-100"
                    } ${isOptimistic ? "opacity-50" : ""}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Metadata indicators - Architectural Honesty */}
                    <div className={`flex items-center gap-2 text-[9px] font-mono text-slate-500 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      {isUser ? (
                        <span className="text-emerald-500 font-semibold uppercase tracking-wider">
                          Memory Cached (TID Scored)
                        </span>
                      ) : (
                        <span className="text-slate-400 uppercase tracking-widest flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 text-indigo-400" /> Grounded Context Match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Interface */}
        <form 
          onSubmit={handleSend}
          className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSendingMessage}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs text-slate-200 outline-none placeholder-slate-600 transition-all font-sans"
            placeholder="Type your message to record into semantic nodes..."
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSendingMessage}
            className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            {isSendingMessage ? (
              <div className="w-4 h-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

      </div>

    </div>
  );
}
