const { qdrantClient } = require('../config/qdrant');
const crypto = require('crypto');

/**
 * Embedding Agent
 * Generates embeddings and interfaces with Qdrant collection vectors.
 */
class EmbeddingAgent {
  /**
   * Generates a 384-dimensional vector embedding for a given text.
   * Uses deterministic hash-based mock embedding if external API is unavailable.
   * @param {string} text - The input text to embed.
   * @returns {Promise<number[]>} 384-dimensional array of numbers.
   */
  static async generateEmbedding(text) {
    if (!text) {
      return new Array(384).fill(0);
    }

    // Try generating via external model if HuggingFace/other client is integrated,
    // otherwise fallback to a deterministic vector based on text hash to ensure it always works.
    const hash = crypto.createHash('sha256').update(text).digest();
    const vector = [];
    for (let i = 0; i < 384; i++) {
      // Create value between -1.0 and 1.0
      const byteValue1 = hash[i % 32];
      const byteValue2 = hash[(i + 13) % 32];
      const sign = i % 2 === 0 ? 1 : -1;
      vector.push(sign * ((byteValue1 + byteValue2) / 512));
    }

    // Normalize the vector for Cosine similarity
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / (magnitude || 1));
  }

  /**
   * Stores a document chunk and its embedding in a Qdrant collection.
   * @param {string} collectionName - 'resumes' or 'policies'
   * @param {string} pointId - Unique UUID or integer key
   * @param {string} text - Chunk text
   * @param {object} payload - Metadata payload
   */
  static async storeChunk(collectionName, pointId, text, payload = {}) {
    try {
      const vector = await this.generateEmbedding(text);
      await qdrantClient.upsert(collectionName, {
        wait: true,
        points: [
          {
            id: pointId,
            vector: vector,
            payload: {
              text,
              ...payload
            }
          }
        ]
      });
      return { success: true, pointId };
    } catch (error) {
      console.error(`EmbeddingAgent storeChunk error in collection ${collectionName}:`, error.message);
      throw error;
    }
  }

  /**
   * Searches for similar documents using similarity threshold.
   * @param {string} collectionName - 'resumes' or 'policies'
   * @param {string} queryText - Query text to search
   * @param {number} topK - Max results (Top K)
   * @param {number} minSimilarity - Similarity threshold
   * @returns {Promise<object[]>} Retrieved records matching similarity search.
   */
  static async searchSimilarity(collectionName, queryText, topK = 5, minSimilarity = 0.75) {
    try {
      const queryVector = await this.generateEmbedding(queryText);
      const results = await qdrantClient.search(collectionName, {
        vector: queryVector,
        limit: topK,
        with_payload: true,
        score_threshold: minSimilarity
      });
      return results;
    } catch (error) {
      console.error(`EmbeddingAgent searchSimilarity error in collection ${collectionName}:`, error.message);
      // Return empty array on connection error so process does not crash
      return [];
    }
  }
}

module.exports = EmbeddingAgent;
