export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  tidScore: number;
  accessCount: number;
  lastAccessedAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface CheckpointPending {
  id: string;
  memoryId: string;
  userId: string;
  content: string;
  tidScore: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface MemoryObituary {
  id: string;
  memoryId: string;
  userId: string;
  summary: string;
  deletedAt: string;
}

export interface TokenBudget {
  totalTokens: number;
  usedTokens: number;
  remainingTokens: number;
  usagePercentage: number;
}

export interface DashboardStats {
  totalMemories: number;
  activeMemories: number;
  forgetQueueCount: number;
  deletedMemoriesCount: number;
  averageTidScore: number;
}
