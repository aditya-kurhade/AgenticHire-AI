import { Link } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import {
  Plus,
  Briefcase,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GitBranch,
  CheckCircle2,
  FileText
} from 'lucide-react';

const JobSpecsTab = ({
  jobs,
  candidates,
  openDashboardTab,
  setSelectedJobId,
  setShowCreateModal
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Specifications"
        description="Configure AI screening criteria and talent matching for each open role."
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Job Spec
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Specs" value={jobs.length} badge="Live" icon={FileText} />
        <StatCard title="Open Roles" value={jobs.length} badge="Active" icon={Briefcase} iconBg="bg-blue-500/10 text-blue-600" />
        <StatCard title="Candidate Pool" value={candidates.length} badge="Indexed" icon={Users} iconBg="bg-primary/10 text-primary" />
        <StatCard
          title="Action Needed"
          value={candidates.filter(c => c.status === 'pending').length}
          badge="Pending"
          icon={Clock}
          iconBg="bg-amber-500/10 text-amber-600"
        />
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No job specs yet"
          description="Create your first role to start collecting applicants and running AI screening."
          actionLabel="Create Job Spec"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Linked to multi-agent autonomous hiring pipeline</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-semibold text-foreground">{jobs.length}</span> active {jobs.length === 1 ? 'role' : 'roles'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const jobCandidates = candidates.filter(c =>
                (c.job_id?._id || c.job_id) === job._id
              );
              const shortlisted = jobCandidates.filter(c => c.status === 'shortlist').length;

              return (
                <article
                  key={job._id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-border/80 hover:shadow-sm transition-all duration-200 flex flex-col gap-4 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        Min. experience: {job.min_experience || 0} years
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium text-[11px]">
                      Active
                    </Badge>
                  </div>

                  <div className="bg-secondary/40 rounded-lg p-3 border border-border/50">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      &ldquo;{job.description}&rdquo;
                    </p>
                  </div>

                  {job.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-secondary/60 border border-border text-foreground text-[11px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 4 && (
                        <span className="text-[10px] text-muted-foreground font-semibold px-1.5 py-0.5 bg-secondary rounded-md">
                          +{job.required_skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Applicants</span>
                      <p className="text-lg font-bold text-foreground tabular-nums">{jobCandidates.length}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Shortlisted</span>
                      <p className="text-lg font-bold text-primary tabular-nums">{shortlisted}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-border/60 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1.5"
                        onClick={() => openDashboardTab('candidates', job._id)}
                      >
                        <Users className="w-3.5 h-3.5" />
                        Applicants
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1.5"
                        onClick={() => openDashboardTab('workflows', job._id)}
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        Pipeline
                      </Button>
                    </div>
                    <div className="flex justify-between items-center pt-1 px-0.5">
                      <Link
                        to={`/jobs/${job._id}`}
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        Public Portal
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobId(job._id);
                          openDashboardTab('overview', job._id);
                        }}
                        className="text-muted-foreground hover:text-primary text-xs font-medium flex items-center gap-0.5 transition-colors"
                      >
                        Filter Dashboard
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-card/50 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-secondary/40 hover:border-primary/50 transition-all group min-h-[280px] text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-xs">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">New Job Specification</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Define role criteria and requirements</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JobSpecsTab;
