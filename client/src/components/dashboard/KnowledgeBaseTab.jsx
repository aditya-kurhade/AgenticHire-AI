import { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatCard } from '../ui/StatCard';
import { EmptyState } from '../ui/EmptyState';
import api from '../../lib/api';

const KnowledgeBaseTab = ({ jobs = [], selectedJobId = 'all', setSelectedJobId }) => {
  const [activeSubTab, setActiveSubTab] = useState('search'); // 'search' | 'add'

  // Search state
  const [collection, setCollection] = useState('resumes');
  const [searchQuery, setSearchQuery] = useState('');
  const [minSimilarity, setMinSimilarity] = useState(0.45);
  const [topK, setTopK] = useState(5);
  const [activeJobId, setActiveJobId] = useState(selectedJobId || 'all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Add policy state
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyCategory, setPolicyCategory] = useState('engineering');
  const [policyJobId, setPolicyJobId] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Sync with parent selectedJobId if provided
  const handleJobChange = (jobId) => {
    setActiveJobId(jobId);
    if (setSelectedJobId) {
      setSelectedJobId(jobId);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    try {
      const payload = {
        collection,
        query: searchQuery.trim(),
        topK: Number(topK),
        minSimilarity: Number(minSimilarity)
      };

      // Only pass jobId filter when querying candidate resumes
      if (collection === 'resumes' && activeJobId && activeJobId !== 'all') {
        payload.jobId = activeJobId;
      }

      const res = await api.post('/rag/search', payload);
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.error('RAG Search Error:', err);
      setSearchError(err.response?.data?.error || 'Failed to perform semantic search');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    if (!policyTitle.trim() || !policyText.trim()) {
      setSubmitError('Title and policy guidelines text are required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      const res = await api.post('/rag/policies', {
        title: policyTitle.trim(),
        category: policyCategory,
        jobId: policyJobId || undefined,
        text: policyText.trim()
      });
      setSubmitSuccess(res.data.message || 'Policy successfully indexed into vector database!');
      setPolicyTitle('');
      setPolicyText('');
      setPolicyJobId('');
    } catch (err) {
      console.error('Policy Indexing Error:', err);
      setSubmitError(err.response?.data?.error || 'Failed to index policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ah-page space-y-6">
      <PageHeader
        title="RAG Knowledge Base & Vector Index"
        badge={
          <Badge tone="primary">
            <span className="material-symbols-outlined text-[14px]">neurology</span>
            Qdrant Cloud (384-d BGE)
          </Badge>
        }
        description="Index organizational hiring standards and query semantic vectors across company guidelines and resumes."
        actions={
          <div className="flex gap-2">
            <Button
              variant={activeSubTab === 'search' ? 'default' : 'outline'}
              onClick={() => setActiveSubTab('search')}
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Vector Search
            </Button>
            <Button
              variant={activeSubTab === 'add' ? 'default' : 'outline'}
              onClick={() => setActiveSubTab('add')}
            >
              <span className="material-symbols-outlined text-[18px]">post_add</span>
              Index New Policy
            </Button>
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Vector Collections"
          value="2 Active"
          badge="'resumes' & 'policies'"
          icon="folder_special"
          iconBg="bg-indigo-100 text-indigo-800"
        />
        <StatCard
          title="Vector Dimensions"
          value="384-d"
          badge="BAAI/bge-small-en-v1.5"
          icon="straighten"
          iconBg="bg-emerald-100 text-emerald-800"
        />
        <StatCard
          title="Search Metric"
          value="Cosine"
          badge="Normalized L2 Distance"
          icon="insights"
          iconBg="bg-amber-100 text-amber-800"
        />
      </div>

      {activeSubTab === 'search' && (
        <div className="space-y-6">
          {/* Search Box Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">manage_search</span>
              Semantic Vector Query Playground
            </h3>
            <p className="text-sm text-slate-500">
              Query the vector database using natural language. Concepts, synonyms, and context are automatically matched via dense embeddings.
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Collection</label>
                  <select
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="resumes">Resumes ('resumes' - Candidate Submissions)</option>
                    <option value="policies">Policies ('policies' - Organizational Standards)</option>
                  </select>
                </div>

                {collection === 'resumes' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-indigo-600">filter_alt</span>
                      Filter by Job Opening
                    </label>
                    <select
                      value={activeJobId}
                      onChange={(e) => handleJobChange(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="all">All Job Openings ({jobs.length})</option>
                      {jobs.map((job) => (
                        <option key={job._id} value={job._id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Scope</label>
                    <div className="w-full text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-100">
                      Global Company Policies
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Min Similarity ({Math.round(minSimilarity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="0.95"
                    step="0.05"
                    value={minSimilarity}
                    onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Top-K Results</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={topK}
                    onChange={(e) => setTopK(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={
                    collection === 'policies'
                      ? "e.g., 'What are the required qualifications for Frontend engineers?'"
                      : "e.g., 'Find candidates with hands-on Kubernetes and microservice experience'"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-4 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                  <span className="material-symbols-outlined text-[18px]">
                    {isSearching ? 'sync' : 'search'}
                  </span>
                  {isSearching ? 'Searching...' : 'Run Query'}
                </Button>
              </div>
            </form>

            {searchError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {searchError}
              </div>
            )}
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">
                Retrieved Chunks ({searchResults.length})
              </h4>
              {searchResults.length > 0 && (
                <span className="text-xs text-slate-500">Sorted by Cosine Distance Relevance</span>
              )}
            </div>

            {searchResults.length === 0 ? (
              <EmptyState
                icon="travel_explore"
                title="No vector results yet"
                description="Enter a query above to inspect chunks and similarity scores retrieved from the Qdrant vector database."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {searchResults.map((item, idx) => {
                  const scorePercent = Math.round((item.score || 0) * 100);
                  const isHighMatch = scorePercent >= 80;

                  return (
                    <div
                      key={item.id || idx}
                      className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                            Chunk #{item.payload?.chunkIndex !== undefined ? item.payload.chunkIndex : idx + 1}
                          </span>
                          {item.payload?.title && (
                            <span className="text-xs font-medium text-slate-800">
                              {item.payload.title}
                            </span>
                          )}
                          {item.payload?.category && (
                            <span className="text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.payload.category}
                            </span>
                          )}
                          {item.payload?.candidateName && (
                            <span className="text-xs font-semibold text-indigo-700">
                              Candidate: {item.payload.candidateName}
                            </span>
                          )}
                          {item.payload?.jobId && (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {jobs.find(j => j._id === item.payload.jobId)?.title || `Job: ${item.payload.jobId.slice(-6)}`}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHighMatch
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {scorePercent}% Similarity
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono whitespace-pre-wrap leading-relaxed">
                        {item.text}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400">
                        <span>Point ID: {item.id}</span>
                        {item.payload?.indexedAt && (
                          <span>Indexed: {new Date(item.payload.indexedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'add' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-3xl space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">note_add</span>
              Add Company Hiring Policy or Standard
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Documents are automatically split into overlapping chunks, vectorized via 384-d dense embeddings, and made instantly available to the AI Matching Agent.
            </p>
          </div>

          <form onSubmit={handleAddPolicy} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Policy Document Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Engineering Hiring Standards & Evaluation Rubric 2026"
                value={policyTitle}
                onChange={(e) => setPolicyTitle(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Associate with Job Opening (Optional)</label>
              <select
                value={policyJobId}
                onChange={(e) => setPolicyJobId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">General / All Roles (Global Guideline)</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={policyCategory}
                onChange={(e) => setPolicyCategory(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="engineering">Engineering & Technology</option>
                <option value="product">Product & Design</option>
                <option value="compliance">Legal, Compliance & Diversity</option>
                <option value="general">General Hiring Guidelines</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Policy Content / Markdown Guidelines *
              </label>
              <textarea
                required
                rows={8}
                placeholder="Paste internal company rubric, minimum educational requirements, tech stack constraints, or interview guidelines here..."
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
              />
            </div>

            {submitSuccess && (
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {submitError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPolicyTitle('');
                  setPolicyText('');
                  setSubmitError('');
                  setSubmitSuccess('');
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting || !policyTitle.trim() || !policyText.trim()}>
                <span className="material-symbols-outlined text-[18px]">
                  {isSubmitting ? 'sync' : 'cloud_upload'}
                </span>
                {isSubmitting ? 'Vectorizing...' : 'Save & Index Document'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseTab;

