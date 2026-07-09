# MemBrain – Strategic Collective Forgetting Agent

MemBrain is a production-ready, full-stack AI memory manager designed to emulate biological brains by deciding what thoughts to keep and what ideas to strategically purge. 

Unlike conventional memory vaults that accumulate digital clutter indefinitely, MemBrain implements a mathematically rigorous **Temporal Importance Decay (TID)** engine that evaluates user interaction traces, computes Goal Relevance and Repetitive Noise, and highlights low-scoring memories for deletion through a secure **Human-in-the-Loop (HITL)** checkpoint.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 18, Zustand, Axios, Tailwind CSS, Lucide icons.
- **Backend Hub**: Node.js, Express.js, TypeScript, Socket.IO.
- **AI Core**: Google GenAI TypeScript SDK (Gemini-3.5-Flash & Gemini embedding) with automated fallbacks.
- **Storage Sub-system**: Persistent JSON database model supporting vector similarity-scoring math.

---

## 📐 Mathematical Formulation (TID Scoring)

Every cognitive trace in MemBrain gets evaluated on each interaction using the following decay function:

$$I(M,t) = \alpha R(M) + \beta e^{-\lambda \Delta t} + \gamma G(M) - \delta N(M)$$

### 📊 Parameter Coefficients
- **$\alpha$ (0.30)**: Recency touch multiplier ($R(M) = e^{-0.15 \times \Delta t_{\text{access}}}$). Touching memories boosts their survival.
- **$\beta$ (0.30)**: Base exponential age decay constant ($\lambda = 0.05$ per day).
- **$\gamma$ (0.40)**: Core Goal Relevance weight ($G(M) \in [0.0, 1.0]$) semantically evaluated by Gemini.
- **$\delta$ (0.20)**: Noise penalty deduction ($N(M) \in [0.0, 1.0]$) for conversational clutter.

*Memories whose score falls below **0.15** are transferred to the Forgetting queue pending User verification.*

---

## 📦 Containerization & Docker Setup

To host this multi-tier stack, use the following configurations.

### `Dockerfile`
```dockerfile
# Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/server/ ./server/

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🗄️ Relational Database & Prisma Blueprint

For heavy Postgres production instances, transition to standard pgvector with the following Prisma model configuration.

```prisma
// schema.prisma
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
  memories     Memory[]
}

model Memory {
  id             String           @id @default(uuid())
  userId         String
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  content        String
  embedding      Unsupported("vector(768)")?
  tidScore       Float            @default(1.0)
  accessCount    Int              @default(1)
  lastAccessedAt DateTime         @default(now())
  createdAt      DateTime         @default(now())
  obituary       MemoryObituary?
}

model MemoryObituary {
  id        String   @id @default(uuid())
  memoryId  String   @unique
  memory    Memory   @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  userId    String
  summary   String
  deletedAt DateTime @default(now())
}
```

---

## ⚙️ Development Installation Guide

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Supply Environmental Configurations (`.env`)**:
   ```env
   GEMINI_API_KEY="your-google-gemini-secret-key"
   JWT_SECRET="membrain-cryptographic-security-key"
   ```

3. **Initialize Compiler Server**:
   ```bash
   npm run dev
   ```

4. **Prepare Production Package**:
   ```bash
   npm run build
   ```

5. **Start Production Container**:
   ```bash
   npm start
   ```

---

## 🔐 Key Product Features in this MVP

- **Fully Autonomic Syncing**: Real-time stats, countdown meters, and budget logs sync over persistent websockets.
- **Human-in-the-Loop Safeguard**: Deletion commands undergo visual moderation before execution.
- **Memory Obits**: Forgetting elements prompts Gemini to log short obituary summaries.
- **Dual search mode**: Fast text filtering and multi-dimensional AI vector matching.
