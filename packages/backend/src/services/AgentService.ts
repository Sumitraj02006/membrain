import { getQwenClient, isQwenConfigured } from "../lib/qwen.js";
import { type ChatMessage } from "../../../frontend/src/types.js";

export class AgentService {
  private static model = process.env.QWEN_MODEL || "qwen-max";

  /**
   * Generate a chat response using Qwen-Max, injecting retrieved memories as context
   */
  public static async generateChatResponse(
    prompt: string,
    history: ChatMessage[],
    retrievedMemories: { content: string; ageDays: number; tidScore: number }[]
  ): Promise<{ text: string; tokensUsed: number }> {
    const memoriesContext = retrievedMemories.length > 0
      ? retrievedMemories
          .map(m => `- "${m.content}" (Age: ${m.ageDays.toFixed(1)} days, TID score: ${m.tidScore.toFixed(3)})`)
          .join("\n")
      : "No relevant long-term memories retrieved.";

    const systemInstruction = `You are MemBrain, the Strategic Collective Forgetting Agent.
You assist the user while dynamically recording memories. For context, you can access past memories.
You write clear, direct, and thoughtful replies.

Current retrieved context from memory:
${memoriesContext}

Guidelines:
1. Refer to relevant retrieved context naturally when answering.
2. Maintain a cool, technical slate, responsive SaaS tone.
3. Keep answers relatively concise and highly coherent.`;

    const estimatedPromptTokens = Math.ceil((prompt.length + systemInstruction.length) / 4);

    if (!isQwenConfigured()) {
      const fallbackAnswers = [
        `I've noted that! [Qwen Offline Mode] Since QWEN_API_KEY is missing or not configured, I'm simulating my responses locally. I've stored this interaction into my memory node, scored its recency, and enqueued it for strategic forgetting analysis!`,
        `Got it! Based on my simulated memory containing "${retrievedMemories.slice(0, 2).map(m => m.content).join('", "') || 'new context'}", I can process this inquiry. In a fully-connected Cloud Run system, this creates semantic traces with scores that decay dynamically over time.`,
        `Interesting perspective. I've indexed your thought in the temporal registry. Memories of index score < 0.15 will be transferred directly to our Human-in-the-Loop checkpoints dashboard. Try asking me about things you've told me previously to trigger memory similarity matches!`
      ];
      const text = fallbackAnswers[Math.abs(prompt.length) % fallbackAnswers.length];
      return {
        text,
        tokensUsed: estimatedPromptTokens + Math.ceil(text.length / 4)
      };
    }

    const client = getQwenClient();
    const formattedHistory = history.slice(-8).map(msg => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content
    }));

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: systemInstruction },
            ...formattedHistory,
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        });

        const reply = response.choices[0]?.message?.content || "";
        return {
          text: reply,
          tokensUsed: response.usage?.total_tokens || 0,
        };
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          console.error("Qwen Chat completion failed, falling back to mock:", error);
          return {
            text: `[Qwen API Error] Local execution mode engaged. Reason: ${error.message || error}`,
            tokensUsed: estimatedPromptTokens + 50
          };
        }
        console.warn(`[Qwen] Chat completion failed, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error("Failed to generate chat response");
  }

  /**
   * Generate a short memory obituary summary using Qwen-Max
   */
  public static async generateObituary(memoryContent: string): Promise<{ summary: string; tokensUsed: number }> {
    const prompt = `Generate a short, elegant, one-sentence obituary summary describing why this memory contains outdated, expired, or irrelevant information and can be safely forgotten. Keep it human, precise, and around 10-15 words.
Original memory content: "${memoryContent}"`;

    const estimatedPromptTokens = Math.ceil(prompt.length / 4);

    if (!isQwenConfigured()) {
      const defaultObituaries = [
        `Faded trace: Simple conversation fragment with low active significance.`,
        `Archived: Content superseded by fresh task streams.`,
        `Let go: Conversational clutter with standard temporal decay.`,
        `Forgotten: Temporary node expired due to non-usage.`
      ];
      const summary = defaultObituaries[Math.abs(memoryContent.length) % defaultObituaries.length];
      return {
        summary,
        tokensUsed: estimatedPromptTokens + Math.ceil(summary.length / 4)
      };
    }

    const client = getQwenClient();
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "system", content: "You summarize outdated or forgotten logs. Write very short summaries like 'Goal accomplished, historical reference expired.'" },
            { role: "user", content: prompt }
          ],
          temperature: 0.8,
        });

        const summary = (response.choices[0]?.message?.content || "Historical relevance expired.")
          .trim()
          .replace(/^"|"/g, '');

        return {
          summary,
          tokensUsed: response.usage?.total_tokens || 0,
        };
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          console.error("Qwen Obituary generation failed, falling back to mock:", error);
          return {
            summary: `Local trace: Expired due to sustained inactivity.`,
            tokensUsed: estimatedPromptTokens + 20
          };
        }
        console.warn(`[Qwen] Obituary generation failed, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error("Failed to generate obituary");
  }

  /**
   * Analyze memory content for goal relevance and noise using Qwen-Max
   */
  public static async analyzeMemoryMetrics(
    memoryContent: string,
    userGoalDescription: string = "Focus on development, learning, technical tools, productivity and AI technology."
  ): Promise<{ goalRelevance: number; noiseScore: number; reason: string; tokensUsed: number }> {
    const prompt = `Analyze this memory and evaluate its Goal Relevance (0.0 to 1.0) relative to core interests: "${userGoalDescription}". Also evaluate its Noise Score (0.0 to 1.0; conversational trivia, redundant noise, or repetitive questions yield high noise scores).
Explain your reasoning briefly in 10 words.

Memory: "${memoryContent}"

Provide your output strictly in JSON according to this format:
{
  "goalRelevance": 0.85,
  "noiseScore": 0.1,
  "reason": "Directly references AI software stack structure."
}`;

    const estimatedPromptTokens = Math.ceil(prompt.length / 4);

    const fallbackResult = {
      goalRelevance: Math.max(0.2, Math.min(1.0, 0.5 + Math.sin(memoryContent.length) * 0.3)),
      noiseScore: Math.max(0.0, Math.min(0.9, 0.3 + Math.cos(memoryContent.length) * 0.25)),
      reason: "Standard interaction text analyzed locally by memory rules engine.",
      tokensUsed: estimatedPromptTokens + 40
    };

    if (!isQwenConfigured()) {
      return fallbackResult;
    }

    const client = getQwenClient();
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await client.chat.completions.create({
          model: this.model,
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        });

        const text = response.choices[0]?.message?.content || "{}";
        const data = JSON.parse(text);
        return {
          goalRelevance: typeof data.goalRelevance === 'number' ? data.goalRelevance : fallbackResult.goalRelevance,
          noiseScore: typeof data.noiseScore === 'number' ? data.noiseScore : fallbackResult.noiseScore,
          reason: data.reason || fallbackResult.reason,
          tokensUsed: response.usage?.total_tokens || 0,
        };
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          console.error("Qwen Memory metrics analysis failed, falling back to mock:", error);
          return fallbackResult;
        }
        console.warn(`[Qwen] Memory metrics analysis failed, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error("Failed to analyze memory metrics");
  }
}
