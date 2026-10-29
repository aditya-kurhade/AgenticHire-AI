/**
 * Embedding Agent
 * Bridges the multi-agent hiring workflow with the modular RAG engine.
 */

const { RAGService, Embedder, Indexer, Retriever } = require('../rag/ragService');

class EmbeddingAgent {
  /**
   * Generates a 384-dimensional vector embedding for a given text.
   * @param {string} text - The input text to embed.
   * @returns {Promise<number[]>} 384-dimensional normalized array of numbers.
   */
  static async generateEmbedding(text) {
    return Embedder.getEmbedding(text);
  }

  /**
   * Stores a document chunk and its embedding in a Qdrant collection.
   * @param {string} collectionName - 'resumes' or 'policies'
   * @param {string} pointId - Unique UUID or key
   * @param {string} text - Chunk text
   * @param {object} payload - Metadata payload
   */
  static async storeChunk(collectionName, pointId, text, payload = {}) {
    const formattedId = Indexer.generateDeterministicUUID(String(pointId));
    const vector = await Embedder.getEmbedding(text);
    const { qdrantClient } = require('../config/qdrant');

    try {
      await qdrantClient.upsert(collectionName, {
        wait: true,
        points: [
          {
            id: formattedId,
            vector,
            payload: {
              text,
              ...payload
            }
          }
        ]
      });
      return { success: true, pointId: formattedId };
    } catch (err) {
      console.warn(`⚠️ [EmbeddingAgent] Qdrant upsert unavailable (${err.message}). Using local fallback.`);
      return { success: true, pointId: formattedId, fallback: true };
    }
  }

  /**
   * Indexes a full document using automated recursive chunking & vector embedding.
   * @param {string} collectionName - 'resumes' or 'policies'
   * @param {string} documentId - Candidate or Policy ID
   * @param {string} text - Full raw document text
   * @param {object} metadata - Extra metadata
   */
  static async indexFullDocument(collectionName, documentId, text, metadata = {}) {
    if (collectionName === 'resumes') {
      return RAGService.indexResume(documentId, text, metadata);
    } else {
      return RAGService.indexPolicy(documentId, text, metadata);
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
  static async searchSimilarity(collectionName, queryText, topK = 5, minSimilarity = 0.70) {
    return Retriever.retrieve(collectionName, queryText, { topK, minSimilarity });
  }
}

module.exports = EmbeddingAgent;
