import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export default function AnalyticsTab({
  analyticsData,
  jobs = [],
  candidates = [],
  selectedJobId,
  setSelectedJobId
}) {
  const currentJob = jobs.find(j => j._id === selectedJobId);

  const avgMatch = analyticsData?.avgMatchScore;
  const shortlistRate = analyticsData?.rates?.shortlist;
  const completionRate = analyticsData?.rates?.completion;

  // Honest fallbacks from live candidate data when API has no metrics
  const scored = candidates.filter(c => c.match_score != null);
  const safeAvg = scored.length
    ? Math.round(scored.reduce((s, c) => s + c.match_score, 0) / scored.length)
    : null;

  const displayAvg = avgMatch ?? safeAvg;
  const displayShortlist = shortlistRate ?? (
    candidates.length ? Math.round((candidates.filter(c => c.status === 'shortlist').length / candidates.length) * 100) : null
  );
  const displayCompletion = completionRate ?? null;

  const handleExportJSON = () => {
    const exportData = {
      generated_at: new Date().toISOString(),
      total_jobs: jobs.length,
      total_candidates: candidates.length,
      analytics: analyticsData,
      candidates: candidates.map(c => ({
        name: c.name,
        email: c.email,
        phone: c.phone,
        match_score: c.match_score,
        status: c.status
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentic_hire_analytics_${Date.now()}.json`;
    a.click();
  };

  const MetricValue = ({ value, suffix = '%' }) => (
    value != null ? (
      <span className="text-3xl font-bold text-on-surface tracking-tight tabular-nums">
        {value}{suffix}
      </span>
    ) : (
      <span className="text-xl font-bold text-on-surface-variant">No data yet</span>
    )
  );

  return (
    <div className="ah-page">
      <PageHeader
        title="Recruitment Performance"
        badge={selectedJobId !== 'all' && (
          <Badge tone="primary">
            <span className="material-symbols-outlined text-[14px]">filter_alt</span>
            {currentJob?.title || 'Selected Job'}
          </Badge>
        )}
        description={
          selectedJobId !== 'all'
            ? `Analytics for ${currentJob?.title || 'the selected role'}.`
            : 'Aggregated insights across all active job specifications.'
        }
        actions={
          <>
            {selectedJobId !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedJobId('all')}>
                Show All Jobs
              </Button>
            )}
            <Button onClick={handleExportJSON}>
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export JSON
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="ah-surface p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Average Match Score</span>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-primary">
              <span className="material-symbols-outlined text-[18px]">stars</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <MetricValue value={displayAvg} />
            {displayAvg != null && (
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Live</span>
            )}
          </div>
        </div>

        <div className="ah-surface p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Shortlist Pass Rate</span>
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <MetricValue value={displayShortlist} />
              {displayShortlist != null && (
                <span className="text-xs text-on-surface-variant font-medium">of applicants</span>
              )}
            </div>
            {displayShortlist != null && (
              <div className="mt-3 relative h-1.5 w-full bg-[#F8F5EF] rounded-full overflow-hidden border border-[#e8ded5]">
                <div className="absolute inset-y-0 left-0 primary-gradient rounded-full" style={{ width: `${displayShortlist}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="ah-surface p-5 flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Workflow Completion</span>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <MetricValue value={displayCompletion} />
            {displayCompletion != null && (
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">Automated</span>
            )}
          </div>
        </div>
      </section>

      {candidates.length === 0 ? (
        <EmptyState
          icon="analytics"
          title="Not enough data for analytics"
          description="Create a job and collect a few applications to see live performance metrics."
        />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="ah-surface p-5">
            <h2 className="text-base font-bold text-on-surface mb-4">Candidate Pipeline Breakdown</h2>
            <div className="space-y-2">
              {[
                { label: 'Shortlisted by AI', count: candidates.filter(c => c.status === 'shortlist').length, color: 'bg-emerald-500' },
                { label: 'Pending / In Screening', count: candidates.filter(c => c.status === 'pending').length, color: 'bg-amber-500' },
                { label: 'Rejected / Low Fit', count: candidates.filter(c => c.status === 'reject').length, color: 'bg-red-500' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center p-3 bg-[#F8F5EF] rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                    <span className="text-sm font-semibold text-on-surface">{row.label}</span>
                  </div>
                  <span className="text-lg font-bold text-on-surface tabular-nums">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ah-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-bold text-on-surface">Historical Trends</h2>
                <Badge tone="warning">Coming Soon</Badge>
              </div>
              <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                Multi-month velocity, recruiter throughput, and cohort reports are on the roadmap.
              </p>
            </div>
            <div className="p-5 bg-[#F8F5EF] rounded-xl border border-dashed border-[#dcc1b1] text-center">
              <span className="material-symbols-outlined text-primary text-[32px] mb-1">insights</span>
              <p className="text-xs font-bold text-on-surface">Advanced BI Dashboard</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Scheduled for a future release.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
