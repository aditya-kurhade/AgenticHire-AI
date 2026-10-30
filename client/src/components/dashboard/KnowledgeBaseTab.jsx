import { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { StatCard } from '../ui/StatCard';
import { EmptyState } from '../ui/EmptyState';
import api from '../../lib/api';
import {
  BrainCircuit,
  Search,
  PlusCircle,
  Layers,
  Ruler,
  Sliders,
  Filter,
  UploadCloud,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';

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
    <div className="space-y-6">
      <PageHeader
        title="RAG Knowledge Base & Vector Index"
        badge={
          <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20">
            <BrainCircuit className="w-3.5 h-3.5" />
            Qdrant Cloud (384-d BGE)
          </Badge>
        }
        description="Index organizational hiring standards and query semantic vectors across company guidelines and resumes."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeSubTab === 'search' ? 'default' : 'outline'}
              onClick={() => setActiveSubTab('search')}
              className="flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Vector Search
            </Button>
            <Button
              variant={activeSubTab === 'add' ? 'default' : 'outline'}
              onClick={() => setActiveSubTab('add')}
              className="flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Index Policy
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
          icon={Layers}
          iconBg="bg-primary/10 text-primary"
        />
        <StatCard
          title="Vector Dimensions"
          value="384-d"
          badge="BAAI/bge-small-en-v1.5"
          icon={Ruler}
          iconBg="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          title="Search Metric"
          value="Cosine"
          badge="Normalized Similarity"
          icon={Sliders}
          iconBg="bg-blue-500/10 text-blue-600"
        />
      </div>

      {activeSubTab === 'search' && (
        <div className="space-y-6">
          {/* Search Box Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Semantic Vector Query Playground
            </h3>
            <p className="text-sm text-muted-foreground">
              Query the vector database using natural language. Concepts, synonyms, and context are automatically matched via dense embeddings.
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Target Collection</label>
                  <Select
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                  >
                    <option value="resumes">Resumes (Candidate Submissions)</option>
                    <option value="policies">Policies (Organizational Standards)</option>
                  </Select>
                </div>

                {collection === 'resumes' ? (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-primary" />
                      Filter by Opening
                    </label>
                    <Select
                      value={activeJobId}
                      onChange={(e) => handleJobChange(e.target.value)}
                    >
                      <option value="all">All Job Openings ({jobs.length})</option>
                      {jobs.map((job) => (
                        <option key={job._id} value={job._id}>
                          {job.title}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Scope</label>
                    <div className="w-full text-xs text-muted-foreground border border-input rounded-lg px-3 py-2.5 bg-secondary/40 font-medium">
                      Global Company Policies
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min Similarity</label>
                    <span className="text-xs font-bold text-primary tabular-nums">{Math.round(minSimilarity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.95"
                    step="0.05"
                    value={minSimilarity}
                    onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Top-K Results</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={topK}
                    onChange={(e) => setTopK(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder={
                    collection === 'policies'
                      ? "e.g., 'What are the required qualifications for Frontend engineers?'"
                      : "e.g., 'Find candidates with hands-on Kubernetes and microservice experience'"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-background border border-input rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button type="submit" loading={isSearching} disabled={!searchQuery.trim()} className="flex items-center gap-1.5">
                  <Search className="w-4 h-4" />
                  {isSearching ? 'Searching...' : 'Run Query'}
                </Button>
              </div>
            </form>

            {searchError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {searchError}
              </div>
            )}
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Retrieved Chunks ({searchResults.length})
              </h4>
              {searchResults.length > 0 && (
                <span className="text-xs text-muted-foreground">Sorted by Cosine Distance Relevance</span>
              )}
            </div>

            {searchResults.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No vector results yet"
                description="Enter a query above to inspect chunks and similarity scores retrieved from the vector database."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {searchResults.map((item, idx) => {
                  const scorePercent = Math.round((item.score || 0) * 100);
                  const isHighMatch = scorePercent >= 80;

                  return (
                    <div
                      key={item.id || idx}
                      className="border border-border bg-card rounded-xl p-4 shadow-xs hover:border-primary/50 transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-secondary text-foreground">
                            Chunk #{item.payload?.chunkIndex !== undefined ? item.payload.chunkIndex : idx + 1}
                          </span>
                          {item.payload?.title && (
                            <span className="text-xs font-medium text-foreground">
                              {item.payload.title}
                            </span>
                          )}
                          {item.payload?.category && (
                            <span className="text-[11px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded border border-border">
                              {item.payload.category}
                            </span>
                          )}
                          {item.payload?.candidateName && (
                            <span className="text-xs font-semibold text-primary">
                              Candidate: {item.payload.candidateName}
                            </span>
                          )}
                          {item.payload?.jobId && (
                            <span className="text-[11px] font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {jobs.find(j => j._id === item.payload.jobId)?.title || `Job: ${item.payload.jobId.slice(-6)}`}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md tabular-nums ${isHighMatch
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}
                        >
                          {scorePercent}% Similarity
                        </span>
                      </div>

                      <p className="text-xs text-foreground bg-secondary/40 p-3 rounded-lg border border-border/60 font-mono whitespace-pre-wrap leading-relaxed">
                        {item.text}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
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
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs max-w-3xl space-y-5">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" />
              Add Company Hiring Policy or Standard
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Documents are automatically split into overlapping chunks, vectorized via 384-d dense embeddings, and made instantly available to the AI Matching Agent.
            </p>
          </div>

          <form onSubmit={handleAddPolicy} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Policy Document Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Engineering Hiring Standards & Evaluation Rubric 2026"
                value={policyTitle}
                onChange={(e) => setPolicyTitle(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Associate with Job Opening (Optional)</label>
              <Select
                value={policyJobId}
                onChange={(e) => setPolicyJobId(e.target.value)}
              >
                <option value="">General / All Roles (Global Guideline)</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
              <Select
                value={policyCategory}
                onChange={(e) => setPolicyCategory(e.target.value)}
              >
                <option value="engineering">Engineering & Technology</option>
                <option value="product">Product & Design</option>
                <option value="compliance">Legal, Compliance & Diversity</option>
                <option value="general">General Hiring Guidelines</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Policy Content / Markdown Guidelines *
              </label>
              <textarea
                required
                rows={8}
                placeholder="Paste internal company rubric, minimum educational requirements, tech stack constraints, or interview guidelines here..."
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed font-mono"
              />
            </div>

            {submitSuccess && (
              <div className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
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
              <Button type="submit" loading={isSubmitting} disabled={!policyTitle.trim() || !policyText.trim()} className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4" />
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