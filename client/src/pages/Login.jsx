import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-8 relative selection:bg-primary/20">
      <main className="w-full max-w-[1040px] flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
        
        {/* Left Side: Illustration & Branding */}
        <section className="hidden md:flex w-1/2 bg-secondary/30 p-12 flex-col justify-between relative overflow-hidden border-r border-border">
          <div className="z-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">AgentHire AI</h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
              Autonomous multi-agent recruitment operating system for modern talent discovery.
            </p>
          </div>

          <div className="z-10 relative flex items-center justify-center py-6">
            <div className="w-full max-w-[280px] p-5 rounded-xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Multi-Agent Workflow</span>
                <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-medium text-[10px]">Active</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Resume Parser</span>
                  <span className="text-foreground font-medium">BGE 384-d</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>Candidate Match</span>
                  <span className="text-foreground font-medium">RAG Qdrant</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Human Review</span>
                  <span className="text-foreground font-medium">Gatekeeper</span>
                </div>
              </div>
            </div>
          </div>

          <div className="z-10">
            <blockquote className="text-xs text-muted-foreground border-l-2 border-primary pl-4 py-1 italic leading-relaxed">
              "Transformed our technical hiring workflow into an autonomous, high-precision advantage."
            </blockquote>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center bg-card">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="md:hidden flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-foreground">AgentHire AI</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-xs text-muted-foreground mt-1">Enter your credentials to access your talent dashboard.</p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Authentication Error</p>
                  <p className="mt-0.5 text-destructive/90">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground" htmlFor="email">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    className="w-full pl-9 pr-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 transition-all" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input 
                    className="w-full pl-9 pr-9 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 transition-all" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input 
                  className="w-3.5 h-3.5 rounded border-input text-primary focus:ring-ring accent-primary" 
                  id="remember" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-xs text-muted-foreground cursor-pointer select-none" htmlFor="remember">Remember me for 30 days</label>
              </div>

              <Button 
                className="w-full mt-2 flex items-center justify-center gap-2" 
                type="submit"
                loading={loading}
                size="lg"
              >
                Sign in to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link className="text-primary font-semibold hover:underline" to="/signup">Sign up for free</Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <span className="text-[11px] text-muted-foreground">© {new Date().getFullYear()} AgentHire AI. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Login;