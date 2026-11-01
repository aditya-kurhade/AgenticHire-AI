import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Bot, 
  Sparkles,
  UploadCloud, 
  FileText, 
  GitBranch, 
  UserCheck, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  Check, 
  Lock,
  Globe
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
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#workflow">Workflow</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#features">Capabilities</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#agents">AI Agents</a>
          <a className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs" href="#pricing">Pricing</a>
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
              <span>AgenticHire 2.0 • Autonomous Multi-Agent OS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
              The Autonomous AI Operating System for <span className="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">Technical Hiring</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Eliminate resume screening fatigue with orchestrated AI agents. Semantic RAG matching, vector indexing, automated checkpoints, and human gatekeepers.
            </p>

            <div className="flex flex-wrap gap-3 pt-2 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="flex items-center gap-2 px-8"
              >
                {user ? 'Go to Dashboard' : 'Start Free 14-Day Trial'}
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

            {/* Pipeline Preview Surface */}
            <div className="pt-10 max-w-4xl mx-auto">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md text-left space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs text-muted-foreground font-mono ml-2">agentic-recruiter-runtime.sh</span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                    Telemetry Online
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Resume Ingest</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">PDF Parsing & OCR</p>
                    <span className="text-[11px] text-emerald-600 font-medium">bge-small 384-d</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Vector Search</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">Semantic Scoring</p>
                    <span className="text-[11px] text-primary font-medium">Cosine Distance</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground block">LLM Reasoning</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">Threshold Match</p>
                    <span className="text-[11px] text-blue-600 font-medium">Groq / Ollama</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Human Review</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">Gatekeeper Lock</p>
                    <span className="text-[11px] text-amber-600 font-medium">1-Click Approve</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Diagram Section */}
        <section className="py-20 px-6 md:px-12 bg-secondary/20 border-b border-border/60" id="workflow">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Precision Multi-Agent Pipeline</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Every applicant flows through automated checkpoints with zero manual spreadsheet handling.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
              {[
                { title: 'Resume Upload', desc: 'Public portal drag-and-drop', icon: UploadCloud, tag: 'Intake' },
                { title: 'Dense Parser', desc: 'Vector embeddings in Qdrant', icon: FileText, tag: '384-d' },
                { title: 'Skill Matcher', desc: 'RAG threshold compatibility', icon: GitBranch, tag: 'Scoring' },
                { title: 'Human Gate', desc: 'Recruiter approval checkpoint', icon: UserCheck, tag: 'Gatekeeper' },
                { title: 'Interview Agent', desc: 'Automated candidate invite', icon: Calendar, tag: 'Scheduled' }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={idx}
                    className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                          0{idx + 1}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-border/50">
                      <span className="text-[10px] font-medium text-primary uppercase tracking-wider">{step.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-20 px-6 md:px-12 border-b border-border/60" id="features">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Engineered for Technical Recruiter Speed</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Built from the ground up to eliminate candidate ghosting and accelerate time-to-hire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Feature 1 */}
              <div className="md:col-span-8 bg-card p-6 md:p-8 rounded-xl border border-border shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Semantic Vector Screening</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Traditional ATS systems search for keywords and miss top engineers. AgentHire uses dense BGE embeddings stored in Qdrant to understand architecture expertise, synonyms, and engineering depth.
                  </p>
                </div>
                <div className="p-3.5 bg-secondary/50 rounded-lg border border-border font-mono text-xs text-muted-foreground flex items-center justify-between">
                  <span>Cosine Similarity Threshold: 85%</span>
                  <span className="text-emerald-600 font-semibold">Match Found</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="md:col-span-4 bg-card p-6 md:p-8 rounded-xl border border-border shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Human-in-the-Loop</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AI never rejects without your authorization. Configurable checkpoints pause the pipeline so human recruiters hold final approval.
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-emerald-600 border-emerald-500/20 bg-emerald-500/10 text-[10px]">
                  Zero Silent Rejections
                </Badge>
              </div>

              {/* Feature 3 */}
              <div className="md:col-span-4 bg-card p-6 md:p-8 rounded-xl border border-border shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Dual-Engine Runtime</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Switch between lightning-fast cloud LLMs via Groq and local air-gapped models via Ollama (Llama-3 8B) for complete data privacy.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-secondary border border-border px-2 py-0.5 rounded font-mono text-muted-foreground">Groq Cloud</span>
                  <span className="text-[10px] bg-secondary border border-border px-2 py-0.5 rounded font-mono text-muted-foreground">Local Ollama</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="md:col-span-8 bg-card p-6 md:p-8 rounded-xl border border-border shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Candidate Application Portals</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    Every created job specification generates a public candidate portal link where applicants can submit PDF resumes in under two minutes.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="text-xs">
                    View Live Portal Example
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Agents Section */}
        <section className="py-20 px-6 md:px-12 bg-secondary/20 border-b border-border/60" id="agents">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Your Autonomous Recruitment Squad</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Specialized micro-agents handling distinct stages with dedicated system prompts and guardrails.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">The Parser Agent</h3>
                  <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Extraction & Chunking</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Extracts raw text from PDF resumes, normalizes experience timelines, and generates dense vector embeddings.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">The Matching Agent</h3>
                  <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Cosine Similarity</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Calculates multi-dimensional compatibility against required skills, minimum years, and organization guidelines.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">The Orchestrator</h3>
                  <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">Checkpoint Gatekeeper</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Manages execution graph state, handles pause-for-approval barriers, and streams live telemetry over WebSockets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-6 md:px-12 border-b border-border/60" id="pricing">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Simple, Predictable Plans</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                No hidden seat taxes or per-resume metering. Everything you need to scale hiring.
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
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> 5 Active Job Slots</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Unlimited Resume Ingest</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Qdrant Vector Indexing</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Community Support</li>
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
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> 25 Active Job Slots</li>
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> Full Multi-Agent Squad</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Groq + Local Ollama Engine</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Human Gatekeeper Controls</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Real-time WebSocket Telemetry</li>
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
                    <li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-3.5 h-3.5 text-primary" /> Unlimited Job Specs</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Dedicated On-Premises Ollama</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> Custom Policy Vectors</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary" /> 99.9% Uptime SLA</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/login')}>
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-4xl mx-auto rounded-2xl bg-card border border-border p-8 md:p-12 text-center space-y-5 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ready to automate candidate screening?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Join technical talent teams using AgentHire AI to discover qualified engineers with autonomous accuracy.
            </p>
            <div className="pt-2">
              <Button size="lg" onClick={() => navigate(user ? '/dashboard' : '/signup')} className="flex items-center gap-2 mx-auto">
                {user ? 'Open Dashboard' : 'Get Started in 60 Seconds'}
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
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          </div>
          <p>© {new Date().getFullYear()} AgentHire AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;