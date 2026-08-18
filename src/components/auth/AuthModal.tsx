import React, { useState } from 'react';
import { useAuth, ClientType } from '../../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Zap,
  Briefcase,
  Layers,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    openAuthModal,
    signIn,
    signUp,
    signInWithOAuth,
    signInDemoAccount,
    resetPassword,
    isLoading,
  } = useAuth();

  // Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpCompany, setSignUpCompany] = useState('');
  const [signUpClientType, setSignUpClientType] = useState<ClientType>('enterprise');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = await signIn(signInEmail, signInPassword, rememberMe);
    if (!res.success) {
      setErrorMessage(res.error || 'Sign in failed. Please try again.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAccepted) {
      setErrorMessage('Please accept the client terms of service to proceed.');
      return;
    }

    const res = await signUp({
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
      company: signUpCompany,
      clientType: signUpClientType,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Account creation failed. Please try again.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = await resetPassword(forgotEmail);
    if (res.success) {
      setForgotSubmitted(true);
      setForgotMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 10) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong (Enterprise Ready)', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(signUpPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all z-10 my-8">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Top Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-xl shadow-lg shadow-blue-600/30">
            F
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {authModalTab === 'signin' && 'Sign In to Client Portal'}
            {authModalTab === 'signup' && 'Create Client Account'}
            {authModalTab === 'forgot' && 'Reset Client Password'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            {authModalTab === 'signin' && 'Access all 50+ privacy-first conversion engines & AI workspace.'}
            {authModalTab === 'signup' && 'Instant access to client workspace with zero server storage.'}
            {authModalTab === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        {authModalTab !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100/80 p-1 mb-6 border border-slate-200/60">
            <button
              onClick={() => {
                openAuthModal('signin');
                setErrorMessage(null);
              }}
              className={`rounded-xl py-2 text-xs sm:text-sm font-bold transition-all ${
                authModalTab === 'signin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                openAuthModal('signup');
                setErrorMessage(null);
              }}
              className={`rounded-xl py-2 text-xs sm:text-sm font-bold transition-all ${
                authModalTab === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-CLICK SOCIAL LOGIN (Google & GitHub) */}
        {authModalTab !== 'forgot' && (
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => signInWithOAuth('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google SSO</span>
              </button>

              <button
                type="button"
                onClick={() => signInWithOAuth('github')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all disabled:opacity-50"
              >
                <svg className="h-4 w-4 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub SSO</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Or with Work Email
              </span>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: SIGN IN FORM */}
        {/* ---------------------------------------------------- */}
        {authModalTab === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Client Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => openAuthModal('forgot')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-blue-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Verifying...' : 'Sign In to Client Portal'}</span>
            </button>

            {/* Quick 1-Click Demo Client Logins */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                1-Click Quick Demo Client Logins
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => signInDemoAccount('enterprise')}
                  className="rounded-xl border border-purple-200 bg-purple-50/70 p-2 text-left hover:bg-purple-100 transition-all"
                >
                  <div className="text-[11px] font-bold text-purple-900">Enterprise</div>
                  <div className="text-[9px] text-purple-600">Alexander W.</div>
                </button>
                <button
                  type="button"
                  onClick={() => signInDemoAccount('pro')}
                  className="rounded-xl border border-blue-200 bg-blue-50/70 p-2 text-left hover:bg-blue-100 transition-all"
                >
                  <div className="text-[11px] font-bold text-blue-900">Agency Pro</div>
                  <div className="text-[9px] text-blue-600">Elena R.</div>
                </button>
                <button
                  type="button"
                  onClick={() => signInDemoAccount('free')}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100 transition-all"
                >
                  <div className="text-[11px] font-bold text-slate-800">Individual</div>
                  <div className="text-[9px] text-slate-500">Marcus V.</div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: SIGN UP FORM */}
        {/* ---------------------------------------------------- */}
        {authModalTab === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Work / Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="sarah@enterprise.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Company / Agency (Optional)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={signUpCompany}
                    onChange={(e) => setSignUpCompany(e.target.value)}
                    placeholder="Company Name"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Client Category</label>
                <select
                  value={signUpClientType}
                  onChange={(e) => setSignUpClientType(e.target.value as ClientType)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="enterprise">🏢 Enterprise Client</option>
                  <option value="agency">💼 Agency / Team</option>
                  <option value="freelancer">⚡ Freelancer / Pro</option>
                  <option value="individual">👤 Individual</option>
                  <option value="student">🎓 Academic / Student</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Create Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-10 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength visual indicator */}
              {signUpPassword && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden flex gap-1">
                    <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'} flex-1`} />
                    <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'} flex-1`} />
                    <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'} flex-1`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{strength.label}</span>
                </div>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 text-[11px] font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span>
                  I agree to the client terms of service, zero-log privacy policy & client data sovereignty standards.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-blue-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isLoading ? 'Creating Client Account...' : 'Create Account & Access Studio'}</span>
            </button>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: FORGOT PASSWORD */}
        {/* ---------------------------------------------------- */}
        {authModalTab === 'forgot' && (
          <div className="space-y-4">
            {forgotSubmitted ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Recovery Instructions Dispatched</h4>
                <p className="text-xs text-emerald-700">{forgotMessage}</p>
                <button
                  onClick={() => {
                    setForgotSubmitted(false);
                    openAuthModal('signin');
                  }}
                  className="mt-2 text-xs font-bold text-blue-600 underline"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block">Account Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <span>Send Recovery Instructions</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Modal Security Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-bit SSL & Client-Side Sandbox</span>
          </div>
          <span>100% Privacy Protected</span>
        </div>

      </div>
    </div>
  );
};
