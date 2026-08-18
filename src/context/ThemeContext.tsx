import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  is3DEnabled: boolean;
  setIs3DEnabled: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  isProUser: boolean;
  setIsProUser: (val: boolean) => void;
  pricingModalOpen: boolean;
  setPricingModalOpen: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('toolkit_theme');
    return (saved as AppTheme) || 'cyber-blue';
  });

  const [is3DEnabled, setIs3DEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('toolkit_3d');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    return localStorage.getItem('toolkit_pro') === 'true';
  });

  const [pricingModalOpen, setPricingModalOpen] = useState<boolean>(false);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('toolkit_theme', newTheme);
  };

  const setIs3DEnabled = (val: boolean) => {
    setIs3DEnabledState(val);
    localStorage.setItem('toolkit_3d', String(val));
  };

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-cyber-blue', 'theme-studio-white', 'theme-crimson-red', 'theme-midnight-dark');
    root.classList.add(`theme-${theme}`);
    
    if (theme === 'studio-white') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        is3DEnabled,
        setIs3DEnabled,
        soundEnabled,
        setSoundEnabled,
        isProUser,
        setIsProUser,
        pricingModalOpen,
        setPricingModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
