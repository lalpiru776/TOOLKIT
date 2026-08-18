import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Check, Crown, Zap, X, Shield, Sparkles, Building } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PricingModal: React.FC = () => {
  const { pricingModalOpen, setPricingModalOpen, isProUser, setIsProUser } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!pricingModalOpen) return null;

  const handleUpgrade = (tier: 'pro' | 'business') => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsProUser(true);
      localStorage.setItem('toolkit_pro', 'true');
      setPricingModalOpen(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#ef4444', '#10b981', '#f59e0b'],
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white bg-white/90 p-6 sm:p-8 text-slate-800 shadow-2xl backdrop-blur-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setPricingModalOpen(false)}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Unleash Full AI & File Processing Power</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Transparent Pricing. Cancel Anytime.
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            Enjoy privacy-first client-side file tools with instant Gemini 3.7 AI intelligence.
          </p>

          {/* Billing Switcher */}
          <div className="mt-4 inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition-all flex items-center gap-1 ${
                billingCycle === 'yearly' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Yearly</span>
              <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-800 uppercase">
                Save 35%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Free Tier */}
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Free Tier</h3>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">Basic</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">₹0</span>
                <span className="text-xs text-slate-500 ml-1">/ forever</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Essential day-to-day tools for quick personal tasks.</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>5 files processed / day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Max file size: 25 MB</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Standard compression</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Passport photo basic sizes</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setPricingModalOpen(false)}
              className="mt-6 w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Current Plan
            </button>
          </div>

          {/* 2. Pro Tier (Featured) */}
          <div className="relative rounded-2xl border-2 border-red-500 bg-white p-5 flex flex-col justify-between shadow-xl shadow-red-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-3 py-0.5 text-[10px] font-black uppercase text-white tracking-wide shadow-sm">
              Most Popular
            </span>

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-red-500 fill-current" />
                  <h3 className="font-bold text-base text-slate-900">Pro Supercharged</h3>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {billingCycle === 'yearly' ? '₹1,499' : '₹199'}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  {billingCycle === 'yearly' ? '/ year' : '/ month'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Unlocks all 50+ tools, AI intelligence, and batch pipelines.</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-semibold">Unlimited files & conversions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-red-500" />
                  <span>Max file size: 500 MB</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-red-500" />
                  <span>Full Gemini 3.7 AI PDF Q&A & Summarizer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-red-500" />
                  <span>Exact KB Resizer (&lt;20KB, &lt;50KB) & 4x6 print</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-red-500" />
                  <span>Live Excel Dashboard Generator</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={isProcessing || isProUser}
              className="mt-6 w-full rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/25 hover:bg-red-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Crown className="h-3.5 w-3.5" />
              <span>{isProUser ? 'Plan Active' : isProcessing ? 'Activating...' : 'Upgrade to Pro'}</span>
            </button>
          </div>

          {/* 3. Business / Enterprise Tier */}
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">Enterprise Team</h3>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {billingCycle === 'yearly' ? '₹4,999' : '₹599'}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  {billingCycle === 'yearly' ? '/ year' : '/ month'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">For agencies, legal teams, and high-volume operations.</p>

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Up to 10 team seats included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Batch processing up to 100 files</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Custom branding & watermark templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                  <span>Dedicated high-speed priority queue</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('business')}
              disabled={isProcessing}
              className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Get Business Plan
            </button>
          </div>

        </div>

        {/* Security / Privacy Trust footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>256-bit SSL encrypted checkout. 30-day money-back guarantee. Zero-storage privacy.</span>
        </div>

      </div>
    </div>
  );
};
