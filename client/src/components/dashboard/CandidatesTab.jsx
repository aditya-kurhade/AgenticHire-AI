import { toast } from 'sonner';
import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { GitHubScoreTooltip } from './GitHubScoreTooltip';
import {
  Search,
  Upload,
  Briefcase,
  FileDown,
  GitBranch,
  Zap,
  Users,
  RotateCcw
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
  openDashboardTab
}) => {
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !candidateSearchQuery ||
      c.name?.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(candidateSearchQuery.toLowerCase());
    const matchesStatus = candidateStatusFilter === 'all' || c.status === candidateStatusFilter;
    const matchesScore = candidateMinMatch === 0 || (c.match_score !== null && c.match_score >= candidateMinMatch);
    return matchesSearch && matchesStatus && matchesScore;
  });

  const shortlisted = candidates.filter(c => c.status === 'shortlist').length;
  const passRate = candidates.length > 0 ? Math.round((shortlisted / candidates.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Pipeline"
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Match</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code Score (MCP)</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8">
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
                filteredCandidates.map((c) => (
                  <tr key={c._id} className="hover:bg-accent/40 transition-colors relative hover:z-20">
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
                    <td className="px-5 py-3.5">
                      <Badge status={c.status}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
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
                ))
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
          filteredCandidates.map((c) => (
            <div key={c._id} className="bg-card border border-border rounded-xl p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
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
                <span className="text-xs font-bold text-primary tabular-nums">
                  Match: {c.match_score != null ? `${c.match_score}%` : '—'}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedCandidateId(c._id);
                    openDashboardTab('workflows');
                  }}
                >
                  Inspect
                </Button>
              </div>
            </div>
          ))
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
    </div>
  );
};

export default CandidatesTab;