import { getQwenClient, isQwenConfigured } from "../lib/qwen.js";

export class EmbeddingService {
  private static model = process.env.QWEN_EMBEDDING_MODEL || "text-embedding-v3";

  // Memory-friendly mock embedding generator that provides deterministic numeric vectors (1536 dimensions)
  private static mockEmbedding(text: string): number[] {
    const size = 1536;
    const embedding = new Array(size).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < size; i++) {
      const seed = Math.sin(hash + i) * 10000;
      embedding[i] = seed - Math.floor(seed);
    }
    // Normalize vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (norm || 1));
  }

  /**
   * Generate vector embedding for the input text using Qwen text-embedding-v3
   */
  public static async generate(text: string): Promise<{ embedding: number[]; tokensUsed: number }> {
    if (!isQwenConfigured()) {
      return {
        embedding: this.mockEmbedding(text),
        tokensUsed: Math.ceil(text.length / 4)
      };
    }

    const client = getQwenClient();
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        const response = await client.embeddings.create({
          model: this.model,
          input: text,
          // text-embedding-v3 default output dimension is 1536
        });

        if (response.data && response.data[0] && response.data[0].embedding) {
          return {
            embedding: response.data[0].embedding,
            tokensUsed: response.usage?.total_tokens || 0,
          };
        }
        throw new Error("Invalid response structure from Qwen Embeddings API");
      } catch (error: any) {
        retries--;
        if (retries === 0) {
          console.error("Qwen Embedding generation failed, falling back to mock:", error);
          return {
            embedding: this.mockEmbedding(text),
            tokensUsed: Math.ceil(text.length / 4)
          };
        }
        console.warn(`[Qwen] Embedding failed, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
    throw new Error("Failed to generate embedding");
  }

  /**
   * Calculate similarity between two vectors using cosine similarity
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return normA && normB ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
  }
}
