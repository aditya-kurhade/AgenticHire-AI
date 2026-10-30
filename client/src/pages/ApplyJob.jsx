import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, ArrowLeft, UploadCloud, CheckCircle2, ShieldAlert, Sparkles, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        setJob(response.data.data);
      } catch {
        setError('Failed to load job details. Make sure the job ID is correct.');
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF resumes are supported.');
        setResume(null);
      } else {
        setError('');
        setResume(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resume) {
      setError('Please upload your resume PDF.');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('jobId', jobId);
    formData.append('resume', resume);

    try {
      const response = await api.post('/candidates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-md space-y-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Application Received!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Thank you for applying. Our multi-agent AI system has initiated parsing and evaluation for:
            </p>
            <p className="text-base font-semibold text-primary">{job?.title}</p>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
            size="lg"
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
          to={`/jobs/${jobId}`} 
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View Role Details
        </Link>
      </header>

      {/* Main Panel */}
      <main className="flex-grow max-w-xl mx-auto w-full px-6 py-10">
        <Link 
          to={`/jobs/${jobId}`} 
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to job details
        </Link>

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-xs space-y-6 text-left">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Submit Application</h2>
            <p className="text-xs text-muted-foreground">Applying for <span className="text-foreground font-semibold">{job?.title}</span></p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Submission Error</p>
                <p className="text-destructive/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground" htmlFor="fullname">Full Name</label>
              <input 
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-sm text-foreground placeholder:text-muted-foreground/60 transition-all" 
                id="fullname" 
                placeholder="Alex Johnson" 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground" htmlFor="email">Work Email</label>
              <input 
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-sm text-foreground placeholder:text-muted-foreground/60 transition-all" 
                id="email" 
                placeholder="alex@company.com" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground" htmlFor="phone">Phone Number (Optional)</label>
              <input 
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring text-sm text-foreground placeholder:text-muted-foreground/60 transition-all" 
                id="phone" 
                placeholder="+1 555 123 4567" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-foreground mb-1">Resume File (PDF only)</label>
              <div className="border border-dashed border-input hover:border-primary/50 hover:bg-secondary/30 rounded-xl p-6 text-center cursor-pointer relative transition-colors">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  {resume ? (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {resume.name}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-foreground">Click to upload or drag & drop</span>
                      <span className="text-[11px] text-muted-foreground">PDF file up to 10MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              loading={submitting}
              className="w-full mt-2"
              size="lg"
            >
              Submit Application
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-transparent border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AgentHire AI Recruitment OS. All rights reserved.
      </footer>
    </div>
  );
};

export default ApplyJob;