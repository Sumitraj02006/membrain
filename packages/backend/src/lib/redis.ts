import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("[Redis] Cache server connection active.");
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});
