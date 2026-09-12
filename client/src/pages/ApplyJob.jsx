import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, ArrowLeft, UploadCloud, CheckCircle, ShieldAlert } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ea580c] animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#dcc1b1] shadow-xl space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#121c2a]">Application Received!</h2>
            <p className="text-sm text-gray-500 font-medium">
              Thank you for applying. Our multi-agent AI system has initiated parsing and evaluation for the role of:
            </p>
            <p className="text-base font-bold text-[#944a00]">{job?.title}</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-3 bg-gradient-to-r from-[#E67E22] to-[#F59E0B] text-white font-bold rounded-xl shadow-md transition-all text-sm hover:opacity-95"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#121c2a] font-sans selection:bg-[#E67E22]/20 flex flex-col justify-between">
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-12 bg-white border-b border-[#ebdccb]/60 shadow-sm h-16">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-[#944a00]">AgentHire AI</span>
        </div>
        <Link 
          to={`/jobs/${jobId}`} 
          className="text-sm font-semibold text-[#564337] hover:text-[#944a00] transition-colors"
        >
          View Role Details
        </Link>
      </header>

      {/* Main Panel */}
      <main className="flex-grow max-w-2xl mx-auto w-full px-6 py-12">
        <Link 
          to={`/jobs/${jobId}`} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#564337] hover:text-[#944a00] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to job details
        </Link>

        <div className="bg-white rounded-3xl border border-[#dcc1b1] p-8 md:p-12 shadow-sm space-y-6 text-left">
          <div>
            <h2 className="text-2xl font-bold text-[#121c2a] mb-1">Submit Application</h2>
            <p className="text-sm text-gray-500 font-medium">Applying for <span className="text-[#944a00] font-bold">{job?.title}</span></p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Submission Error</p>
                <p className="text-red-600/90 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#121c2a] mb-1.5" htmlFor="fullname">Full Name</label>
              <input 
                className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#ffb783] focus:border-[#ffb783] outline-none transition-all text-sm text-[#121c2a]" 
                id="fullname" 
                placeholder="Alex Johnson" 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-[#121c2a] mb-1.5" htmlFor="email">Work Email</label>
              <input 
                className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#ffb783] focus:border-[#ffb783] outline-none transition-all text-sm text-[#121c2a]" 
                id="email" 
                placeholder="alex@company.com" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-[#121c2a] mb-1.5" htmlFor="phone">Phone Number (Optional)</label>
              <input 
                className="w-full px-4 py-2.5 bg-white border border-[#d1d5db] rounded-xl focus:ring-2 focus:ring-[#ffb783] focus:border-[#ffb783] outline-none transition-all text-sm text-[#121c2a]" 
                id="phone" 
                placeholder="+1 555 123 4567" 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Resume Upload (PDF) */}
            <div>
              <label className="block text-sm font-semibold text-[#121c2a] mb-1.5">Resume File (PDF only)</label>
              <div className="border-2 border-dashed border-[#dcc1b1] hover:bg-gray-50 rounded-xl p-6 text-center cursor-pointer relative transition-colors">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-[#944a00]" />
                  {resume ? (
                    <span className="text-sm font-bold text-green-600">{resume.name}</span>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-[#564337]">Click to upload or drag & drop</span>
                      <span className="text-xs text-gray-400">PDF up to 10MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-[#E67E22] to-[#F59E0B] w-full py-3.5 text-white font-bold rounded-xl shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#ebdccb]/60 py-6 text-center text-xs text-gray-500">
        © 2024 AgentHire AI Recruitment OS. All rights reserved.
      </footer>
    </div>
  );
};

export default ApplyJob;
