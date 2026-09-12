import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Bot, 
  Search, 
  Award, 
  PlayCircle, 
  UploadCloud, 
  FileSearch, 
  GitBranch, 
  UserCheck, 
  Calendar, 
  Send, 
  Users, 
  ArrowRight, 
  Globe, 
  Share2 
} from 'lucide-react';

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#121c2a] font-sans selection:bg-[#E67E22]/20 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center px-6 md:px-12 w-full sticky top-0 z-50 bg-[#f8f9ff]/80 backdrop-blur-md shadow-sm h-16 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bot className="text-[#944a00] w-6 h-6" />
          <span className="font-bold text-lg text-[#944a00]">AgentHire AI</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-10">
          <a className="text-[#564337] hover:text-[#944a00] transition-colors font-semibold text-sm" href="#features">Features</a>
          <a className="text-[#564337] hover:text-[#944a00] transition-colors font-semibold text-sm" href="#workflow">Workflows</a>
          <a className="text-[#564337] hover:text-[#944a00] transition-colors font-semibold text-sm" href="#agents">AI Agents</a>
          <a className="text-[#564337] hover:text-[#944a00] transition-colors font-semibold text-sm" href="#pricing">Pricing</a>
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex relative items-center">
            <Search className="w-4 h-4 absolute left-3 text-[#897365]" />
            <input 
              className="pl-10 pr-4 py-1.5 bg-[#eff4ff] border border-[#dcc1b1] rounded-lg text-sm focus:ring-2 focus:ring-[#ffb783] outline-none transition-all w-48 text-[#121c2a]" 
              placeholder="Search roles..." 
              type="text" 
            />
          </div>
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="bg-gradient-to-r from-[#E67E22] to-[#F59E0B] hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold text-sm shadow-md active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 pb-32 px-6 md:px-12 overflow-hidden bg-gradient-to-b from-[#FFFDF8] to-[#faf5ee]">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffbb8c]/10 border border-[#ffbb8c]/30 rounded-full mx-auto">
                <Award className="text-[#85522c] w-4.5 h-4.5" />
                <span className="text-[#85522c] font-semibold text-xs uppercase tracking-wider">Trusted by 500+ HR Leaders</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#121c2a] max-w-2xl leading-tight mx-auto tracking-tight">
                AI Recruitment <span className="text-[#944a00]">Operating System</span>
              </h1>
              <p className="text-lg md:text-xl text-[#564337] max-w-xl mx-auto leading-relaxed">
                Automate screening, intelligent matching, and interview scheduling. Give your team the bandwidth to focus on what matters: the human connection.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 justify-center">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-[#E67E22] to-[#F59E0B] hover:opacity-95 text-white px-10 py-4 rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-all"
                >
                  Get Started Free
                </button>
                <button className="bg-white border border-[#dcc1b1] text-[#121c2a] hover:bg-gray-50 px-10 py-4 rounded-xl font-semibold text-base shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-gray-600" />
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Diagram Section */}
        <section className="py-16 px-6 md:px-12 bg-[#eff4ff]/30 border-y border-[#ebdccb]/40" id="workflow">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#121c2a]">Precision Hiring Workflow</h2>
              <p className="text-base text-[#564337] mt-2 font-medium">From discovery to offer, handled with intelligent automation.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="flex-1 text-center group w-full md:w-auto">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-[#dcc1b1] shadow-sm hover:border-[#944a00] transition-colors mb-3">
                  <UploadCloud className="text-[#944a00] w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-[#121c2a]">Resume Upload</p>
              </div>
              <div className="hidden md:block w-12 h-px bg-[#dcc1b1]"></div>

              {/* Step 2 */}
              <div className="flex-1 text-center group w-full md:w-auto">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-[#dcc1b1] shadow-sm hover:border-[#944a00] transition-colors mb-3">
                  <FileSearch className="text-[#944a00] w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-[#121c2a]">AI Parser</p>
              </div>
              <div className="hidden md:block w-12 h-px bg-[#dcc1b1]"></div>

              {/* Step 3 */}
              <div className="flex-1 text-center group w-full md:w-auto">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-[#dcc1b1] shadow-sm hover:border-[#944a00] transition-colors mb-3">
                  <GitBranch className="text-[#944a00] w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-[#121c2a]">Skill Matching</p>
              </div>
              <div className="hidden md:block w-12 h-px bg-[#dcc1b1]"></div>

              {/* Step 4 */}
              <div className="flex-1 text-center group w-full md:w-auto">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center border border-[#dcc1b1] shadow-sm hover:border-[#944a00] transition-colors mb-3">
                  <UserCheck className="text-[#944a00] w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-[#121c2a]">Human Approval</p>
              </div>
              <div className="hidden md:block w-12 h-px bg-[#dcc1b1]"></div>

              {/* Step 5 */}
              <div className="flex-1 text-center group w-full md:w-auto">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#E67E22] to-[#F59E0B] rounded-2xl flex items-center justify-center border border-transparent shadow-md mb-3">
                  <Calendar className="text-white w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-[#121c2a]">Interview Set</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-20 px-6 md:px-12" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Feature 1 */}
              <div className="md:col-span-8 bg-white p-8 rounded-2xl border border-[#dcc1b1] shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold text-[#121c2a]">Context-Aware Screening</h3>
                  <p className="text-sm text-[#564337] leading-relaxed">
                    Our AI agents read between the lines of a resume, identifying core competencies and cultural fit through advanced semantic analysis.
                  </p>
                  <a className="inline-flex items-center text-[#944a00] font-bold text-sm gap-1 hover:underline" href="#">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex-1 w-full h-48 bg-[#eff4ff] rounded-xl overflow-hidden shadow-inner border border-gray-100">
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyxiI9hAR7mY4kFtiFQICdhl_wkR5yVrNsc3cgFDU6u8OoZiAX6ccpkRUjWnQvIpsSd-MsBjPjzAy12A9V6m3-BOY8bY8IZk0ocoajGg-vkHFP_xZJhi3MLUqGa9-bSIPmAlI-AairWcx-Vm6X_3xrYhwXMHIt9BYEUGhArCuFaVdY4dcOdoqAo7y4VuRdPv6D6SCPI3IfUMz7uxJ6bdvA8o3sII97nm75JSmzGixQFgtRstqwisWvyMLQiJ8Z2suXmTWAb41yN7o')` }}
                  ></div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="md:col-span-4 bg-white p-8 rounded-2xl border border-[#dcc1b1] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#ffbb8c]/20 rounded-xl flex items-center justify-center mb-6">
                    <Send className="text-[#85522c] w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#121c2a] mb-2">Auto-Scheduling</h3>
                  <p className="text-xs text-[#564337] leading-relaxed">
                    Syncs with your calendar to find the perfect slot for both interviewer and candidate instantly.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="md:col-span-4 bg-white p-8 rounded-2xl border border-[#dcc1b1] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-[#ffdcc5]/20 rounded-xl flex items-center justify-center mb-6">
                    <Users className="text-[#944a00] w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#121c2a] mb-2">Bias Prevention</h3>
                  <p className="text-xs text-[#564337] leading-relaxed">
                    Anonymize candidate profiles to focus purely on skills and achievements during initial stages.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="md:col-span-8 bg-white p-8 rounded-2xl border border-[#dcc1b1] shadow-sm flex flex-col md:flex-row-reverse gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <h3 className="text-2xl font-bold text-[#121c2a]">Collaborative Portals</h3>
                  <p className="text-sm text-[#564337] leading-relaxed">
                    Shared workspaces where hiring managers and recruiters can leave feedback and score candidates in real-time.
                  </p>
                  <a className="inline-flex items-center text-[#944a00] font-bold text-sm gap-1 hover:underline" href="#">
                    See how it works <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex-1 w-full h-48 bg-[#eff4ff] rounded-xl overflow-hidden shadow-inner border border-gray-100">
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJfkLq19P97jNSgycTt5-sDCKFmAqzqkpGR2S63zOUjztcQlbOkI85fzZa4AAjTeXtWGWf0w-a3KVTnh9CG8J0-5TUNI3TNtn0jae88c2GaDG_VUxddX8ciWTmZqSvZLgZxU_0Q5zJC1MXNbzoVQWnUdg0ho6b4QK3IlTHVqpd0G1LVME0-chmk_8di33KHoqBQtljP4BrheFD2g59UMWZcQmK7n99frPoN73yEvgK13EctNHcHhsttW9kkQMWUPAYezOcgR9oLRA')` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* AI Agents Section */}
        <section className="py-20 px-6 md:px-12 bg-[#eff4ff]/20 border-y border-[#ebdccb]/40" id="agents">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#121c2a] mb-12">Meet Your New AI Recruiting Team</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Agent 1 */}
              <div className="bg-white p-6 rounded-2xl border border-[#dcc1b1] shadow-sm text-left">
                <div className="w-16 h-16 rounded-full bg-[#ffdcc5]/10 mb-6 overflow-hidden border border-gray-100">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="The Sourcer Avatar" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-lA0q88t2OwWm_emioipt13-pcuw4FPNUnXv486CHbAAN5ML3aob90tFJCmJ_U5zJpHypdvtZ3pkqtojChEeX96EWLiwXLovaU6n1QBPvTmW56Jf0pAA8YqC0_OylpsIVVAZvvgVHCWfduXmFoYgqnlNN7G82ecJ3r5zocMXMLRY_V92LNcO512w34I3MDTvYgOJaib1CKtmeeR949984zRiGC4DrnOb4ZGG3iHPzYZYdwNHHlBBKIfGaEvyr1c28p48ZfNdbsEk"
                  />
                </div>
                <h4 className="text-lg font-bold text-[#121c2a]">The Sourcer</h4>
                <p className="text-[#944a00] font-semibold text-xs mb-3">Active 24/7</p>
                <p className="text-xs text-[#564337] leading-relaxed">
                  Crawls professional networks to find passive talent that matches your ideal candidate persona perfectly.
                </p>
              </div>

              {/* Agent 2 */}
              <div className="bg-white p-6 rounded-2xl border border-[#dcc1b1] shadow-sm text-left">
                <div className="w-16 h-16 rounded-full bg-[#ffdcc5]/10 mb-6 overflow-hidden border border-gray-100">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="The Screener Avatar" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBil5l2BaUWJfVMQD2nAykMp_s6cDcR3ehHFaY9xRYAnmI2YxPHlb6H6yr9x3Hp_MDetZJRoRoFtct_DfuG_FRGgEnfV2jF4uI12bHLOicJPUpKyHsN4LdI3CgF2Yv-9xDuVk9HnjkjReeOHdJGvA5fXMr-eL-41cRpj8lrHngSB04nADUdeoitICjr7L__gzmqq-ma3r14fr22gS77W7bOQX5JXN7VLKbhgUANW96q2wfBct_X0ML_Q-uKSMLPIJcnuXwQ-1DiUnY"
                  />
                </div>
                <h4 className="text-lg font-bold text-[#121c2a]">The Screener</h4>
                <p className="text-[#944a00] font-semibold text-xs mb-3">Skills Focused</p>
                <p className="text-xs text-[#564337] leading-relaxed">
                  Conducts initial technical assessments and clarifies resume gaps through automated conversational interfaces.
                </p>
              </div>

              {/* Agent 3 */}
              <div className="bg-white p-6 rounded-2xl border border-[#dcc1b1] shadow-sm text-left">
                <div className="w-16 h-16 rounded-full bg-[#ffdcc5]/10 mb-6 overflow-hidden border border-gray-100">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="The Concierge Avatar" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAccQzeW_Al5vP20-x2SK6RAdIBvm3tT9Sz2VMpnl5yU2jPc6E7dgkqsa9hUReDdKffzQJkMNVo40B_FAZsYz6FWpC6vx1VLoTtTbkA6FLhiz26BG-l68pB6arKpYKos2KMo4ZmjT4rhpg_QXIij0lLmFV-MEYGURYLJx819zwuZ9tMknCpKcyGeHkCfwS0HQ2NspO6ip8-21idg2X6r4Qn__V-39z8ed_Aw48za0iGC6gs7OHrPk47nurw5QNuqg2WymhaIIMQNM"
                  />
                </div>
                <h4 className="text-lg font-bold text-[#121c2a]">The Concierge</h4>
                <p className="text-[#944a00] font-semibold text-xs mb-3">Experience First</p>
                <p className="text-xs text-[#564337] leading-relaxed">
                  Maintains high candidate engagement by answering FAQs and providing interview preparation guides automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 px-6 md:px-12" id="pricing">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#121c2a]">Simple, Transparent Plans</h2>
              <p className="text-base text-[#564337] mt-2 font-medium">No hidden seats or credit limits. Just results.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {/* Basic */}
              <div className="bg-white p-8 rounded-2xl border border-[#dcc1b1] shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#564337] uppercase tracking-widest mb-2">Growth</h4>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-[#121c2a]">$49</span>
                    <span className="text-xs text-[#564337] font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      5 Active Job Slots
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      Unlimited Resumes
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      AI Sourcing Agent
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#dcc1b1] rounded-xl text-sm font-semibold hover:bg-[#eff4ff] transition-colors active:scale-95">
                  Start Basic
                </button>
              </div>

              {/* Pro (Featured) */}
              <div className="bg-white p-8 rounded-2xl border-2 border-[#944a00] shadow-md relative flex flex-col justify-between md:scale-105">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-[#E67E22] to-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#944a00] uppercase tracking-widest mb-2 mt-2">Scale</h4>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-[#121c2a]">$149</span>
                    <span className="text-xs text-[#564337] font-medium">/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      25 Active Job Slots
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      Full AI Agent Team
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      Slack &amp; HRIS Sync
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      Advanced Analytics
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-[#E67E22] to-[#F59E0B] text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-transform">
                  Get Started Now
                </button>
              </div>

              {/* Enterprise */}
              <div className="bg-white p-8 rounded-2xl border border-[#dcc1b1] shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#564337] uppercase tracking-widest mb-2">Enterprise</h4>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold text-[#121c2a]">Custom</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      Unlimited Everything
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      Dedicated Success Manager
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#121c2a]">
                      <svg className="w-5 h-5 text-[#944a00]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 8 12 12 14 14" />
                      </svg>
                      On-premise AI training
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 border border-[#dcc1b1] rounded-xl text-sm font-semibold hover:bg-[#eff4ff] transition-colors active:scale-95">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 md:px-12 mb-16">
          <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#E67E22] to-[#F59E0B] rounded-[32px] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
              </svg>
            </div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold max-w-2xl mx-auto">Ready to hire your next star teammate?</h2>
              <p className="text-base md:text-lg text-white/90 max-w-xl mx-auto">Join the future of recruitment. Try AgentHire AI for 14 days, no credit card required.</p>
              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-white text-[#944a00] hover:bg-gray-50 px-10 py-4 rounded-xl font-semibold text-base shadow-xl active:scale-95 transition-all"
                >
                  Start Your Free Trial
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 w-full py-8 border-t border-[#dcc1b1] bg-white mt-auto gap-6 text-sm text-[#564337]">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <div className="flex items-center gap-2">
            <Bot className="text-[#944a00] w-5 h-5" />
            <span className="font-bold text-[#944a00]">AgentHire AI</span>
          </div>
          <p className="text-xs text-gray-500">© 2024 AgentHire AI. Human-Centric Intelligence.</p>
        </div>
        
        <div className="flex gap-8">
          <Link className="hover:underline" to="#">Privacy Policy</Link>
          <Link className="hover:underline" to="#">Terms of Service</Link>
          <Link className="hover:underline" to="#">Support</Link>
        </div>

        <div className="flex gap-4">
          <button className="w-8 h-8 rounded-full border border-[#dcc1b1] flex items-center justify-center hover:text-[#944a00] transition-colors">
            <Globe className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full border border-[#dcc1b1] flex items-center justify-center hover:text-[#944a00] transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Home;
