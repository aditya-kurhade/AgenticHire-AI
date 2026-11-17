import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { StatCard } from '../ui/StatCard';
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
  ArrowRight,
  Trash2,
  RefreshCw,
  FolderGit2,
  Calendar,
  BookOpen,
  Edit3,
  X,
  Code2,
  ShieldCheck,
  Compass,
  FileCode,
  Zap,
  Tag,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'React & TypeScript architecture',
  'Kubernetes & microservices',
  'Senior full-stack experience',
  'Engineering evaluation rubric'
];

const TEMPLATES = [
  {
    title: 'Senior Full Stack Rubric',
    category: 'engineering',
    text: `Evaluation Criteria for Senior Full Stack Engineer:
1. Technical Competency:
   - Deep knowledge of modern frontend frameworks (React, Next.js or Vue) and state management.
   - Robust Node.js/TypeScript backend architecture with scalable REST/GraphQL APIs.
   - Production experience with Docker, CI/CD pipelines, and cloud services (AWS/GCP).
2. Code Quality & Systems Thinking:
   - Writing clean, modular, self-documenting code with unit and integration tests.
   - Experience designing scalable distributed architectures and microservices.
3. Leadership & Autonomy:
   - Ability to mentor junior engineers and conduct constructive code reviews.`
  },
  {
    title: 'Product Design & UX Criteria',
    category: 'product',
    text: `Evaluation Criteria for Senior Product Designer:
1. Systems & UX Research:
   - Strong proficiency in Figma, design tokens, and scalable design system maintenance.
   - Demonstrated experience running user research sessions, usability testing, and translating insights into prototypes.
2. Cross-Functional Collaboration:
   - Seamless collaboration with engineering and product managers to deliver accessible and WCAG-compliant UI.`
  },
  {
    title: 'Compliance & Equal Opportunity Standard',
    category: 'compliance',
    text: `Internal Hiring Compliance & Diversity Standards:
1. Fair & Bias-Free Screening:
   - Strict blind screening guidelines omitting gender, age, ethnicity, and graduation year indicators.
   - Standardized interview questions scored against empirical rubrics to ensure equal opportunity.
2. Verification Protocol:
   - Verify candidate contributions against authentic work portfolios or verified code contributions.`
  }
];

const CATEGORY_CONFIG = {
  engineering: {
    label: 'Engineering',
    icon: Code2,
    badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
    cardBorder: 'hover:border-blue-500/40',
    iconColor: 'text-blue-600 bg-blue-500/10'
  },
  product: {
    label: 'Product & UX',
    icon: Compass,
    badgeBg: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400',
    cardBorder: 'hover:border-purple-500/40',
    iconColor: 'text-purple-600 bg-purple-500/10'
  },
  compliance: {
    label: 'Compliance',
    icon: ShieldCheck,
    badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    cardBorder: 'hover:border-emerald-500/40',
    iconColor: 'text-emerald-600 bg-emerald-500/10'
  },
  general: {
    label: 'General',
    icon: BookOpen,
    badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    cardBorder: 'hover:border-amber-500/40',
    iconColor: 'text-amber-600 bg-amber-500/10'
  }
};

const KnowledgeBaseTab = ({ jobs = [], selectedJobId = 'all', setSelectedJobId }) => {
  const [activeSubTab, setActiveSubTab] = useState('manage'); // 'manage' | 'search' | 'add'

  // Search state
  const [collection, setCollection] = useState('policies');
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

  // Manage policies state
  const [policies, setPolicies] = useState([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [policiesError, setPoliciesError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [reindexingDocId, setReindexingDocId] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [policyFilterCategory, setPolicyFilterCategory] = useState('all');
  const [policySearchTerm, setPolicySearchTerm] = useState('');
  
  // View Details Modal state
  const [viewingPolicy, setViewingPolicy] = useState(null);

  // Edit policy drawer/modal state
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('engineering');
  const [editJobId, setEditJobId] = useState('');
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setEditTitle(policy.title || '');
    setEditCategory(policy.category || 'engineering');
    setEditJobId(policy.jobId?._id || policy.jobId || '');
    setEditText(policy.text || '');
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingPolicy(null);
    setEditTitle('');
    setEditCategory('engineering');
    setEditJobId('');
    setEditText('');
    setEditError('');
  };

  const handleUpdatePolicy = async (e) => {
    e?.preventDefault();
    if (!editTitle.trim() || !editText.trim()) {
      setEditError('Title and policy content are required.');
      return;
    }

    setIsUpdating(true);
    setEditError('');
    try {
      const res = await api.put(`/rag/policies/${encodeURIComponent(editingPolicy.documentId)}`, {
        title: editTitle.trim(),
        category: editCategory,
        jobId: editJobId || null,
        text: editText.trim()
      });

      if (res.data?.success) {
        setActionSuccess(`Policy "${editTitle}" updated and automatically re-indexed in Qdrant.`);
        await fetchPolicies();
        closeEditModal();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update policy:', err);
      setEditError(err.response?.data?.error || 'Failed to update policy.');
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchPolicies = async () => {
    setIsLoadingPolicies(true);
    setPoliciesError('');
    try {
      const res = await api.get('/rag/policies');
      if (res.data?.success) {
        setPolicies(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
      setPoliciesError(err.response?.data?.error || 'Failed to load policies.');
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDeletePolicy = async (documentId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This removes the vector embeddings from Qdrant and knowledge base records.`)) {
      return;
    }
    setDeletingDocId(documentId);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.delete(`/rag/policies/${encodeURIComponent(documentId)}`);
      if (res.data?.success) {
        setActionSuccess(`Policy "${title}" deleted from vector index and database.`);
        setPolicies((prev) => prev.filter((p) => p.documentId !== documentId));
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Failed to delete policy:', err);
      setActionError(err.response?.data?.error || 'Failed to delete policy.');
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setDeletingDocId(null);
    }
  };

  const handleReindexPolicy = async (documentId, title) => {
    setReindexingDocId(documentId);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.post(`/rag/policies/${encodeURIComponent(documentId)}/reindex`);
      if (res.data?.success) {
        setActionSuccess(`"${title}" re-indexed successfully with ${res.data.chunks} vector chunks.`);
        await fetchPolicies();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Failed to re-index policy:', err);
      setActionError(err.response?.data?.error || 'Failed to re-index policy.');
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setReindexingDocId(null);
    }
  };

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
      fetchPolicies();
      setTimeout(() => {
        setActiveSubTab('manage');
      }, 1200);
    } catch (err) {
      console.error('Policy Indexing Error:', err);
      setSubmitError(err.response?.data?.error || 'Failed to index policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Standardized PageHeader with Segmented Actions */}
      <PageHeader
        title="Vector Knowledge Base"
        category="Semantic Search & RAG"
        icon={BrainCircuit}
        badge={
          <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20 text-xs py-0.5">
            <Database className="w-3.5 h-3.5" />
            Qdrant Cloud • 384-d
          </Badge>
        }
        description="Semantic vector search across candidate resumes and organizational hiring standards."
        actions={
          <div className="flex items-center p-1 bg-secondary/80 rounded-xl border border-border shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('manage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'manage'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              Policies ({policies.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'add'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Index Policy
            </button>
          </div>
        }
      />

      {/* Dashboard Metrics Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Policies</p>
            <p className="text-xl font-bold text-foreground tracking-tight">{policies.length}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Dense Vectors</p>
            <p className="text-xl font-bold text-foreground tracking-tight">{policies.reduce((acc, p) => acc + (p.indexedChunks || 1), 0)}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role Targeted</p>
            <p className="text-xl font-bold text-foreground tracking-tight">{policies.filter(p => !!p.jobId).length}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Global Standards</p>
            <p className="text-xl font-bold text-foreground tracking-tight">{policies.filter(p => !p.jobId).length}</p>
          </div>
        </div>
      </div>

      {/* Flash Notifications */}
      {actionSuccess && (
        <div className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between font-medium shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
        </div>
      )}

      {actionError && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center justify-between font-medium shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
        </div>
      )}

      {activeSubTab === 'manage' ? (
        /* Manage Policies Tab */
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Policy Search Input */}
              <div className="relative min-w-[200px] max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter guidelines by name or ID..."
                  value={policySearchTerm}
                  onChange={(e) => setPolicySearchTerm(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {policySearchTerm && (
                  <button
                    onClick={() => setPolicySearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {['all', 'engineering', 'product', 'compliance', 'general'].map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat];
                  const Icon = cfg?.icon;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPolicyFilterCategory(cat)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all flex items-center gap-1.5 shrink-0 ${
                        policyFilterCategory === cat
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {cfg?.label || cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPolicies}
                disabled={isLoadingPolicies}
                className="text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPolicies ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveSubTab('add')}
                className="text-xs gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Policy
              </Button>
            </div>
          </div>

          {isLoadingPolicies ? (
            <div className="py-16 text-center text-xs text-muted-foreground bg-card border border-border rounded-xl flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              Loading indexed hiring policies from Qdrant...
            </div>
          ) : policiesError ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {policiesError}
            </div>
          ) : policies.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No hiring policies indexed yet"
              description="Upload internal evaluation rubrics, standards, or role criteria into Qdrant to power semantic RAG matching."
              actionLabel="Add First Policy"
              onAction={() => setActiveSubTab('add')}
              className="py-16"
            />
          ) : (
            /* Vertical Responsive Policy Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {policies
                .filter((p) => {
                  const matchesCat = policyFilterCategory === 'all' || p.category === policyFilterCategory;
                  const matchesQuery = !policySearchTerm || 
                    p.title?.toLowerCase().includes(policySearchTerm.toLowerCase()) ||
                    p.documentId?.toLowerCase().includes(policySearchTerm.toLowerCase()) ||
                    p.text?.toLowerCase().includes(policySearchTerm.toLowerCase());
                  return matchesCat && matchesQuery;
                })
                .map((policy) => {
                  const isDeleting = deletingDocId === policy.documentId;
                  const isReindexing = reindexingDocId === policy.documentId;
                  const catCfg = CATEGORY_CONFIG[policy.category] || CATEGORY_CONFIG.general;
                  const CatIcon = catCfg.icon || BookOpen;

                  return (
                    <div
                      key={policy.documentId}
                      className={`bg-card border border-border rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4 ${catCfg.cardBorder}`}
                    >
                      {/* Top Header */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`p-1.5 rounded-lg shrink-0 ${catCfg.iconColor}`}>
                              <CatIcon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${catCfg.badgeBg}`}>
                              {catCfg.label}
                            </span>
                          </div>
                          
                          {policy.jobId ? (
                            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 max-w-[140px] truncate" title={typeof policy.jobId === 'object' ? policy.jobId.title : 'Target Opening'}>
                              <FolderGit2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{typeof policy.jobId === 'object' ? policy.jobId.title : 'Target Opening'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground bg-secondary/80 border border-border/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                              Global Standard
                            </span>
                          )}
                        </div>

                        {/* Title & Document Id */}
                        <div>
                          <h4 className="text-sm font-semibold text-foreground tracking-tight line-clamp-2 leading-snug" title={policy.title}>
                            {policy.title}
                          </h4>
                          <p className="text-[10px] font-mono text-muted-foreground/80 mt-1 truncate">
                            {policy.documentId}
                          </p>
                        </div>

                        {/* Important Metrics Row */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Database className="w-3 h-3" />
                            {policy.indexedChunks || 1} Chunks
                          </span>
                          <span className="flex items-center gap-1 text-[10px]">
                            <Calendar className="w-3 h-3" />
                            {policy.lastIndexedAt ? new Date(policy.lastIndexedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Actions: View Detail Modal trigger + actions */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingPolicy(policy)}
                          className="h-7 text-xs gap-1.5 flex-1 hover:text-primary hover:border-primary/40 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          View Details
                        </Button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={isReindexing || isDeleting}
                            onClick={() => openEditModal(policy)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit Policy"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isReindexing || isDeleting}
                            onClick={() => handleReindexPolicy(policy.documentId, policy.title)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Re-index into Qdrant"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-primary' : ''}`} />
                          </button>
                          <button
                            type="button"
                            disabled={isReindexing || isDeleting}
                            onClick={() => handleDeletePolicy(policy.documentId, policy.title)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Delete Policy"
                          >
                            <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? 'animate-pulse text-destructive' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ) : activeSubTab === 'search' ? (
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
        /* Add Policy Layout with Template Quick-Fill */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm pb-2 border-b border-border/60">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <UploadCloud className="w-4 h-4" />
                </div>
                Vector Ingestion Info
              </div>
              <p className="leading-relaxed">
                When you index a policy, the text is split into semantic paragraphs, embedded via <code className="text-foreground font-mono">bge-small-en</code> (384-d vectors), and saved in Qdrant.
              </p>
              <p className="leading-relaxed">
                The <span className="font-semibold text-foreground">AI Matching Agent</span> references these policies during automated applicant screening to verify compliance and minimum qualifications.
              </p>
            </div>

            {/* Quick Templates Selector */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Rubric Templates
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click a template below to auto-fill standardized evaluation standards:
              </p>
              <div className="space-y-2">
                {TEMPLATES.map((tmpl, tIdx) => {
                  const cfg = CATEGORY_CONFIG[tmpl.category] || CATEGORY_CONFIG.general;
                  const TmplIcon = cfg.icon;
                  return (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => {
                        setPolicyTitle(tmpl.title);
                        setPolicyCategory(tmpl.category);
                        setPolicyText(tmpl.text);
                      }}
                      className="w-full text-left p-2.5 rounded-lg border border-border/70 hover:border-primary/40 bg-secondary/30 hover:bg-secondary/60 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1 rounded-md ${cfg.iconColor} shrink-0`}>
                          <TmplIcon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {tmpl.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8 bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Index New Hiring Policy</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define organizational criteria, interview rubrics, or role prerequisites to guide agent decisions.
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
                  placeholder="e.g. Senior Frontend Architecture Rubric 2026"
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
                  rows={8}
                  placeholder="Paste internal evaluation criteria, required competencies, or interview rubrics..."
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed resize-none"
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

              <div className="flex justify-end gap-2 pt-1 border-t border-border/60">
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
                <Button type="submit" size="sm" loading={isSubmitting} disabled={!policyTitle.trim() || !policyText.trim()} className="gap-1.5">
                  <UploadCloud className="w-4 h-4" />
                  Save & Index
                </Button>
              </div>
            </form>
          </main>
        </div>
      )}

      {/* Edit Policy Modal / Drawer */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Edit Hiring Policy</h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {editingPolicy.documentId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isUpdating}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePolicy} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  Policy Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Associate with Opening</label>
                  <Select
                    value={editJobId}
                    onChange={(e) => setEditJobId(e.target.value)}
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
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="engineering">Engineering</option>
                    <option value="product">Product & Design</option>
                    <option value="compliance">Compliance & Legal</option>
                    <option value="general">General Hiring</option>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Policy Content / Rubric Text *
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Saving automatically recalculates semantic chunks & vectors in Qdrant
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-background border border-input rounded-lg p-3 text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed resize-none"
                />
              </div>

              {editError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={closeEditModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  loading={isUpdating}
                  disabled={!editTitle.trim() || !editText.trim()}
                  className="gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                  Save & Re-index
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Policy Modal */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${(CATEGORY_CONFIG[viewingPolicy.category] || CATEGORY_CONFIG.general).iconColor}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground tracking-tight">
                    {viewingPolicy.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded border border-border/50">
                      ID: {viewingPolicy.documentId}
                    </span>
                    <span>•</span>
                    <span className="capitalize font-medium text-foreground">
                      {(CATEGORY_CONFIG[viewingPolicy.category] || CATEGORY_CONFIG.general).label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingPolicy(null)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meta badges strip */}
            <div className="flex items-center gap-3 text-xs bg-secondary/30 p-2.5 rounded-xl border border-border/60">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Indexed Chunks:</span>
                <span className="font-semibold text-foreground">{viewingPolicy.indexedChunks || 1}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-muted-foreground">Scope:</span>
                <span className="font-semibold text-foreground">
                  {viewingPolicy.jobId ? (typeof viewingPolicy.jobId === 'object' ? viewingPolicy.jobId.title : 'Target Opening') : 'Global Standard'}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium text-foreground">
                  {viewingPolicy.lastIndexedAt ? new Date(viewingPolicy.lastIndexedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Policy Full Content Scroll area */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Full Policy & Evaluation Rubric Content
              </label>
              <div className="bg-secondary/40 border border-border/70 rounded-xl p-4 text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground select-text">
                {viewingPolicy.text}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toEdit = viewingPolicy;
                    setViewingPolicy(null);
                    openEditModal(toEdit);
                  }}
                  className="gap-1.5 text-xs h-8"
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  Edit Policy
                </Button>
              </div>
              <Button
                size="sm"
                onClick={() => setViewingPolicy(null)}
                className="text-xs h-8"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseTab;