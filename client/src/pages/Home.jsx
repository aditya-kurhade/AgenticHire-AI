import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Bot, 
  Sparkles,
  UploadCloud, 
  FileText, 
  GitBranch, 
  UserCheck, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  Check, 
  CheckSquare,
  Lock,
  Globe,
  Code2,
  PlayCircle,
  RotateCw,
  ToggleRight,
  Database,
  Search,
  Award,
  Terminal,
  Activity,
  CheckCircle2,
  ListChecks,
  ChevronRight,
  BookOpen,
  BarChart3,
  Mail,
  Send,
  TrendingUp,
  Sliders,
  FolderGit2,
  ExternalLink,
  ThumbsUp,
  MessageSquareQuote,
  Target,
  FileCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LeetCodeIcon } from '../components/ui/LeetCodeIcon';

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center px-6 md:px-12 w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md h-16 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground">AgentHire AI</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#agents">6-Agent Engine</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#github-mcp">GitHub MCP</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs text-amber-600 dark:text-amber-400 font-semibold" href="#leetcode-mcp">LeetCode MCP</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs text-primary font-semibold" href="#interview-copilot">Interview Copilot</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#knowledge-base">Knowledge Base</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#analytics">Analytics</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#how-it-works">How to Use</a>
        </nav>

        <div className="flex items-center gap-2.5">
          {!user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex text-xs"
              >
                Sign In
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/signup')}
                className="text-xs"
              >
                Get Started Free
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs flex items-center gap-1.5"
            >
              Open Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-28 px-6 md:px-12 overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-foreground text-xs font-medium shadow-2xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AgenticHire 2.0 • Autonomous Multi-Agent OS & Live Copilot</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
              Autonomous Multi-Agent AI for <span className="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">Technical Hiring</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Orchestrate PDF parsing, vector search, <strong>company knowledge base RAG</strong>, empirical <strong>GitHub & LeetCode MCP verification</strong>, live <strong>Interview Copilot HUD</strong>, and deep funnel analytics.
            </p>

            <div className="flex flex-wrap gap-3 pt-2 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="flex items-center gap-2 px-8"
              >
                {user ? 'Open Recruiter Dashboard' : 'Start Free 14-Day Trial'}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
                className="px-8"
              >
                Recruiter Sign In
              </Button>
            </div>

            {/* Interactive Live Pipeline Hero Card */}
            <div className="pt-10 max-w-4xl mx-auto">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md text-left space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs text-muted-foreground font-mono ml-2">agentic-recruiter-runtime.mcp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                      Live Telemetry • Tri-Score Engine Active
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">Agent 1</span>
                      <FileText className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Resume Parser</p>
                    <span className="text-[11px] text-emerald-600 font-medium">Text & Contact</span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">Agent 2</span>
                      <Database className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Embedding Agent</p>
                    <span className="text-[11px] text-blue-600 font-medium">Qdrant Vectors</span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">Agent 3</span>
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Matching Agent</p>
                    <span className="text-[11px] text-primary font-medium">GitHub + LeetCode</span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">Agent 4</span>
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Shortlisting Agent</p>
                    <span className="text-[11px] text-emerald-600 font-medium">Threshold & Gates</span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">Agent 5</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Interview Agent</p>
                    <span className="text-[11px] text-amber-600 font-medium">Technical Rubrics</span>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/40 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">Agent 6</span>
                      <Mail className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Email Agent</p>
                    <span className="text-[11px] text-purple-600 font-medium">Status & Invites</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6-Agent Engine Grid Section */}
        <section className="py-20 px-6 md:px-12 bg-secondary/20 border-b border-border/60" id="agents">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5" />
                Pipeline Orchestration
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Autonomous 6-Agent Evaluation Engine
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Each agent operates as a specialized micro-service executing deterministic parsing, semantic embedding, and empirical verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
              {/* Agent 1 */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Agent 01</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Resume Parser</h3>
                    <p className="text-xs text-primary font-medium mt-0.5">PDF Extraction & Structuring</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ingests multi-page PDF resumes, cleans OCR noise, and structures raw text into typed JSON schema containing candidate contact, skills, and experience.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Engine:</span>
                  <span className="font-mono text-foreground font-medium">pdf-parse / Gemini 2.0</span>
                </div>
              </div>

              {/* Agent 2 */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Agent 02</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Embedding Agent</h3>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Vector Knowledge Ingestion</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Transforms parsed candidate profile text into 384-dimensional dense vectors using modern sentence transformers, indexable directly into Qdrant Cloud.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Vector DB:</span>
                  <span className="font-mono text-foreground font-medium">Qdrant Cloud HNSW</span>
                </div>
              </div>

              {/* Agent 3 */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Agent 03</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Matching Agent</h3>
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">Dual MCP + RAG Scoring</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Performs semantic cosine similarity against company hiring rubrics, while simultaneously executing GitHub code verification and LeetCode algorithmic benchmarks.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Intelligence:</span>
                  <span className="font-mono text-foreground font-medium">Tri-Score Architecture</span>
                </div>
              </div>

              {/* Agent 4 */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Agent 04</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Shortlisting Agent</h3>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Automated Threshold Evaluation</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluates candidate qualification thresholds against job criteria. Decides whether to auto-approve, route to human review, or flag for rejection.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Decision:</span>
                  <span className="font-mono text-foreground font-medium">Shortlist / Review / Reject</span>
                </div>
              </div>

              {/* Agent 5 */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Agent 05</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Interview Agent</h3>
                    <p className="text-xs text-amber-600 font-medium mt-0.5">Assessment & Rubric Synthesis</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Synthesizes customized technical interview questions tailored specifically to the candidate's verified skill gaps, complete with clean numbered questions and 1-click Markdown export.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Deliverable:</span>
                  <span className="font-mono text-foreground font-medium">Structured Interview Rubric</span>
                </div>
              </div>

              {/* Agent 6 */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Agent 06</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Email Agent</h3>
                    <p className="text-xs text-purple-600 font-medium mt-0.5">Automated Candidate Notifications</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automatically dispatches personalized status emails to applicants at critical pipeline milestones—sending interview invitations upon shortlisting and respectful rejection notices to eliminate ghosting.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Engine:</span>
                  <span className="font-mono text-foreground font-medium">Resend Email Gateway</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW FEATURE 1: Dedicated LeetCode MCP Protocol Showcase */}
        <section className="py-20 px-6 md:px-12 bg-card border-b border-border/60" id="leetcode-mcp">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <LeetCodeIcon className="w-3.5 h-3.5" loopColor="text-amber-600 dark:text-amber-400" />
                  Model Context Protocol (MCP) Add-on
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Empirical LeetCode DSA Evaluation
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Screen candidates on real algorithmic problem-solving ability before ever stepping into an interview. The LeetCode MCP Connector analyzes problem volumes, Easy/Medium/Hard distribution, contest ratings, and submission accuracy.
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs px-3 py-1 font-mono">
                MCP Protocol: Algorithmic Verification
              </Badge>
            </div>

            {/* Interactive Visual LeetCode Inspector Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 bg-[#FFFDF7] dark:bg-[#1E1911] rounded-2xl border border-amber-500/30 p-6 shadow-sm space-y-5 text-left">
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center p-2 shadow-xs">
                      <LeetCodeIcon className="w-5 h-5" loopColor="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">LeetCode MCP Protocol</span>
                        <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono text-amber-700 dark:text-amber-300">@candidate-profile</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Automated multi-factor algorithmic audit</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">86% DSA</span>
                    <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">Algorithmic Score</span>
                  </div>
                </div>

                {/* Easy, Med, Hard Badges */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold block uppercase tracking-wider">Easy</span>
                    <span className="text-base font-black tabular-nums">112</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold block uppercase tracking-wider">Medium</span>
                    <span className="text-base font-black tabular-nums">168</span>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl p-2.5">
                    <span className="text-[10px] font-bold block uppercase tracking-wider">Hard</span>
                    <span className="text-base font-black tabular-nums">42</span>
                  </div>
                </div>

                {/* 4 Factor Visual Breakdown */}
                <div className="space-y-3">
                  {[
                    { label: 'Problem Volume (Weighted)', weight: '40%', score: 92, color: 'bg-[#FFA116]' },
                    { label: 'Contest / Global Rank', weight: '25%', score: 74, color: 'bg-amber-500' },
                    { label: 'Acceptance Rate', weight: '20%', score: 88, color: 'bg-emerald-500' },
                    { label: 'Consistency & Badges', weight: '15%', score: 82, color: 'bg-indigo-500' },
                  ].map((dim) => (
                    <div key={dim.label} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">
                          {dim.label} <span className="text-muted-foreground text-[10px]">({dim.weight} weight)</span>
                        </span>
                        <span className="font-semibold text-foreground font-mono">{dim.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${dim.color}`} style={{ width: `${dim.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Stats Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-500/20 text-center">
                  <div className="bg-background/80 p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Total Solved</span>
                    <span className="text-sm font-bold text-foreground">322 Questions</span>
                  </div>
                  <div className="bg-background/80 p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Acceptance</span>
                    <span className="text-sm font-bold text-foreground">91.4% Rate</span>
                  </div>
                  <div className="bg-background/80 p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Contest Rating</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">⭐ 1645</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Cards */}
              <div className="lg:col-span-5 space-y-4 text-left">
                <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    Real Algorithmic Competency Verification
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Verify a candidate's actual mastery of Data Structures & Algorithms (graphs, trees, DP, two pointers) through live public LeetCode telemetry.
                  </p>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Weighted Difficulty Scoring Formula
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hard problems are weighted 5x, Medium 2.5x, and Easy 1x to ensure rigorous standards for senior software and backend engineering roles.
                  </p>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Zero Penalization for Unlinked Candidates
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Providing a LeetCode profile is optional for applicants. Candidates without competitive programming backgrounds are fairly evaluated via resume and GitHub.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Interactive GitHub MCP Protocol Showcase */}
        <section className="py-20 px-6 md:px-12 bg-secondary/10 border-b border-border/60" id="github-mcp">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Code2 className="w-3.5 h-3.5" />
                  Model Context Protocol (MCP)
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Empirical GitHub Verification Add-on
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Resumes can exaggerate tech stacks, but commit histories don't lie. The Matching Agent runs an automated GitHub MCP add-on to evaluate real code quality, testing habits, and commit patterns directly from public repositories.
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-mono">
                Standard: Model Context Protocol
              </Badge>
            </div>

            {/* Interactive Visual MCP Inspector Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5 text-left">
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">GitHub MCP Protocol</span>
                        <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.2 rounded font-mono text-muted-foreground">@candidate-profile</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Automated multi-factor repository audit</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-emerald-600 font-mono">88%</span>
                    <span className="text-[10px] text-muted-foreground block uppercase tracking-wider font-semibold">Coding Score</span>
                  </div>
                </div>

                {/* 4 Factor Visual Breakdown */}
                <div className="space-y-3">
                  {[
                    { label: 'Language Alignment', weight: '40%', score: 92, color: 'bg-primary' },
                    { label: 'Commit Recency & Velocity', weight: '25%', score: 85, color: 'bg-emerald-500' },
                    { label: 'Project Quality & Depth', weight: '20%', score: 80, color: 'bg-blue-500' },
                    { label: 'Contribution Footprint & Stars', weight: '15%', score: 90, color: 'bg-amber-500' },
                  ].map((dim) => (
                    <div key={dim.label} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground">
                          {dim.label} <span className="text-muted-foreground text-[10px]">({dim.weight} weight)</span>
                        </span>
                        <span className="font-semibold text-foreground font-mono">{dim.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${dim.color}`} style={{ width: `${dim.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Stats Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center">
                  <div className="bg-secondary/40 p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Verified Repos</span>
                    <span className="text-sm font-bold text-foreground">24 Public</span>
                  </div>
                  <div className="bg-secondary/40 p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Top Languages</span>
                    <span className="text-sm font-bold text-foreground">TS, React, Go</span>
                  </div>
                  <div className="bg-secondary/40 p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Community Stars</span>
                    <span className="text-sm font-bold text-foreground">⭐ 142 Stars</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Cards */}
              <div className="lg:col-span-5 space-y-4 text-left">
                <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    Bypasses Resume Fluff & Keyword Stuffing
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Candidates often claim technologies on resumes after writing a single tutorial. The MCP protocol inspects genuine line changes, AST structures, and dependency manifests.
                  </p>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Seamless Hover Breakdown in Dashboard
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Recruiters can hover over any candidate's GitHub badge in the Candidates or Workflows tabs to see this full breakdown in a popup tooltip.
                  </p>
                </div>

                <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                    Optional for Applicants
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If an applicant does not have public repositories, the Matching Agent evaluates the resume using standard semantic RAG without penalizing them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW FEATURE 2: Dedicated Interview Copilot HUD Showcase */}
        <section className="py-20 px-6 md:px-12 bg-card border-b border-border/60" id="interview-copilot">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5" />
                  Live Interviewer Cockpit
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Interview Copilot & Live Analysis HUD
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  During an active interview, recruiters no longer need to scramble across multiple tabs or links. The Interview Copilot centralizes contact info, GitHub code scores, LeetCode DSA performance, categorized tech stacks, and live question banks into a single cockpit.
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 font-mono">
                Tab: /dashboard/copilot
              </Badge>
            </div>

            {/* Visual Copilot Mockup */}
            <div className="bg-secondary/30 rounded-2xl border border-border p-6 shadow-sm space-y-6 text-left">
              {/* Top Cockpit Identity Strip */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">Alex Rivera</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2 py-0.2 rounded font-semibold">Shortlisted</span>
                    </div>
                    <span className="text-xs text-primary font-medium">Full Stack Developer (React / Node.js)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono bg-secondary px-2.5 py-1 rounded border border-border text-foreground">
                    ✉️ alex.rivera@example.com
                  </span>
                  <span className="text-xs font-mono bg-secondary px-2.5 py-1 rounded border border-border text-foreground">
                    📞 +1 (555) 234-5678
                  </span>
                  <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-2.5 py-1 rounded text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>AI Match: 88%</span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Dual Platform Intelligence Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-zinc-950 text-white flex items-center justify-center">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">@alex-rivera (GitHub)</span>
                    </div>
                    <span className="text-xs font-bold bg-secondary px-2 py-0.5 rounded border border-border">88% Code Score</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <p>• Verified Repos: <strong>24 Public</strong> | ⭐ 142 Stars</p>
                    <p>• Top Stacks: TypeScript, React, Node.js, Express</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-zinc-950 flex items-center justify-center p-0.5">
                        <LeetCodeIcon className="w-3.5 h-3.5" loopColor="text-white" />
                      </div>
                      <span className="text-xs font-bold text-foreground">@alex_rivera (LeetCode)</span>
                    </div>
                    <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">86% DSA Score</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-1">
                    <p>• Problems Solved: <strong>322 Total</strong> (112 Easy, 168 Medium, 42 Hard)</p>
                    <p>• Acceptance: <strong>91.4%</strong> | ⭐ Contest: <strong>1645</strong></p>
                  </div>
                </div>
              </div>

              {/* Copilot Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-card p-3.5 rounded-xl border border-border space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Live 1-Click Decisions</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pass, shortlist, or reject candidates instantly during the interview with instant backend persistence.
                  </p>
                </div>

                <div className="bg-card p-3.5 rounded-xl border border-border space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Categorized Tech Stack</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Skills cleanly grouped into Languages, Frameworks, and Cloud/DB tools with clear Job Requirement tags.
                  </p>
                </div>

                <div className="bg-card p-3.5 rounded-xl border border-border space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-amber-500" />
                    <span>Questions You Can Ask</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pre-synthesized technical probes customized to candidate gaps with 1-click clipboard copying.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1 Highlight: Knowledge Base & RAG Policies */}
        <section className="py-20 px-6 md:px-12 border-b border-border/60" id="knowledge-base">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  Context-Aware Screening
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Company Knowledge Base & RAG Policies
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generic keyword matchers don't know what your team values. AgentHire ingests your internal culture documents, engineering standards, and role-specific hiring rubrics into a localized vector knowledge store.
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1">
                Vectorized Policy Ingest
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Role-Specific Criteria</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Attach custom evaluation rubrics to individual job specs. The AI strictly enforces must-have architectures, cloud certifications, and domain expertise.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Qdrant Policy Chunking</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Guidelines are chunked into dense vector embeddings. During screening, candidate resumes are cross-referenced with your company guidelines using semantic search.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Bias-Free Calibration</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Standardizes screening across all engineering leads and recruiters, guaranteeing every candidate is measured against the exact same hiring benchmark.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2 Highlight: Hiring Analytics & Intelligence */}
        <section className="py-20 px-6 md:px-12 bg-secondary/20 border-b border-border/60" id="analytics">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" />
                Talent Intelligence
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Deep Recruitment Funnel Analytics
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Transform raw applicant flow into actionable hiring metrics with real-time analytics across your talent pool.
              </p>
            </div>

            {/* Simulated Analytics Dashboard Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-card p-5 rounded-xl border border-border shadow-xs text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Screening Velocity</span>
                <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">&lt; 30 sec</p>
                <span className="text-[11px] text-emerald-600 font-medium">Per candidate full-agent run</span>
              </div>

              <div className="bg-card p-5 rounded-xl border border-border shadow-xs text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tri-Score Accuracy</span>
                <p className="text-2xl font-bold text-primary mt-1 tabular-nums">96.4%</p>
                <span className="text-[11px] text-muted-foreground">GitHub + LeetCode + RAG</span>
              </div>

              <div className="bg-card p-5 rounded-xl border border-border shadow-xs text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Skill Gap Visibility</span>
                <p className="text-2xl font-bold text-amber-500 mt-1 tabular-nums">100%</p>
                <span className="text-[11px] text-muted-foreground">Every missing skill highlighted</span>
              </div>

              <div className="bg-card p-5 rounded-xl border border-border shadow-xs text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time-to-Interview</span>
                <p className="text-2xl font-bold text-blue-500 mt-1 tabular-nums">3.2x</p>
                <span className="text-[11px] text-blue-600 font-medium">Faster recruiter pass rate</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Talent Funnel Conversion</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track applicant flow from initial submission $\rightarrow$ AI parsing $\rightarrow$ semantic shortlist $\rightarrow$ interview scheduled. Filter metrics by single job spec or company-wide.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-foreground">Empirical Code & DSA Distribution</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Compare candidate GitHub MCP coding scores and LeetCode DSA mastery side-by-side with resume claims, ensuring you only advance candidates with proven engineering capability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3 Highlight: Automated Candidate Email Updates */}
        <section className="py-20 px-6 md:px-12 border-b border-border/60" id="notifications">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5" />
                  Candidate Experience
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Automated Candidate Email Updates
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Eliminate candidate ghosting forever. AgentHire's integrated <strong>Email Agent</strong> automatically formats and dispatches personalized status updates directly to candidates at critical pipeline milestones.
                </p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-3 py-1">
                Zero Candidate Ghosting
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Interview Invitations</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    When a candidate is shortlisted (or passed by auto-approval), the Email Agent immediately sends a tailored interview scheduling invitation with role details.
                  </p>
                </div>
                <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-emerald-600">
                  Template: interview_invite.html
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-4">
                <div className="w-9 h-9 rounded-lg bg-zinc-500/10 text-zinc-500 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Polite Rejection Notices</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Candidates who do not meet mandatory criteria receive thoughtful, polite notifications rather than being left in the dark for weeks.
                  </p>
                </div>
                <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                  Template: rejection_notice.html
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Dynamic Interpolation</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Templates dynamically interpolate candidate names, target job titles, application timestamps, and recruiter points of contact seamlessly.
                  </p>
                </div>
                <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-primary">
                  Engine: Resend / Spec Loader
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-Step "How to Use" Section */}
        <section className="py-20 px-6 md:px-12 border-b border-border/60" id="how-it-works">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <ListChecks className="w-3.5 h-3.5" />
                Quickstart Guide
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">How to Use the Platform</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Test the end-to-end multi-agent hiring OS in four simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-left">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm shadow-xs">
                  1
                </div>
                <h3 className="text-base font-semibold text-foreground">Create a Job Spec</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Navigate to <strong>Job Specs</strong> in your recruiter dashboard. Click <strong>+ New Job Spec</strong>, define required core skills, preferred skills, and minimum experience.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  2
                </div>
                <h3 className="text-base font-semibold text-foreground">Apply via Public Link</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open the public applicant portal. Upload a resume and supply both <strong>GitHub and LeetCode</strong> profile links for empirical verification.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  3
                </div>
                <h3 className="text-base font-semibold text-foreground">Inspect AI Workflows</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Switch to <strong>AI Workflows</strong> to watch live telemetry, inspect GitHub Code & LeetCode DSA scores, and verify agent checkpoints.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  4
                </div>
                <h3 className="text-base font-semibold text-foreground">Conduct with Copilot</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open <strong>Interview Copilot</strong> during live interviews to reference developer scores, categorized tech stacks, and tailored question banks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-6 md:px-12 bg-secondary/20 border-b border-border/60" id="pricing">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Simple, Predictable Plans</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                No hidden seat taxes or per-resume metering. Everything you need to scale autonomous technical hiring.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Starter */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Growth</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-foreground">$49</span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> 5 Active Job Specs</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Unlimited PDF Resume Ingest</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Qdrant Vector Indexing</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> GitHub + LeetCode MCP Checks</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/signup')}>
                  Start Basic
                </Button>
              </div>

              {/* Pro (Featured) */}
              <div className="bg-card p-6 rounded-xl border-2 border-primary shadow-sm flex flex-col justify-between space-y-6 relative">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Scale</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold text-foreground">$149</span>
                        <span className="text-xs text-muted-foreground">/ month</span>
                      </div>
                    </div>
                    <Badge variant="default" className="text-[10px]">Popular</Badge>
                  </div>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> 25 Active Job Specs</li>
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> Full Multi-Agent Squad</li>
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> Live Interview Copilot HUD</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Company Knowledge Base RAG</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Automated Email Updates Engine</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Deep Funnel Analytics Dashboard</li>
                  </ul>
                </div>
                <Button className="w-full text-xs" onClick={() => navigate('/signup')}>
                  Start Pro Trial
                </Button>
              </div>

              {/* Enterprise */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Enterprise</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-foreground">Custom</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> Unlimited Job Specs & Portals</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Dedicated On-Premises Ollama</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Custom Organizational RAG Policies</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Full Interview Copilot Customization</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> 99.9% Uptime SLA & Dedicated Support</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/login')}>
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-4xl mx-auto rounded-2xl bg-card border border-border p-8 md:p-12 text-center space-y-5 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ready to automate technical screening?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Join technical talent teams using AgentHire AI to discover qualified engineers with empirical code verification, LeetCode algorithmic benchmarks, and live Interview Copilot assistance.
            </p>
            <div className="pt-2">
              <Button size="lg" onClick={() => navigate(user ? '/dashboard' : '/signup')} className="flex items-center gap-2 mx-auto">
                {user ? 'Open Recruiter Dashboard' : 'Get Started in 60 Seconds'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12 bg-card text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>AgentHire AI Recruitment OS</span>
          </div>
          <div className="flex gap-6 flex-wrap">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            <a href="#leetcode-mcp" className="hover:text-foreground transition-colors">LeetCode MCP</a>
            <a href="#interview-copilot" className="hover:text-foreground transition-colors">Interview Copilot</a>
            <a href="#knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base</a>
            <a href="#analytics" className="hover:text-foreground transition-colors">Analytics</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How to Use</a>
          </div>
          <p>© {new Date().getFullYear()} AgentHire AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
