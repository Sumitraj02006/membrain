# Backend Developer Migration & Implementation Guide (Handoff)

This document is for the **backend developer** to migrate the current **MemBrain MVP** (which runs on a local JSON database and Gemini AI fallback) to a production-grade scale stack using **PostgreSQL, Prisma ORM, Redis, Qwen API**, and real scheduled jobs.

---

## 🚀 Overview of Current MVP Architecture

The application is structured to run as a **single unified full-stack server** on Node.js using Express.js and Vite:
1. **Frontend**: Styled in dark high-contrast Tailwind CSS, using Zustand for state management (`src/stores/`) and communicating with the server via Axios and real-time Socket.io.
2. **Backend Engine (`server.ts`)**: 
   - Exposes REST APIs for Authentication, Chat sessions, Semantic Searches, Checkpoints, and Token budgets.
   - Hosts the Socket.io WebSocket server.
   - Integrates Vite as an development middleware so **both the client and server run concurrently on port 3000** under `npm run dev`.

*In production (`NODE_ENV=production`), the backend serves the statically built frontend from the `dist/` directory, making it fully ready to deploy to containers like Docker or Cloud Run.*

---

## 🛠️ Step-by-Step Production Migration Plan

The backend developer needs to perform the following **5 key transformations**:

### 1. Database Migration: Replace JSON Database with PostgreSQL & Prisma

Currently, all read/write states are located in `server/db.ts` utilizing JSON filesystem storage (`data/db.json`). You must swap this out for standard SQL queries using Prisma ORM.

#### Steps:
1. **Install Prisma**:
   ```bash
   npm install @prisma/client
   npm install prisma --save-dev
   ```
2. **Initialize Prisma**:
   ```bash
   npx prisma init
   ```
3. **Database Schema**: Configure your `prisma/schema.prisma` as follows:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model User {
     id           String    @id @default(uuid())
     email        String    @unique
     passwordHash String
     createdAt    DateTime  @default(now())
   }

   model Memory {
     id             String           @id @default(uuid())
     userId         String
     content        String
     embedding      Unsupported("vector(768)")? // Use pgvector extension if available, or store as a JSON float array
     tidScore       Float            @default(1.0)
     accessCount    Int              @default(1)
     lastAccessedAt DateTime         @default(now())
     createdAt      DateTime         @default(now())
   }

   model Checkpoint {
     id        String   @id @default(uuid())
     memoryId  String
     userId    String
     content   String
     tidScore  Float
     reason    String
     status    String   @default("pending") // "pending", "approved", "rejected"
     createdAt DateTime @default(now())
   }

   model MemoryObituary {
     id        String   @id @default(uuid())
     memoryId  String   @unique
     userId    String
     summary   String
     deletedAt DateTime @default(now())
   }
   ```
4. **Link Connection Details**: Put your production PostgreSQL string in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/membrain_db?schema=public"
   ```
5. **Generate client**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
6. **Rewrite Queries**: Update references in `server.ts` from `getDb()` / `saveDb()` to transactional Prisma client codes:
   ```typescript
   import { PrismaClient } from "@prisma/client";
   const prisma = new PrismaClient();
   // Example User Find
   const user = await prisma.user.findUnique({ where: { email } });
   ```

---

### 2. AI Layer Migration: Swap Gemini API with Qwen-Max & Qwen Embedding API

Currently, `server/gemini.ts` invokes Google's `@google/genai` library. You need to replace this file with Qwen API connectors (which are OpenAI compatible) using standard headers or DashScope API configurations.

#### Steps:
1. **Install OpenAI SDK**:
   ```bash
   npm install openai
   ```
2. **Rewrite `server/gemini.ts` to Qwen REST parameters**:
   ```typescript
   import OpenAI from "openai";

   const qwenClient = new OpenAI({
     apiKey: process.env.DASHSCOPE_API_KEY,
     baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", // Qwen OpenAI Compatible endpoint
   });

   // Generate chat reply
   export async function generateChatResponse(prompt: string, history: any[], retrievedMemories: any[]) {
     const response = await qwenClient.chat.completions.create({
       model: "qwen-max",
       messages: [
         { role: "system", content: "..." },
         ...history,
         { role: "user", content: prompt }
       ]
     });
     return {
       text: response.choices[0].message.content,
       tokensUsed: response.usage?.total_tokens || 0
     };
   }

   // Generate embeddings
   export async function generateEmbedding(text: string) {
     const response = await qwenClient.embeddings.create({
       model: "text-embedding-v2", // Qwen embedding model
       input: text,
     });
     return {
       embedding: response.data[0].embedding,
       tokensUsed: response.usage?.total_tokens || 0
     };
   }
   ```

---

### 3. Background Processing: Redis & Queue Worker

Instead of the raw manual trigger (`/api/force-decay`), you need a background scheduler to automatically decay scores and move low-value memories into the forget queue overnight.

#### Steps:
1. **Install BullMQ (Redis-backed Queue) & ioredis**:
   ```bash
   npm install bullmq ioredis
   ```
2. **Configure workers/queues**:
   Create a cron scheduler that triggers `processTemporalDecay()` every night at 02:00:
   ```typescript
   import { Queue, Worker } from "bullmq";
   import Redis from "ioredis";

   const connection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

   const decayQueue = new Queue("decay-scheduler", { connection });

   // Repeat daily cron schedule
   await decayQueue.add("nightly-decay", {}, {
     repeat: { cron: "0 2 * * *" }
   });

   const worker = new Worker("decay-scheduler", async job => {
     if (job.name === "nightly-decay") {
       console.log("Staging nightly memory decay step...");
       await processTemporalDecay(); 
     }
   }, { connection });
   ```

---

### 4. Semantic Search Transition

The current app filters memories utilizing standard cosine similarity written directly in JavaScript (found in `server/db.ts` / `cosineSimilarity`).

- If you migrate to **PostgreSQL with the `pgvector` extension**, you should perform vector similarity matches directly on the database query layer for ultra-fast performance:
  ```postgresql
  SELECT id, content, 1 - (embedding <=> $1::vector) AS similarity 
  FROM "Memory" 
  WHERE "userId" = $2 AND 1 - (embedding <=> $1::vector) > 0.35 
  ORDER BY similarity DESC LIMIT 5;
  ```
- Alternatively, you can use raw sql bindings inside Prisma to access `pgvector`.

---

## 💻 Running the App Locally (VS Code Guide)

### Setup Checklist
1. **Clone/Download the files into a workspace.**
2. **Configure Local Environment variables** (`.env` file in root):
   ```env
   GEMINI_API_KEY="your-gemini-key-if-using-fallbacks"
   JWT_SECRET="membrain-cryptographic-security-key"
   # Add your future variables here:
   # DATABASE_URL="postgresql://..."
   # REDIS_URL="redis://..."
   # DASHSCOPE_API_KEY="your-qwen-key"
   ```
3. **Install node dependencies**:
   ```bash
   npm install
   ```
4. **Start the Integrated dev server**:
   ```bash
   npm run dev
   ```
   *Your server will boot on `http://localhost:3000` with HMR and hot real-time API integrations, and the React frontend will immediately load!*
5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🎨 Note on the Frontend Layout

**Do not change the React Frontend routing/layout files.** 
- The React application is intentionally decoupled from database state wrappers; it communicates strictly via custom REST calls (`axios.post("/api/...")`) and listens on Socket.io events (`memory_updated`, `budget_update`, etc.).
- As long as you maintain the API endpoints (same paths, query params, and body data structures) and emit socket events, the frontend will function flawlessly out-of-the-box, without requiring any manual modification!
