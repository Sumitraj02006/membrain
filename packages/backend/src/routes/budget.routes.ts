import { Router, Request, Response } from "express";
import z from "zod";
import { redis } from "../lib/redis.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const budgetSettingsSchema = z.object({
  body: z.object({
    totalTokens: z.number().min(1000, "Minimum total budget is 1,000 tokens"),
  }),
});

const router = Router();

// Fetch the current token budget status and calculate dynamic remaining active chat time
router.get("/status", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const raw = await redis.get(`membrain:budget:${userId}`);
    const budget = raw ? JSON.parse(raw) : {
      totalTokens: 1000000,
      usedTokens: 0,
      remainingTokens: 1000000,
      usagePercentage: 0
    };

    // Calculate a mock dynamic ETA to context window overflow
    const messageCountRaw = await redis.get(`membrain:session_velocity:${userId}`);
    const msgCount = messageCountRaw ? Number(messageCountRaw) : 5;
    
    // Average tokens per message ~ 500
    const avgTokenRate = Math.max(100, budget.usedTokens / Math.max(1, msgCount));
    const messagesLeft = budget.remainingTokens / avgTokenRate;
    
    // Convert messages left to a time format (assuming 1 message per 10 mins)
    const minutesLeft = Math.round(messagesLeft * 10);
    const hoursLeft = Math.round(minutesLeft / 60);
    const eta = hoursLeft > 0 ? `${hoursLeft} hours of active chat` : `${minutesLeft} minutes left`;

    res.json({
      ...budget,
      eta
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve budget status" });
  }
});

// Update token budget limits for the session
router.put("/settings", authenticateToken, validateRequest(budgetSettingsSchema), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { totalTokens } = req.body;

    const raw = await redis.get(`membrain:budget:${userId}`);
    let budget = raw ? JSON.parse(raw) : {
      totalTokens: 1000000,
      usedTokens: 0,
      remainingTokens: 1000000,
      usagePercentage: 0
    };

    budget.totalTokens = totalTokens;
    budget.remainingTokens = Math.max(0, totalTokens - budget.usedTokens);
    budget.usagePercentage = Math.round((budget.usedTokens / totalTokens) * 100);

    await redis.set(`membrain:budget:${userId}`, JSON.stringify(budget));

    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update budget settings" });
  }
});

// Fetch token usage history logs for charting analytics
router.get("/history", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    // Mock historical timeline for chart displays
    const raw = await redis.get(`membrain:budget:${userId}`);
    const budget = raw ? JSON.parse(raw) : { usedTokens: 50000 };

    const now = new Date();
    const history = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString(),
        tokens: Math.round(budget.usedTokens * (0.3 + (i * 0.1) + Math.random() * 0.05))
      };
    });

    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve budget history" });
  }
});

// GET: Fallback root budget endpoint (for older frontend compatibility)
router.get("/", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const raw = await redis.get(`membrain:budget:${userId}`);
    const budget = raw ? JSON.parse(raw) : {
      totalTokens: 1000000,
      usedTokens: 0,
      remainingTokens: 1000000,
      usagePercentage: 0
    };
    res.json(budget);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve budget" });
  }
});

export default router;
