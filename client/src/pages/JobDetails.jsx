import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, ArrowLeft, Briefcase, Calendar, Award } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#ea580c] animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-red-100 shadow-sm space-y-4">
          <p className="text-red-600 font-bold">Error Loading Job</p>
          <p className="text-sm text-gray-600">{error || 'Job not found.'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-5 py-2.5 bg-gradient-to-r from-[#E67E22] to-[#F59E0B] text-white rounded-lg text-sm font-bold shadow-md hover:opacity-95"
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
        <button 
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-[#564337] hover:text-[#944a00] transition-colors"
        >
          View All Roles
        </button>
      </header>

      {/* Main Panel */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#564337] hover:text-[#944a00] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to open opportunities
        </Link>

        <div className="bg-white rounded-3xl border border-[#dcc1b1] p-8 md:p-12 shadow-sm space-y-8 text-left">
          
          {/* Header Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#121c2a] mb-3 leading-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-[#564337] font-semibold">
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#944a00]" /> Full-time</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#944a00]" /> Posted recently</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#944a00]" /> {job.min_experience}+ years experience</span>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#121c2a]">Role Description</h3>
            <p className="text-sm text-[#564337] leading-relaxed whitespace-pre-line font-medium">
              {job.description}
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Skills Required */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#121c2a]">Required Core Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.required_skills && job.required_skills.length > 0 ? (
                  job.required_skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="bg-[#ffbb8c]/10 text-[#944a00] px-3.5 py-1 rounded-full text-xs font-bold border border-[#ffbb8c]/30"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 font-semibold">No core skills explicitly defined</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#121c2a]">Preferred Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.preferred_skills && job.preferred_skills.length > 0 ? (
                  job.preferred_skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="bg-[#d9e3f6]/40 text-[#121c2a] px-3.5 py-1 rounded-full text-xs font-bold border border-[#d9e3f6]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 font-semibold">No preferred skills defined</span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
            <div>
              <p className="text-xs text-[#564337] font-bold uppercase tracking-wider mb-1">Apply today</p>
              <p className="text-[11px] text-gray-500">Takes less than 2 minutes to submit your PDF resume.</p>
            </div>
            <button 
              onClick={() => navigate(`/jobs/${job._id}/apply`)}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#E67E22] to-[#F59E0B] text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              Apply for this Role
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#ebdccb]/60 py-6 text-center text-xs text-gray-500">
        © 2024 AgentHire AI Recruitment OS. All rights reserved.
      </footer>
    </div>
  );
};

export default JobDetails;
