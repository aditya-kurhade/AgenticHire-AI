import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleSpecialty, setRoleSpecialty] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, user, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate, clearError]);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const getStrengthTextAndColor = (strength) => {
    const labels = [
      'Password must be at least 8 characters.',
      'Weak - add numbers or symbols',
      'Fair - keep going',
      'Good password',
      'Excellent password strength!'
    ];
    return {
      text: labels[strength]
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    const success = await signup(name, email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const strength = getPasswordStrength();
  const { text: strengthText } = getStrengthTextAndColor(strength);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-8 relative selection:bg-primary/20">
      <main className="w-full max-w-[1040px] flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden shadow-lg border border-border">
        
        {/* Left Side: Branding */}
        <section className="hidden md:flex w-1/2 bg-secondary/30 p-12 flex-col justify-between relative overflow-hidden border-r border-border">
          <div className="z-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">AgentHire AI</h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
              Empowering technical recruiters with an autonomous multi-agent operating system.
            </p>
          </div>

          <div className="z-10 relative flex items-center justify-center py-6">
            <div className="w-full max-w-[280px] p-5 rounded-xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Recruiter Workstation</span>
                <span className="text-primary font-medium text-[10px] bg-primary/10 px-2 py-0.5 rounded">Pro OS</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your job criteria with vector embeddings, semantic scoring, and auto-scheduled screening calls.
              </p>
            </div>
          </div>

          <div className="z-10">
            <blockquote className="text-xs text-muted-foreground border-l-2 border-primary pl-4 py-1 italic leading-relaxed">
              "Automate the repetitive resume grind and focus 100% on high-impact talent engagement."
            </blockquote>
          </div>
        </section>

        {/* Right Side: Signup Form */}
        <section className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center bg-card">
          <div className="w-full max-w-sm">
            <div className="mb-6">
              <div className="md:hidden flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-foreground">AgentHire AI</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Create account</h2>
              <p className="text-xs text-muted-foreground mt-1">Get started with your enterprise recruiting workspace.</p>
            </div>

            {(error || passwordError) && (
              <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Registration Notice</p>
                  <p className="mt-0.5 text-destructive/90">{error || passwordError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground" htmlFor="fullname">Full Name</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 transition-all" 
                  id="fullname" 
                  placeholder="Alex Johnson" 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground" htmlFor="email">Work Email</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 transition-all" 
                  id="email" 
                  placeholder="alex@company.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground" htmlFor="role">Recruiter Role</label>
                <Select 
                  id="role"
                  required
                  value={roleSpecialty}
                  onChange={(e) => setRoleSpecialty(e.target.value)}
                >
                  <option disabled value="">Select your specialty</option>
                  <option value="technical">Technical Recruiter</option>
                  <option value="talent_lead">Talent Acquisition Lead</option>
                  <option value="sourcer">Talent Sourcer</option>
                  <option value="executive">Executive Search</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground" htmlFor="password">Password</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 transition-all" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password && (
                  <div className="pt-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map(idx => (
                        <div
                          key={idx}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            strength >= idx
                              ? strength >= 3
                                ? 'bg-emerald-500'
                                : strength === 2
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                              : 'bg-secondary'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{strengthText}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-foreground" htmlFor="confirm-password">Confirm Password</label>
                <input 
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60 transition-all" 
                  id="confirm-password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button 
                className="w-full mt-2 flex items-center justify-center gap-2" 
                type="submit"
                loading={loading}
                size="lg"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link className="text-primary font-semibold hover:underline" to="/login">Login</Link>
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

export default Signup;