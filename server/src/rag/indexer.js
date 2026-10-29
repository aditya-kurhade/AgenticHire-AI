/**
 * Qdrant Vector Indexer for RAG
 * Handles batching, UUID generation, collection upserts, and cleanup.
 */

const crypto = require('crypto');
const { qdrantClient } = require('../config/qdrant');
const Embedder = require('./embedder');
const Chunker = require('./chunker');

// In-memory fallback vector store for when Qdrant Cloud has connection/network issues
const inMemoryStore = {
  resumes: [],
  policies: []
};

class Indexer {
  static getInMemoryStore() {
    return inMemoryStore;
  }
  /**
   * Generates a valid UUIDv4-like string from text or seed to satisfy Qdrant point ID requirements.
   * @param {string} seed
   * @returns {string} valid UUID string
   */
  static generateDeterministicUUID(seed) {
    const hash = crypto.createHash('md5').update(seed).digest('hex');
    // Format hash into 8-4-4-4-12 UUID format
    return [
      hash.substring(0, 8),
      hash.substring(8, 12),
      '4' + hash.substring(13, 16),
      ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
      hash.substring(20, 32)
    ].join('-');
  }

  /**
   * Indexes a document (such as a parsed resume or hiring policy) into a specified collection.
   * @param {string} collectionName - 'resumes' | 'policies'
   * @param {string} documentId - Candidate ID, Job ID, or Policy Name
   * @param {string} fullText - Complete document text to chunk and index
   * @param {object} metadata - Common metadata attached to every chunk
   * @returns {Promise<{ indexedChunks: number, points: string[] }>}
   */
  static async indexDocument(collectionName, documentId, fullText, metadata = {}) {
    if (!fullText || typeof fullText !== 'string') {
      return { indexedChunks: 0, points: [] };
    }

    const chunkSize = collectionName === 'policies' ? 1000 : 500;
    const chunks = Chunker.splitText(fullText, { chunkSize });

    if (chunks.length === 0) {
      return { indexedChunks: 0, points: [] };
    }

    console.log(`📑 [RAG Indexer] Indexing document '${documentId}' into '${collectionName}' (${chunks.length} chunks)...`);

    const points = [];
    for (const chunk of chunks) {
      const pointId = this.generateDeterministicUUID(`${collectionName}_${documentId}_${chunk.chunkIndex}`);
      const vector = await Embedder.getEmbedding(chunk.text);

      points.push({
        id: pointId,
        vector: vector,
        payload: {
          documentId: String(documentId),
          chunkIndex: chunk.chunkIndex,
          totalChunks: chunks.length,
          text: chunk.text,
          indexedAt: new Date().toISOString(),
          ...metadata
        }
      });
    }

    // Save into local memory cache as well so searches always work even if Qdrant Cloud times out
    if (!inMemoryStore[collectionName]) inMemoryStore[collectionName] = [];
    // Remove old points for this documentId
    inMemoryStore[collectionName] = inMemoryStore[collectionName].filter(
      p => String(p.payload?.documentId) !== String(documentId)
    );
    inMemoryStore[collectionName].push(...points);

    // Upsert points in batches to Qdrant with graceful offline/network fallback
    try {
      await qdrantClient.upsert(collectionName, {
        wait: true,
        points
      });
      console.log(`✅ [RAG Indexer] Successfully indexed ${points.length} chunks into '${collectionName}'.`);
      return {
        indexedChunks: points.length,
        points: points.map(p => p.id)
      };
    } catch (error) {
      console.warn(`⚠️ [RAG Indexer] Qdrant Cloud unreachable or offline (${error.message}). Continuing with local memory indexing.`);
      return {
        indexedChunks: points.length,
        points: points.map(p => p.id),
        offlineFallback: true
      };
    }
  }

  /**
   * Deletes all points belonging to a specific document ID.
   * @param {string} collectionName
   * @param {string} documentId
   */
  static async deleteDocument(collectionName, documentId) {
    try {
      await qdrantClient.delete(collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: 'documentId',
              match: {
                value: String(documentId)
              }
            }
          ]
        }
      });
      console.log(`🗑️ [RAG Indexer] Deleted all vectors for document '${documentId}' from '${collectionName}'.`);
      return { success: true };
    } catch (error) {
      console.error(`[RAG Indexer] Error deleting document ${documentId}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Indexer;

