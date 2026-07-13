import express from "express";
import path from "path";
import http from "http";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { initSocketIO } from "./socket/gateway.js";
import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.ts";
import memoryRoutes from "./routes/memory.routes.ts";
import checkpointRoutes from "./routes/checkpoint.routes.ts";
import budgetRoutes from "./routes/budget.routes.ts";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Load backend API endpoints
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/memory", memoryRoutes);
app.use("/api/checkpoint", checkpointRoutes);
app.use("/api/budget", budgetRoutes);

const server = http.createServer(app);

// Initialize Socket.io Server
initSocketIO(server);

// Serve Frontend in Production mode
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("MemBrain Production API Server Active.");
  });
}

server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`[MemBrain] Production server listening on http://0.0.0.0:${PORT}`);
});
