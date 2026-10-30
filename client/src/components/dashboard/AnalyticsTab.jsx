import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import {
  Download,
  Sparkles,
  CheckCircle2,
  Zap,
  BarChart3,
  Filter,
  TrendingUp,
  PieChart
} from 'lucide-react';

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
      <span className="text-3xl font-bold text-foreground tracking-tight tabular-nums">
        {value}{suffix}
      </span>
    ) : (
      <span className="text-xl font-medium text-muted-foreground">No data yet</span>
    )
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruitment Performance"
        badge={selectedJobId !== 'all' && (
          <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20">
            <Filter className="w-3.5 h-3.5" />
            {currentJob?.title || 'Selected Job'}
          </Badge>
        )}
        description={
          selectedJobId !== 'all'
            ? `Analytics for ${currentJob?.title || 'the selected role'}.`
            : 'Aggregated insights across all active job specifications.'
        }
        actions={
          <div className="flex items-center gap-2">
            {selectedJobId !== 'all' && (
              <Button variant="outline" onClick={() => setSelectedJobId('all')}>
                Show All Jobs
              </Button>
            )}
            <Button onClick={handleExportJSON} className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Match Score</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <MetricValue value={displayAvg} />
            {displayAvg != null && (
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">Live</span>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shortlist Pass Rate</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <MetricValue value={displayShortlist} />
              {displayShortlist != null && (
                <span className="text-xs text-muted-foreground font-medium">of applicants</span>
              )}
            </div>
            {displayShortlist != null && (
              <div className="mt-3 relative h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border">
                <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${displayShortlist}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workflow Completion</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <MetricValue value={displayCompletion} />
            {displayCompletion != null && (
              <span className="text-xs text-blue-600 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-md">Automated</span>
            )}
          </div>
        </div>
      </section>

      {candidates.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Not enough data for analytics"
          description="Create a job and collect a few applications to see live performance metrics."
        />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <h2 className="text-base font-semibold text-foreground mb-4">Candidate Pipeline Breakdown</h2>
            <div className="space-y-2.5">
              {[
                { label: 'Shortlisted by AI', count: candidates.filter(c => c.status === 'shortlist').length, color: 'bg-emerald-500' },
                { label: 'Pending / In Screening', count: candidates.filter(c => c.status === 'pending').length, color: 'bg-amber-500' },
                { label: 'Rejected / Low Fit', count: candidates.filter(c => c.status === 'reject').length, color: 'bg-destructive' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center p-3 bg-secondary/40 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                    <span className="text-sm font-medium text-foreground">{row.label}</span>
                  </div>
                  <span className="text-base font-bold text-foreground tabular-nums">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-semibold text-foreground">Historical Trends</h2>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Coming Soon</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Multi-month velocity, recruiter throughput, and cohort reports are on the roadmap.
              </p>
            </div>
            <div className="p-6 bg-secondary/30 rounded-xl border border-dashed border-border text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Advanced BI Dashboard</p>
              <p className="text-xs text-muted-foreground mt-0.5">Scheduled for an upcoming release.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}