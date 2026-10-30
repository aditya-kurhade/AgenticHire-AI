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
import { useRealtimeWorkflow } from '../hooks/useRealtimeWorkflow';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  GitFork,
  BrainCircuit,
  BarChart3,
  HelpCircle,
  Settings,
  LogOut,
  Pin,
  Search,
  Briefcase,
  Cloud,
  Terminal,
  Menu,
  X,
  Plus,
  Sparkles,
  Sun,
  Moon,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'jobs', label: 'Job Specs', icon: FileText },
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'workflows', label: 'AI Workflows', icon: GitFork },
  { id: 'knowledge', label: 'Knowledge Base', icon: BrainCircuit },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('agentichire_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('agentichire_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('agentichire_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    return localStorage.getItem('agentichire_sidebar_pinned') === 'true';
  });

  const toggleSidebarPin = () => {
    setSidebarPinned(prev => {
      const next = !prev;
      localStorage.setItem('agentichire_sidebar_pinned', String(next));
      return next;
    });
  };

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

  const openUtilityTab = (tab) => {
    setUtilityTab(tab);
    setSidebarOpen(false);
    // Keep URL clean on utility tab without desyncing
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
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

  // Real-time WebSocket event handler for dynamic agent updates without page refresh
  const handleRealtimeEvent = (msg) => {
    if (!msg || !msg.event) return;
    const { event, data } = msg;

    console.log(`⚡ [Realtime Dashboard] Event received: ${event}`, data);

    // If event belongs to the currently inspected workflow, update state immediately
    if (selectedWorkflow && data.workflowId === String(selectedWorkflow._id)) {
      if (event === 'workflow:node_start') {
        setSelectedWorkflow(prev => prev ? { ...prev, current_state: data.node, status: 'running' } : prev);
      } else if (event === 'workflow:paused_approval') {
        setSelectedWorkflow(prev => prev ? { ...prev, current_state: 'human_approval', status: 'paused_approval' } : prev);
        setRefreshTrigger(prev => prev + 1);
      } else if (event === 'workflow:node_success') {
        if (data.log) {
          setWorkflowLogs(prev => {
            const exists = prev.some(l => l._id === data.log._id);
            return exists ? prev : [data.log, ...prev];
          });
        }
      } else if (event === 'workflow:state_change') {
        setSelectedWorkflow(prev => prev ? { ...prev, current_state: data.currentState, status: data.status } : prev);
      } else if (event === 'workflow:completed' || event === 'workflow:failed') {
        setSelectedWorkflow(prev => prev ? { ...prev, status: data.status } : prev);
        // Refresh candidate list metrics to update match scores & statuses
        setRefreshTrigger(prev => prev + 1);
      }
    } else {
      // General state changes trigger light background refresh
      if (event === 'workflow:completed' || event === 'workflow:failed' || event === 'workflow:paused_approval') {
        setRefreshTrigger(prev => prev + 1);
      }
    }
  };

  const { isConnected: wsConnected } = useRealtimeWorkflow(handleRealtimeEvent);

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

  const isExpanded = sidebarOpen || sidebarHovered || sidebarPinned;

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className={cn(
        "flex items-center mb-6 transition-all duration-300 relative",
        isExpanded ? "gap-3 px-2 justify-between" : "justify-center px-0"
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div 
            title="AgentHire AI" 
            className="w-10 h-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm cursor-pointer"
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0 pointer-events-none hidden lg:block lg:opacity-0"
          )}>
            <h1 className="font-bold text-sm tracking-tight text-foreground leading-tight">AgentHire AI</h1>
            <p className="text-[11px] font-medium text-muted-foreground tracking-wide">Recruitment OS</p>
          </div>
        </div>

        {/* Desktop Pin/Unpin Collapse Toggle */}
        {isExpanded && (
          <button
            type="button"
            onClick={toggleSidebarPin}
            title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
            className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            <Pin className={cn("w-4 h-4 transition-transform duration-300", sidebarPinned && "rotate-45 text-primary fill-primary")} />
          </button>
        )}
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
          <Plus className="w-4 h-4 shrink-0" />
          <span className={cn(
            "transition-all duration-300 whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[120px] ml-1.5" : "opacity-0 max-w-0 hidden"
          )}>
            New Job Spec
          </span>
        </Button>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => openDashboardTab(item.id)}
              title={item.label}
              className={cn(
                'flex items-center rounded-lg text-xs font-medium transition-all text-left group duration-150',
                isExpanded 
                  ? 'w-full gap-3 px-3 py-2' 
                  : 'w-10 h-10 mx-auto justify-center p-0',
                isActive
                  ? 'bg-secondary text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
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

      <div className="mt-auto border-t border-border pt-3 space-y-1">
        <button
          onClick={() => openUtilityTab('support')}
          title="Support"
          className={cn(
            'flex items-center rounded-lg text-xs font-medium text-left transition-all group',
            isExpanded 
              ? 'w-full gap-3 px-3 py-2' 
              : 'w-10 h-10 mx-auto justify-center p-0',
            activeTab === 'support'
              ? 'bg-secondary text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 hidden"
          )}>
            Support
          </span>
        </button>

        <button
          onClick={() => openUtilityTab('settings')}
          title="Settings"
          className={cn(
            'flex items-center rounded-lg text-xs font-medium text-left transition-all group',
            isExpanded 
              ? 'w-full gap-3 px-3 py-2' 
              : 'w-10 h-10 mx-auto justify-center p-0',
            activeTab === 'settings'
              ? 'bg-secondary text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
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
            'flex items-center rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-all text-left group',
            isExpanded 
              ? 'w-full gap-3 px-3 py-2' 
              : 'w-10 h-10 mx-auto justify-center p-0'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0 hidden"
          )}>
            Log Out
          </span>
        </button>

        {/* User Profile Info Card at Sidebar Bottom */}
        <div className="pt-2 border-t border-border mt-1">
          <button
            type="button"
            onClick={() => openUtilityTab('settings')}
            title={`${user?.name || 'Recruiter'} (${user?.email || 'Talent Acquisition'})`}
            className={cn(
              "flex items-center rounded-lg transition-all text-left group hover:bg-accent",
              isExpanded 
                ? "w-full gap-2.5 p-2 bg-secondary/50 border border-border/60" 
                : "w-10 h-10 mx-auto justify-center p-0"
            )}
          >
            <div className="w-8 h-8 shrink-0 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={cn(
              "transition-all duration-300 overflow-hidden text-left min-w-0",
              isExpanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0 hidden"
            )}>
              <p className="text-xs font-semibold text-foreground leading-tight truncate">{user?.name || 'Recruiter'}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{user?.email || 'Talent Acquisition'}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground transition-colors duration-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SideNavBar — desktop pinned/hover-expandable fixed + mobile drawer */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={cn(
          'bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col py-5 px-3 z-[70] select-none transition-all duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0',
          isExpanded
            ? 'lg:w-64 lg:shadow-[4px_0_24px_rgba(0,0,0,0.06)]'
            : 'lg:w-[72px] lg:shadow-none'
        )}
      >
        <div className="flex lg:hidden justify-end mb-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      <main 
        className={cn(
          "flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out",
          isExpanded 
            ? "lg:pl-64" 
            : "lg:pl-[72px]"
        )}
      >
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-3 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-accent text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => { setShowSearchOverlay(true); setSearchQuery(''); }}
              className="relative hidden sm:flex items-center bg-secondary/60 border border-input rounded-lg pl-9 pr-3 py-1.5 w-48 lg:w-64 text-xs font-medium text-muted-foreground hover:border-ring/50 hover:bg-secondary transition-all text-left"
            >
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <span className="truncate">Search jobs, candidates…</span>
              <kbd className="ml-auto hidden lg:inline text-[10px] font-semibold bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">⌘K</kbd>
            </button>

            <div className="relative flex items-center bg-secondary/60 hover:bg-secondary border border-input rounded-lg px-2.5 sm:px-3 py-1 gap-2 hover:border-ring/50 transition-all min-w-0 group shadow-2xs">
              <Briefcase className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none hidden sm:block">Job Context</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="bg-transparent appearance-none border-none text-xs font-semibold text-foreground outline-none cursor-pointer pr-4 py-0.5 max-w-[130px] sm:max-w-[200px] truncate focus:ring-0 [&>option]:bg-card [&>option]:text-card-foreground"
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
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none shrink-0 group-hover:text-foreground transition-colors ml-0.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Realtime WebSocket Live Pulse Indicator */}
            <div 
              title={wsConnected ? "WebSocket Connected: Live agent telemetry enabled" : "WebSocket Disconnected: Attempting reconnect"}
              className="flex items-center gap-1.5 bg-secondary/60 border border-border px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground"
            >
              <span className={cn(
                "w-2 h-2 rounded-full",
                wsConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              )} />
              <span className="hidden sm:inline">{wsConnected ? "Live" : "Connecting"}</span>
            </div>

            {/* Compact LLM indicator — full controls in Settings */}
            <button
              type="button"
              onClick={() => openUtilityTab('settings')}
              className="hidden md:flex items-center gap-1.5 bg-secondary/60 border border-border px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
              title="LLM engine settings"
            >
              {llmSettings.provider === 'cloud' ? (
                <Cloud className="w-3.5 h-3.5" />
              ) : (
                <Terminal className="w-3.5 h-3.5" />
              )}
              <span>{llmSettings.provider === 'cloud' ? 'Cloud' : 'Ollama'}</span>
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  llmSettings.provider === 'cloud' || llmSettings.ollamaStatus?.online
                    ? 'bg-emerald-500'
                    : 'bg-destructive'
                )}
              />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent border border-border transition-colors"
              title={isDarkMode ? "Switch to Light mode" : "Switch to Dark mode"}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-lg"
              onClick={() => { setShowSearchOverlay(true); setSearchQuery(''); }}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-grow w-full px-6 sm:px-8 lg:px-10 py-6 lg:py-8 max-w-[1400px]">
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
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Support & Diagnostics</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      System health, integration connectivity, and agent runtime configuration.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
                    <div className="bg-card border border-border rounded-xl p-6 text-left shadow-xs">
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">Runtime Status</h3>
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
                          <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground font-medium text-xs">{row.label}</span>
                            <span className={cn(
                              'font-medium text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5',
                              row.ok ? 'text-emerald-600 bg-emerald-500/10' : 'text-amber-600 bg-amber-500/10'
                            )}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", row.ok ? "bg-emerald-500" : "bg-amber-500")} />
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 text-left flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <h3 className="text-base font-semibold text-foreground">Need Help?</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          For resume parsing or LLM timeouts, check the server console or switch engines in Settings.
                        </p>
                      </div>
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => window.location.reload()}>
                        <RefreshCw className="w-4 h-4" />
                        Refresh App State
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recruitment thresholds and LLM engine configuration.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6 text-left max-w-2xl shadow-xs">
                    <h3 className="text-base font-semibold text-foreground mb-4">LLM & Local Model Engine</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Active Engine Provider</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            disabled={llmUpdating}
                            onClick={() => handleToggleLLMProvider('cloud')}
                            className={cn(
                              'flex-1 py-2.5 px-4 rounded-lg font-medium border transition-all text-sm flex items-center justify-center gap-2',
                              llmSettings.provider === 'cloud'
                                ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                : 'bg-secondary/50 border-input text-muted-foreground hover:bg-secondary hover:text-foreground'
                            )}
                          >
                            <Cloud className="w-4 h-4" />
                            Cloud (Groq)
                          </button>
                          <button
                            type="button"
                            disabled={llmUpdating}
                            onClick={() => handleToggleLLMProvider('ollama')}
                            className={cn(
                              'flex-1 py-2.5 px-4 rounded-lg font-medium border transition-all text-sm flex items-center justify-center gap-2',
                              llmSettings.provider === 'ollama'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-secondary/50 border-input text-muted-foreground hover:bg-secondary hover:text-foreground'
                            )}
                          >
                            <Terminal className="w-4 h-4" />
                            Local Ollama
                          </button>
                        </div>
                      </div>

                      {llmSettings.provider === 'ollama' && (
                        <div className="p-4 bg-secondary/40 border border-border rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-foreground">Ollama Status</span>
                            <span className={cn(
                              'text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5',
                              llmSettings.ollamaStatus?.online
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-destructive/10 text-destructive'
                            )}>
                              <span className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                llmSettings.ollamaStatus?.online ? 'bg-emerald-500' : 'bg-destructive'
                              )} />
                              {llmSettings.ollamaStatus?.online ? 'Online & Ready' : 'Disconnected'}
                            </span>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Installed Local Model</label>
                            {llmSettings.ollamaStatus?.models?.length > 0 ? (
                              <Select
                                value={llmSettings.ollamaModel}
                                onChange={(e) => handleToggleLLMProvider('ollama', e.target.value)}
                              >
                                {llmSettings.ollamaStatus.models.map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </Select>
                            ) : (
                              <input
                                type="text"
                                value={llmSettings.ollamaModel}
                                onChange={(e) => handleToggleLLMProvider('ollama', e.target.value)}
                                placeholder="llama3:8b"
                                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6 text-left max-w-2xl shadow-xs">
                    <h3 className="text-base font-semibold text-foreground mb-4">Integration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">API Server Address</label>
                        <input className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed select-all" type="text" readOnly value="http://localhost:5000/api" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Upload Location</label>
                        <input className="w-full bg-secondary/50 border border-input rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed select-all" type="text" readOnly value="server/uploads/" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="bg-transparent py-8 mt-4 border-t border-border/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full text-center px-6 sm:px-8 max-w-[1400px] mx-auto select-none">
            <span className="text-xs font-medium text-foreground">AgentHire AI Recruitment OS</span>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AgentHire AI. All rights reserved.</p>
          </div>
        </footer>
      </main>

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Job Specification"
      >
        {formError && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs border border-destructive/20 rounded-lg mb-4 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Full-Stack Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Job Description</label>
            <textarea
              rows="3"
              required
              placeholder="Describe the duties, stack, and details..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Minimum Experience (Years)</label>
            <input
              type="number"
              required
              min="0"
              value={jobMinExp}
              onChange={(e) => setJobMinExp(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Required Skills (comma separated)</label>
            <input
              type="text"
              placeholder="React, Node.js, CSS"
              value={jobRequiredSkills}
              onChange={(e) => setJobRequiredSkills(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">Preferred Skills (comma separated)</label>
            <input
              type="text"
              placeholder="Next.js, Tailwind, Docker"
              value={jobPreferredSkills}
              onChange={(e) => setJobPreferredSkills(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-2xl rounded-xl shadow-xl overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-4 flex items-center gap-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                placeholder="Search job specs or candidates…"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="text-[10px] font-semibold text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-secondary/50 hover:bg-secondary"
                onClick={() => setShowSearchOverlay(false)}
              >
                ESC
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-5">
              <div>
                <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
                      className="flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left w-full"
                    >
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground truncate">{job.title}</span>
                    </button>
                  ))}
                  {searchResults.jobs.length === 0 && (
                    <span className="text-muted-foreground text-xs italic p-2">No matching jobs.</span>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
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
                      className="flex items-center gap-3 p-2.5 hover:bg-accent rounded-lg transition-colors text-left w-full"
                    >
                      <div className="w-7 h-7 rounded-md bg-secondary text-foreground border border-border flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      </div>
                    </button>
                  ))}
                  {searchResults.candidates.length === 0 && (
                    <span className="text-muted-foreground text-xs italic p-2">No matching candidates.</span>
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
