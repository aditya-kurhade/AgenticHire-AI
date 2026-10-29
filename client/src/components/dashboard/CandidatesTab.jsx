import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

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
    <div className="ah-page">
      <PageHeader
        title="Candidate Pipeline"
        description="Evaluate AI-matched talent across your open roles."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => alert('Bulk CSV Resume Import feature is coming soon!')}
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              Import CSV
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Soon</span>
            </Button>
            <Button onClick={() => openDashboardTab('jobs')}>
              <span className="material-symbols-outlined text-[16px]">add</span>
              Open Job Portal
            </Button>
          </>
        }
      />

      {/* Compact filter bar */}
      <div className="ah-surface p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="ah-label">Search</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#897365] text-[18px]">search</span>
              <input
                type="text"
                value={candidateSearchQuery}
                onChange={(e) => setCandidateSearchQuery(e.target.value)}
                placeholder="Name or email…"
                className="ah-input pl-9"
              />
            </div>
          </div>
          <div>
            <label className="ah-label flex justify-between">
              <span>Opening</span>
              {selectedJobId !== 'all' && (
                <button type="button" onClick={() => setSelectedJobId('all')} className="text-[10px] text-primary hover:underline font-bold normal-case tracking-normal">
                  Reset
                </button>
              )}
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="ah-input font-bold text-primary"
            >
              <option value="all">All Roles ({jobs.length})</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="ah-label">Status</label>
            <select
              value={candidateStatusFilter}
              onChange={(e) => setCandidateStatusFilter(e.target.value)}
              className="ah-input"
            >
              <option value="all">All ({candidates.length})</option>
              <option value="shortlist">Shortlisted ({candidates.filter(c => c.status === 'shortlist').length})</option>
              <option value="pending">Pending ({candidates.filter(c => c.status === 'pending').length})</option>
              <option value="reject">Rejected ({candidates.filter(c => c.status === 'reject').length})</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Min. Match</label>
              <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md tabular-nums">{candidateMinMatch}%</span>
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
      <div className="ah-surface overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8F5EF] border-b border-[#e8ded5]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Candidate</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Contact</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">AI Match</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e7df]">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4">
                    <EmptyState
                      icon="group_off"
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
                  <tr key={c._id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl border border-[#e8ded5] bg-[#F8F5EF] flex items-center justify-center font-bold text-primary text-xs shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-on-surface">{c.name}</div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-0.5">
                            <span className="material-symbols-outlined text-[12px]">work</span>
                            {c.job_id?.title || 'General Applicant'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs text-on-surface font-medium">{c.email}</div>
                      <div className="text-[11px] text-on-surface-variant">{c.phone || 'No phone'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-primary tabular-nums">
                          {c.match_score != null ? `${c.match_score}%` : '—'}
                        </span>
                        <div className="w-16 h-1 bg-[#F8F5EF] border border-[#e8ded5] rounded-full overflow-hidden mt-1">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${c.match_score || 0}%` }} />
                        </div>
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
                            className="p-1.5 rounded-lg border border-[#e8ded5] hover:bg-[#F8F5EF] text-on-surface-variant transition-colors"
                            title="Download resume"
                          >
                            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedCandidateId(c._id);
                            openDashboardTab('workflows');
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">account_tree</span>
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
        <div className="px-5 py-3 bg-[#F8F5EF] flex items-center justify-between border-t border-[#e8ded5]">
          <span className="text-xs font-medium text-on-surface-variant">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </span>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredCandidates.length === 0 ? (
          <EmptyState
            icon="group_off"
            title={candidates.length === 0 ? 'No candidates yet' : 'No matches for filters'}
            description="Adjust filters or share a job portal link."
          />
        ) : (
          filteredCandidates.map((c) => (
            <div key={c._id} className="ah-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#e8ded5] flex items-center justify-center font-bold text-primary text-sm shrink-0">
                    {c.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{c.name}</p>
                    <p className="text-[11px] text-on-surface-variant truncate">{c.email}</p>
                    <p className="text-[10px] text-primary font-semibold mt-0.5 truncate">{c.job_id?.title || 'Applicant'}</p>
                  </div>
                </div>
                <Badge status={c.status}>{c.status}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
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
        <div className="ah-surface p-5 flex gap-3.5 items-start">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
            <span className="material-symbols-outlined text-[22px]">bolt</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Automated Shortlisting</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              <strong className="text-primary">{shortlisted}</strong> of {candidates.length} candidates met qualification thresholds.
            </p>
          </div>
        </div>
        <div className="ah-surface p-5">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Pass Rate</span>
            <Badge tone="success">Live</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-on-surface tabular-nums">{passRate}%</span>
            <span className="text-xs text-on-surface-variant font-medium">qualified applicants</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatesTab;
