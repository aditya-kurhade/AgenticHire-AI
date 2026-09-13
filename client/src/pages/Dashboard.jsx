import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const getTabFromPath = (pathname) => {
    if (pathname.includes('/dashboard/candidates')) return 'candidates';
    if (pathname.includes('/dashboard/workflows')) return 'workflows';
    if (pathname.includes('/dashboard/analytics')) return 'analytics';
    if (pathname.includes('/dashboard/jobs/create')) return 'jobs';
    if (pathname.includes('/dashboard/jobs')) return 'jobs';
    return 'overview';
  };
  const routeTab = getTabFromPath(location.pathname);
  const [utilityTab, setUtilityTab] = useState(null);
  const activeTab = utilityTab || routeTab;

  // Live Data States
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Job Creation Form States
  const [showCreateModal, setShowCreateModal] = useState(() => location.pathname.includes('/dashboard/jobs/create'));
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobMinExp, setJobMinExp] = useState(0);
  const [jobRequiredSkills, setJobRequiredSkills] = useState('');
  const [jobPreferredSkills, setJobPreferredSkills] = useState('');
  const [jobCreating, setJobCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // Search Overlay State
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Workflow Inspection States
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowLogs, setWorkflowLogs] = useState([]);
  const [nodeColorsSpec, setNodeColorsSpec] = useState({
    running: 'blue',
    success: 'green',
    failed: 'red',
    waiting_approval: 'yellow'
  });
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);

  // LLM Provider & Ollama State
  const [llmSettings, setLlmSettings] = useState({
    provider: 'cloud',
    ollamaModel: 'llama3:8b',
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaStatus: { online: false, models: [] }
  });
  const [llmUpdating, setLlmUpdating] = useState(false);

  // Analytics States
  const [analyticsData, setAnalyticsData] = useState(null);

  const openDashboardTab = (tab) => {
    const tabPaths = {
      overview: '/dashboard',
      jobs: '/dashboard/jobs',
      candidates: '/dashboard/candidates',
      workflows: '/dashboard/workflows',
      analytics: '/dashboard/analytics'
    };
    setUtilityTab(null);
    navigate(tabPaths[tab] || '/dashboard');
  };

  // Fetch Jobs, Candidates, Settings, LLM status & Analytics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, candidatesRes, settingsRes, analyticsRes, llmRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/candidates'),
          api.get('/workflow/settings').catch(() => ({ data: { data: {} } })),
          api.get('/analytics').catch(() => ({ data: { data: null } })),
          api.get('/workflow/llm-settings').catch(() => api.get('/settings/llm')).catch(() => ({ data: { data: null } }))
        ]);
        setJobs(jobsRes.data.data);
        const fetchedCandidates = candidatesRes.data.data;
        setCandidates(fetchedCandidates);

        // Pre-select candidate
        if (fetchedCandidates.length > 0 && !selectedCandidateId) {
          setSelectedCandidateId(fetchedCandidates[0]._id);
        }

        if (settingsRes.data?.success && settingsRes.data.data?.nodeColors) {
          setNodeColorsSpec(settingsRes.data.data.nodeColors);
        }

        if (analyticsRes.data?.success) {
          setAnalyticsData(analyticsRes.data.data);
        }

        if (llmRes.data?.success && llmRes.data.data) {
          setLlmSettings(llmRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger, selectedCandidateId]);

  const handleToggleLLMProvider = async (newProvider, newModel) => {
    try {
      setLlmUpdating(true);
      const targetProvider = newProvider !== undefined ? newProvider : (llmSettings.provider === 'cloud' ? 'ollama' : 'cloud');
      const targetModel = newModel || llmSettings.ollamaModel;

      let res;
      try {
        res = await api.post('/workflow/llm-settings', {
          provider: targetProvider,
          ollamaModel: targetModel
        });
      } catch {
        res = await api.post('/settings/llm', {
          provider: targetProvider,
          ollamaModel: targetModel
        });
      }

      if (res.data?.success) {
        setLlmSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update LLM provider:', err);
    } finally {
      setLlmUpdating(false);
    }
  };

  // Fetch Active Workflow & Logs when selectedCandidateId changes
  useEffect(() => {
    if (!selectedCandidateId) return;

    const fetchWorkflow = async () => {
      try {
        const response = await api.get(`/workflow/candidate/${selectedCandidateId}`);
        if (response.data?.success && response.data.data) {
          setSelectedWorkflow(response.data.data.workflow);
          setWorkflowLogs(response.data.data.logs);
        } else {
          setSelectedWorkflow(null);
          setWorkflowLogs([]);
        }
      } catch (err) {
        console.error('Error fetching workflow details:', err);
      }
    };
    fetchWorkflow();
  }, [selectedCandidateId, refreshTrigger]);

  const handleApproveWorkflow = async (decision) => {
    if (!selectedWorkflow) return;
    try {
      setWorkflowActionLoading(true);
      await api.post('/workflow/approve', {
        workflowId: selectedWorkflow._id,
        decision
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to approve/reject workflow:', err);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  const handleRetryWorkflow = async () => {
    if (!selectedWorkflow) return;
    try {
      setWorkflowActionLoading(true);
      await api.post('/workflow/retry', {
        workflowId: selectedWorkflow._id
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Failed to retry workflow:', err);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setFormError('');
    setJobCreating(true);

    const requiredArray = jobRequiredSkills
      ? jobRequiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const preferredArray = jobPreferredSkills
      ? jobPreferredSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    try {
      const response = await api.post('/jobs', {
        title: jobTitle,
        description: jobDesc,
        min_experience: Number(jobMinExp),
        required_skills: requiredArray,
        preferred_skills: preferredArray,
        workflow_spec_id: 'default-hiring-workflow'
      });

      if (response.data.success) {
        setJobTitle('');
        setJobDesc('');
        setJobMinExp(0);
        setJobRequiredSkills('');
        setJobPreferredSkills('');
        setShowCreateModal(false);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create Job Specification.');
    } finally {
      setJobCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Keyboard shortcut listener for search overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSearchOverlay(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchOverlay(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex w-full">
      {/* SideNavBar */}
      <aside className="bg-surface-container-lowest border-r border-outline-variant w-64 h-screen fixed left-0 top-0 flex flex-col py-md px-sm gap-xs z-50 select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-sm px-sm mb-lg">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">AgentHire AI</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Enterprise Recruiter</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="primary-gradient text-white font-label-md text-label-md py-sm px-md rounded-xl flex items-center justify-center gap-xs mb-md transition-transform active:scale-95 shadow-sm w-full"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          New Job Spec
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-xs">
          <button
            onClick={() => openDashboardTab('overview')}
            className={`w-full flex items-center gap-sm px-sm py-xs transition-all ${activeTab === 'overview'
                ? 'relative bg-secondary-container bg-opacity-10 text-primary border-l-4 border-primary rounded-r-lg font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg'
              }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Overview</span>
          </button>

          <button
            onClick={() => openDashboardTab('jobs')}
            className={`w-full flex items-center gap-sm px-sm py-xs transition-all ${activeTab === 'jobs'
                ? 'relative bg-secondary-container bg-opacity-10 text-primary border-l-4 border-primary rounded-r-lg font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'jobs' ? "'FILL' 1" : undefined }}>description</span>
            <span className="font-label-md text-label-md">Job Specs</span>
          </button>

          <button
            onClick={() => openDashboardTab('candidates')}
            className={`w-full flex items-center gap-sm px-sm py-xs transition-all ${activeTab === 'candidates'
                ? 'relative bg-secondary-container bg-opacity-10 text-primary border-l-4 border-primary rounded-r-lg font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg'
              }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md">Candidates</span>
          </button>

          <button
            onClick={() => openDashboardTab('workflows')}
            className={`w-full flex items-center gap-sm px-sm py-xs transition-all ${activeTab === 'workflows'
                ? 'relative bg-secondary-container bg-opacity-10 text-primary border-l-4 border-primary rounded-r-lg font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg'
              }`}
          >
            <span className="material-symbols-outlined">schema</span>
            <span className="font-label-md text-label-md">AI Workflows</span>
          </button>

          <button
            onClick={() => openDashboardTab('analytics')}
            className={`w-full flex items-center gap-sm px-sm py-xs transition-all ${activeTab === 'analytics'
                ? 'relative bg-secondary-container bg-opacity-10 text-primary border-l-4 border-primary rounded-r-lg font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg'
              }`}
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-label-md text-label-md">Analytics</span>
          </button>
        </nav>

        {/* Footer Links */}
        <div className="mt-auto border-t border-outline-variant pt-md space-y-xs">
          <button
            onClick={() => setUtilityTab('support')}
            className="w-full flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all rounded-lg text-left"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </button>
          <button
            onClick={() => setUtilityTab('settings')}
            className="w-full flex items-center gap-sm px-sm py-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all rounded-lg text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-sm px-sm py-xs text-error hover:bg-error-container/20 transition-all rounded-lg text-left font-bold"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 flex flex-col min-h-screen w-[calc(100%-16rem)]">
        {/* Top Bar Header */}
        <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center w-full px-margin-desktop py-base shadow-sm">
          <div className="flex items-center gap-md">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant pointer-events-none">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                className="bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-xs w-80 font-body-sm text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                onClick={() => setShowSearchOverlay(true)}
                placeholder="Search job specs, agents..."
                type="text"
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-md">
            {/* LLM Mode Switcher */}
            <div className="flex items-center bg-surface-container-low border border-outline-variant p-1 rounded-xl gap-1 text-xs">
              <button
                onClick={() => handleToggleLLMProvider('cloud')}
                disabled={llmUpdating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  llmSettings.provider === 'cloud'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
                title="Groq (Cloud) with OpenRouter fallback"
              >
                <span className="material-symbols-outlined text-[16px]">cloud</span>
                <span>Cloud (Groq)</span>
              </button>

              <button
                onClick={() => handleToggleLLMProvider('ollama')}
                disabled={llmUpdating}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  llmSettings.provider === 'ollama'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
                title={llmSettings.ollamaStatus?.online ? `Local Ollama (${llmSettings.ollamaModel}) Connected` : 'Local Ollama (Offline / Not Running)'}
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span>Local Ollama</span>
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    llmSettings.ollamaStatus?.online ? 'bg-emerald-300 animate-pulse' : 'bg-red-400'
                  }`}
                  title={llmSettings.ollamaStatus?.online ? 'Ollama Online' : 'Ollama Offline'}
                />
              </button>

              {llmSettings.provider === 'ollama' && llmSettings.ollamaStatus?.models?.length > 0 && (
                <select
                  value={llmSettings.ollamaModel}
                  onChange={(e) => handleToggleLLMProvider('ollama', e.target.value)}
                  className="bg-surface-container border-0 rounded-lg text-body-xs font-semibold px-2 py-1 text-on-surface outline-none cursor-pointer"
                >
                  {llmSettings.ollamaStatus.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            <button className="relative p-2 text-on-surface-variant hover:bg-surface-container transition-colors rounded-full">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <div className="flex items-center gap-sm cursor-pointer group">
              <img
                className="w-10 h-10 rounded-full border-2 border-primary-container object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE-myMv2X5CZAxy8CmDA0hwZGGYFV4R1ICsaVovC2V_WbqG0RQvb8zobzvvNZdKkT9pgcAWNbZrh4p5FMmynVyqgFsT6sUf1m8tLqgtkUVyY_wKM65vyWpIMwHGXAI_S1yUzTC_S5usNysD1SKuvMu3vQ1gZbFGrX_WPhxm8s8q05BBUGJdZ3oHRjvuypbFqNkC8jZOH6yHEMxqLuFi3ZRDLZuYWRl_bpRPoyEynpH8hCx-URxX_EPvnajW9ZvmnxuUljmyMpuJNs"
                alt="Sarah Jenkins"
              />
              <div className="hidden lg:block text-left">
                <p className="font-label-md text-label-md text-primary">{user?.name || 'Sarah Jenkins'}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{user?.email ? 'HR Partner' : 'Sr. Talent Partner'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Outer container */}
        <div className="flex-grow w-full px-margin-desktop py-lg max-w-container-max mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-lg text-left">
                  <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
                    <div>
                      <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">Recruitment Funnel</h1>
                      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">AI-optimized hiring overview for the current sprint.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="primary-gradient text-on-primary font-label-md text-label-md px-lg py-sm rounded-xl flex items-center gap-xs shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
                      New Job Spec
                    </button>
                  </section>

                  {/* Funnel Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Active Job Specs</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{jobs.length}</span>
                    </div>
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-on-primary-fixed-variant uppercase tracking-wider">Total Applicants</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{candidates.length}</span>
                    </div>
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">Pending Screening</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{candidates.filter(c => c.status === 'pending').length}</span>
                    </div>
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-error uppercase tracking-wider">Shortlisted Matches</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{candidates.filter(c => c.status === 'shortlist').length}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    <div className="lg:col-span-8 bg-surface-container-lowest p-md rounded-[24px] border border-outline-variant shadow-sm flex flex-col gap-md">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Submissions</h3>
                      <div className="divide-y divide-outline-variant/30">
                        {candidates.slice(0, 5).map((c) => (
                          <div key={c._id} className="py-sm flex justify-between items-center hover:bg-surface-bright rounded-lg px-xs transition-colors">
                            <div>
                              <p className="font-label-md text-label-md text-primary">{c.name}</p>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">{c.email} • {c.phone || 'No phone'}</p>
                            </div>
                            <span className={`px-sm py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.status === 'shortlist' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                              {c.status}
                            </span>
                          </div>
                        ))}
                        {candidates.length === 0 && (
                          <p className="text-center py-md text-on-surface-variant font-body-sm">No applications received yet.</p>
                        )}
                      </div>
                      <button
                        onClick={() => openDashboardTab('candidates')}
                        className="mt-auto text-primary font-label-md text-label-md hover:underline text-center w-full pt-sm border-t border-outline-variant/30"
                      >
                        View All Candidates
                      </button>
                    </div>

                    {/* Agent Status Panel */}
                    <div className="lg:col-span-4 bg-[#F8F5EF] p-md rounded-[24px] border border-outline-variant flex flex-col justify-between h-full">
                      <div className="flex items-center gap-xs mb-md">
                        <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">Agent System Status</h3>
                      </div>

                      <div className="space-y-sm flex-grow">
                        <div className="bg-white p-sm rounded-xl border border-outline-variant flex justify-between items-center">
                          <div className="flex items-center gap-xs">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="font-body-md text-body-md text-on-surface">Sourcing Agent</span>
                          </div>
                          <span className="px-sm py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full">Active</span>
                        </div>
                        <div className="bg-white p-sm rounded-xl border border-outline-variant flex justify-between items-center">
                          <div className="flex items-center gap-xs">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="font-body-md text-body-md text-on-surface">Screening Logic</span>
                          </div>
                          <span className="px-sm py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full">Active</span>
                        </div>
                        <div className="bg-white p-sm rounded-xl border border-outline-variant flex justify-between items-center">
                          <div className="flex items-center gap-xs">
                            <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></span>
                            <span className="font-body-md text-body-md text-on-surface">Workflow Engine</span>
                          </div>
                          <span className="px-sm py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-full">Running</span>
                        </div>
                      </div>

                      <button
                        onClick={() => openDashboardTab('workflows')}
                        className="mt-lg w-full py-sm border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-label-md text-label-md rounded-xl"
                      >
                        Manage All Agents
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: JOB SPECS */}
              {activeTab === 'jobs' && (
                <div className="text-left">
                  {/* Header Section */}
                  <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
                    <div>
                      <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">Job Specifications</h1>
                      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                        Manage your AI-powered recruitment agents and fine-tune your hiring logic for every role in your pipeline.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="primary-gradient text-on-primary font-label-md text-label-md px-lg py-sm rounded-xl flex items-center gap-xs shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
                      New Job Spec
                    </button>
                  </section>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Total Specs</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{jobs.length}</span>
                    </div>
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-on-primary-fixed-variant uppercase tracking-wider">Active Agents</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{jobs.length}</span>
                    </div>
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">Candidates Matching</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{candidates.length}</span>
                    </div>
                    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
                      <span className="font-label-sm text-label-sm text-error uppercase tracking-wider">Attention Required</span>
                      <span className="font-headline-lg text-headline-lg text-on-surface">{candidates.filter(c => c.status === 'pending').length}</span>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex items-center justify-between mb-md">
                    <div className="flex items-center gap-sm">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md">filter_list</span>
                        <select className="pl-10 pr-lg py-xs bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm appearance-none focus:ring-2 focus:ring-primary-container focus:outline-none transition-all">
                          <option>Status: All</option>
                          <option>Status: Active</option>
                        </select>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md">psychology</span>
                        <select className="pl-10 pr-lg py-xs bg-white border border-outline-variant rounded-lg font-body-sm text-body-sm appearance-none focus:ring-2 focus:ring-primary-container focus:outline-none transition-all">
                          <option>Logic: All Types</option>
                          <option>Logic: Neural Sourcing</option>
                          <option>Logic: Behavioral Analysis</option>
                          <option>Logic: Technical Deep-Dive</option>
                        </select>
                      </div>
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">
                      Showing <span className="font-bold text-on-surface">{jobs.length}</span> of {jobs.length} specifications
                    </div>
                  </div>

                  {/* Bento Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {jobs.map((job, idx) => {
                      const logicTypes = ['Neural Sourcing', 'Technical Deep-Dive', 'Behavioral Analysis'];
                      const logicType = logicTypes[idx % logicTypes.length];
                      const matchedCount = candidates.filter(c => c.status === 'shortlist').length || Math.floor((idx + 1) * 7.5);

                      return (
                        <article key={job._id} className="bg-white border border-outline-variant rounded-[24px] p-md shadow-sm card-hover transition-all flex flex-col gap-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-headline-sm text-headline-sm text-on-surface">{job.title}</h3>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">Engineering • Remote / Hybrid</p>
                            </div>
                            <span className="px-sm py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full tracking-widest">Active</span>
                          </div>

                          <div className="bg-surface-container-low rounded-xl p-sm border border-outline-variant/30">
                            <p className="font-body-sm text-body-sm italic text-on-secondary-container leading-relaxed line-clamp-3">
                              "{job.description}"
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-sm">
                            <div className="flex flex-col">
                              <span className="font-label-sm text-[10px] text-secondary uppercase">Matching</span>
                              <span className="font-headline-sm text-headline-sm">{matchedCount}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-label-sm text-[10px] text-secondary uppercase">Logic Type</span>
                              <span className="font-body-md text-body-md font-semibold text-primary">{logicType}</span>
                            </div>
                          </div>

                          <div className="mt-auto pt-md border-t border-outline-variant flex items-center justify-between">
                            <div className="flex -space-x-2">
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXeQXRLeQJU-i5vE99znIsdXv8JyuMyJ3lK5fqk6mmcdqrqquK_XjG5GxTuySOvadPSngYMKGf-cW1VaYM2jDanD8dfE5km-UglLlL8ud88_S7SOj0MQHFlMkaRKGmhaBisPhXVnWv7cXThu4RJTN49u6PbdWmQIRY8sqqfbaG3DBxKaB7wAJxdeW3_WmoFmZuH5ySNgXD10pTiuG0Cdspiljp1OgAxwYkvu9i0Mw_dOWdyJz1IA5pMm7dExvGBI4KgqB6sC4m3hc" alt="avatar" />
                              </div>
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden">
                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9tnGCPeSCTfd7wv746pDlD3e0BcUCjUeJcEaVXf77VqnIIA9QsX1N_WHZqASToH6Vf8U3T3h1Fyf4t_uSPXWmmUwlZxV2ttyXFETvVLHtV1F9msUiBrwkkuUle_LqwcmYHUHozpyJENGBtu7C9iKW697kpuEP-Mm6w6_zrcXlImuV4u0DdjnBI_Ad3tlkXUB1J1gMeKxvMT8qJEPcJDA4iZ71RsNRXKZz6mgbRx8nuSr_FnpHrYjKvk53YprE9NT2q0ZSBJLUejA" alt="avatar" />
                              </div>
                            </div>
                            <div className="flex gap-sm">
                              <Link to={`/jobs/${job._id}`} target="_blank" className="text-primary font-label-md text-label-md hover:underline">Public Link ↗</Link>
                              <button onClick={() => openDashboardTab('workflows')} className="text-primary font-label-md text-label-md hover:underline">View Agent Logs</button>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                    {/* Empty State Card */}
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-surface-container-low border-2 border-dashed border-outline-variant rounded-[24px] p-md flex flex-col items-center justify-center gap-sm hover:bg-surface-container hover:border-primary-container transition-all group min-h-[300px] text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary-container shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'opsz' 48" }}>add_circle</span>
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface">New Job Spec</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Let AI help you define the perfect role</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CANDIDATES */}
              {activeTab === 'candidates' && (
                <div className="space-y-lg text-left">
                  {/* Header Section */}
                  <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
                    <div>
                      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Candidate Pipeline</h1>
                      <p className="font-body-md text-body-md text-on-surface-variant">Manage and evaluate your top AI-matched talent pool across all open roles.</p>
                    </div>
                    <div className="flex gap-sm">
                      <button className="px-md py-xs rounded-lg border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-on-surface hover:shadow-md transition-all flex items-center gap-xs">
                        <span className="material-symbols-outlined text-body-md">upload</span> Import CSV
                      </button>
                      <button className="px-md py-xs rounded-lg primary-gradient text-white font-label-md text-label-md hover:opacity-90 transition-all flex items-center gap-xs">
                        <span className="material-symbols-outlined text-body-md">add</span> Add Candidate
                      </button>
                    </div>
                  </div>

                  {/* Bento Filter Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
                    {/* Search & Basic Filter */}
                    <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs block">Search Candidates</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">search</span>
                        <input
                          type="text"
                          placeholder="Name, email, or status..."
                          className="w-full pl-10 pr-md py-xs rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-tertiary-container focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    {/* Match Threshold */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs block">Min. AI Match</label>
                      <div className="flex items-center gap-sm mt-2">
                        <input type="range" min="0" max="100" defaultValue="75" className="w-full accent-primary-container" />
                        <span className="font-label-md text-label-md text-primary font-bold">75%</span>
                      </div>
                    </div>
                    {/* Quick Actions Grid */}
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex items-center justify-between">
                      <div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant block">Active Filters</span>
                        <div className="flex gap-xs mt-xs">
                          <span className="bg-secondary-container/20 text-secondary text-[10px] px-2 py-0.5 rounded-full font-bold border border-secondary/20">Remote</span>
                          <span className="bg-primary-container/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold border border-primary/20">Senior</span>
                        </div>
                      </div>
                      <button className="text-primary font-label-sm text-label-sm hover:underline">Clear all</button>
                    </div>
                  </div>

                  {/* Main Candidates Table View */}
                  <div className="bg-white rounded-[24px] shadow-sm border border-outline-variant overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#F8F5EF] border-b border-outline-variant">
                            <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant">Candidate</th>
                            <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant">Contact Details</th>
                            <th className="px-md py-sm text-center font-label-md text-label-md text-on-surface-variant">AI Match</th>
                            <th className="px-md py-sm text-left font-label-md text-label-md text-on-surface-variant">Status</th>
                            <th className="px-md py-sm text-right font-label-md text-label-md text-on-surface-variant">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {candidates.length > 0 ? (
                            candidates.map((c) => (
                              <tr key={c._id} className="hover:bg-[#FFFDF8] transition-colors group">
                                <td className="px-md py-md">
                                  <div className="flex items-center gap-sm">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center">
                                      <span className="material-symbols-outlined text-secondary text-[24px]">person</span>
                                    </div>
                                    <div>
                                      <div className="font-label-md text-label-md text-on-surface">{c.name}</div>
                                      <div className="font-body-sm text-body-sm text-on-surface-variant">Applicant</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-md py-md">
                                  <div className="font-body-sm text-body-sm text-on-surface font-semibold mb-1">{c.email}</div>
                                  <div className="font-body-sm text-body-sm text-on-surface-variant">{c.phone || 'No Phone Number'}</div>
                                </td>
                                <td className="px-md py-md text-center">
                                  <div className="inline-flex flex-col items-center">
                                    <span className="text-headline-sm font-headline-sm text-tertiary">
                                      {c.match_score !== null && c.match_score !== undefined ? `${c.match_score}%` : 'N/A'}
                                    </span>
                                    <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden mt-1">
                                      <div
                                        className="bg-tertiary h-full"
                                        style={{ width: `${c.match_score || 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-md py-md">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${c.status === 'shortlist'
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : c.status === 'reject'
                                        ? 'bg-red-100 text-red-700 border-red-200'
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    }`}>
                                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                  </span>
                                </td>
                                <td className="px-md py-md text-right">
                                  <div className="flex justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    {c.resume_url && (
                                      <a
                                        href={`http://localhost:5000${c.resume_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low text-on-surface-variant"
                                        title="Download Resume"
                                      >
                                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                      </a>
                                    )}
                                    <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low text-on-surface-variant" title="Message">
                                      <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                                    </button>
                                    <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low text-on-surface-variant" title="Schedule">
                                      <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    </button>
                                    <button className="p-2 rounded-lg bg-primary-container text-white hover:opacity-90" title="Approve">
                                      <span className="material-symbols-outlined text-[20px]">check</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="px-md py-lg text-center text-on-surface-variant italic">
                                No candidate applications found yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination/Footer */}
                    <div className="px-md py-sm bg-[#F8F5EF] flex items-center justify-between border-t border-outline-variant">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Showing 1 to {candidates.length} of {candidates.length} candidates
                      </span>
                      <div className="flex gap-xs">
                        <button className="p-1 rounded border border-outline-variant bg-white disabled:opacity-50" disabled>
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 rounded bg-primary text-white font-label-md text-label-md">1</button>
                        <button className="p-1 rounded border border-outline-variant bg-white disabled:opacity-50" disabled>
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Floating Insight Card (Bento Style) */}
                  <div className="mt-lg grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-md flex gap-md items-start">
                      <div className="p-3 bg-primary-container rounded-xl text-white">
                        <span className="material-symbols-outlined">bolt</span>
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-primary">AI Insight</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Based on recent hiring trends, candidates with 'Product Design' and 'React' skills are getting 40% more approvals.</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-md flex flex-col justify-between">
                      <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Avg. Time to Hire</div>
                      <div className="mt-2 flex items-baseline gap-xs">
                        <span className="font-display-lg text-[32px] text-on-surface font-bold">14.2</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">days</span>
                      </div>
                      <div className="mt-2 text-green-600 font-label-sm text-label-sm flex items-center">
                        <span className="material-symbols-outlined text-sm">arrow_upward</span> 2.4% vs last month
                      </div>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-md flex flex-col justify-between">
                      <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pipeline Health</div>
                      <div className="mt-2 flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-orange-400 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white flex items-center justify-center text-[10px] font-bold">+12</div>
</div>
                      <div className="mt-2 font-label-md text-label-md text-on-surface">3 Active Interviews Today</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: WORKFLOWS */}
              {activeTab === 'workflows' && (
                <div className="space-y-lg text-left">
                  {/* Header & Top Metrics */}
                  <section className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg">
                    <div>
                      <h1 className="font-headline-lg text-headline-lg text-on-surface">Orchestration Engine</h1>
                      <p className="text-on-surface-variant font-body-md text-body-md">Monitoring spec-driven LangGraph pipeline execution, checkpoints, and human intervention points.</p>
                    </div>
                    <div className="flex flex-wrap gap-sm">
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm min-w-[140px] shadow-sm">
                        <span className="text-on-surface-variant font-label-sm text-label-sm block mb-1">Workflow Status</span>
                        <div className="flex items-center gap-xs">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            selectedWorkflow?.status === 'running' ? 'bg-blue-500 animate-pulse' :
                            selectedWorkflow?.status === 'paused_approval' ? 'bg-yellow-500 animate-ping' :
                            selectedWorkflow?.status === 'success' ? 'bg-green-500' :
                            selectedWorkflow?.status === 'failed' ? 'bg-red-500' : 'bg-outline'
                          }`}></div>
                          <span className="font-headline-sm text-headline-sm text-on-surface uppercase text-xs font-bold">
                            {selectedWorkflow ? selectedWorkflow.status.replace('_', ' ') : 'NO WORKFLOW'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-sm min-w-[140px] shadow-sm">
                        <span className="text-on-surface-variant font-label-sm text-label-sm block mb-1">Checkpointer</span>
                        <span className="text-primary font-label-md text-label-md flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">database</span> MongoDB State
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Main Workspace Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    {/* Left Candidate List */}
                    <div className="lg:col-span-3 bg-white border border-outline-variant rounded-[24px] p-md shadow-sm overflow-hidden flex flex-col gap-sm">
                      <h3 className="font-label-md text-label-md font-bold text-on-surface">Select Candidate</h3>
                      <div className="space-y-xs overflow-y-auto max-h-[500px] pr-xs">
                        {candidates.map((c) => (
                          <button
                            key={c._id}
                            onClick={() => setSelectedCandidateId(c._id)}
                            className={`w-full text-left p-sm rounded-xl border transition-all ${
                              selectedCandidateId === c._id
                                ? 'bg-primary-container/10 border-primary text-primary font-bold'
                                : 'border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
                            }`}
                          >
                            <p className="text-body-sm font-semibold truncate">{c.name}</p>
                            <p className="text-[10px] uppercase mt-0.5 tracking-wider opacity-85">{c.status}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Middle Column: Graph Visualization & Node Status */}
                    <div className="lg:col-span-6 space-y-gutter">
                      {/* Visual Node-based Status Indicators */}
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
                        <div className="flex items-center justify-between mb-lg">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-xs">
                            <span className="material-symbols-outlined text-primary">account_tree</span>
                            Workflow Execution Graph
                          </h3>
                        </div>

                        <div className="relative min-h-[420px] bg-surface-container-low rounded-xl p-md border border-dashed border-outline-variant flex flex-col justify-around">
                          {/* Sourcing & Screening Node list */}
                          {[
                            { key: 'resume_parser', title: 'Resume Parser', icon: 'picture_as_pdf', desc: 'Real PDF Text Extraction' },
                            { key: 'embedding_agent', title: 'Embedding Agent', icon: 'database', desc: 'Qdrant Vector Database Ingest' },
                            { key: 'matching_agent', title: 'Matching Agent', icon: 'compare_arrows', desc: 'RAG Compatibility Analysis' },
                            { key: 'shortlisting_agent', title: 'Shortlisting Agent', icon: 'rule', desc: 'Spec Threshold Check' },
                            { key: 'human_approval', title: 'Human Approval', icon: 'rate_review', desc: 'Manual Resume Verification' },
                            { key: 'interview_agent', title: 'Interview Agent', icon: 'quiz', desc: 'Tailored Technical Assessment' },
                            { key: 'email_agent', title: 'Email Agent', icon: 'mail', desc: 'Email Notification Dispatch' }
                          ].map((step, idx, arr) => {
                            // Determine node state & color
                            let stateColor = 'bg-surface-variant border-outline text-on-surface-variant opacity-60';
                            let badge = 'Pending';
                            let iconColor = 'bg-surface-container-highest text-on-surface-variant';

                            if (selectedWorkflow) {
                              const sequence = arr.map(a => a.key);
                              const currentIdx = sequence.indexOf(selectedWorkflow.current_state);
                              const nodeIdx = sequence.indexOf(step.key);

                              if (selectedWorkflow.status === 'success') {
                                stateColor = 'bg-green-50 border-green-500 text-green-700 font-semibold';
                                iconColor = 'bg-green-500 text-white';
                                badge = 'Completed';
                              } else if (nodeIdx < currentIdx) {
                                stateColor = 'bg-green-50 border-green-500 text-green-700 font-semibold';
                                iconColor = 'bg-green-500 text-white';
                                badge = 'Completed';
                              } else if (nodeIdx === currentIdx) {
                                if (selectedWorkflow.status === 'running') {
                                  stateColor = 'bg-blue-50 border-blue-500 text-blue-700 font-bold';
                                  iconColor = 'bg-blue-500 text-white animate-pulse';
                                  badge = 'Running...';
                                } else if (selectedWorkflow.status === 'paused_approval') {
                                  stateColor = 'bg-yellow-50 border-yellow-500 text-yellow-700 font-bold';
                                  iconColor = 'bg-yellow-500 text-white animate-bounce';
                                  badge = 'Needs Review';
                                } else if (selectedWorkflow.status === 'failed') {
                                  stateColor = 'bg-red-50 border-red-500 text-red-700 font-bold';
                                  iconColor = 'bg-red-500 text-white';
                                  badge = 'Failed';
                                }
                              }
                            }

                            return (
                              <div key={step.key} className="relative flex items-center gap-md">
                                {/* Connector line to next node */}
                                {idx < arr.length - 1 && (
                                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-outline-variant -z-10"></div>
                                )}
                                
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm ${iconColor}`}>
                                  <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                                </div>

                                <div className={`flex-1 border p-xs rounded-xl shadow-sm transition-all flex items-center justify-between ${stateColor}`}>
                                  <div>
                                    <span className="block font-label-md text-label-md font-bold">{step.title}</span>
                                    <span className="text-[10px] opacity-80">{step.desc}</span>
                                  </div>
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider mr-xs">{badge}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Live Logs & Configuration */}
                    <div className="lg:col-span-3 space-y-gutter">
                      {/* Interactive Action Controls Panel */}
                      {selectedWorkflow && (
                        <div className="bg-[#F8F5EF] border border-outline-variant rounded-xl p-md shadow-sm">
                          <h3 className="font-label-md text-label-md font-bold text-on-surface mb-sm flex items-center gap-xs">
                            <span className="material-symbols-outlined text-primary">pending_actions</span>
                            Emergency & Execution Controls
                          </h3>
                          
                          {selectedWorkflow.status === 'paused_approval' && (
                            <div className="space-y-xs">
                              <p className="text-body-sm text-on-surface-variant mb-xs">This candidate is paused for manual recruiter review. Please review their match score and decide:</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveWorkflow('approve')}
                                  disabled={workflowActionLoading}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-sm rounded-lg flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-xs">check_circle</span> Approve
                                </button>
                                <button
                                  onClick={() => handleApproveWorkflow('reject')}
                                  disabled={workflowActionLoading}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-sm rounded-lg flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <span className="material-symbols-outlined text-xs">cancel</span> Reject
                                </button>
                              </div>
                            </div>
                          )}

                          {selectedWorkflow.status === 'failed' && (
                            <div className="space-y-xs">
                              <p className="text-body-sm text-on-surface-variant mb-xs">The workflow failed at node <strong>{selectedWorkflow.current_state}</strong>.</p>
                              <button
                                onClick={handleRetryWorkflow}
                                disabled={workflowActionLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-sm rounded-lg flex items-center justify-center gap-1 shadow-sm"
                              >
                                <span className="material-symbols-outlined text-xs">replay</span> Retry Failed Node
                              </button>
                            </div>
                          )}

                          {selectedWorkflow.status === 'success' && (
                            <p className="text-body-sm text-green-700 font-semibold bg-green-50 p-sm rounded-lg border border-green-200">
                              ✓ Workflow completed successfully. Sourcing output email notifications successfully delivered.
                            </p>
                          )}

                          {selectedWorkflow.status === 'running' && (
                            <div className="flex items-center gap-sm bg-blue-50 p-sm rounded-lg border border-blue-200 text-blue-700 font-semibold">
                              <span className="material-symbols-outlined animate-spin text-blue-500">sync</span>
                              <span className="text-body-sm">AI Agents are running calculations...</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Live Log Stream */}
                      <div className="bg-inverse-surface text-surface-container-low rounded-xl shadow-xl overflow-hidden flex flex-col h-[350px]">
                        <div className="px-md py-sm border-b border-surface-variant/10 flex items-center justify-between">
                          <div className="flex items-center gap-xs">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <h3 className="font-label-md text-label-md font-bold uppercase tracking-wider">Live Log Stream</h3>
                          </div>
                        </div>
                        <div className="flex-1 p-md font-mono text-[11px] leading-relaxed overflow-y-auto custom-scrollbar log-gradient" id="log-container">
                          {workflowLogs.length > 0 ? (
                            workflowLogs.map((log, idx) => (
                              <div key={log._id || idx} className="mb-2 border-b border-white/5 pb-1">
                                <div className="flex justify-between items-center text-[10px] opacity-75">
                                  <span className="text-primary-fixed-dim">{log.agent_name.toUpperCase()}</span>
                                  <span className={log.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                                    {log.status.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-white/90 whitespace-pre-wrap mt-0.5">
                                  {log.status === 'success'
                                    ? JSON.stringify(log.output?.data || log.output || {}, null, 1)
                                    : log.error || 'Unknown Error'}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center py-10 text-surface-variant/40 italic">No execution logs found.</p>
                          )}
                        </div>
                      </div>

                      {/* System Config / Checkpointer Details */}
                      <div className="bg-white border border-outline-variant rounded-xl p-md shadow-sm">
                        <h3 className="font-label-md text-label-md font-bold text-on-surface mb-md">Spec System Configuration</h3>
                        <div className="space-y-sm">
                          <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                            <span className="text-body-sm text-on-surface-variant">Default LLM Provider</span>
                            <span className="text-label-sm font-bold bg-surface-container px-2 rounded">
                              {llmSettings.provider === 'ollama' ? `Local Ollama (${llmSettings.ollamaModel})` : 'Groq (Fallback: OpenRouter)'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                            <span className="text-body-sm text-on-surface-variant">Persistence Layer</span>
                            <span className="text-label-sm font-bold bg-green-50 text-green-700 px-2 rounded">MongoDB Mongoose</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-body-sm text-on-surface-variant">Graph Checkpoints</span>
                            <span className="text-label-sm font-bold text-on-surface">Every Agent Step</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-t border-outline-variant">
                            <span className="text-body-sm text-on-surface-variant">Approval Node Color</span>
                            <span className="text-label-sm font-bold text-on-surface">{nodeColorsSpec.waiting_approval}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-lg text-left animate-fade-in">
                  {/* Header Section */}
                  <header className="flex flex-col md:flex-row md:items-end justify-between gap-md">
                    <div>
                      <h1 className="font-headline-lg text-headline-lg text-on-surface">Recruitment Performance</h1>
                      <p className="font-body-md text-body-md text-on-surface-variant">Real-time insights across your talent acquisition pipeline.</p>
                    </div>
                    <div className="flex gap-sm">
                      <button className="flex items-center gap-xs px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-all">
                        <span className="material-symbols-outlined">calendar_today</span>
                        Last 30 Days
                      </button>
                      <button className="flex items-center gap-xs px-md py-sm primary-gradient text-white rounded-lg font-label-md text-label-md shadow-sm hover:opacity-90 transition-all">
                        <span className="material-symbols-outlined">download</span>
                        Export Data
                      </button>
                    </div>
                  </header>

                  {/* KPI Bento Grid */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    {/* Metric 1 */}
                    <div className="bg-white border border-outline-variant shadow-sm p-md rounded-xl hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-sm">
                        <div className="p-xs bg-primary-fixed rounded-lg text-primary">
                          <span className="material-symbols-outlined">stars</span>
                        </div>
                      </div>
                      <h3 className="font-label-md text-label-md text-on-surface-variant">Average Match Score</h3>
                      <div className="mt-xs flex items-baseline gap-xs">
                        <span className="font-headline-md text-headline-md text-on-surface">
                          {analyticsData ? `${analyticsData.avgMatchScore}%` : '75%'}
                        </span>
                      </div>
                    </div>
                    {/* Metric 2 */}
                    <div className="bg-white border border-outline-variant shadow-sm p-md rounded-xl hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-sm">
                        <div className="p-xs bg-tertiary-fixed rounded-lg text-tertiary">
                          <span className="material-symbols-outlined">check_circle</span>
                        </div>
                      </div>
                      <h3 className="font-label-md text-label-md text-on-surface-variant">Shortlist Rate</h3>
                      <div className="mt-xs flex items-baseline gap-xs">
                        <span className="font-headline-md text-headline-md text-on-surface">
                          {analyticsData ? `${analyticsData.rates.shortlist}%` : '40%'}
                        </span>
                      </div>
                      <div className="mt-md relative h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 primary-gradient" style={{ width: `${analyticsData ? analyticsData.rates.shortlist : 40}%` }}></div>
                      </div>
                    </div>
                    {/* Metric 3 */}
                    <div className="bg-white border border-outline-variant shadow-sm p-md rounded-xl hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-sm">
                        <div className="p-xs bg-secondary-fixed rounded-lg text-secondary">
                          <span className="material-symbols-outlined">bolt</span>
                        </div>
                      </div>
                      <h3 className="font-label-md text-label-md text-on-surface-variant">Workflow Completion Rate</h3>
                      <div className="mt-xs flex items-baseline gap-xs">
                        <span className="font-headline-md text-headline-md text-on-surface">
                          {analyticsData ? `${analyticsData.rates.completion}%` : '100%'}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Charts & Leaderboard Row */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-md">
                    {/* Performance Trend Chart */}
                    <div className="lg:col-span-2 bg-white border border-outline-variant shadow-sm p-md rounded-xl">
                      <div className="flex justify-between items-center mb-lg">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Hiring Pipeline Velocity</h2>
                        <div className="flex gap-sm">
                          <div className="flex items-center gap-xs">
                            <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Sourcing</span>
                          </div>
                          <div className="flex items-center gap-xs">
                            <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant">Interviewing</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-[300px] flex items-end justify-between px-xs">
                        <div className="absolute inset-0 border-b border-outline-variant flex flex-col justify-between py-xs pointer-events-none select-none">
                          <div className="border-t border-dashed border-outline-variant w-full opacity-20"></div>
                          <div className="border-t border-dashed border-outline-variant w-full opacity-20"></div>
                          <div className="border-t border-dashed border-outline-variant w-full opacity-20"></div>
                          <div className="border-t border-dashed border-outline-variant w-full opacity-20"></div>
                        </div>
                        <div className="relative flex-1 flex items-end justify-around gap-sm h-full pb-xs">
                          <div className="group relative flex items-end gap-1 h-full w-full max-w-[40px]">
                            <div className="bg-primary-container w-full h-[60%] rounded-t-lg transition-all hover:opacity-90"></div>
                            <div className="bg-secondary-container w-full h-[40%] rounded-t-lg transition-all hover:opacity-90"></div>
                          </div>
                          <div className="group relative flex items-end gap-1 h-full w-full max-w-[40px]">
                            <div className="bg-primary-container w-full h-[75%] rounded-t-lg transition-all hover:opacity-90"></div>
                            <div className="bg-secondary-container w-full h-[55%] rounded-t-lg transition-all hover:opacity-90"></div>
                          </div>
                          <div className="group relative flex items-end gap-1 h-full w-full max-w-[40px]">
                            <div className="bg-primary-container w-full h-[85%] rounded-t-lg transition-all hover:opacity-90"></div>
                            <div className="bg-secondary-container w-full h-[70%] rounded-t-lg transition-all hover:opacity-90"></div>
                          </div>
                          <div className="group relative flex items-end gap-1 h-full w-full max-w-[40px]">
                            <div className="bg-primary-container w-full h-[65%] rounded-t-lg transition-all hover:opacity-90"></div>
                            <div className="bg-secondary-container w-full h-[45%] rounded-t-lg transition-all hover:opacity-90"></div>
                          </div>
                          <div className="group relative flex items-end gap-1 h-full w-full max-w-[40px]">
                            <div className="bg-primary-container w-full h-[90%] rounded-t-lg transition-all hover:opacity-90"></div>
                            <div className="bg-secondary-container w-full h-[80%] rounded-t-lg transition-all hover:opacity-90"></div>
                          </div>
                          <div className="group relative flex items-end gap-1 h-full w-full max-w-[40px]">
                            <div className="bg-primary-container w-full h-[80%] rounded-t-lg transition-all hover:opacity-90"></div>
                            <div className="bg-secondary-container w-full h-[60%] rounded-t-lg transition-all hover:opacity-90"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-sm px-xs font-label-sm text-label-sm text-on-surface-variant">
                        <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                      </div>
                    </div>
                    {/* Recruiter Leaderboard */}
                    <div className="bg-white border border-outline-variant shadow-sm p-md rounded-xl overflow-hidden flex flex-col justify-between">
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-lg">Top Performers</h2>
                        <div className="space-y-sm">
                          <div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-low transition-colors group">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxIbZO0AmheMEpup74hFhx75yfHCOB8uvlGswRHGhtndw7yywee4XeYJAwgvsCKUhpmf2MVJrVFYpzcFapWZsxD-YRw_TKP-kYAS5sJL43LjtoXNspUkdoPZAUg1ifvUOfVUruO5K2r928QSrskpk7r6yQGBrP9ToCRCUJzYcU4t1eAMbU6rnsabnl6rOPpRXobuf3oMgWifbKoMVrW7mwD2uY087pvYITfnBr3ooOEbtjMqXitepzAP44fUwPlc9MX30yePdSKBc" alt="Alex Rivera" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px]">1</div>
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-label-md text-label-md text-on-surface">Alex Rivera</h4>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">8 Hires • 94% Accept</p>
                            </div>
                            <div className="text-right">
                              <span className="font-label-md text-label-md text-primary">Score 98</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-low transition-colors group">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-outline-variant">
                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAVFp17HauL0RYFy4EtIDTr8iCpaJcJ4vOJ5grJCnGUQveCGfVb-9Wuyk14qMfC7LSe7WiGc9UHJZQChotKXFM3lLB0o4mm4CsdnySBQ9diUhN-ARyvWfonDuLUz3KpCY5wvzOj64FwM8ke68VZ6Z6ePGU0eEhi5BJLDlujr5zyljdH9ScGLxRHci631zGy-fHKJS_u4JUewcCmFHri8Dbbs0ldmOnD4JdRvt4VYrdE_65UhYIqD-AsUYyGFPjdHikH2v1DcyCQQA" alt="Sarah Chen" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-surface-container-highest text-on-surface w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px]">2</div>
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-label-md text-label-md text-on-surface">Sarah Chen</h4>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">6 Hires • 88% Accept</p>
                            </div>
                            <div className="text-right">
                              <span className="font-label-md text-label-md text-on-surface">Score 91</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-md p-sm rounded-lg hover:bg-surface-container-low transition-colors group">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-outline-variant">
                                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkd0fcrYdVKeDnN-yUhd9H42w80UTzH6Pxa3NdLk9IHvNtKf9Qgp07HWoJwWnZsxuOqIPf7rRDOp8iisvfmvFw_mR-Cv39LXSWnXkR7mAP2DywDUyJKIIwwisVoz0rtGVt4TKoJpQtVirpK0dm9eXVkRlnrDr2za34SHOloyVZal3yKxCvkeL13wh3UYBVE2GnpFspQ93cIWifQkq7kJ7-a-mvcSN8RcG0GTE4tPzO4-trlCC8tjArZk6nzzk3ZyDxAke6-eOwSBY" alt="James Wilson" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-surface-container-highest text-on-surface w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-[10px]">3</div>
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-label-md text-label-md text-on-surface">James Wilson</h4>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">5 Hires • 85% Accept</p>
                            </div>
                            <div className="text-right">
                              <span className="font-label-md text-label-md text-on-surface">Score 87</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="w-full mt-lg py-sm font-label-md text-label-md text-primary border border-primary border-dashed rounded-lg hover:bg-primary-fixed transition-colors">
                        View Full Leaderboard
                      </button>
                    </div>
                  </section>

                  {/* Detailed Table Section */}
                  <section className="bg-white border border-outline-variant shadow-sm rounded-xl overflow-hidden">
                    <div className="px-md py-lg flex justify-between items-center border-b border-outline-variant">
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Placements</h2>
                      <div className="flex gap-xs">
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                          <input className="pl-xl pr-md py-xs bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-body-sm focus:ring-2 focus:ring-primary-container focus:outline-none w-64" placeholder="Search roles..." type="text" />
                        </div>
                        <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg">
                          <span className="material-symbols-outlined">filter_list</span>
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant">
                            <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Job Title</th>
                            <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Department</th>
                            <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Recruiter</th>
                            <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Status</th>
                            <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Days Open</th>
                            <th className="px-md py-sm font-label-md text-label-md text-on-surface-variant">Efficiency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                          <tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                            <td className="px-md py-md font-body-md text-body-md text-on-surface font-semibold">Sr. Product Designer</td>
                            <td className="px-md py-md text-on-surface-variant">Design</td>
                            <td className="px-md py-md text-on-surface-variant">Sarah Chen</td>
                            <td className="px-md py-md"><span className="px-sm py-1 bg-green-100 text-green-800 rounded-full font-label-sm text-label-sm">Filled</span></td>
                            <td className="px-md py-md text-on-surface-variant">24</td>
                            <td className="px-md py-md">
                              <div className="flex items-center gap-xs text-primary font-label-md">
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                98%
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                            <td className="px-md py-md font-body-md text-body-md text-on-surface font-semibold">Engineering Lead</td>
                            <td className="px-md py-md text-on-surface-variant">Engineering</td>
                            <td className="px-md py-md text-on-surface-variant">Alex Rivera</td>
                            <td className="px-md py-md"><span className="px-sm py-1 bg-amber-100 text-amber-800 rounded-full font-label-sm text-label-sm">In Progress</span></td>
                            <td className="px-md py-md text-on-surface-variant">12</td>
                            <td className="px-md py-md">
                              <div className="flex items-center gap-xs text-on-surface-variant font-label-md">
                                <span className="material-symbols-outlined text-[18px]">bolt</span>
                                84%
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
                            <td className="px-md py-md font-body-md text-body-md text-on-surface font-semibold">Account Executive</td>
                            <td className="px-md py-md text-on-surface-variant">Sales</td>
                            <td className="px-md py-md text-on-surface-variant">James Wilson</td>
                            <td className="px-md py-md"><span className="px-sm py-1 bg-green-100 text-green-800 rounded-full font-label-sm text-label-sm">Filled</span></td>
                            <td className="px-md py-md text-on-surface-variant">18</td>
                            <td className="px-md py-md">
                              <div className="flex items-center gap-xs text-primary font-label-md">
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                92%
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="px-md py-sm bg-surface-container-low flex justify-between items-center">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 3 of 42 entries</span>
                      <div className="flex gap-xs">
                        <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded transition-colors disabled:opacity-50" disabled><span className="material-symbols-outlined">chevron_left</span></button>
                        <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* TAB 6: SUPPORT */}
              {activeTab === 'support' && (
                <div className="space-y-md text-left">
                  <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">Support Center</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-lg">
                    Contact system administrators or read platform reference guidelines.
                  </p>

                  <div className="p-lg bg-surface-container-lowest border border-outline-variant rounded-[24px] shadow-sm text-center">
                    <div className="max-w-md mx-auto py-lg space-y-md">
                      <span className="material-symbols-outlined text-[64px] text-primary">support_agent</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Enterprise S.O.S</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        If you encounter problems with PDF parsing or server route validation limits, reach out directly to operations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-md text-left">
                  <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">Settings</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-lg">
                    Customize recruitment thresholds and integration parameters.
                  </p>

                  <div className="p-lg bg-surface-container-lowest border border-outline-variant rounded-[24px] shadow-sm text-left max-w-2xl">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">LLM & Local Model Engine</h3>
                    <div className="space-y-md">
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Active Engine Provider</label>
                        <div className="flex gap-sm">
                          <button
                            type="button"
                            onClick={() => handleToggleLLMProvider('cloud')}
                            className={`flex-1 py-sm px-md rounded-xl font-bold border transition-all text-body-sm flex items-center justify-center gap-xs ${
                              llmSettings.provider === 'cloud'
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">cloud</span>
                            Cloud (Groq & OpenRouter)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleLLMProvider('ollama')}
                            className={`flex-1 py-sm px-md rounded-xl font-bold border transition-all text-body-sm flex items-center justify-center gap-xs ${
                              llmSettings.provider === 'ollama'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">terminal</span>
                            Local Ollama
                          </button>
                        </div>
                      </div>

                      {llmSettings.provider === 'ollama' && (
                        <div className="p-sm bg-surface-container-low border border-outline-variant rounded-xl space-y-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-body-sm font-bold text-on-surface">Ollama Status</span>
                            <span className={`text-label-sm px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              llmSettings.ollamaStatus?.online
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${llmSettings.ollamaStatus?.online ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              {llmSettings.ollamaStatus?.online ? 'Online & Ready' : 'Disconnected / Server Unreachable'}
                            </span>
                          </div>

                          <div>
                            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Installed Local Model</label>
                            {llmSettings.ollamaStatus?.models?.length > 0 ? (
                              <select
                                value={llmSettings.ollamaModel}
                                onChange={(e) => handleToggleLLMProvider('ollama', e.target.value)}
                                className="w-full px-sm py-2 bg-white border border-outline-variant rounded-lg text-body-sm font-semibold outline-none"
                              >
                                {llmSettings.ollamaStatus.models.map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={llmSettings.ollamaModel}
                                onChange={(e) => handleToggleLLMProvider('ollama', e.target.value)}
                                placeholder="llama3:8b"
                                className="w-full px-sm py-2 bg-white border border-outline-variant rounded-lg text-body-sm font-semibold outline-none"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-lg bg-surface-container-lowest border border-outline-variant rounded-[24px] shadow-sm text-left max-w-2xl">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Integration Credentials</h3>
                    <div className="space-y-sm">
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Current API Server Address</label>
                        <input className="w-full px-sm py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm font-semibold outline-none" type="text" readOnly value="http://localhost:5000/api" />
                      </div>
                      <div>
                        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Multer Upload Location</label>
                        <input className="w-full px-sm py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm font-semibold outline-none" type="text" readOnly value="server/uploads/" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-transparent py-lg mt-xl border-t border-outline-variant/30">
          <div className="flex flex-col items-center justify-center gap-xs w-full text-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto select-none">
            <span className="font-label-md text-label-md font-bold text-primary">AgentHire AI Recruitment OS</span>
            <div className="flex items-center gap-md my-xs">
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-all duration-300 underline" to="#">Privacy Policy</Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-all duration-300 underline" to="#">Terms of Service</Link>
              <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-all duration-300 underline" to="#">Contact Support</Link>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">© 2024 AgentHire AI Recruitment OS. All rights reserved.</p>
          </div>
        </footer>
      </main>

      {/* CREATE JOB SPEC MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-outline-variant p-6 max-w-lg w-full shadow-2xl relative text-left">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Create Job Specification</h3>

            {formError && (
              <div className="p-3 bg-error-container text-on-error-container text-xs border border-error/20 rounded-lg mb-4 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-sm">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-xs">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-sm py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container text-body-sm text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-xs">Job Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe the duties, stack, and details..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full px-sm py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container text-body-sm text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-xs">Minimum Experience (Years)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={jobMinExp}
                  onChange={(e) => setJobMinExp(e.target.value)}
                  className="w-full px-sm py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container text-body-sm text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-xs">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, CSS"
                  value={jobRequiredSkills}
                  onChange={(e) => setJobRequiredSkills(e.target.value)}
                  className="w-full px-sm py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container text-body-sm text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-xs">Preferred Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="Next.js, Tailwind, Docker"
                  value={jobPreferredSkills}
                  onChange={(e) => setJobPreferredSkills(e.target.value)}
                  className="w-full px-sm py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container text-body-sm text-on-surface outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={jobCreating}
                className="w-full py-sm bg-primary-container hover:bg-primary text-white font-label-md text-label-md rounded-xl transition-all shadow-md flex items-center justify-center gap-xs mt-md"
              >
                {jobCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Spec'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Search Overlay */}
      {showSearchOverlay && (
        <div
          onClick={() => setShowSearchOverlay(false)}
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-xl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl mx-margin-mobile rounded-2xl shadow-xl overflow-hidden border border-outline-variant"
          >
            <div className="p-md flex items-center gap-sm border-b border-outline-variant">
              <span className="material-symbols-outlined text-primary">search</span>
              <input
                className="w-full border-none focus:ring-0 font-body-lg text-body-lg text-on-surface placeholder-on-surface-variant/50 outline-none"
                placeholder="Search job specs, agents, or candidates..."
                type="text"
                autoFocus
              />
              <button
                className="text-body-sm text-on-surface-variant hover:text-on-surface font-bold"
                onClick={() => setShowSearchOverlay(false)}
              >
                ESC
              </button>
            </div>
            <div className="p-md">
              <h5 className="font-label-sm text-label-sm text-secondary uppercase mb-sm">Recent Specs</h5>
              <div className="flex flex-col gap-xs">
                {jobs.slice(0, 3).map((job) => (
                  <button
                    key={job._id}
                    onClick={() => {
                      openDashboardTab('jobs');
                      setShowSearchOverlay(false);
                    }}
                    className="flex items-center gap-sm p-xs hover:bg-surface-container-low rounded-lg transition-colors text-left w-full"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">history</span>
                    <span className="font-body-md text-body-md">{job.title}</span>
                  </button>
                ))}
                {jobs.length === 0 && (
                  <span className="text-on-surface-variant font-body-sm italic p-xs">No active specifications found.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
