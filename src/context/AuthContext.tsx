import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

export type ClientPlan = 'free' | 'pro' | 'enterprise';
export type ClientType = 'enterprise' | 'agency' | 'freelancer' | 'individual' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  clientType: ClientType;
  plan: ClientPlan;
  createdAt: string;
  conversionsCount: number;
  aiCreditsRemaining: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'signin' | 'signup' | 'forgot';
  openAuthModal: (tab?: 'signin' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    company?: string;
    clientType?: ClientType;
  }) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ success: boolean; error?: string }>;
  signInDemoAccount: (role: 'enterprise' | 'pro' | 'free') => void;
  signOut: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  incrementConversionCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'toolkit_auth_user';
const USERS_DB_KEY = 'toolkit_registered_clients_db';

// Initial Demo Client Profiles
const DEMO_PROFILES: Record<'enterprise' | 'pro' | 'free', UserProfile> = {
  enterprise: {
    id: 'client_ent_9021',
    name: 'Alexander Wright',
    email: 'alexander@apexenterprises.corp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    company: 'Apex Global Enterprises',
    clientType: 'enterprise',
    plan: 'enterprise',
    createdAt: '2026-01-15',
    conversionsCount: 342,
    aiCreditsRemaining: 50000,
  },
  pro: {
    id: 'client_pro_4482',
    name: 'Elena Rostova',
    email: 'elena.design@studioflow.io',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    company: 'Studio Flow Creative',
    clientType: 'agency',
    plan: 'pro',
    createdAt: '2026-03-10',
    conversionsCount: 128,
    aiCreditsRemaining: 15000,
  },
  free: {
    id: 'client_free_1092',
    name: 'Marcus Vance',
    email: 'marcus.v@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    company: 'Independent Client',
    clientType: 'individual',
    plan: 'free',
    createdAt: '2026-08-01',
    conversionsCount: 19,
    aiCreditsRemaining: 1500,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSuccessToast, showErrorToast, showInfoToast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup' | 'forgot'>('signin');

  const openAuthModal = useCallback((tab: 'signin' | 'signup' | 'forgot' = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Persist user on change
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Sync Pro status in localStorage
      if (user.plan === 'pro' || user.plan === 'enterprise') {
        localStorage.setItem('toolkit_pro', 'true');
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Sign In Handler
  const signIn = async (
    email: string,
    pass: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      if (!email || !email.includes('@')) {
        setIsLoading(false);
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (!pass || pass.length < 4) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 4 characters.' };
      }

      // Check registered users database in localStorage
      let usersDb: Record<string, any> = {};
      try {
        const stored = localStorage.getItem(USERS_DB_KEY);
        usersDb = stored ? JSON.parse(stored) : {};
      } catch {
        usersDb = {};
      }

      const existing = usersDb[email.toLowerCase()];
      let profile: UserProfile;

      if (existing) {
        if (existing.password && existing.password !== pass) {
          setIsLoading(false);
          return { success: false, error: 'Incorrect password. Please verify credentials.' };
        }
        profile = existing.profile;
      } else {
        // Create client account on-the-fly for smooth client access
        const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        profile = {
          id: `client_${Date.now()}`,
          name: capitalized,
          email: email.toLowerCase(),
          clientType: 'individual',
          plan: 'free',
          createdAt: new Date().toISOString().split('T')[0],
          conversionsCount: 1,
          aiCreditsRemaining: 2000,
        };

        usersDb[email.toLowerCase()] = { password: pass, profile };
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));
      }

      setUser(profile);
      setIsLoading(false);
      closeAuthModal();

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showSuccessToast(`Welcome back, ${profile.name}! Signed in successfully.`, 'Authentication Confirmed');

      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Authentication failed' };
    }
  };

  // Sign Up Handler
  const signUp = async (data: {
    name: string;
    email: string;
    password: string;
    company?: string;
    clientType?: ClientType;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 750));

    try {
      if (!data.name || data.name.trim().length < 2) {
        setIsLoading(false);
        return { success: false, error: 'Please enter your full name.' };
      }
      if (!data.email || !data.email.includes('@')) {
        setIsLoading(false);
        return { success: false, error: 'Please enter a valid work email.' };
      }
      if (!data.password || data.password.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      let usersDb: Record<string, any> = {};
      try {
        const stored = localStorage.getItem(USERS_DB_KEY);
        usersDb = stored ? JSON.parse(stored) : {};
      } catch {
        usersDb = {};
      }

      const clientType = data.clientType || (data.company ? 'enterprise' : 'individual');
      const plan: ClientPlan = clientType === 'enterprise' ? 'enterprise' : 'pro';

      const newProfile: UserProfile = {
        id: `client_${Date.now()}`,
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        company: data.company?.trim() || undefined,
        clientType,
        plan,
        createdAt: new Date().toISOString().split('T')[0],
        conversionsCount: 0,
        aiCreditsRemaining: plan === 'enterprise' ? 50000 : 15000,
      };

      usersDb[data.email.toLowerCase().trim()] = {
        password: data.password,
        profile: newProfile,
      };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersDb));

      setUser(newProfile);
      setIsLoading(false);
      closeAuthModal();

      confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
      showSuccessToast(
        `Account created successfully for ${newProfile.name}! ${plan.toUpperCase()} tier privileges unlocked.`,
        'Welcome to TOOLKIT AI'
      );

      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Registration failed' };
    }
  };

  // 1-Click Social OAuth
  const signInWithOAuth = async (provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const providerName = provider === 'google' ? 'Google' : 'GitHub';
    const email = provider === 'google' ? 'client.google.user@gmail.com' : 'dev.client@github.com';
    const name = provider === 'google' ? 'Google Client' : 'GitHub Developer';

    const profile: UserProfile = {
      id: `client_${provider}_${Date.now()}`,
      name,
      email,
      avatar:
        provider === 'google'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      clientType: provider === 'google' ? 'enterprise' : 'freelancer',
      plan: 'pro',
      createdAt: new Date().toISOString().split('T')[0],
      conversionsCount: 15,
      aiCreditsRemaining: 20000,
    };

    setUser(profile);
    setIsLoading(false);
    closeAuthModal();

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    showSuccessToast(`Authenticated via ${providerName} Single Sign-On!`, 'SSO Login Confirmed');

    return { success: true };
  };

  // 1-Click Quick Demo Login
  const signInDemoAccount = (role: 'enterprise' | 'pro' | 'free') => {
    const demo = DEMO_PROFILES[role];
    setUser(demo);
    closeAuthModal();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showSuccessToast(`Signed in as ${demo.name} (${demo.plan.toUpperCase()} Client)`, 'Demo Mode Active');
  };

  // Sign Out Handler
  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    showInfoToast('You have been signed out safely. Client session ended.', 'Signed Out');
  };

  // Update Profile Details
  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    showSuccessToast('Client profile updated successfully.', 'Profile Saved');
  };

  // Password Reset
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    return {
      success: true,
      message: `Password reset instructions and security token dispatched to ${email}.`,
    };
  };

  const incrementConversionCount = () => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, conversionsCount: prev.conversionsCount + 1 } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signInWithOAuth,
        signInDemoAccount,
        signOut,
        updateProfile,
        resetPassword,
        incrementConversionCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
