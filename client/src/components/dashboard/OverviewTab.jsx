import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

const OverviewTab = ({
  jobs,
  candidates,
  selectedJobId,
  setSelectedJobId,
  openDashboardTab,
  setShowCreateModal
}) => {
  const jobTitle = jobs.find(j => j._id === selectedJobId)?.title;

  return (
    <div className="ah-page">
      <PageHeader
        title="Recruitment Funnel"
        badge={selectedJobId !== 'all' && (
          <Badge tone="primary">
            <span className="material-symbols-outlined text-[14px]">work</span>
            {jobTitle || 'Target Job'}
          </Badge>
        )}
        description={
          selectedJobId !== 'all'
            ? `Pipeline metrics and candidate matches for ${jobTitle}.`
            : 'AI-optimized talent pipeline across all active roles.'
        }
        actions={
          <>
            {selectedJobId !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedJobId('all')}>
                Clear Filter
              </Button>
            )}
            <Button onClick={() => setShowCreateModal(true)}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Job Spec
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Job Specs" value={jobs.length} badge="Open Roles" icon="business_center" iconBg="bg-amber-100 text-amber-800" />
        <StatCard title="Total Applicants" value={candidates.length} badge="All Pools" icon="groups" iconBg="bg-blue-100 text-blue-800" />
        <StatCard title="Pending Screening" value={candidates.filter(c => c.status === 'pending').length} badge="In Progress" icon="pending_actions" iconBg="bg-orange-100 text-orange-800" />
        <StatCard title="Shortlisted Matches" value={candidates.filter(c => c.status === 'shortlist').length} badge="Qualified" icon="verified" iconBg="bg-emerald-100 text-emerald-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 ah-surface p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#f0e7df]">
            <div>
              <h3 className="text-base font-bold text-on-surface">Recent Submissions</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Latest applications and match statuses</p>
            </div>
            <button
              type="button"
              onClick={() => openDashboardTab('candidates')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All ({candidates.length})
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {candidates.length === 0 ? (
            <EmptyState
              icon="person_add"
              title="No applications yet"
              description="New candidates will appear here as they apply through your public job portals."
              actionLabel="Create Job Spec"
              onAction={() => setShowCreateModal(true)}
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <div className="divide-y divide-[#f5eee8] flex-1">
              {candidates.slice(0, 5).map((c) => (
                <div
                  key={c._id}
                  className="py-3 flex justify-between items-center gap-3 hover:bg-[#FDFBF7] rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F5EF] border border-[#e8ded5] flex items-center justify-center font-bold text-primary text-xs shrink-0">
                      {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{c.name}</p>
                      <p className="text-[11px] text-on-surface-variant font-medium truncate">
                        {c.email}
                        {c.job_id?.title && (
                          <span className="text-primary font-semibold"> · {c.job_id.title}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.match_score != null && (
                      <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/5 rounded-md tabular-nums">
                        {c.match_score}%
                      </span>
                    )}
                    <Badge status={c.status}>{c.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-[#F8F5EF] p-5 rounded-2xl border border-[#e8ded5] flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#e8ded5] flex items-center justify-center text-primary shadow-2xs">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">Pipeline Snapshot</h3>
                <p className="text-[11px] text-on-surface-variant">Based on current applicant pool</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: 'Shortlisted',
                  count: candidates.filter(c => c.status === 'shortlist').length,
                  tone: 'bg-emerald-500',
                  badge: 'success'
                },
                {
                  label: 'Pending Review',
                  count: candidates.filter(c => c.status === 'pending').length,
                  tone: 'bg-amber-500',
                  badge: 'warning'
                },
                {
                  label: 'Rejected',
                  count: candidates.filter(c => c.status === 'reject').length,
                  tone: 'bg-red-400',
                  badge: 'danger'
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="bg-white p-3 rounded-xl border border-[#e8ded5] flex justify-between items-center shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 ${row.tone} rounded-full`} />
                    <span className="text-xs font-semibold text-on-surface">{row.label}</span>
                  </div>
                  <Badge tone={row.badge}>{row.count}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-5 w-full !text-primary hover:!bg-primary/5"
            onClick={() => openDashboardTab('workflows')}
          >
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            Open Workflows
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
