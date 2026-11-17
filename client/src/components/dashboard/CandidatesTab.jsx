import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { GitHubScoreTooltip } from './GitHubScoreTooltip';
import { LeetCodeScoreTooltip } from './LeetCodeScoreTooltip';
import { LeetCodeIcon } from '../ui/LeetCodeIcon';
import { InterviewModal } from './InterviewModal';
import {
  Search,
  Upload,
  Briefcase,
  FileDown,
  GitBranch,
  Zap,
  Users,
  RotateCcw,
  MessageSquare,
  CheckSquare,
  Square,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const CandidatesTab = ({
  candidates,
  jobs,
  selectedJobId,
  setSelectedJobId,
  candidateSearchQuery,
  setCandidateSearchQuery,
  candidateStatusFilter,
  setCandidateStatusFilter,
  candidateMinMatch,
  setCandidateMinMatch,
  setSelectedCandidateId,
  openDashboardTab,
  refreshCandidates
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesSearch = !candidateSearchQuery ||
        c.name?.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(candidateSearchQuery.toLowerCase());
      const matchesStatus = candidateStatusFilter === 'all' || c.status === candidateStatusFilter;
      const matchesScore = candidateMinMatch === 0 || (c.match_score !== null && c.match_score >= candidateMinMatch);
      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [candidates, candidateSearchQuery, candidateStatusFilter, candidateMinMatch]);

  const [selectedInterviewCandidate, setSelectedInterviewCandidate] = useState(null);
  const shortlisted = candidates.filter(c => c.status === 'shortlist').length;
  const passRate = candidates.length > 0 ? Math.round((shortlisted / candidates.length) * 100) : 0;

  // Multi-selection helpers
  const allFilteredSelected = filteredCandidates.length > 0 && filteredCandidates.every(c => selectedIds.includes(c._id));
  const someFilteredSelected = filteredCandidates.some(c => selectedIds.includes(c._id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map(c => c._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBatchStatus = async (status) => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const res = await api.post('/candidates/batch-status', {
        candidateIds: selectedIds,
        status
      });
      toast.success(res.data.message || `Candidates marked as ${status}`);
      setSelectedIds([]);
      refreshCandidates?.();
    } catch (err) {
      console.error('Batch status error:', err);
      toast.error(err.response?.data?.error || 'Failed to update candidates');
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleBatchRetrigger = async () => {
    if (selectedIds.length === 0) return;
    setBatchActionLoading(true);
    try {
      const res = await api.post('/candidates/batch-retrigger', {
        candidateIds: selectedIds
      });
      toast.success(res.data.message || 'Workflow re-triggered for selected candidates!');
      setSelectedIds([]);
      refreshCandidates?.();
    } catch (err) {
      console.error('Batch retrigger error:', err);
      toast.error(err.response?.data?.error || 'Failed to re-trigger workflows');
    } finally {
      setBatchActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Pipeline"
        category="Talent Pool"
        icon={Users}
        description="Evaluate AI-matched talent across your open roles."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-1.5"
              onClick={() => toast.info('Bulk CSV Resume Import feature is coming soon!')}
            >
              <Upload className="w-3.5 h-3.5" />
              Import CSV
              <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-medium ml-1">Soon</span>
            </Button>
            <Button onClick={() => openDashboardTab('jobs')} className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Job Portal
            </Button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={candidateSearchQuery}
                onChange={(e) => setCandidateSearchQuery(e.target.value)}
                placeholder="Name or email…"
                className="w-full bg-background border border-input rounded-lg pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opening</label>
              {selectedJobId !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedJobId('all')}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>
            <Select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="all">All Roles ({jobs.length})</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
            <Select
              value={candidateStatusFilter}
              onChange={(e) => setCandidateStatusFilter(e.target.value)}
            >
              <option value="all">All ({candidates.length})</option>
              <option value="shortlist">Shortlisted ({candidates.filter(c => c.status === 'shortlist').length})</option>
              <option value="pending">Pending ({candidates.filter(c => c.status === 'pending').length})</option>
              <option value="reject">Rejected ({candidates.filter(c => c.status === 'reject').length})</option>
            </Select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min. Match</label>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md tabular-nums">{candidateMinMatch}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={candidateMinMatch}
              onChange={(e) => setCandidateMinMatch(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer mt-2"
              aria-label="Minimum match score"
            />
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="bg-card border border-border rounded-xl shadow-xs hidden md:block">
        <div className="relative">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                <th className="w-10 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={el => {
                      if (el) el.indeterminate = someFilteredSelected;
                    }}
                    onChange={toggleSelectAll}
                    aria-label="Select all candidates"
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Match</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code Score (MCP)</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">LeetCode DSA</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8">
                    <EmptyState
                      icon={Users}
                      title={candidates.length === 0 ? 'No candidates yet' : 'No matches for filters'}
                      description={candidates.length === 0
                        ? 'Share a public job portal link to start receiving applications.'
                        : 'Try clearing search or lowering the match threshold.'}
                      className="border-0 bg-transparent"
                    />
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const isSelected = selectedIds.includes(c._id);
                  return (
                  <tr
                    key={c._id}
                    className={`transition-colors relative hover:z-20 ${
                      isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/40'
                    }`}
                  >
                    <td className="w-10 px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(c._id)}
                        aria-label={`Select ${c.name}`}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border border-border bg-secondary flex items-center justify-center font-semibold text-foreground text-xs shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{c.name}</div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-0.5">
                            <Briefcase className="w-3 h-3" />
                            {c.job_id?.title || 'General Applicant'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs text-foreground font-medium">{c.email}</div>
                      <div className="text-[11px] text-muted-foreground">{c.phone || 'No phone'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-bold text-primary tabular-nums">
                          {c.match_score != null ? `${c.match_score}%` : '—'}
                        </span>
                        <div className="w-16 h-1.5 bg-secondary border border-border rounded-full overflow-hidden mt-1">
                          <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${c.match_score || 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center relative group">
                      <div className="inline-flex flex-col items-center cursor-help">
                        {c.coding_score != null ? (
                          <>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/80 border border-border text-foreground font-semibold text-xs tabular-nums shadow-2xs group-hover:bg-accent group-hover:border-primary/40 transition-all">
                              <svg className="w-3.5 h-3.5 fill-current text-foreground shrink-0" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                              </svg>
                              <span>{`${c.coding_score}%`}</span>
                            </div>
                            <div className="w-16 h-1.5 bg-secondary border border-border rounded-full overflow-hidden mt-1.5">
                              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${c.coding_score || 0}%` }} />
                            </div>

                            {/* Hover Tooltip Breakdown */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[100] pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95">
                              <GitHubScoreTooltip
                                codingScore={c.coding_score}
                                username={c.github_username}
                                metrics={c.github_metrics}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center relative group">
                      <div className="inline-flex flex-col items-center cursor-help">
                        {c.dsa_score != null ? (
                          <>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs tabular-nums shadow-2xs group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all">
                              <LeetCodeIcon className="w-3.5 h-3.5 shrink-0" />
                              <span>{`${c.dsa_score}%`}</span>
                            </div>
                            <div className="w-16 h-1.5 bg-secondary border border-border rounded-full overflow-hidden mt-1.5">
                              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${c.dsa_score || 0}%` }} />
                            </div>

                            {/* Hover Tooltip Breakdown */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[100] pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95">
                              <LeetCodeScoreTooltip
                                dsaScore={c.dsa_score}
                                username={c.leetcode_username}
                                metrics={c.leetcode_metrics}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={c.status}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        {c.interview_rubric && (
                          <button
                            type="button"
                            onClick={() => setSelectedInterviewCandidate(c)}
                            title="View interview assessment & rubric"
                            className="p-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </button>
                        )}
                        {c.resume_url && (
                          <a
                            href={`http://localhost:5000${c.resume_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="Download resume"
                          >
                            <FileDown className="w-4 h-4" />
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex items-center gap-1 text-xs"
                          onClick={() => {
                            setSelectedCandidateId(c._id);
                            openDashboardTab('workflows');
                          }}
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          Inspect
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
            </table>
        </div>
        <div className="px-5 py-3 bg-secondary/30 flex items-center justify-between border-t border-border">
          <span className="text-xs font-medium text-muted-foreground">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </span>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredCandidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title={candidates.length === 0 ? 'No candidates yet' : 'No matches for filters'}
            description="Adjust filters or share a job portal link."
          />
        ) : (
          filteredCandidates.map((c) => {
            const isSelected = selectedIds.includes(c._id);
            return (
            <div
              key={c._id}
              className={`bg-card border rounded-xl p-4 shadow-xs transition-colors ${
                isSelected ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(c._id)}
                    aria-label={`Select ${c.name}`}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                  />
                  <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center font-semibold text-foreground text-xs shrink-0">
                    {c.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    <p className="text-[11px] text-primary font-medium mt-0.5 truncate">{c.job_id?.title || 'Applicant'}</p>
                  </div>
                </div>
                <Badge status={c.status}>{c.status}</Badge>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary tabular-nums">
                    Match: {c.match_score != null ? `${c.match_score}%` : '—'}
                  </span>
                  {c.coding_score != null && (
                    <span className="text-[11px] font-semibold text-foreground tabular-nums flex items-center gap-1">
                      Code: {c.coding_score}%
                    </span>
                  )}
                  {c.dsa_score != null && (
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums flex items-center gap-1">
                      DSA: {c.dsa_score}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {c.interview_rubric && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setSelectedInterviewCandidate(c)}
                    >
                      Questions
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs"
                    onClick={() => {
                      setSelectedCandidateId(c._id);
                      openDashboardTab('workflows');
                    }}
                  >
                    Inspect
                  </Button>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex gap-3.5 items-start shadow-xs">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Automated Shortlisting</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              <strong className="text-primary font-semibold">{shortlisted}</strong> of {candidates.length} candidates met qualification thresholds.
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pass Rate</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Live</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-foreground tabular-nums">{passRate}%</span>
            <span className="text-xs text-muted-foreground font-medium">qualified applicants</span>
          </div>
        </div>
      </div>

      {/* Linear / Notion Style Floating Bottom Action Dock */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900/90 dark:bg-zinc-900/95 text-zinc-100 backdrop-blur-md px-3.5 py-2.5 rounded-full border border-zinc-700/60 shadow-2xl ring-1 ring-black/20">
            {/* Selection Counter Pill */}
            <div className="flex items-center gap-2 pl-1 pr-2 border-r border-zinc-700/80">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground font-bold text-[11px] flex items-center justify-center tabular-nums shadow-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs font-medium text-zinc-300 hidden sm:inline">
                Selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors underline-offset-2 hover:underline ml-0.5 cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => handleBatchStatus('shortlist')}
                className="h-7 px-2.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shortlist</span>
              </button>

              <button
                type="button"
                disabled={batchActionLoading}
                onClick={() => handleBatchStatus('reject')}
                className="h-7 px-2.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={batchActionLoading}
                onClick={handleBatchRetrigger}
                className="h-7 px-3 text-xs font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {batchActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                <span>Re-run</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Interview Rubric & Questions Modal */}
      <InterviewModal
        isOpen={!!selectedInterviewCandidate}
        onClose={() => setSelectedInterviewCandidate(null)}
        candidate={selectedInterviewCandidate}
        jobTitle={selectedInterviewCandidate?.job_id?.title}
      />
    </div>
  );
};

export default CandidatesTab;