import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  User,
  LogOut,
  Crown,
  Shield,
  Sparkles,
  Building,
  CheckCircle2,
  ChevronDown,
  Layers,
  Zap,
  Settings,
  Mail,
  Edit2,
  ExternalLink,
} from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { setPricingModalOpen } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editCompany, setEditCompany] = useState(user?.company || '');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditCompany(user.company || '');
    }
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim(),
      company: editCompany.trim() || undefined,
    });
    setIsEditingProfile(false);
  };

  const getPlanBadge = () => {
    if (user.plan === 'enterprise') {
      return {
        label: 'Enterprise Client',
        badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Shield,
      };
    }
    if (user.plan === 'pro') {
      return {
        label: 'Pro Client',
        badgeClass: 'bg-red-100 text-red-700 border-red-200',
        icon: Crown,
      };
    }
    return {
      label: 'Free Client',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: User,
    };
  };

  const planInfo = getPlanBadge();
  const PlanIcon = planInfo.icon;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      
      {/* Top Header Client Trigger Pill */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 py-1 pl-1 pr-2.5 shadow-sm hover:bg-white transition-all group"
      >
        {/* Avatar Circle */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-7 w-7 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs">
            {initials || 'U'}
          </div>
        )}

        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
            {user.name}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
            {user.plan}
          </span>
        </div>

        <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-700 transition-transform" />
      </button>

      {/* Profile Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl z-50 transition-all space-y-4">
          
          {/* User Profile Header Card */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-11 w-11 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-sm shrink-0 shadow-sm">
                {initials || 'U'}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
              </div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
              {user.company && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 font-medium truncate">
                  <Building className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{user.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Plan Status & Quota Stats */}
          <div className="rounded-2xl border border-slate-100 bg-white p-3 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Tier</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${planInfo.badgeClass}`}
              >
                <PlanIcon className="h-3 w-3" />
                <span>{planInfo.label}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div className="p-2 rounded-xl bg-slate-50 text-left">
                <div className="text-[10px] font-bold text-slate-400">Total Ops</div>
                <div className="text-xs font-black text-slate-800">{user.conversionsCount} files</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 text-left">
                <div className="text-[10px] font-bold text-slate-400">AI Compute</div>
                <div className="text-xs font-black text-blue-600">{user.aiCreditsRemaining.toLocaleString()} tokens</div>
              </div>
            </div>

            {user.plan === 'free' && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setPricingModalOpen(true);
                }}
                className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-2 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:opacity-95 transition-all"
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Upgrade to Pro / Enterprise</span>
              </button>
            )}
          </div>

          {/* Edit Profile Form toggle */}
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-xs font-bold text-slate-800">Edit Client Information</div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={editCompany}
                onChange={(e) => setEditCompany(e.target.value)}
                placeholder="Company / Agency"
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Edit2 className="h-4 w-4 text-slate-400" />
                <span>Edit Client Profile & Company</span>
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setPricingModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Crown className="h-4 w-4 text-amber-500" />
                <span>Manage Client Subscription</span>
              </button>
            </div>
          )}

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Client Session</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
