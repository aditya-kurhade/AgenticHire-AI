import { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
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
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'React & TypeScript architecture',
  'Kubernetes & microservices',
  'Senior full-stack experience',
  'Engineering evaluation rubric'
];

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

  const handleJobChange = (jobId) => {
    setActiveJobId(jobId);
    if (setSelectedJobId) {
      setSelectedJobId(jobId);
    }
  };

  const handleSearch = async (e, overrideQuery) => {
    e?.preventDefault();
    const q = overrideQuery || searchQuery;
    if (!q.trim()) return;

    if (overrideQuery) {
      setSearchQuery(overrideQuery);
    }

    setIsSearching(true);
    setSearchError('');
    try {
      const payload = {
        collection,
        query: q.trim(),
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
      setSearchError(err.response?.data?.error || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPolicy = async (e) => {
    e.preventDefault();
    if (!policyTitle.trim() || !policyText.trim()) {
      setSubmitError('Title and content are required.');
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
      setSubmitSuccess(res.data.message || 'Policy indexed successfully.');
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
      {/* Sleek Header with Inline Segmented Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Base</h1>
            <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20 text-xs py-0.5">
              <BrainCircuit className="w-3.5 h-3.5" />
              Qdrant Cloud • 384-d
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Semantic vector search across candidate resumes and organizational standards.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-secondary/80 rounded-lg border border-border shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'search'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Vector Search
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('add')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'add'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Index Policy
          </button>
        </div>
      </div>

      {activeSubTab === 'search' ? (
        /* Modern 2-Column Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Filter & Search Parameters Rail */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-primary" />
                  Search Parameters
                </span>
                <span className="text-[10px] text-muted-foreground">Cosine L2</span>
              </div>

              {/* Target Collection Segmented Toggle */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Target Collection</label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-secondary/60 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setCollection('resumes')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all text-center ${
                      collection === 'resumes'
                        ? 'bg-card text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Resumes
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollection('policies')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all text-center ${
                      collection === 'policies'
                        ? 'bg-card text-foreground shadow-xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Policies
                  </button>
                </div>
              </div>

              {/* Filter by Opening */}
              {collection === 'resumes' && (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Role Opening</label>
                  <Select
                    size="sm"
                    value={activeJobId}
                    onChange={(e) => handleJobChange(e.target.value)}
                  >
                    <option value="all">All Roles ({jobs.length})</option>
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Similarity Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Min Similarity</label>
                  <span className="text-xs font-bold text-primary tabular-nums bg-primary/10 px-2 py-0.5 rounded">
                    {Math.round(minSimilarity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.95"
                  step="0.05"
                  value={minSimilarity}
                  onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer h-1.5 mt-1"
                />
              </div>

              {/* Top K */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Result Limit</label>
                <Select
                  size="sm"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                >
                  <option value="3">Top 3 matches</option>
                  <option value="5">Top 5 matches</option>
                  <option value="8">Top 8 matches</option>
                  <option value="10">Top 10 matches</option>
                </Select>
              </div>
            </div>

            {/* Compact Vector Engine Stats */}
            <div className="bg-secondary/40 border border-border rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Collections</span>
                <span className="font-semibold text-foreground">2 Active</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Embedding Model</span>
                <span className="font-mono text-foreground text-[11px]">bge-small-en</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Vector Dimension</span>
                <span className="font-semibold text-foreground">384-d</span>
              </div>
            </div>
          </aside>

          {/* Right Column: Command Search Bar & Results Stream */}
          <main className="lg:col-span-8 space-y-4">
            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="bg-card border border-border rounded-xl p-3 shadow-xs space-y-2.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search candidate skills, tech stacks, or policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border border-input rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <Button type="submit" loading={isSearching} disabled={!searchQuery.trim()} className="px-5 shrink-0">
                  Search
                </Button>
              </div>

              {/* Instant Query Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-muted-foreground">
                <span className="text-muted-foreground/80 font-medium">Try:</span>
                {SUGGESTED_QUERIES.map((sq, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={(e) => handleSearch(e, sq)}
                    className="px-2 py-0.5 rounded-md bg-secondary hover:bg-accent text-foreground transition-colors hover:text-primary border border-border/50 text-[11px]"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </form>

            {searchError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {searchError}
              </div>
            )}

            {/* Results Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Matches ({searchResults.length})
                </span>
                {searchResults.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">Sorted by cosine score</span>
                )}
              </div>

              {searchResults.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No vector results yet"
                  description="Type a search query above or click a suggestion to inspect vector compatibility."
                  className="py-12"
                />
              ) : (
                <div className="space-y-2.5">
                  {searchResults.map((item, idx) => {
                    const scorePercent = Math.round((item.score || 0) * 100);
                    const isHighMatch = scorePercent >= 80;

                    return (
                      <div
                        key={item.id || idx}
                        className="border border-border bg-card rounded-xl p-4 shadow-xs hover:border-primary/40 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-semibold text-foreground">
                              {item.payload?.title || item.payload?.candidateName || `Result #${idx + 1}`}
                            </span>
                            {item.payload?.category && (
                              <Badge variant="secondary" className="text-[10px]">
                                {item.payload.category}
                              </Badge>
                            )}
                            {item.payload?.jobId && (
                              <span className="text-[11px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                                {jobs.find(j => j._id === item.payload.jobId)?.title || 'Assigned Job'}
                              </span>
                            )}
                          </div>

                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md tabular-nums ${
                              isHighMatch
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}
                          >
                            {scorePercent}% match
                          </span>
                        </div>

                        <p className="text-xs text-foreground/90 bg-secondary/30 p-3 rounded-lg border border-border/50 leading-relaxed font-mono whitespace-pre-wrap">
                          {item.text}
                        </p>

                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
                          <span>Point: {item.id?.toString().slice(0, 8)}...</span>
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
          </main>
        </div>
      ) : (
        /* Add Policy Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm pb-2 border-b border-border/60">
              <UploadCloud className="w-4 h-4 text-primary" />
              Guidelines
            </div>
            <p className="leading-relaxed">
              When you add a policy, the text is split into semantic chunks and embedded as 384-dimensional dense vectors in Qdrant.
            </p>
            <p className="leading-relaxed">
              The AI Matching Agent references these policies during automated applicant screening to verify compliance and minimum qualifications.
            </p>
          </aside>

          <main className="lg:col-span-8 bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Add Hiring Policy</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define organizational criteria, interview rubrics, or role prerequisites.
              </p>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  Policy Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Engineering Evaluation Rubric 2026"
                  value={policyTitle}
                  onChange={(e) => setPolicyTitle(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Associate with Opening</label>
                  <Select
                    value={policyJobId}
                    onChange={(e) => setPolicyJobId(e.target.value)}
                  >
                    <option value="">All Openings (Global Standard)</option>
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Category</label>
                  <Select
                    value={policyCategory}
                    onChange={(e) => setPolicyCategory(e.target.value)}
                  >
                    <option value="engineering">Engineering</option>
                    <option value="product">Product & Design</option>
                    <option value="compliance">Compliance & Legal</option>
                    <option value="general">General Hiring</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  Policy Content / Rubric Text *
                </label>
                <textarea
                  required
                  rows={7}
                  placeholder="Paste internal evaluation criteria, required competencies, or interview rubrics..."
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed resize-none"
                />
              </div>

              {submitSuccess && (
                <div className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {submitSuccess}
                </div>
              )}

              {submitError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPolicyTitle('');
                    setPolicyText('');
                    setSubmitError('');
                    setSubmitSuccess('');
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" size="sm" loading={isSubmitting} disabled={!policyTitle.trim() || !policyText.trim()}>
                  Save & Index
                </Button>
              </div>
            </form>
          </main>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseTab;