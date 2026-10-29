/**
 * Central RAG Service
 * Orchestrates Document Chunking, Embedding Generation, Indexing, and Context Retrieval.
 */

const Chunker = require('./chunker');
const Embedder = require('./embedder');
const Indexer = require('./indexer');
const Retriever = require('./retriever');

class RAGService {
  /**
   * Indexes candidate resume text into Qdrant vector database.
   * @param {string} candidateId - Candidate MongoDB ObjectId
   * @param {string} resumeText - Full extracted plain text of resume
   * @param {object} metadata - Extra details (jobId, candidateName, email)
   */
  static async indexResume(candidateId, resumeText, metadata = {}) {
    return Indexer.indexDocument('resumes', candidateId, resumeText, {
      type: 'resume',
      ...metadata
    });
  }

  /**
   * Indexes a company hiring policy or compliance guideline into Qdrant.
   * @param {string} policyId - Unique policy ID or slug (e.g. 'frontend-dev-policy')
   * @param {string} policyText - Full text of policy
   * @param {object} metadata - Details (category, title, author)
   */
  static async indexPolicy(policyId, policyText, metadata = {}) {
    return Indexer.indexDocument('policies', policyId, policyText, {
      type: 'policy',
      ...metadata
    });
  }

  /**
   * Retrieves context for LLM generation with grounding and citations.
   * @param {string} collectionName - 'policies' | 'resumes'
   * @param {string} query - Natural language search query
   * @param {object} options - { topK, minSimilarity, filter }
   */
  static async queryContext(collectionName, query, options = {}) {
    return Retriever.retrieve(collectionName, query, options);
  }

  /**
   * Formats RAG retrieved documents into a clean prompt section for LLMs.
   * @param {Array<{ text: string, score: number, payload: object }>} chunks
   * @param {string} headerTitle
   * @returns {string} Formatted context block
   */
  static formatContextForPrompt(chunks, headerTitle = 'RELEVANT CONTEXT GUIDELINES') {
    if (!chunks || chunks.length === 0) {
      return '';
    }

    const formattedItems = chunks
      .map((c, i) => `--- CONTEXT ITEM [${i + 1}] (Relevance: ${(c.score * 100).toFixed(1)}%) ---\n${c.text}`)
      .join('\n\n');

    return `\n\n### ${headerTitle} ###\n${formattedItems}\n### END OF CONTEXT ###\n`;
  }
}

module.exports = {
  RAGService,
  Chunker,
  Embedder,
  Indexer,
  Retriever
};

