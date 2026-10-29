/**
 * Vector Search and Context Retrieval for RAG Pipeline
 * Queries Qdrant with semantic vectors, applies score thresholds, and structures context.
 */

const { qdrantClient } = require('../config/qdrant');
const Embedder = require('./embedder');
const Indexer = require('./indexer');
const specLoader = require('../utils/specLoader');

// Cosine similarity between two vectors
function computeCosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class Retriever {
  /**
   * Retrieves context chunks from a Qdrant collection matching the query.
   * @param {string} collectionName - 'resumes' | 'policies'
   * @param {string} queryText - Search prompt or criteria
   * @param {object} options - { topK, minSimilarity, filter }
   * @returns {Promise<Array<{ text: string, score: number, payload: object }>>}
   */
  static async retrieve(collectionName, queryText, options = {}) {
    if (!queryText || typeof queryText !== 'string') {
      return [];
    }

    let ragSettings = {};
    try {
      ragSettings = specLoader.loadRagSettings();
    } catch {
      ragSettings = {};
    }

    const topK = options.topK || ragSettings.search?.top_k || 5;
    const minSimilarity = options.minSimilarity !== undefined 
      ? options.minSimilarity 
      : (ragSettings.search?.min_similarity || 0.65);

    try {
      const queryVector = await Embedder.getEmbedding(queryText);

      const searchParams = {
        vector: queryVector,
        limit: topK,
        with_payload: true,
        score_threshold: minSimilarity
      };

      if (options.filter) {
        searchParams.filter = options.filter;
      }

      console.log(`🔍 [RAG Retriever] Querying '${collectionName}' with Top-K=${topK}, Min-Similarity=${minSimilarity}...`);
      const searchResults = await qdrantClient.search(collectionName, searchParams);

      const formatted = searchResults.map(item => ({
        id: item.id,
        score: item.score,
        text: item.payload?.text || '',
        payload: item.payload || {}
      }));

      console.log(`📥 [RAG Retriever] Found ${formatted.length} relevant chunks in '${collectionName}'.`);
      return formatted;
    } catch (error) {
      console.warn(`[RAG Retriever] Qdrant search unavailable (${error.message}). Performing local vector fallback search...`);
      // Local vector memory search fallback
      const inMemory = Indexer.getInMemoryStore?.() || { resumes: [], policies: [] };
      const pool = inMemory[collectionName] || [];

      let filteredPool = pool;
      if (options.filter?.must) {
        for (const f of options.filter.must) {
          if (f.key && f.match?.value !== undefined) {
            filteredPool = filteredPool.filter(item => String(item.payload?.[f.key]) === String(f.match.value));
          }
        }
      }

      const queryVector = await Embedder.getEmbedding(queryText);
      const scored = filteredPool.map(item => {
        const score = computeCosineSimilarity(queryVector, item.vector);
        return {
          id: item.id,
          score,
          text: item.payload?.text || '',
          payload: item.payload || {}
        };
      })
      .sort((a, b) => b.score - a.score);

      // Filter by minSimilarity or take top matches if strict threshold discards all
      let finalResults = scored.filter(item => item.score >= minSimilarity);
      if (finalResults.length === 0 && scored.length > 0) {
        finalResults = scored.slice(0, Math.min(topK, 3));
      } else {
        finalResults = finalResults.slice(0, topK);
      }

      console.log(`📥 [RAG Retriever Fallback] Found ${finalResults.length} matches from local vector store.`);
      return finalResults;
    }
  }

  /**
   * Retrieves policies relevant to a job role or criteria.
   * @param {string} jobTitleOrDescription
   * @param {number} topK
   * @returns {Promise<string>} Clean formatted context string with document citations
   */
  static async getPolicyContext(jobTitleOrDescription, topK = 3) {
    const query = `${jobTitleOrDescription} hiring policy rules requirements criteria`;
    const results = await this.retrieve('policies', query, { topK });

    if (!results || results.length === 0) {
      return '';
    }

    return results
      .map((item, idx) => `[Policy Document ${idx + 1} (Score: ${Math.round(item.score * 100)}%)]:\n${item.text}`)
      .join('\n\n');
  }

  /**
   * Retrieves relevant resume chunks for a specific candidate.
   * @param {string} candidateId
   * @param {string} queryCriteria
   * @param {number} topK
   */
  static async getCandidateResumeContext(candidateId, queryCriteria, topK = 4) {
    const filter = {
      must: [
        {
          key: 'documentId',
          match: { value: String(candidateId) }
        }
      ]
    };

    const results = await this.retrieve('resumes', queryCriteria, { topK, filter });
    return results.map(item => item.text).join('\n\n');
  }
}

module.exports = Retriever;

