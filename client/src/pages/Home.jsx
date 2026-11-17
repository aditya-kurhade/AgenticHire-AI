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
  FolderGit2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

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
        
        <nav className="hidden md:flex items-center space-x-7">
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#agents">6-Agent Engine</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#github-mcp">GitHub MCP</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#knowledge-base">Knowledge Base</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#analytics">Hiring Analytics</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#notifications">Email Updates</a>
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
              <span>AgenticHire • Autonomous Multi-Agent OS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
              Autonomous Multi-Agent AI for <span className="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">Technical Hiring</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Orchestrate PDF parsing, vector search, <strong>company knowledge base RAG</strong>, empirical GitHub MCP verification, <strong>automated email updates</strong>, and deep funnel analytics.
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
                      Live Telemetry • WebSocket Active
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
                    <span className="text-[11px] text-primary font-medium">RAG + GitHub MCP</span>
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
                    <span className="text-[11px] text-purple-600 font-medium">Auto Notifications</span>
                  </div>
                </div>

                <div className="p-3 bg-secondary/30 rounded-xl border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Includes <strong>Auto-Approval Automation</strong> with dynamic threshold evaluation + <strong>Re-Run Engine</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border text-foreground">
                      Cloud (OpenRouter) / Local (Ollama)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 AI Agents Breakdown */}
        <section className="py-20 px-6 md:px-12 bg-secondary/20 border-b border-border/60" id="agents">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Bot className="w-3.5 h-3.5" />
                The Core Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">6 Autonomous AI Agents in One Engine</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Each agent is a specialized micro-worker executing in an event-driven state machine with MongoDB checkpointing.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
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
                    Pulls raw text, detects contact info, candidate identity, skills, and extracts GitHub usernames from portfolio links.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Output:</span>
                  <span className="font-mono text-foreground font-medium">Structured JSON + Metadata</span>
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
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Qdrant Vector Ingestion</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Generates dense semantic vector embeddings from candidate resumes and indexes them inside high-speed Qdrant vector collections.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Indexing:</span>
                  <span className="font-mono text-foreground font-medium">Dense Cosine Vectors</span>
                </div>
              </div>

              {/* Agent 3 */}
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Agent 03</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Matching Agent</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-emerald-600 font-medium">Semantic RAG</span>
                      <span className="text-[10px] bg-secondary border border-border text-foreground px-1.5 py-0.2 rounded font-mono font-medium">
                        + Policy Check
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluates candidate experience against job requirements and internal Knowledge Base guidelines to calculate semantic alignment and missing skills.
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Protocol:</span>
                  <span className="font-mono text-foreground font-medium">Dense Vector Cosine RAG</span>
                </div>
              </div>

              {/* Connected Add-on Card 1: GitHub MCP Protocol (Points directly to Agent 3) */}
              <div className="md:col-span-2 lg:col-span-3 bg-secondary/30 rounded-2xl border-2 border-dashed border-border/80 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5 text-left">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Add-on to Agent 03 (Matching Agent)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">GitHub MCP Protocol Add-on</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Runs alongside the Matching Agent: audits real git commit recency, language alignment with the job spec, project quality, and contribution footprint for an empirical coding score.
                  </p>
                </div>
                
                {/* Visual Pill Badge */}
                <div className="bg-card border border-border p-3 rounded-xl shadow-xs flex items-center gap-4 shrink-0">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Verified Code</span>
                    <span className="text-xs font-medium text-foreground">@candidate-profile</span>
                  </div>
                  <div className="h-7 w-px bg-border" />
                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-600 font-mono">85%</span>
                    <span className="text-[10px] text-muted-foreground block font-medium">Coding Score</span>
                  </div>
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
                  <span className="font-mono text-foreground font-medium">Pass / Review / Reject</span>
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

              {/* Connected Output Card 2: Technical Assessment Rubric (Points directly to Agent 5) */}
              <div className="md:col-span-2 lg:col-span-3 bg-secondary/30 rounded-2xl border-2 border-dashed border-border/80 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5 text-left">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      Synthesized by Agent 05 (Interview Agent)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">Technical Assessment & Rubric Deliverable</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Takes the candidate's exact skill gaps identified by Agent 3 and generates tailored, probe questions for the interviewer with scoring criteria and 1-click Markdown copy.
                  </p>
                </div>
                
                {/* Visual Rubric Preview Snippet */}
                <div className="bg-card border border-border p-3 rounded-xl shadow-xs space-y-1.5 shrink-0 max-w-xs w-full">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                    <span>Interview Questions Preview</span>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded">Export .MD</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono space-y-0.5">
                    <p className="truncate"><strong className="text-primary">Q1:</strong> Controlled vs. Uncontrolled Components</p>
                    <p className="truncate"><strong className="text-primary">Q2:</strong> Middleware & Error Handling in Express</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Interactive GitHub MCP Protocol Showcase */}
        <section className="py-20 px-6 md:px-12 bg-card border-b border-border/60" id="github-mcp">
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
              <div className="lg:col-span-7 bg-secondary/30 rounded-2xl border border-border p-6 shadow-sm space-y-5 text-left">
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
                  <div className="bg-card p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Verified Repos</span>
                    <span className="text-sm font-bold text-foreground">24 Public</span>
                  </div>
                  <div className="bg-card p-2 rounded-lg border border-border">
                    <span className="text-[10px] text-muted-foreground block">Top Languages</span>
                    <span className="text-sm font-bold text-foreground">TS, React, Go</span>
                  </div>
                  <div className="bg-card p-2 rounded-lg border border-border">
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
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Shortlist Accuracy</span>
                <p className="text-2xl font-bold text-primary mt-1 tabular-nums">94.2%</p>
                <span className="text-[11px] text-muted-foreground">Empirical code + RAG validation</span>
              </div>

              <div className="bg-card p-5 rounded-xl border border-border shadow-xs text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Skill Gap Visibility</span>
                <p className="text-2xl font-bold text-amber-500 mt-1 tabular-nums">100%</p>
                <span className="text-[11px] text-muted-foreground">Every missing skill highlighted</span>
              </div>

              <div className="bg-card p-5 rounded-xl border border-border shadow-xs text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Time-to-Interview</span>
                <p className="text-2xl font-bold text-blue-500 mt-1 tabular-nums">2.4x</p>
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
                  <h3 className="text-sm font-semibold text-foreground">Empirical Code Scores Distribution</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Compare candidate GitHub MCP coding scores side-by-side with resume claims, ensuring you only advance candidates with real, high-quality development activity.
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
                Test the end-to-end multi-agent hiring OS in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
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
                  Open the public applicant portal link. Upload a sample PDF resume and provide a GitHub username to trigger empirical code verification.
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  3
                </div>
                <h3 className="text-base font-semibold text-foreground">Inspect AI Workflows</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Switch to the <strong>AI Workflows</strong> tab to watch live execution graphs, inspect GitHub code scores, toggle Auto-Approval, and review the technical assessment rubric.
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
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> GitHub MCP Protocol Code Check</li>
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
              Join technical talent teams using AgentHire AI to discover qualified engineers with empirical code verification, company policy RAG, and automated notifications.
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
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            <a href="#knowledge-base" className="hover:text-foreground transition-colors">Knowledge Base</a>
            <a href="#analytics" className="hover:text-foreground transition-colors">Analytics</a>
            <a href="#notifications" className="hover:text-foreground transition-colors">Email Updates</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How to Use</a>
          </div>
          <p>© {new Date().getFullYear()} AgentHire AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
