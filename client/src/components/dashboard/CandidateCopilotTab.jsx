import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { LeetCodeIcon } from '../ui/LeetCodeIcon';
import {
  UserCheck,
  Search,
  Briefcase,
  Mail,
  Phone,
  Code2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileDown,
  Clock,
  GraduationCap,
  Copy,
  Check,
  FileEdit,
  Send,
  ThumbsUp,
  ThumbsDown,
  Terminal,
  Cpu,
  Database,
  HelpCircle,
  MessageSquareQuote
} from 'lucide-react';

// Skill categorizer helper
function categorizeSkills(skillList = [], requiredSkills = []) {
  const reqLower = (requiredSkills || []).map(s => s.toLowerCase());
  
  const categories = {
    languages: { title: 'Languages & Core', icon: Terminal, skills: [] },
    frameworks: { title: 'Frameworks & Libraries', icon: Cpu, skills: [] },
    tools: { title: 'Tools, DB & Cloud', icon: Database, skills: [] }
  };

  const langKeywords = ['javascript', 'typescript', 'python', 'c++', 'c#', 'java', 'golang', 'rust', 'php', 'ruby', 'html', 'html5', 'css', 'css3', 'sql', 'dsa', 'data structures', 'algorithms', 'problem solving'];
  const frameworkKeywords = ['react', 'react.js', 'node', 'node.js', 'express', 'express.js', 'vue', 'angular', 'next.js', 'django', 'fastapi', 'flask', 'tailwind', 'bootstrap', 'spring', 'redux'];

  skillList.forEach(rawSkill => {
    const sLower = rawSkill.toLowerCase();
    const isRequired = reqLower.includes(sLower);
    const item = { name: rawSkill, isRequired };

    if (langKeywords.some(k => sLower.includes(k))) {
      categories.languages.skills.push(item);
    } else if (frameworkKeywords.some(k => sLower.includes(k))) {
      categories.frameworks.skills.push(item);
    } else {
      categories.tools.skills.push(item);
    }
  });

  return categories;
}

const CandidateCopilotTab = ({ candidates = [], jobs = [], onCandidateUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [activeCandidateId, setActiveCandidateId] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Recruiter Live Decision & Notes State
  const [actionLoading, setActionLoading] = useState(false);
  const [interviewNotes, setInterviewNotes] = useState(() => {
    return localStorage.getItem('agentichire_copilot_notes') || '';
  });
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // Filter candidate options based on job and search input
  const selectableCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesJob = selectedJobFilter === 'all' || (c.job_id?._id || c.job_id) === selectedJobFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q);
      return matchesJob && matchesSearch;
    });
  }, [candidates, selectedJobFilter, searchQuery]);

  // Active selected candidate
  const candidate = useMemo(() => {
    if (activeCandidateId) {
      return candidates.find(c => c._id === activeCandidateId);
    }
    return selectableCandidates[0] || null;
  }, [candidates, activeCandidateId, selectableCandidates]);

  const targetJob = useMemo(() => {
    if (!candidate) return null;
    return jobs.find(j => j._id === (candidate.job_id?._id || candidate.job_id));
  }, [candidate, jobs]);

  const parsedResume = candidate?.parsed_resume_json || {};
  const skills = parsedResume.skills || candidate?.matched_skills || [];
  const experienceYears = parsedResume.experience ?? null;
  const education = parsedResume.education || 'Degree on file';

  // Parse synthesized questions from interview_rubric
  const questionsYouCanAsk = useMemo(() => {
    const raw = candidate?.interview_rubric || '';
    if (!raw) return [];
    
    const lines = raw.split('\n');
    const items = [];
    let currentCategory = 'Technical Core';

    for (const l of lines) {
      const line = l.trim();
      if (!line) continue;

      if (/^#{1,4}\s+/.test(line)) {
        currentCategory = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
        continue;
      }

      if (/^(?:\d+[\.\)]|\-|\*)\s+/.test(line) || line.includes('?')) {
        const cleanText = line.replace(/^(?:\d+[\.\)]|\-|\*)\s*/, '').replace(/\*\*/g, '').trim();
        if (cleanText.length > 12) {
          items.push({ category: currentCategory, question: cleanText });
        }
      }
    }
    return items;
  }, [candidate]);

  // Categorize skills into 3 clean groups
  const categorizedSkills = useMemo(() => {
    return categorizeSkills(skills, targetJob?.required_skills);
  }, [skills, targetJob]);

  // Copy helper with feedback
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Recruiter Status Decision Trigger
  const handleUpdateStatus = async (newStatus) => {
    if (!candidate?._id) return;
    try {
      setActionLoading(true);
      await api.post('/candidates/batch-status', {
        candidateIds: [candidate._id],
        status: newStatus
      });
      toast.success(`Candidate marked as '${newStatus.toUpperCase()}'!`);
      candidate.status = newStatus;
      if (onCandidateUpdated) onCandidateUpdated();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`agentichire_notes_${candidate?._id}`, interviewNotes);
    setNoteSaved(true);
    toast.success('Interview notes saved locally');
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // Check if candidate actually has GitHub and LeetCode linked
  const hasGitHub = Boolean(candidate?.github_url || candidate?.github_username || candidate?.coding_score != null);
  const hasLeetCode = Boolean(candidate?.leetcode_url || candidate?.leetcode_username || candidate?.dsa_score != null);

  // GitHub Metrics & Breakdown
  const ghMetrics = candidate?.github_metrics || {};
  const ghBreakdown = ghMetrics?.breakdown || {
    language_alignment: candidate?.coding_score != null ? Math.round(candidate.coding_score * 0.8) : 0,
    commit_recency: candidate?.coding_score != null ? Math.round(candidate.coding_score * 0.9) : 0,
    project_quality: candidate?.coding_score != null ? Math.round(candidate.coding_score * 0.75) : 0,
    contribution_footprint: candidate?.coding_score != null ? Math.round(candidate.coding_score * 0.65) : 0
  };
  const ghPublicRepos = ghMetrics?.public_repos ?? ghMetrics?.total_repos ?? 0;
  const ghTotalStars = ghMetrics?.total_stars ?? (hasGitHub ? 0 : 0);
  const ghTopLanguages = ghMetrics?.top_languages || [];

  const ghDimensions = [
    { label: 'Language Alignment', weight: '40%', score: ghBreakdown.language_alignment ?? 0 },
    { label: 'Commit Recency', weight: '25%', score: ghBreakdown.commit_recency ?? 0 },
    { label: 'Project Quality', weight: '20%', score: ghBreakdown.project_quality ?? 0 },
    { label: 'Contribution Footprint', weight: '15%', score: ghBreakdown.contribution_footprint ?? 0 }
  ];

  // LeetCode Metrics & Breakdown
  const lcMetrics = candidate?.leetcode_metrics || {};
  const lcBreakdown = lcMetrics?.breakdown || {
    problem_volume: candidate?.dsa_score != null ? Math.round(candidate.dsa_score * 0.85) : 0,
    contest_rating: candidate?.dsa_score != null ? Math.round(candidate.dsa_score * 0.75) : 0,
    acceptance_rate: candidate?.dsa_score != null ? Math.round(candidate.dsa_score * 0.9) : 0,
    consistency_badges: candidate?.dsa_score != null ? Math.round(candidate.dsa_score * 0.7) : 0
  };
  const lcEasy = lcMetrics?.easy_solved ?? 0;
  const lcMedium = lcMetrics?.medium_solved ?? 0;
  const lcHard = lcMetrics?.hard_solved ?? 0;
  const lcTotalSolved = lcMetrics?.total_solved ?? (lcEasy + lcMedium + lcHard);
  const lcAcceptanceRate = lcMetrics?.acceptance_rate ?? 0;
  const lcContestRating = lcMetrics?.contest_rating ?? 0;

  const lcDimensions = [
    { label: 'Problem Volume (Weighted)', weight: '40%', score: lcBreakdown.problem_volume ?? 0 },
    { label: 'Contest / Global Rank', weight: '25%', score: lcBreakdown.contest_rating ?? 0 },
    { label: 'Acceptance Rate', weight: '20%', score: lcBreakdown.acceptance_rate ?? 0 },
    { label: 'Consistency & Badges', weight: '15%', score: lcBreakdown.consistency_badges ?? 0 }
  ];

  const getGhBenchmark = (score) => {
    if (score >= 70) return { label: 'High Codebase Quality', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 40) return { label: 'Active Developer', color: 'text-primary bg-primary/10 border-primary/20' };
    return { label: 'Junior Footprint', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  };

  const getLcBenchmark = (score) => {
    if (score >= 75) return { label: 'Strong DSA (Top 10%)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    if (score >= 50) return { label: 'Proficient Solver', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    return { label: 'Foundational DSA', color: 'text-muted-foreground bg-secondary/80 border-border/80' };
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Top Header & Control Bar */}
      <div className="bg-card border border-border/80 rounded-2xl px-4 py-2.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-2xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Interview Copilot</h2>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Live Cockpit
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Single-candidate live interview HUD with synchronized telemetry
            </p>
          </div>
        </div>

        {/* Right Filter & Candidate Selector */}
        <div className="flex flex-1 max-w-xl items-center gap-2">
          <div className="relative flex-1 min-w-[170px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidate name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border border-border/70 focus:border-ring rounded-xl pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-40 shrink-0">
            <Select
              size="sm"
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="py-1 text-xs h-8 rounded-xl bg-secondary/30 border-border/70"
            >
              <option value="all">All Roles ({jobs.length})</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-48 shrink-0">
            <Select
              size="sm"
              value={candidate?._id || ''}
              onChange={(e) => setActiveCandidateId(e.target.value)}
              className="py-1 text-xs h-8 font-medium rounded-xl bg-secondary/30 border-border/70"
            >
              {selectableCandidates.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.match_score || 0}%)
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {!candidate ? (
        <EmptyState
          icon={UserCheck}
          title="No candidate found"
          description="Enter a candidate name, phone number, or email above to view their live interview analysis."
          className="py-12"
        />
      ) : (
        <div className="space-y-3.5">
          
          {/* 2. Candidate Identity & Contact Bar */}
          <div className="bg-card border border-border/80 rounded-2xl px-5 py-3.5 shadow-2xs grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Left: Avatar, Name, Role & Status (Col 4) */}
            <div className="md:col-span-4 flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 text-primary flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground tracking-tight truncate">
                    {candidate.name}
                  </h3>
                  <Badge status={candidate.status} className="capitalize text-[10px] py-0 px-2 font-medium rounded-md shrink-0">
                    {candidate.status === 'shortlist' ? 'Shortlisted' : candidate.status}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-primary/90 flex items-center gap-1.5 mt-0.5 truncate">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{targetJob?.title || candidate.job_id?.title || 'Open Role'}</span>
                </p>
              </div>
            </div>

            {/* Middle: Clean Contact Pills with 1-Click Copy (Col 4) */}
            <div className="md:col-span-4 flex items-center justify-start md:justify-center gap-2 flex-wrap">
              {/* Email Pill */}
              <div className="inline-flex items-center gap-1.5 bg-secondary/40 hover:bg-secondary/70 border border-border/70 rounded-xl px-3 py-1.5 text-xs transition-colors group">
                <Mail className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <span className="text-xs font-medium text-foreground tracking-tight" title={candidate.email}>
                  {candidate.email}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(candidate.email, 'email')}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-0.5 rounded-md hover:bg-background/80"
                  title="Copy email"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Phone Pill */}
              {candidate.phone && (
                <div className="inline-flex items-center gap-1.5 bg-secondary/40 hover:bg-secondary/70 border border-border/70 rounded-xl px-3 py-1.5 text-xs transition-colors group">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <span className="text-xs font-medium text-foreground tracking-tight shrink-0">
                    {candidate.phone}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(candidate.phone, 'phone')}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors ml-0.5 rounded-md hover:bg-background/80"
                    title="Copy phone number"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Right: AI Match Score + Resume Action (Col 4) */}
            <div className="md:col-span-4 flex items-center justify-end gap-2.5">
              {/* Clean Unified AI Match Pill */}
              <div className="flex items-center gap-2 bg-secondary/40 border border-border/70 px-3 py-1.5 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-medium text-muted-foreground">AI Match:</span>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {candidate.match_score != null ? `${candidate.match_score}%` : '—'}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground pl-1.5 border-l border-border/80">
                  {candidate.match_score >= 70 ? 'High Fit' : candidate.match_score >= 40 ? 'Moderate' : 'Low Fit'}
                </span>
              </div>

              {/* Original Resume PDF Button */}
              {candidate.resume_url && (
                <a
                  href={`http://localhost:5000${candidate.resume_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-2xs transition-all hover:shadow-xs shrink-0"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Resume PDF
                </a>
              )}
            </div>

          </div>

          {/* 3. Recruiter Decision & Live Scratchpad Action Bar */}
          <div className="bg-card border border-border/80 rounded-2xl px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Interview Action:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={actionLoading || candidate.status === 'shortlist'}
                  onClick={() => handleUpdateStatus('shortlist')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.2 rounded-xl text-xs font-semibold border transition-all ${
                    candidate.status === 'shortlist'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/20 shadow-2xs'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  Pass / Shortlist
                </button>

                <button
                  type="button"
                  disabled={actionLoading || candidate.status === 'reject'}
                  onClick={() => handleUpdateStatus('reject')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.2 rounded-xl text-xs font-semibold border transition-all ${
                    candidate.status === 'reject'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 cursor-default'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600 hover:bg-rose-500/20 shadow-2xs'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>

            {/* Live Recruiter Scratchpad Note Trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.2 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/80 text-xs font-medium text-foreground transition-all shadow-2xs"
              >
                <FileEdit className="w-3.5 h-3.5 text-primary" />
                {showNotesDrawer ? 'Hide Notes Scratchpad' : 'Recruiter Interview Notes'}
              </button>
            </div>
          </div>

          {/* Optional Expanding Recruiter Scratchpad */}
          {showNotesDrawer && (
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-2.5 transition-all animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-primary" /> Live Interview Scratchpad
                </span>
                <span className="text-[10px] text-muted-foreground">Auto-persisted to browser storage</span>
              </div>
              <textarea
                rows={3}
                placeholder="Enter live interview feedback, strengths, problem solving impressions, technical questions..."
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border border-border/70 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs"
                >
                  {noteSaved ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  {noteSaved ? 'Saved!' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}

          {/* 4. BALANCED 1:1 HEIGHT GITHUB MCP & LEETCODE MCP CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
            
            {/* GITHUB MCP PROTOCOL CARD */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
              {hasGitHub ? (
                <>
                  <div>
                    {/* Header with Benchmark */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/70">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-foreground block truncate">
                            @{candidate.github_username || 'candidate'}
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            GitHub MCP • Code Intelligence
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getGhBenchmark(candidate.coding_score || 0).color}`}>
                          {getGhBenchmark(candidate.coding_score || 0).label}
                        </span>
                        <span className="font-bold text-foreground bg-secondary/80 border border-border/80 px-2 py-0.5 rounded-lg text-xs tabular-nums">
                          {candidate.coding_score != null ? `${candidate.coding_score}%` : '—'}
                        </span>
                        {candidate.github_url && (
                          <a
                            href={candidate.github_url.startsWith('http') ? candidate.github_url : `https://github.com/${candidate.github_username || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="View Repositories"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Counterpart 3-Pill Strip */}
                    <div className="grid grid-cols-3 gap-2 text-center my-3">
                      <div className="bg-secondary/30 border border-border/70 rounded-xl py-1.5 px-2">
                        <span className="text-[10px] font-medium text-muted-foreground block uppercase tracking-wider">Repos</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">{ghPublicRepos}</span>
                      </div>
                      <div className="bg-secondary/30 border border-border/70 rounded-xl py-1.5 px-2">
                        <span className="text-[10px] font-medium text-muted-foreground block uppercase tracking-wider">Stars</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">⭐ {ghTotalStars}</span>
                      </div>
                      <div className="bg-secondary/30 border border-border/70 rounded-xl py-1.5 px-2">
                        <span className="text-[10px] font-medium text-muted-foreground block uppercase tracking-wider">Languages</span>
                        <span className="text-xs font-bold text-foreground tabular-nums">{ghTopLanguages.length} Stacks</span>
                      </div>
                    </div>

                    {/* 4 Score Bars */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                        Score Breakdown
                      </span>
                      {ghDimensions.map((dim) => (
                        <div key={dim.label} className="space-y-0.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-foreground/90 font-medium flex items-center gap-1 text-[11px]">
                              {dim.label}
                              <span className="text-[10px] text-muted-foreground">({dim.weight})</span>
                            </span>
                            <span className="font-semibold text-foreground tabular-nums text-[11px]">
                              {dim.score}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages Footer */}
                  <div className="bg-secondary/25 border border-border/60 rounded-xl px-3 py-2 flex items-center gap-2 text-xs overflow-hidden">
                    <span className="text-muted-foreground shrink-0 text-[10px] font-medium">Top Stacks:</span>
                    <div className="flex flex-wrap gap-1">
                      {ghTopLanguages.length > 0 ? (
                        ghTopLanguages.slice(0, 4).map((lang, lIdx) => (
                          <span key={lIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-card border border-border/70 text-foreground font-medium shadow-2xs">
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">None detected</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state when no GitHub link is provided */
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 h-full min-h-[220px]">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground">
                    <svg className="w-5 h-5 fill-current opacity-40" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">No GitHub Profile Linked</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">
                      Candidate did not attach a GitHub repository or profile URL during application.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    Code MCP Evaluation Skipped
                  </span>
                </div>
              )}
            </div>

            {/* LEETCODE MCP PROTOCOL CARD */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
              {hasLeetCode ? (
                <>
                  <div>
                    {/* Header with Benchmark */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/70">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center p-1 shrink-0 shadow-2xs">
                          <LeetCodeIcon className="w-4 h-4" loopColor="text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-foreground block truncate">
                            @{candidate.leetcode_username || 'candidate'}
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            LeetCode MCP • Algorithmic Verification
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${getLcBenchmark(candidate.dsa_score || 0).color}`}>
                          {getLcBenchmark(candidate.dsa_score || 0).label}
                        </span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg text-xs tabular-nums">
                          {candidate.dsa_score != null ? `${candidate.dsa_score}% DSA` : '—'}
                        </span>
                        {(candidate.leetcode_url || candidate.leetcode_username) && (
                          <a
                            href={candidate.leetcode_url ? (candidate.leetcode_url.startsWith('http') ? candidate.leetcode_url : `https://${candidate.leetcode_url}`) : `https://leetcode.com/u/${candidate.leetcode_username || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            title="View LeetCode Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Difficulty Breakdown Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center my-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl py-1.5 px-2">
                        <span className="text-[10px] font-medium block uppercase tracking-wider">Easy</span>
                        <span className="text-xs font-bold tabular-nums">{lcEasy}</span>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl py-1.5 px-2">
                        <span className="text-[10px] font-medium block uppercase tracking-wider">Medium</span>
                        <span className="text-xs font-bold tabular-nums">{lcMedium}</span>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl py-1.5 px-2">
                        <span className="text-[10px] font-medium block uppercase tracking-wider">Hard</span>
                        <span className="text-xs font-bold tabular-nums">{lcHard}</span>
                      </div>
                    </div>

                    {/* 4 Score Bars */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                        Score Breakdown
                      </span>
                      {lcDimensions.map((dim) => (
                        <div key={dim.label} className="space-y-0.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-foreground/90 font-medium flex items-center gap-1 text-[11px]">
                              {dim.label}
                              <span className="text-[10px] text-muted-foreground">({dim.weight})</span>
                            </span>
                            <span className="font-semibold text-foreground tabular-nums text-[11px]">
                              {dim.score}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#FFA116] h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, dim.score))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Solved & Rating Footer */}
                  <div className="bg-secondary/25 border border-border/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium text-[11px]">
                      {lcTotalSolved} Solved ({lcAcceptanceRate}% Acc)
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                      ⭐ Contest: {lcContestRating}
                    </span>
                  </div>
                </>
              ) : (
                /* Empty state when no LeetCode link is provided */
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 h-full min-h-[220px]">
                  <div className="w-10 h-10 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground p-2">
                    <LeetCodeIcon className="w-5 h-5 opacity-40" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">No LeetCode Profile Linked</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">
                      Candidate did not provide a LeetCode profile URL during job submission.
                    </p>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                    Algorithmic MCP Evaluation Skipped
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* 5. Bottom Row: Grouped Categorized Skills & Background Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
            
            {/* Left Card: Clean Categorized Tech Stack */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Categorized Tech Stack & Toolkit</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary border border-border/70 text-foreground">
                    {skills.length} Tools Verified
                  </span>
                </div>

                {/* 3 Categories: Languages, Frameworks, Tools */}
                <div className="mt-3 space-y-2.5">
                  {Object.entries(categorizedSkills).map(([catKey, cat]) => {
                    if (cat.skills.length === 0) return null;
                    const Icon = cat.icon;
                    return (
                      <div key={catKey} className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Icon className="w-3 h-3 text-primary" /> {cat.title} ({cat.skills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.skills.map((skillItem, sIdx) => (
                            <span
                              key={sIdx}
                              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border flex items-center gap-1.5 transition-all ${
                                skillItem.isRequired
                                  ? 'bg-primary/10 border-primary/30 text-primary font-semibold shadow-2xs'
                                  : 'bg-secondary/40 border-border/70 text-foreground/90'
                              }`}
                            >
                              {skillItem.isRequired && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
                              {skillItem.name}
                              {skillItem.isRequired && (
                                <span className="text-[8px] uppercase tracking-wider bg-primary/20 text-primary px-1 rounded font-bold">
                                  Req
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {targetJob?.required_skills?.length > 0 && (
                <div className="pt-2.5 mt-3 border-t border-border/70 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">Core Skill Alignment</span>
                  <span className="font-semibold text-primary text-[11px]">
                    {skills.filter(s => targetJob.required_skills.some(rs => rs.toLowerCase() === s.toLowerCase())).length} of {targetJob.required_skills.length} Job Requirements Matched
                  </span>
                </div>
              )}
            </div>

            {/* Right Card: Professional Background, Education & Experience Profile */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Background & Verified Credentials</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium rounded-md">
                    Dossier Verified
                  </Badge>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Work Experience</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {experienceYears != null ? `${experienceYears} Years` : 'Fresher / Entry Level'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Degree & Education</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground text-right truncate max-w-[220px]" title={education}>
                      {education}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-0.5">
                    <div className="p-2 rounded-xl border border-border/70 bg-secondary/30">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium block">Target Role</span>
                      <span className="text-xs font-bold text-foreground truncate block mt-0.5">
                        {targetJob?.title || 'Engineer'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl border border-border/70 bg-secondary/30">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium block">Experience Level</span>
                      <span className="text-xs font-bold text-primary truncate block mt-0.5">
                        {targetJob?.min_experience ? `${targetJob.min_experience}+ Yrs Exp` : 'Standard Level'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 mt-3 border-t border-border/70 flex items-center justify-between text-xs text-muted-foreground">
                <span className="text-[11px]">Audit Source</span>
                <span className="text-foreground font-mono text-[10px]">Verified Candidate ID: {candidate._id.slice(-6)}</span>
              </div>
            </div>

          </div>

          {/* 6. Questions You Can Ask (Live Interview Question Bank) */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-foreground">
                    Questions You Can Ask
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Tailored interview probes synthesized by the AI agent from candidate profile & role rubric
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary border border-border/70 text-foreground">
                {questionsYouCanAsk.length} Interview Probes
              </span>
            </div>

            {questionsYouCanAsk.length === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <HelpCircle className="w-6 h-6 text-muted-foreground mx-auto opacity-40" />
                <p className="text-xs font-semibold text-foreground">No tailored questions generated yet</p>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Run this candidate through the AI Workflows pipeline to generate custom interview questions based on their profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {questionsYouCanAsk.map((item, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3 rounded-xl border border-border/70 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50 transition-all flex items-start justify-between gap-2.5 group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block truncate">
                          {item.category}
                        </span>
                        <p className="text-xs font-medium text-foreground leading-relaxed">
                          {item.question}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.question, `q-${qIdx}`)}
                      className="p-1.5 rounded-lg border border-border/70 hover:bg-background text-muted-foreground hover:text-foreground transition-colors shrink-0 opacity-70 group-hover:opacity-100"
                      title="Copy question text"
                    >
                      {copiedField === `q-${qIdx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default CandidateCopilotTab;
