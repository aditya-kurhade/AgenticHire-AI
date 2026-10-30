import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Bot,
  GitBranch,
  UserPlus
} from 'lucide-react';

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
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Funnel"
        badge={selectedJobId !== 'all' && (
          <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20">
            <Briefcase className="w-3.5 h-3.5" />
            {jobTitle || 'Target Job'}
          </Badge>
        )}
        description={
          selectedJobId !== 'all'
            ? `Pipeline metrics and candidate matches for ${jobTitle}.`
            : 'AI-optimized talent pipeline across all active roles.'
        }
        actions={
          <div className="flex items-center gap-2">
            {selectedJobId !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedJobId('all')}>
                Clear Filter
              </Button>
            )}
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Job Spec
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Job Specs" value={jobs.length} badge="Open Roles" icon={Briefcase} iconBg="bg-blue-500/10 text-blue-600" />
        <StatCard title="Total Applicants" value={candidates.length} badge="All Pools" icon={Users} iconBg="bg-primary/10 text-primary" />
        <StatCard title="Pending Screening" value={candidates.filter(c => c.status === 'pending').length} badge="In Progress" icon={Clock} iconBg="bg-amber-500/10 text-amber-600" />
        <StatCard title="Shortlisted Matches" value={candidates.filter(c => c.status === 'shortlist').length} badge="Qualified" icon={CheckCircle2} iconBg="bg-emerald-500/10 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-card border border-border rounded-xl p-5 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/60">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Submissions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest applications and match statuses</p>
            </div>
            <button
              type="button"
              onClick={() => openDashboardTab('candidates')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              View All ({candidates.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {candidates.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No applications yet"
              description="New candidates will appear here as they apply through your public job portals."
              actionLabel="Create Job Spec"
              onAction={() => setShowCreateModal(true)}
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <div className="divide-y divide-border/50 flex-1">
              {candidates.slice(0, 5).map((c) => (
                <div
                  key={c._id}
                  className="py-3 flex justify-between items-center gap-3 hover:bg-accent/50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-secondary text-foreground border border-border flex items-center justify-center font-semibold text-xs shrink-0">
                      {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate">
                        {c.email}
                        {c.job_id?.title && (
                          <span className="text-primary font-medium"> · {c.job_id.title}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {c.match_score != null && (
                      <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-md tabular-nums">
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

        <div className="lg:col-span-4 bg-card p-5 rounded-xl border border-border flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Pipeline Snapshot</h3>
                <p className="text-[11px] text-muted-foreground">Based on current applicant pool</p>
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
                  tone: 'bg-destructive',
                  badge: 'destructive'
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="bg-secondary/40 p-3 rounded-lg border border-border flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${row.tone} rounded-full`} />
                    <span className="text-xs font-medium text-foreground">{row.label}</span>
                  </div>
                  <Badge variant={row.badge === 'destructive' ? 'destructive' : 'secondary'} className="font-semibold tabular-nums">
                    {row.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-5 w-full flex items-center justify-center gap-2"
            onClick={() => openDashboardTab('workflows')}
          >
            <GitBranch className="w-4 h-4" />
            Open Workflows
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;