import OpenAI from "openai";

const apiKey = process.env.QWEN_API_KEY;
const rawBaseUrl = process.env.QWEN_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";

// Resolve OpenAI SDK compatibility if native DashScope /api/v1 URL is provided
const baseURL = rawBaseUrl.endsWith("/api/v1")
  ? rawBaseUrl.replace("/api/v1", "/compatible-mode/v1")
  : rawBaseUrl;

let qwenClient: OpenAI | null = null;

export function getQwenClient(): OpenAI {
  if (!qwenClient) {
    qwenClient = new OpenAI({
      apiKey: apiKey && apiKey !== "your_qwen_api_key_here" ? apiKey : "MOCK_KEY",
      baseURL,
    });
  }
  return qwenClient;
}

export function isQwenConfigured(): boolean {
  return !!apiKey && 
    apiKey !== "your_qwen_api_key_here" && 
    apiKey !== "sk-ws-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z";
}
