import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, Loader2 } from 'lucide-react';

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

  // Visual password strength (4 segments)
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
    const colors = ['#E5E7EB', '#EF4444', '#F59E0B', '#10B981', '#10B981'];
    const labels = [
      'Password must be at least 8 characters.',
      'Weak - try adding numbers',
      'Fair - keep going!',
      'Good password',
      'Excellent strength!'
    ];
    return {
      text: labels[strength],
      color: strength > 0 ? colors[strength] : '#564337',
      colorsList: colors
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
  const { text: strengthText, color: strengthColor, colorsList } = getStrengthTextAndColor(strength);

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-0 font-sans selection:bg-[#E67E22]/20">
      {/* Main Content Grid */}
      <main className="w-full min-h-screen flex flex-col md:flex-row">
        
        {/* Left Side: Brand Storytelling & Graphics */}
        <section className="hidden md:flex md:w-1/2 bg-[#F8F5EF] relative overflow-hidden flex-col justify-center px-12 md:px-16 border-r border-[#dcc1b1]">
          {/* Animated Background Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#F4B183] opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-[#E67E22] opacity-10 rounded-full blur-3xl animate-pulse duration-10000" style={{ animationDelay: '-5s' }}></div>
          
          <div className="relative z-10 max-w-lg">
            <div className="mb-10">
              <span className="text-3xl font-extrabold text-[#944a00]">AgentHire AI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#121c2a] mb-6 leading-tight tracking-tight">
              Empowering the human side of recruitment.
            </h1>
            <p className="text-lg text-[#564337] mb-12 leading-relaxed font-medium">
              Join thousands of talent acquisition leaders using AI to automate the mundane and focus on what matters: building meaningful connections with world-class talent.
            </p>
            
            {/* Graphic Element */}
            <div className="relative rounded-xl overflow-hidden shadow-md border border-[#dcc1b1] aspect-video bg-white">
              <img 
                className="w-full h-full object-cover" 
                alt="A professional and warm office scene showing HR specialists collaborating" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDv6sfrcIJIhOmBZTvWJ3eQAul4MXtPv2QADQAP5bYPM7jtpoxMABSC74xme_XrqRWq84mqJNvxNkDM98NFNS2dWI_k5u9TNfWkMF4lt6VGKSo1R5561U4rwI5vc97GXOpxlVt78sm3erNF5Wvv7rIfIVmG6n_Zl8DZ_VT3o2CMKDRh70R7BUvDhzR9MxHPeppxer87Sr082COklMgSfd_v9XZ1Np0Gznw501Dh-vXTQsRCtxY4duNgSu154XYL2gxQNpxSSuZWJ4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#F8F5EF] bg-[#d9e3f6]"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#F8F5EF] bg-[#dee9fc]"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#F8F5EF] bg-[#e6eeff]"></div>
              </div>
              <span className="text-sm font-semibold text-[#564337]">Trusted by 500+ talent teams worldwide</span>
            </div>
          </div>
        </section>

        {/* Right Side: Signup Form */}
        <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#FFFDF8]">
          <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#E5E7EB]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#121c2a] mb-2">Create your account</h2>
              <p className="text-sm text-[#564337] font-medium">Start your 14-day free trial. No credit card required.</p>
            </div>

            {(error || passwordError) && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-red-600/90 text-xs mt-0.5">{error || passwordError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#121c2a] mb-1" htmlFor="fullname">Full Name</label>
                <input 
                  className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#F4B183] focus:border-[#F4B183] outline-none transition-all text-sm text-[#121c2a]" 
                  id="fullname" 
                  placeholder="Alex Johnson" 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-sm font-semibold text-[#121c2a] mb-1" htmlFor="email">Work Email</label>
                <input 
                  className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#F4B183] focus:border-[#F4B183] outline-none transition-all text-sm text-[#121c2a]" 
                  id="email" 
                  placeholder="alex@company.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-[#121c2a] mb-1" htmlFor="role">Recruiter Role</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#F4B183] focus:border-[#F4B183] outline-none transition-all text-sm text-[#121c2a] cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22%2523564337%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.875rem_center] bg-no-repeat pr-10" 
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
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#121c2a] mb-1" htmlFor="password">Password</label>
                <input 
                  className="password-input w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#F4B183] focus:border-[#F4B183] outline-none transition-all text-sm text-[#121c2a]" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {/* Strength Indicator */}
                <div className="strength-container mt-2 flex gap-1">
                  <div className="h-1 flex-1 rounded transition-all duration-300" id="meter-1" style={{ backgroundColor: strength >= 1 ? colorsList[strength] : colorsList[0] }}></div>
                  <div className="h-1 flex-1 rounded transition-all duration-300" id="meter-2" style={{ backgroundColor: strength >= 2 ? colorsList[strength] : colorsList[0] }}></div>
                  <div className="h-1 flex-1 rounded transition-all duration-300" id="meter-3" style={{ backgroundColor: strength >= 3 ? colorsList[strength] : colorsList[0] }}></div>
                  <div className="h-1 flex-1 rounded transition-all duration-300" id="meter-4" style={{ backgroundColor: strength >= 4 ? colorsList[strength] : colorsList[0] }}></div>
                </div>
                <p className="text-xs font-semibold mt-1.5 transition-colors" style={{ color: strengthColor }} id="strength-text">
                  {strengthText}
                </p>
              </div>

              {/* Confirm Password */}
              <div className="pb-2">
                <label className="block text-sm font-semibold text-[#121c2a] mb-1" htmlFor="confirm-password">Confirm Password</label>
                <input 
                  className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#F4B183] focus:border-[#F4B183] outline-none transition-all text-sm text-[#121c2a]" 
                  id="confirm-password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* Primary Action */}
              <button 
                className="bg-gradient-to-r from-[#E67E22] to-[#F59E0B] w-full py-3 px-4 text-white font-bold rounded-lg shadow-sm hover:shadow-md hover:opacity-95 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer Link */}
            <p className="mt-8 text-center text-sm text-[#564337]">
              Already have an account?{' '}
              <Link className="text-[#944a00] font-bold hover:underline" to="/login">Login</Link>
            </p>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="fixed bottom-0 w-full flex justify-center py-2 px-6">
        <p className="text-xs text-[#564337]/60">
          © {new Date().getFullYear()} AgentHire AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Signup;
