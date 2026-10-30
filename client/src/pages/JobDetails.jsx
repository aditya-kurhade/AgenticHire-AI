import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, ArrowLeft, Briefcase, Calendar, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-card p-8 rounded-2xl border border-destructive/20 shadow-xs space-y-4">
          <p className="text-destructive font-semibold text-base">Error Loading Job</p>
          <p className="text-xs text-muted-foreground">{error || 'Job specification not found.'}</p>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-12 bg-card/80 backdrop-blur-md border-b border-border h-16 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base text-foreground">AgentHire AI</span>
        </Link>
        <Link
          to="/"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Home
        </Link>
      </header>

      {/* Main Panel */}
      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to open opportunities
        </Link>

        <div className="bg-card rounded-2xl border border-border p-6 md:p-10 shadow-xs space-y-6 text-left">
          {/* Header Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3 leading-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" /> Full-time</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> Actively Screening</span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-primary" /> {job.min_experience}+ years experience</span>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Role Description</h3>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-normal">
              {job.description}
            </p>
          </div>

          <hr className="border-border/60" />

          {/* Skills Required */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Required Core Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.required_skills && job.required_skills.length > 0 ? (
                  job.required_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-secondary/70 text-foreground px-2.5 py-1 rounded-md text-xs font-medium border border-border"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No core skills explicitly defined</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferred Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.preferred_skills && job.preferred_skills.length > 0 ? (
                  job.preferred_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-secondary/40 text-muted-foreground px-2.5 py-1 rounded-md text-xs font-medium border border-border/60"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No preferred skills defined</span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-0.5">Apply with your Resume</p>
              <p className="text-xs text-muted-foreground">Takes less than 2 minutes to submit your PDF resume.</p>
            </div>
            <Button
              onClick={() => navigate(`/jobs/${job._id}/apply`)}
              className="w-full sm:w-auto flex items-center gap-1.5"
              size="lg"
            >
              Apply for this Role
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-transparent border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AgentHire AI Recruitment OS. All rights reserved.
      </footer>
    </div>
  );
};

export default JobDetails;