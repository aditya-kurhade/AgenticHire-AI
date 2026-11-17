const { RAGService, Retriever, Indexer } = require('../rag/ragService');
const Candidate = require('../models/Candidate');
const Policy = require('../models/Policy');

/**
 * @desc    Get all indexed hiring policies
 * @route   GET /api/rag/policies
 * @access  Private (Recruiter)
 */
const getPoliciesController = async (req, res) => {
  try {
    const { category, jobId } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (jobId && jobId !== 'all') filter.jobId = jobId;

    const policies = await Policy.find(filter).sort({ createdAt: -1 }).populate('jobId', 'title');
    return res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    console.error('getPoliciesController error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Upload & index a new hiring policy into Qdrant & MongoDB
 * @route   POST /api/rag/policies
 * @access  Private (Recruiter)
 */
const indexPolicyController = async (req, res) => {
  try {
    const { policyId, title, text, category, jobId } = req.body;

    if (!title || !text) {
      return res.status(400).json({
        success: false,
        error: 'Policy title and text are required'
      });
    }

    const documentId = policyId || title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) + '-' + Date.now().toString(36);
    const result = await RAGService.indexPolicy(documentId, text, {
      title,
      category: category || 'general',
      jobId: jobId || null,
      createdBy: req.user ? req.user.id : 'system'
    });

    // Upsert or save in MongoDB Policy collection
    const policyDoc = await Policy.findOneAndUpdate(
      { documentId },
      {
        documentId,
        title,
        text,
        category: category || 'general',
        jobId: jobId || null,
        indexedChunks: result.indexedChunks || 1,
        lastIndexedAt: new Date(),
        createdBy: req.user?.name || req.user?.email || 'recruiter'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: `Policy '${title}' successfully indexed into RAG vector database`,
      data: policyDoc
    });
  } catch (error) {
    console.error('indexPolicyController error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Delete a hiring policy from Qdrant vector database and MongoDB
 * @route   DELETE /api/rag/policies/:documentId
 * @access  Private (Recruiter)
 */
const deletePolicyController = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Document ID is required' });
    }

    // 1. Delete vectors from Qdrant policies collection
    await Indexer.deleteDocument('policies', documentId);

    // 2. Delete record from MongoDB
    await Policy.findOneAndDelete({ documentId });

    return res.status(200).json({
      success: true,
      message: `Policy '${documentId}' deleted successfully from vector index and database`
    });
  } catch (error) {
    console.error('deletePolicyController error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Update and automatically re-index a hiring policy
 * @route   PUT /api/rag/policies/:documentId
 * @access  Private (Recruiter)
 */
const updatePolicyController = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, text, category, jobId } = req.body;

    const policy = await Policy.findOne({ documentId });
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    if (title) policy.title = title.trim();
    if (text) policy.text = text.trim();
    if (category) policy.category = category;
    if (jobId !== undefined) policy.jobId = jobId || null;

    // 1. Delete previous chunks for this document in Qdrant
    await Indexer.deleteDocument('policies', documentId);

    // 2. Re-index new text & metadata into Qdrant
    const result = await RAGService.indexPolicy(policy.documentId, policy.text, {
      title: policy.title,
      category: policy.category,
      jobId: policy.jobId ? policy.jobId.toString() : null,
      createdBy: policy.createdBy || (req.user ? req.user.id : 'recruiter')
    });

    policy.indexedChunks = result.indexedChunks || 1;
    policy.lastIndexedAt = new Date();
    await policy.save();

    const populatedPolicy = await Policy.findById(policy._id).populate('jobId', 'title');

    return res.status(200).json({
      success: true,
      message: `Policy '${policy.title}' updated and re-indexed into Qdrant (${policy.indexedChunks} chunks).`,
      data: populatedPolicy
    });
  } catch (error) {
    console.error('updatePolicyController error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @desc    Re-index an existing policy in Qdrant
 * @route   POST /api/rag/policies/:documentId/reindex
 * @access  Private (Recruiter)
 */
const reindexPolicyController = async (req, res) => {
  try {
    const { documentId } = req.params;

    const policy = await Policy.findOne({ documentId });
    if (!policy) {
      return res.status(404).json({ success: false, error: 'Policy not found' });
    }

    // Re-index into Qdrant
    const result = await RAGService.indexPolicy(policy.documentId, policy.text, {
      title: policy.title,
      category: policy.category,
      jobId: policy.jobId ? policy.jobId.toString() : null,
      createdBy: policy.createdBy
    });

    policy.indexedChunks = result.indexedChunks || 1;
    policy.lastIndexedAt = new Date();
    await policy.save();

    return res.status(200).json({
      success: true,
      message: `Policy '${policy.title}' successfully re-indexed into Qdrant (${result.indexedChunks} chunks)`,
      data: policy
    });
  } catch (error) {
    console.error('reindexPolicyController error:', error);
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
  searchRagController,
  getPoliciesController,
  updatePolicyController,
  deletePolicyController,
  reindexPolicyController
};

