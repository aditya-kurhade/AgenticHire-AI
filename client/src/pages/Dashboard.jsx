import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import OverviewTab from '../components/dashboard/OverviewTab';
import JobSpecsTab from '../components/dashboard/JobSpecsTab';
import CandidatesTab from '../components/dashboard/CandidatesTab';
import WorkflowsTab from '../components/dashboard/WorkflowsTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import KnowledgeBaseTab from '../components/dashboard/KnowledgeBaseTab';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'jobs', label: 'Job Specs', icon: 'description' },
  { id: 'candidates', label: 'Candidates', icon: 'group' },
  { id: 'workflows', label: 'AI Workflows', icon: 'schema' },
  { id: 'knowledge', label: 'Knowledge Base', icon: 'neurology' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics' },
];

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const getTabFromPath = (pathname) => {
    if (pathname.includes('/dashboard/candidates')) return 'candidates';
    if (pathname.includes('/dashboard/workflows')) return 'workflows';
    if (pathname.includes('/dashboard/knowledge')) return 'knowledge';
    if (pathname.includes('/dashboard/analytics')) return 'analytics';
    if (pathname.includes('/dashboard/jobs/create')) return 'jobs';
    if (pathname.includes('/dashboard/jobs')) return 'jobs';
    return 'overview';
  };
  const routeTab = getTabFromPath(location.pathname);
  const [utilityTab, setUtilityTab] = useState(null);
  const activeTab = utilityTab || routeTab;

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(() => location.pathname.includes('/dashboard/jobs/create'));
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobMinExp, setJobMinExp] = useState(0);
  const [jobRequiredSkills, setJobRequiredSkills] = useState('');
  const [jobPreferredSkills, setJobPreferredSkills] = useState('');
  const [jobCreating, setJobCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('all');
  const [candidateMinMatch, setCandidateMinMatch] = useState(0);

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

  const [llmSettings, setLlmSettings] = useState({
    provider: 'cloud',
    ollamaModel: 'llama3:8b',
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaStatus: { online: false, models: [] }
  });
  const [llmUpdating, setLlmUpdating] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const openDashboardTab = (tab, targetJobId) => {
    const tabPaths = {
      overview: '/dashboard',
      jobs: '/dashboard/jobs',
      candidates: '/dashboard/candidates',
      workflows: '/dashboard/workflows',
      knowledge: '/dashboard/knowledge',
      analytics: '/dashboard/analytics'
    };
    if (targetJobId !== undefined) {
      setSelectedJobId(targetJobId);
    }
    setUtilityTab(null);
    setSidebarOpen(false);
    navigate(tabPaths[tab] || '/dashboard');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const candidatesUrl = selectedJobId && selectedJobId !== 'all' ? `/candidates?jobId=${selectedJobId}` : '/candidates';
        const analyticsUrl = selectedJobId && selectedJobId !== 'all' ? `/analytics?jobId=${selectedJobId}` : '/analytics';

        const [jobsRes, candidatesRes, settingsRes, analyticsRes, llmRes] = await Promise.all([
          api.get('/jobs'),
          api.get(candidatesUrl),
          api.get('/workflow/settings').catch(() => ({ data: { data: {} } })),
          api.get(analyticsUrl).catch(() => ({ data: { data: null } })),
          api.get('/workflow/llm-settings').catch(() => api.get('/settings/llm')).catch(() => ({ data: { data: null } }))
        ]);
        setJobs(jobsRes.data.data);
        const fetchedCandidates = candidatesRes.data.data;
        setCandidates(fetchedCandidates);

        if (fetchedCandidates.length > 0) {
          const isCurrentSelectedValid = fetchedCandidates.some(c => c._id === selectedCandidateId);
          if (!isCurrentSelectedValid || !selectedCandidateId) {
            setSelectedCandidateId(fetchedCandidates[0]._id);
          }
        } else {
          setSelectedCandidateId('');
          setSelectedWorkflow(null);
          setWorkflowLogs([]);
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
  }, [refreshTrigger, selectedJobId]);

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
        openDashboardTab('jobs');
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSearchOverlay(prev => !prev);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        jobs: jobs.slice(0, 5),
        candidates: candidates.slice(0, 5),
      };
    }
    return {
      jobs: jobs.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      ).slice(0, 8),
      candidates: candidates.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      ).slice(0, 8),
    };
  }, [searchQuery, jobs, candidates]);

  const isExpanded = sidebarOpen || sidebarHovered;

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className={cn(
        "flex items-center mb-6 transition-all duration-300",
        isExpanded ? "gap-3 px-2 justify-start" : "justify-center px-0"
      )}>
        <div 
          title="AgentHire AI" 
          className="w-10 h-10 shrink-0 primary-gradient rounded-xl flex items-center justify-center text-white shadow-sm ring-2 ring-primary/10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        </div>
        <div className={cn(
          "transition-all duration-300 overflow-hidden whitespace-nowrap",
          isExpanded ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0 pointer-events-none hidden lg:block lg:opacity-0"
        )}>
          <h1 className="font-bold text-[17px] tracking-tight text-primary leading-tight">AgentHire AI</h1>
          <p className="text-[11px] font-medium text-on-surface-variant tracking-wide">Enterprise Recruiter</p>
        </div>
      </div>

      <div className="mb-5">
        <Button
          onClick={() => {
            setShowCreateModal(true);
            setSidebarOpen(false);
          }}
          title="New Job Spec"
          className={cn(
            "transition-all duration-300 overflow-hidden",
            isExpanded 
              ? "w-full justify-center px-4" 
              : "w-10 h-10 p-0 mx-auto rounded-xl flex items-center justify-center"
          )}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">add_circle</span>
          <span className={cn(
            "transition-all duration-300 whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[120px] ml-1.5" : "opacity-0 max-w-0 hidden"
          )}>
            New Job Spec
          </span>
        </Button>
      </div>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => openDashboardTab(item.id)}
              title={item.label}
              className={cn(
                'flex items-center rounded-xl text-xs font-semibold transition-all text-left group',
                isExpanded 
                  ? 'w-full gap-3 px-3 py-2.5' 
                  : 'w-10 h-10 mx-auto justify-center p-0',
                isActive
                  ? isExpanded
                    ? 'bg-primary/10 text-primary font-bold shadow-xs border-l-[3px] border-primary'
                    : 'bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/30'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-[#F8F5EF]'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[20px] shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                )}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
              >
                {item.icon}
              </span>
              <span className={cn(
                "transition-all duration-300 overflow-hidden whitespace-nowrap",
                isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 hidden"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#e8ded5] pt-3 space-y-1">
        <button
          onClick={() => { setUtilityTab('support'); setSidebarOpen(false); }}
          title="Support"
          className={cn(
            'flex items-center rounded-xl text-xs font-semibold text-left transition-all group',
            isExpanded 
              ? 'w-full gap-3 px-3 py-2' 
              : 'w-10 h-10 mx-auto justify-center p-0',
            activeTab === 'support'
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-[#F8F5EF]'
          )}
        >
          <span className="material-symbols-outlined text-[19px] shrink-0">help</span>
          <span className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 hidden"
          )}>
            Support
          </span>
        </button>

        <button
          onClick={() => { setUtilityTab('settings'); setSidebarOpen(false); }}
          title="Settings"
          className={cn(
            'flex items-center rounded-xl text-xs font-semibold text-left transition-all group',
            isExpanded 
              ? 'w-full gap-3 px-3 py-2' 
              : 'w-10 h-10 mx-auto justify-center p-0',
            activeTab === 'settings'
              ? 'bg-primary/10 text-primary font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-[#F8F5EF]'
          )}
        >
          <span className="material-symbols-outlined text-[19px] shrink-0">settings</span>
          <span className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 hidden"
          )}>
            Settings
          </span>
        </button>

        <button
          onClick={handleLogout}
          title="Log Out"
          className={cn(
            'flex items-center rounded-xl text-xs font-bold text-error hover:bg-error-container/20 transition-all text-left group',
            isExpanded 
              ? 'w-full gap-3 px-3 py-2' 
              : 'w-10 h-10 mx-auto justify-center p-0'
          )}
        >
          <span className="material-symbols-outlined text-[19px] shrink-0">logout</span>
          <span className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 hidden"
          )}>
            Log Out
          </span>
        </button>

        {/* User Profile Info Card at Sidebar Bottom */}
        <div className="pt-2 border-t border-[#e8ded5] mt-1">
          <button
            type="button"
            onClick={() => { setUtilityTab('settings'); setSidebarOpen(false); }}
            title={`${user?.name || 'Recruiter'} (${user?.email || 'Talent Acquisition'})`}
            className={cn(
              "flex items-center rounded-xl transition-all text-left group hover:bg-[#F8F5EF]",
              isExpanded 
                ? "w-full gap-2.5 p-2 bg-[#F8F5EF]/70 border border-[#e8ded5]" 
                : "w-10 h-10 mx-auto justify-center p-0"
            )}
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={cn(
              "transition-all duration-300 overflow-hidden text-left min-w-0",
              isExpanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0 hidden"
            )}>
              <p className="text-xs font-bold text-on-surface leading-tight truncate">{user?.name || 'Recruiter'}</p>
              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 truncate">{user?.email || 'Talent Acquisition'}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-[#FFFDF8]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-inverse-surface/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SideNavBar — desktop hover-expandable fixed + mobile drawer */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={cn(
          'bg-white border-r border-[#e8ded5] h-screen fixed left-0 top-0 flex flex-col py-5 px-3 z-[70] select-none transition-all duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0',
          sidebarHovered
            ? 'lg:w-64 lg:shadow-[6px_0_28px_rgba(0,0,0,0.08)]'
            : 'lg:w-[72px] lg:shadow-[1px_0_4px_rgba(0,0,0,0.02)]'
        )}
      >
        <div className="flex lg:hidden justify-end mb-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-[#F8F5EF] text-on-surface-variant"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <SidebarContent />
      </aside>

      <main className="flex-1 lg:ml-[72px] flex flex-col min-h-screen w-full lg:w-[calc(100%-72px)]">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e8ded5] flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-[#F8F5EF] text-on-surface"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <button
              type="button"
              onClick={() => { setShowSearchOverlay(true); setSearchQuery(''); }}
              className="relative hidden sm:flex items-center bg-[#F8F5EF] border border-[#e8ded5] rounded-xl pl-9 pr-3 py-1.5 w-48 lg:w-64 text-xs font-medium text-on-surface-variant hover:border-[#dcc1b1] transition-all text-left"
            >
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#897365] pointer-events-none">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <span className="truncate">Search jobs, candidates…</span>
              <kbd className="ml-auto hidden lg:inline text-[10px] font-bold bg-white border border-[#e8ded5] px-1.5 py-0.5 rounded-md text-on-surface-variant">⌘K</kbd>
            </button>

            <div className="flex items-center bg-[#F8F5EF] border border-[#e8ded5] rounded-xl px-2.5 sm:px-3 py-1 gap-2 hover:border-[#dcc1b1] transition-colors min-w-0">
              <span className="material-symbols-outlined text-primary text-[17px] shrink-0">work</span>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/70 leading-none hidden sm:block">Job Context</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-on-surface outline-none cursor-pointer pr-1 py-0.5 max-w-[140px] sm:max-w-[200px] truncate"
                  aria-label="Filter by job"
                >
                  <option value="all">All Openings ({jobs.length})</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Compact LLM indicator — full controls in Settings */}
            <button
              type="button"
              onClick={() => setUtilityTab('settings')}
              className="hidden md:flex items-center gap-1.5 bg-[#F8F5EF] border border-[#e8ded5] px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
              title="LLM engine settings"
            >
              <span className="material-symbols-outlined text-[14px]">
                {llmSettings.provider === 'cloud' ? 'cloud' : 'terminal'}
              </span>
              <span>{llmSettings.provider === 'cloud' ? 'Cloud' : 'Ollama'}</span>
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  llmSettings.provider === 'cloud' || llmSettings.ollamaStatus?.online
                    ? 'bg-emerald-500'
                    : 'bg-red-400'
                )}
              />
            </button>

            <button
              type="button"
              className="sm:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-[#F8F5EF] transition-colors rounded-xl"
              onClick={() => { setShowSearchOverlay(true); setSearchQuery(''); }}
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>
        </header>

        <div className="flex-grow w-full px-4 sm:px-6 lg:px-12 py-6 lg:py-10 max-w-[1440px] mx-auto">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  jobs={jobs}
                  candidates={candidates}
                  selectedJobId={selectedJobId}
                  setSelectedJobId={setSelectedJobId}
                  setShowCreateModal={setShowCreateModal}
                  openDashboardTab={openDashboardTab}
                />
              )}

              {activeTab === 'jobs' && (
                <JobSpecsTab
                  jobs={jobs}
                  candidates={candidates}
                  selectedJobId={selectedJobId}
                  setSelectedJobId={setSelectedJobId}
                  openDashboardTab={openDashboardTab}
                  setShowCreateModal={setShowCreateModal}
                />
              )}

              {activeTab === 'candidates' && (
                <CandidatesTab
                  jobs={jobs}
                  candidates={candidates}
                  selectedJobId={selectedJobId}
                  setSelectedJobId={setSelectedJobId}
                  candidateSearchQuery={candidateSearchQuery}
                  setCandidateSearchQuery={setCandidateSearchQuery}
                  candidateStatusFilter={candidateStatusFilter}
                  setCandidateStatusFilter={setCandidateStatusFilter}
                  candidateMinMatch={candidateMinMatch}
                  setCandidateMinMatch={setCandidateMinMatch}
                  setSelectedCandidateId={setSelectedCandidateId}
                  openDashboardTab={openDashboardTab}
                />
              )}

              {activeTab === 'workflows' && (
                <WorkflowsTab
                  candidates={candidates}
                  selectedCandidateId={selectedCandidateId}
                  setSelectedCandidateId={setSelectedCandidateId}
                  selectedWorkflow={selectedWorkflow}
                  workflowLogs={workflowLogs}
                  workflowActionLoading={workflowActionLoading}
                  handleApproveWorkflow={handleApproveWorkflow}
                  handleRetryWorkflow={handleRetryWorkflow}
                  llmSettings={llmSettings}
                  nodeColorsSpec={nodeColorsSpec}
                />
              )}

              {activeTab === 'knowledge' && (
                <KnowledgeBaseTab
                  jobs={jobs}
                  selectedJobId={selectedJobId}
                  setSelectedJobId={setSelectedJobId}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsTab
                  analyticsData={analyticsData}
                  jobs={jobs}
                  candidates={candidates}
                  selectedJobId={selectedJobId}
                  setSelectedJobId={setSelectedJobId}
                />
              )}

              {activeTab === 'support' && (
                <div className="ah-page">
                  <div>
                    <h1 className="text-2xl md:text-[1.75rem] font-bold tracking-tight text-on-surface mb-1">Support & Diagnostics</h1>
                    <p className="text-sm text-on-surface-variant font-medium max-w-2xl">
                      System health, integration connectivity, and agent runtime configuration.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
                    <div className="ah-surface p-6 text-left">
                      <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-primary text-[28px]">health_and_safety</span>
                        <h3 className="text-lg font-bold text-on-surface">Runtime Status</h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        {[
                          { label: 'API Server', value: 'Online', ok: true },
                          { label: 'Database (MongoDB)', value: 'Connected', ok: true },
                          { label: 'Vector DB (Qdrant)', value: 'Active / Fallback', ok: true },
                          {
                            label: 'Local Ollama',
                            value: llmSettings.ollamaStatus?.online ? `Online (${llmSettings.ollamaModel})` : 'Offline / Standby',
                            ok: !!llmSettings.ollamaStatus?.online
                          },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#f0e7df] last:border-0">
                            <span className="text-on-surface-variant">{row.label}</span>
                            <span className={cn(
                              'font-bold text-xs px-2.5 py-1 rounded-lg',
                              row.ok ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                            )}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ah-surface p-6 text-left flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-primary text-[28px]">help</span>
                          <h3 className="text-lg font-bold text-on-surface">Need Help?</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">
                          For resume parsing or LLM timeouts, check the server console or switch engines in Settings.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        Refresh App State
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="ah-page">
                  <div>
                    <h1 className="text-2xl md:text-[1.75rem] font-bold tracking-tight text-on-surface mb-1">Settings</h1>
                    <p className="text-sm text-on-surface-variant font-medium max-w-2xl">
                      Recruitment thresholds and LLM engine configuration.
                    </p>
                  </div>

                  <div className="ah-surface p-6 text-left max-w-2xl">
                    <h3 className="text-lg font-bold text-on-surface mb-5">LLM & Local Model Engine</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="ah-label">Active Engine Provider</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            disabled={llmUpdating}
                            onClick={() => handleToggleLLMProvider('cloud')}
                            className={cn(
                              'flex-1 py-2.5 px-4 rounded-xl font-bold border transition-all text-sm flex items-center justify-center gap-2',
                              llmSettings.provider === 'cloud'
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'bg-[#F8F5EF] border-[#e8ded5] text-on-surface-variant hover:bg-white'
                            )}
                          >
                            <span className="material-symbols-outlined text-[18px]">cloud</span>
                            Cloud (Groq)
                          </button>
                          <button
                            type="button"
                            disabled={llmUpdating}
                            onClick={() => handleToggleLLMProvider('ollama')}
                            className={cn(
                              'flex-1 py-2.5 px-4 rounded-xl font-bold border transition-all text-sm flex items-center justify-center gap-2',
                              llmSettings.provider === 'ollama'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-[#F8F5EF] border-[#e8ded5] text-on-surface-variant hover:bg-white'
                            )}
                          >
                            <span className="material-symbols-outlined text-[18px]">terminal</span>
                            Local Ollama
                          </button>
                        </div>
                      </div>

                      {llmSettings.provider === 'ollama' && (
                        <div className="p-4 bg-[#F8F5EF] border border-[#e8ded5] rounded-xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-on-surface">Ollama Status</span>
                            <span className={cn(
                              'text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5',
                              llmSettings.ollamaStatus?.online
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            )}>
                              <span className={cn(
                                'w-2 h-2 rounded-full',
                                llmSettings.ollamaStatus?.online ? 'bg-emerald-500' : 'bg-red-500'
                              )} />
                              {llmSettings.ollamaStatus?.online ? 'Online & Ready' : 'Disconnected'}
                            </span>
                          </div>
                          <div>
                            <label className="ah-label">Installed Local Model</label>
                            {llmSettings.ollamaStatus?.models?.length > 0 ? (
                              <select
                                value={llmSettings.ollamaModel}
                                onChange={(e) => handleToggleLLMProvider('ollama', e.target.value)}
                                className="ah-input"
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
                                className="ah-input"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ah-surface p-6 text-left max-w-2xl">
                    <h3 className="text-lg font-bold text-on-surface mb-5">Integration</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="ah-label">API Server Address</label>
                        <input className="ah-input opacity-80" type="text" readOnly value="http://localhost:5000/api" />
                      </div>
                      <div>
                        <label className="ah-label">Upload Location</label>
                        <input className="ah-input opacity-80" type="text" readOnly value="server/uploads/" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="bg-transparent py-8 mt-4 border-t border-[#e8ded5]/50">
          <div className="flex flex-col items-center justify-center gap-2 w-full text-center px-4 max-w-[1440px] mx-auto select-none">
            <span className="text-xs font-bold text-primary">AgentHire AI Recruitment OS</span>
            <p className="text-xs text-on-surface-variant">© {new Date().getFullYear()} AgentHire AI. All rights reserved.</p>
          </div>
        </footer>
      </main>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Job Specification"
      >
        {formError && (
          <div className="p-3 bg-error-container text-on-error-container text-xs border border-error/20 rounded-xl mb-4 font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateJob} className="space-y-3">
          <div>
            <label className="ah-label !text-on-surface">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Full-Stack Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="ah-input !bg-white"
            />
          </div>
          <div>
            <label className="ah-label !text-on-surface">Job Description</label>
            <textarea
              rows="3"
              required
              placeholder="Describe the duties, stack, and details..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="ah-input !bg-white resize-none"
            />
          </div>
          <div>
            <label className="ah-label !text-on-surface">Minimum Experience (Years)</label>
            <input
              type="number"
              required
              min="0"
              value={jobMinExp}
              onChange={(e) => setJobMinExp(e.target.value)}
              className="ah-input !bg-white"
            />
          </div>
          <div>
            <label className="ah-label !text-on-surface">Required Skills (comma separated)</label>
            <input
              type="text"
              placeholder="React, Node.js, CSS"
              value={jobRequiredSkills}
              onChange={(e) => setJobRequiredSkills(e.target.value)}
              className="ah-input !bg-white"
            />
          </div>
          <div>
            <label className="ah-label !text-on-surface">Preferred Skills (comma separated)</label>
            <input
              type="text"
              placeholder="Next.js, Tailwind, Docker"
              value={jobPreferredSkills}
              onChange={(e) => setJobPreferredSkills(e.target.value)}
              className="ah-input !bg-white"
            />
          </div>
          <Button type="submit" loading={jobCreating} className="w-full mt-2" size="lg">
            {jobCreating ? 'Creating…' : 'Create Spec'}
          </Button>
        </form>
      </Modal>

      {/* Search Overlay */}
      {showSearchOverlay && (
        <div
          onClick={() => setShowSearchOverlay(false)}
          className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-sm z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-[#e8ded5] animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-4 flex items-center gap-3 border-b border-[#e8ded5]">
              <span className="material-symbols-outlined text-primary">search</span>
              <input
                className="w-full border-none focus:ring-0 text-base text-on-surface placeholder-on-surface-variant/50 outline-none"
                placeholder="Search job specs or candidates…"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="text-[11px] text-on-surface-variant hover:text-on-surface font-bold border border-[#e8ded5] px-2 py-1 rounded-lg"
                onClick={() => setShowSearchOverlay(false)}
              >
                ESC
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto ah-scrollbar space-y-5">
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  {searchQuery ? 'Matching Jobs' : 'Recent Jobs'}
                </h5>
                <div className="flex flex-col gap-1">
                  {searchResults.jobs.map((job) => (
                    <button
                      key={job._id}
                      type="button"
                      onClick={() => {
                        openDashboardTab('jobs', job._id);
                        setShowSearchOverlay(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#F8F5EF] rounded-xl transition-colors text-left w-full"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">work</span>
                      <span className="text-sm font-semibold text-on-surface truncate">{job.title}</span>
                    </button>
                  ))}
                  {searchResults.jobs.length === 0 && (
                    <span className="text-on-surface-variant text-xs italic p-2">No matching jobs.</span>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  {searchQuery ? 'Matching Candidates' : 'Recent Candidates'}
                </h5>
                <div className="flex flex-col gap-1">
                  {searchResults.candidates.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        setSelectedCandidateId(c._id);
                        openDashboardTab('candidates');
                        setShowSearchOverlay(false);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-[#F8F5EF] rounded-xl transition-colors text-left w-full"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F8F5EF] border border-[#e8ded5] flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{c.name}</p>
                        <p className="text-[11px] text-on-surface-variant truncate">{c.email}</p>
                      </div>
                    </button>
                  ))}
                  {searchResults.candidates.length === 0 && (
                    <span className="text-on-surface-variant text-xs italic p-2">No matching candidates.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
