import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-0 md:p-12 overflow-x-hidden relative font-sans">
      {/* Auth Container */}
      <main className="w-full max-w-[1200px] h-full md:h-[800px] flex flex-col md:flex-row bg-white rounded-none md:rounded-xl overflow-hidden shadow-sm border border-[#dcc1b1]">
        
        {/* Left Side: Illustration & Branding */}
        <section className="hidden md:flex w-1/2 bg-gradient-to-br from-[#FFFDF8] to-[#F8F5EF] p-16 flex-col justify-between relative overflow-hidden border-r border-[#dcc1b1]">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#ffdcc6] opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ffdcc5] opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
          
          <div className="z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">AH</div>
              <h1 className="text-3xl font-extrabold text-[#944a00]">AgentHire AI</h1>
            </div>
            <p className="text-lg text-[#564337] font-medium max-w-sm">The human-centric recruitment OS built for modern talent discovery.</p>
          </div>

          <div className="z-10 relative flex items-center justify-center py-10">
            <div className="w-full h-80 relative flex items-center justify-center">
              <img 
                className="object-contain max-h-full drop-shadow-[0_0_20px_rgba(244,177,131,0.2)]" 
                alt="Human-centric recruitment and AI intelligence illustration" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc67xSP9zQm853ZwCQnbdUFM6LLRyg_ovyjQW6AgAkq3AliyTiSkNLqEekCYOntRH6zUuMf3XHzJyCu-tVXqZJcLIXY82CVCn3BcA7W9OeRaBD6b0ViLzXOp7FgBweh0MP-Kb3WxmizOjtosCxJMp_YmSeRSW-_NhqlbNPft9-GNLh_9Sccx9HVBKrGjbaimhFVJVtQCKW-W0332c6PWgORiXgfGA7N4jbB878AfOo_S6L_OOWQPGnhYoI8WuAkS_MPRzZYUuLKUg"
              />
            </div>
          </div>

          <div className="z-10">
            <div className="flex gap-2 items-center mb-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#d9e3f6]"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#ffdcc5]"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-[#ffdcc6]"></div>
              </div>
              <span className="text-xs font-semibold text-[#85522c]">Trusted by 500+ talent teams</span>
            </div>
            <blockquote className="text-base italic text-[#564337] border-l-4 border-[#944a00] pl-6 py-2">
              "AgentHire has transformed our hiring process from a manual grind into a strategic advantage."
            </blockquote>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center items-center bg-white">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-[#121c2a] mb-2">Welcome back</h2>
              <p className="text-sm text-[#564337] font-medium">Enter your details to access your recruitment dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Authentication Error</p>
                  <p className="text-red-600/90 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#121c2a]" htmlFor="email">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#897365] w-5 h-5" />
                  <input 
                    className="w-full pl-[44px] pr-4 py-3 border border-[#dcc1b1] rounded-lg bg-white text-[#121c2a] focus:ring-2 focus:ring-[#ffb783] focus:border-[#ffb783] outline-none transition-all text-sm" 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-[#121c2a]" htmlFor="password">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#897365] w-5 h-5" />
                  <input 
                    className="w-full pl-[44px] pr-[44px] py-3 border border-[#dcc1b1] rounded-lg bg-white text-[#121c2a] focus:ring-2 focus:ring-[#ffb783] focus:border-[#ffb783] outline-none transition-all text-sm" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#897365] hover:text-[#121c2a] transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input 
                  className="w-4 h-4 rounded border-[#dcc1b1] text-[#944a00] focus:ring-[#ffb783]" 
                  id="remember" 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-sm text-[#564337] cursor-pointer selection:bg-transparent" htmlFor="remember">Remember me for 30 days</label>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full bg-gradient-to-r from-[#E67E22] to-[#F59E0B] hover:opacity-95 text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Login to Dashboard
                    <span className="text-base">→</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#564337]">
              Don't have an account?{' '}
              <Link className="text-[#944a00] font-bold hover:underline" to="/signup">Sign up for free</Link>
            </p>
          </div>
        </section>
      </main>

      {/* Simple Footer for Legal */}
      <footer className="absolute bottom-4 md:bottom-2 left-1/2 -translate-x-1/2 w-full px-6 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 opacity-60">
        <span className="text-xs font-semibold text-[#85522c]">© {new Date().getFullYear()} AgentHire AI</span>
      </footer>
    </div>
  );
};

export default Login;
