class MemoryRedis {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string): Promise<string> {
    this.store.set(key, value);
    return "OK";
  }

  async keys(pattern: string): Promise<string[]> {
    const regexPattern = pattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);
    const results: string[] = [];
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        results.push(key);
      }
    }
    return results;
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (event === "connect") {
      setTimeout(callback, 0);
    }
  }
}

console.log("[Redis] Using in-memory fallback cache.");
export const redis = new MemoryRedis() as any;
