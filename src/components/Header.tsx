import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserProfileMenu } from './auth/UserProfileMenu';
import { AppTheme } from '../types';
import {
  Sparkles,
  Zap,
  Box,
  Crown,
  Search,
  Check,
  ChevronDown,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface HeaderProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenSmartWorkspace: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: 'catalog' | 'smart-workspace' | 'tool';
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenSmartWorkspace,
  searchQuery,
  onSearchChange,
  activeView,
  onNavigateHome,
}) => {
  const { theme, setTheme, is3DEnabled, setIs3DEnabled, isProUser, setPricingModalOpen } = useTheme();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const themeOptions: { id: AppTheme; label: string; bgClass: string }[] = [
    { id: 'studio-white', label: 'Frosted Glass', bgClass: 'bg-blue-600' },
    { id: 'cyber-blue', label: 'Ocean Blue', bgClass: 'bg-cyan-500' },
    { id: 'crimson-red', label: 'Crimson Red', bgClass: 'bg-red-500' },
    { id: 'midnight-dark', label: 'Midnight Dark', bgClass: 'bg-slate-800' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/60 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Zone (Single Element) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="group flex items-center gap-2.5 text-left focus-visible:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-md shadow-blue-600/20 transition-transform group-hover:scale-105">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                TOOLKIT <span className="text-blue-600">AI</span>
              </span>
            </div>
          </button>
        </div>

        {/* Search & Navigation Zone */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 50+ tools (e.g. Merge, Passport KB, Excel BI, OCR)..."
              className="w-full rounded-full border border-slate-200/80 bg-white/60 py-1.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 backdrop-blur-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Smart Workspace Button */}
          <button
            onClick={onOpenSmartWorkspace}
            className={`hidden sm:flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
              activeView === 'smart-workspace'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white/60 text-slate-700 hover:bg-white border border-slate-200/80 shadow-sm'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Smart Workspace</span>
          </button>

          {/* 3D Visualizer Toggle */}
          <button
            onClick={() => setIs3DEnabled(!is3DEnabled)}
            title={is3DEnabled ? '3D Visualizer: ON' : '3D Visualizer: OFF'}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all ${
              is3DEnabled
                ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-slate-200/80 bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{is3DEnabled ? '3D ON' : '3D OFF'}</span>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white focus:outline-none shadow-sm"
            >
              <div className="h-3 w-3 rounded-full bg-blue-600 shadow-sm" />
              <span className="hidden sm:inline capitalize">
                Theme
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {themeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setThemeDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-48 origin-top-right rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-2xl backdrop-blur-xl">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Appearance
                  </div>
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setTheme(opt.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                        theme === opt.id
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-3.5 w-3.5 rounded-full ${opt.bgClass}`} />
                        <span>{opt.label}</span>
                      </div>
                      {theme === opt.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Go Pro / Pricing Button */}
          <button
            onClick={() => setPricingModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{isProUser ? 'PRO' : 'Go Pro'}</span>
          </button>

          {/* Client Authentication Zone */}
          {isAuthenticated ? (
            <UserProfileMenu />
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('signin')}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-white/80 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup')}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
