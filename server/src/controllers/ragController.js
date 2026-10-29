const { RAGService, Retriever, Indexer } = require('../rag/ragService');
const Candidate = require('../models/Candidate');

/**
 * @desc    Upload & index a new hiring policy into Qdrant
 * @route   POST /api/rag/policies
 * @access  Private (Recruiter)
 */
const indexPolicyController = async (req, res) => {
  try {
    const { policyId, title, text, category } = req.body;

    if (!title || !text) {
      return res.status(400).json({
        success: false,
        error: 'Policy title and text are required'
      });
    }

    const documentId = policyId || title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const result = await RAGService.indexPolicy(documentId, text, {
      title,
      category: category || 'general',
      createdBy: req.user ? req.user.id : 'system'
    });

    return res.status(201).json({
      success: true,
      message: `Policy '${title}' successfully indexed into RAG vector database`,
      data: result
    });
  } catch (error) {
    console.error('indexPolicyController error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Test RAG semantic vector search on policies or resumes
 * @route   POST /api/rag/search
 * @access  Private (Recruiter)
 */
const searchRagController = async (req, res) => {
  try {
    const { collection = 'policies', query, topK = 5, minSimilarity = 0.65, jobId } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query text is required' });
    }

    // Build Qdrant metadata filter if jobId is specified
    let filter = undefined;
    if (jobId && jobId !== 'all') {
      filter = {
        must: [
          {
            key: 'jobId',
            match: { value: String(jobId) }
          }
        ]
      };
    }

    // Ensure local in-memory store has candidates from MongoDB if store is empty
    if (collection === 'resumes') {
      const inMemory = Indexer.getInMemoryStore();
      if (!inMemory.resumes || inMemory.resumes.length === 0) {
        console.log('🔄 [RAG Pre-warm] In-memory store empty. Loading candidates from MongoDB...');
        const candidates = await Candidate.find({}).limit(50);
        for (const candidate of candidates) {
          const parsed = candidate.parsed_resume_json || {};
          const text = [
            `Candidate Name: ${candidate.name || ''}`,
            `Skills: ${(parsed.skills || candidate.matched_skills || []).join(', ')}`,
            `Experience: ${parsed.experience || candidate.match_score || 0} years`,
            `Education: ${parsed.education || ''}`,
            `Summary: ${parsed.summary || ''}`
          ].join('\n');

          await Indexer.indexDocument('resumes', candidate._id.toString(), text, {
            candidateId: candidate._id.toString(),
            jobId: candidate.job_id ? candidate.job_id.toString() : '',
            candidateName: candidate.name,
            email: candidate.email
          }).catch(() => {});
        }
      }
    }

    let results = await Retriever.retrieve(collection, query, {
      topK: Number(topK),
      minSimilarity: Number(minSimilarity),
      filter
    });

    // If 0 results were found in vector DB (e.g. resumes were parsed before RAG or Qdrant was empty),
    // automatically sync existing candidates from MongoDB so the query produces real results.
    if (results.length === 0 && collection === 'resumes') {
      const candidateQuery = jobId && jobId !== 'all' ? { job_id: jobId } : {};
      const candidates = await Candidate.find(candidateQuery).limit(10);
      console.log(`🔄 [RAG Sync] Found ${candidates.length} candidates in MongoDB matching filter for on-the-fly indexing.`);

      if (candidates.length > 0) {
        // Index them on the fly into RAG
        for (const candidate of candidates) {
          const parsed = candidate.parsed_resume_json || {};
          const text = [
            `Candidate Name: ${candidate.name}`,
            `Skills: ${(parsed.skills || candidate.matched_skills || []).join(', ')}`,
            `Experience: ${parsed.experience || 0} years`,
            `Education: ${parsed.education || ''}`,
            `Summary: ${parsed.summary || ''}`
          ].join('\n');

          await Indexer.indexDocument('resumes', candidate._id.toString(), text, {
            candidateId: candidate._id.toString(),
            jobId: candidate.job_id ? candidate.job_id.toString() : '',
            candidateName: candidate.name,
            email: candidate.email
          }).catch((err) => {
            console.warn(`[RAG Sync Error] ${err.message}`);
          });
        }

        // Retry retrieval with more permissive minimum similarity threshold
        const relaxedThreshold = Math.min(Number(minSimilarity), 0.40);
        results = await Retriever.retrieve(collection, query, {
          topK: Number(topK),
          minSimilarity: relaxedThreshold,
          filter
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('searchRagController error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  indexPolicyController,
  searchRagController
};

