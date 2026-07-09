import { describe, it, expect } from "vitest";
import { EmbeddingService } from "../src/services/EmbeddingService.js";

describe("TID Scorer Math Verification", () => {
  it("should calculate exact cosine similarity for identical vectors", () => {
    const vecA = [1, 2, 3];
    const vecB = [1, 2, 3];
    const similarity = EmbeddingService.cosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(1.0);
  });

  it("should calculate perpendicular vectors as 0 similarity", () => {
    const vecA = [1, 0];
    const vecB = [0, 1];
    const similarity = EmbeddingService.cosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(0.0);
  });
});
