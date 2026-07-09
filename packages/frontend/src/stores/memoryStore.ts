import { create } from "zustand";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { 
  type Memory, 
  type ChatMessage, 
  type ChatSession, 
  type CheckpointPending, 
  type MemoryObituary, 
  type TokenBudget, 
  type DashboardStats 
} from "../types.js";

interface MemoryState {
  stats: DashboardStats | null;
  activeMemories: Memory[];
  obituaries: any[];
  pendingCheckpoints: CheckpointPending[];
  budget: TokenBudget | null;
  sessions: ChatSession[];
  currentSessionId: string;
  messages: ChatMessage[];
  searchQuery: string;
  isSendingMessage: boolean;
  isLoadingStats: boolean;
  isLoadingMemories: boolean;
  isLoadingCheckpoints: boolean;
  isProcessingAction: boolean;
  socket: Socket | null;
  
  initSocket: (userId: string) => void;
  disconnectSocket: () => void;
  fetchStats: () => Promise<void>;
  fetchMemories: (search?: string) => Promise<void>;
  fetchObituaries: () => Promise<void>;
  fetchCheckpoints: () => Promise<void>;
  fetchBudget: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  approveCheckpoint: (id: string) => Promise<void>;
  rejectCheckpoint: (id: string) => Promise<void>;
  approveAllCheckpoints: () => Promise<void>;
  forceDecayCalculation: () => Promise<void>;
  setCurrentSession: (sessionId: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  stats: null,
  activeMemories: [],
  obituaries: [],
  pendingCheckpoints: [],
  budget: null,
  sessions: [],
  currentSessionId: "default_session",
  messages: [],
  searchQuery: "",
  isSendingMessage: false,
  isLoadingStats: false,
  isLoadingMemories: false,
  isLoadingCheckpoints: false,
  isProcessingAction: false,
  socket: null,

  initSocket: (userId: string) => {
    // Avoid double connect
    if (get().socket) return;

    // Connect to same origin host
    const socketInstance = io();

    socketInstance.on("connect", () => {
      console.log("Socket client connected, joining room:", userId);
      socketInstance.emit("join", userId);
    });

    socketInstance.on("memory_updated", () => {
      console.log("Socket event: memory_updated. Refreshing states.");
      get().fetchStats();
      get().fetchMemories(get().searchQuery);
      get().fetchObituaries();
      get().fetchCheckpoints();
    });

    socketInstance.on("budget_update", (budget: TokenBudget) => {
      console.log("Socket event: budget_update.", budget);
      set({ budget });
    });

    socketInstance.on("checkpoint_ready", (data: any) => {
      console.log("Socket event: checkpoint_ready. Refreshing checkpoints.", data);
      get().fetchCheckpoints();
    });

    socketInstance.on("message_reply", (data: { sessionId: string; messages: ChatMessage[] }) => {
      console.log("Socket event: message_reply.", data);
      if (data.sessionId === get().currentSessionId) {
        // Filter out any messages already added of the same IDs
        const existingIds = new Set(get().messages.map(m => m.id));
        const newMessages = data.messages.filter(m => !existingIds.has(m.id));
        if (newMessages.length > 0) {
          set({ messages: [...get().messages, ...newMessages] });
        }
      }
    });

    set({ socket: socketInstance });
  },

  disconnectSocket: () => {
    const s = get().socket;
    if (s) {
      s.disconnect();
      set({ socket: null });
    }
  },

  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const res = await axios.get("/api/dashboard/stats");
      set({ stats: res.data, isLoadingStats: false });
    } catch (err) {
      console.error("Fetch stats error", err);
      set({ isLoadingStats: false });
    }
  },

  fetchMemories: async (searchString = "") => {
    set({ isLoadingMemories: true });
    try {
      const res = await axios.get(`/api/dashboard/memories?search=${encodeURIComponent(searchString)}`);
      set({ activeMemories: res.data, isLoadingMemories: false });
    } catch (err) {
      console.error("Fetch memories error", err);
      set({ isLoadingMemories: false });
    }
  },

  fetchObituaries: async () => {
    try {
      const res = await axios.get("/api/dashboard/obituaries");
      set({ obituaries: res.data });
    } catch (err) {
      console.error("Fetch obituaries error", err);
    }
  },

  fetchCheckpoints: async () => {
    set({ isLoadingCheckpoints: true });
    try {
      const res = await axios.get("/api/checkpoint/pending");
      set({ pendingCheckpoints: res.data, isLoadingCheckpoints: false });
    } catch (err) {
      console.error("Fetch checkpoints error", err);
      set({ isLoadingCheckpoints: false });
    }
  },

  fetchBudget: async () => {
    try {
      const res = await axios.get("/api/budget");
      set({ budget: res.data });
    } catch (err) {
      console.error("Fetch budget error", err);
    }
  },

  fetchSessions: async () => {
    try {
      const res = await axios.get("/api/agent/sessions");
      set({ sessions: res.data });
    } catch (err) {
      console.error("Fetch sessions error", err);
    }
  },

  fetchMessages: async (sessionId: string) => {
    try {
      const res = await axios.get(`/api/agent/history/${sessionId}`);
      set({ messages: res.data, currentSessionId: sessionId });
    } catch (err) {
      console.error("Fetch messages error", err);
    }
  },

  sendMessage: async (text: string) => {
    if (!text.trim()) return;
    set({ isSendingMessage: true });
    const sessionId = get().currentSessionId;
    
    // Optimistic user message addition
    const optimisticMessage: ChatMessage = {
      id: "optimistic_" + Date.now(),
      userId: "local",
      sessionId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };
    set({ messages: [...get().messages, optimisticMessage] });

    try {
      const res = await axios.post("/api/agent/chat", {
        message: text,
        sessionId
      });
      
      const officialUserMessage: ChatMessage = {
        id: "user_" + Date.now(),
        userId: "local",
        sessionId,
        role: "user",
        content: text,
        createdAt: new Date().toISOString()
      };

      const assistantMsg: ChatMessage = {
        id: "assistant_" + Date.now(),
        userId: "local",
        sessionId,
        role: "assistant",
        content: res.data.reply,
        createdAt: new Date().toISOString()
      };

      const currentMsgs = get().messages.filter(m => !m.id.startsWith("optimistic_"));
      set({ 
        messages: [...currentMsgs, officialUserMessage, assistantMsg],
        isSendingMessage: false 
      });
      
      get().fetchStats();
      get().fetchMemories(get().searchQuery);
    } catch (err) {
      console.error("Send message error", err);
      set({ isSendingMessage: false });
    }
  },

  approveCheckpoint: async (id: string) => {
    set({ isProcessingAction: true });
    try {
      await axios.post(`/api/checkpoint/${id}/approve`);
      set({ isProcessingAction: false });
      get().fetchCheckpoints();
      get().fetchStats();
      get().fetchObituaries();
      get().fetchMemories(get().searchQuery);
    } catch (err) {
      console.error("Approve deletion error", err);
      set({ isProcessingAction: false });
    }
  },

  rejectCheckpoint: async (id: string) => {
    set({ isProcessingAction: true });
    try {
      await axios.post(`/api/checkpoint/${id}/reject`);
      set({ isProcessingAction: false });
      get().fetchCheckpoints();
      get().fetchStats();
      get().fetchMemories(get().searchQuery);
    } catch (err) {
      console.error("Reject deletion error", err);
      set({ isProcessingAction: false });
    }
  },

  approveAllCheckpoints: async () => {
    set({ isProcessingAction: true });
    try {
      await axios.post("/api/checkpoint/approve-all");
      set({ isProcessingAction: false });
      get().fetchCheckpoints();
      get().fetchStats();
      get().fetchObituaries();
      get().fetchMemories(get().searchQuery);
    } catch (err) {
      console.error("Approve all deletions error", err);
      set({ isProcessingAction: false });
    }
  },

  forceDecayCalculation: async () => {
    set({ isProcessingAction: true });
    try {
      const res = await axios.post("/api/force-decay");
      set({ 
        stats: res.data.stats, 
        isProcessingAction: false 
      });
      get().fetchCheckpoints();
      get().fetchMemories(get().searchQuery);
    } catch (err) {
      console.error("Force decay calculation error", err);
      set({ isProcessingAction: false });
    }
  },

  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
    get().fetchMessages(sessionId);
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  }
}));
