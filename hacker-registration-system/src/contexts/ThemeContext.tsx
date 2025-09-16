import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  isMatrixRainEnabled: boolean;
  isSoundEnabled: boolean;
  isGlitchEnabled: boolean;
  toggleMatrixRain: () => void;
  toggleSound: () => void;
  toggleGlitch: () => void;
  triggerErrorFlash: () => void;
  triggerShake: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMatrixRainEnabled, setIsMatrixRainEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isGlitchEnabled, setIsGlitchEnabled] = useState(true);

  const toggleMatrixRain = () => setIsMatrixRainEnabled(!isMatrixRainEnabled);
  const toggleSound = () => setIsSoundEnabled(!isSoundEnabled);
  const toggleGlitch = () => setIsGlitchEnabled(!isGlitchEnabled);

  const triggerErrorFlash = () => {
    document.body.classList.add('error-flash');
    setTimeout(() => {
      document.body.classList.remove('error-flash');
    }, 300);
  };

  const triggerShake = () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.classList.add('error-shake');
      setTimeout(() => {
        form.classList.remove('error-shake');
      }, 500);
    });
  };

  const value = {
    isMatrixRainEnabled,
    isSoundEnabled,
    isGlitchEnabled,
    toggleMatrixRain,
    toggleSound,
    toggleGlitch,
    triggerErrorFlash,
    triggerShake,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};