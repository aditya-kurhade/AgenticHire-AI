import { Link } from 'react-router-dom';
import { PageHeader } from '../ui/PageHeader';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

const JobSpecsTab = ({
  jobs,
  candidates,
  openDashboardTab,
  setSelectedJobId,
  setShowCreateModal
}) => {
  return (
    <div className="ah-page">
      <PageHeader
        title="Job Specifications"
        description="Configure AI screening criteria and talent matching for each open role."
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Job Spec
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Specs" value={jobs.length} badge="Live" />
        <StatCard title="Open Roles" value={jobs.length} badge="Active" icon="business_center" iconBg="bg-blue-100 text-blue-800" />
        <StatCard title="Candidate Pool" value={candidates.length} badge="Indexed" icon="groups" iconBg="bg-primary/10 text-primary" />
        <StatCard
          title="Action Needed"
          value={candidates.filter(c => c.status === 'pending').length}
          badge="Pending"
          icon="pending_actions"
          iconBg="bg-amber-100 text-amber-800"
        />
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon="description"
          title="No job specs yet"
          description="Create your first role to start collecting applicants and running AI screening."
          actionLabel="Create Job Spec"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span>Linked to multi-agent hiring workflow</span>
            </div>
            <div className="text-xs text-on-surface-variant font-medium">
              Showing <span className="font-bold text-on-surface">{jobs.length}</span> active {jobs.length === 1 ? 'role' : 'roles'}
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
                  className="ah-surface p-5 card-hover flex flex-col gap-3 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        Min. experience: {job.min_experience || 0} years
                      </p>
                    </div>
                    <Badge tone="success">Active</Badge>
                  </div>

                  <div className="bg-[#F8F5EF] rounded-xl p-3 border border-[#e8ded5]/60">
                    <p className="text-xs italic text-on-surface-variant leading-relaxed line-clamp-3">
                      &ldquo;{job.description}&rdquo;
                    </p>
                  </div>

                  {job.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.required_skills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-[#F8F5EF] border border-[#e8ded5] text-on-surface text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 4 && (
                        <span className="text-[10px] text-on-surface-variant font-bold px-1.5 py-0.5 bg-[#F8F5EF] rounded-md">
                          +{job.required_skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0e7df]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Applicants</span>
                      <p className="text-lg font-bold text-on-surface tabular-nums">{jobCandidates.length}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Shortlisted</span>
                      <p className="text-lg font-bold text-primary tabular-nums">{shortlisted}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#f0e7df] flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => openDashboardTab('candidates', job._id)}
                      >
                        <span className="material-symbols-outlined text-[15px]">group</span>
                        Applicants
                      </Button>
                      <Button
                        variant="soft"
                        onClick={() => openDashboardTab('workflows', job._id)}
                      >
                        <span className="material-symbols-outlined text-[15px]">account_tree</span>
                        Pipeline
                      </Button>
                    </div>
                    <div className="flex justify-between items-center pt-1 px-0.5">
                      <Link
                        to={`/jobs/${job._id}`}
                        target="_blank"
                        className="text-on-surface-variant hover:text-primary text-[11px] font-medium flex items-center gap-1"
                      >
                        Public Portal
                        <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedJobId(job._id);
                          openDashboardTab('overview', job._id);
                        }}
                        className="text-on-surface-variant hover:text-primary text-[11px] font-medium"
                      >
                        Filter Dashboard →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-[#F8F5EF]/60 border-2 border-dashed border-[#dcc1b1] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-[#F8F5EF] hover:border-primary transition-all group min-h-[280px] text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#e8ded5] flex items-center justify-center text-primary shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">New Job Specification</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Define role criteria and requirements</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JobSpecsTab;
