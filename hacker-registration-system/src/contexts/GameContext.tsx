import React, { createContext, useContext, useState } from 'react';

interface EasterEgg {
  id: string;
  name: string;
  discovered: boolean;
  discoveredAt?: Date;
  score: number;
}

interface GameContextType {
  easterEggs: EasterEgg[];
  totalScore: number;
  hackerLevel: number;
  discoverEasterEgg: (eggId: string) => void;
  isKonamiCodeActive: boolean;
  setKonamiCodeActive: (active: boolean) => void;
  isAdminPanelUnlocked: boolean;
  unlockAdminPanel: () => void;
  vulnerabilitiesFound: string[];
  addVulnerability: (vuln: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const initialEasterEggs: EasterEgg[] = [
  { id: 'konami_code', name: 'Konami Code Master', discovered: false, score: 100 },
  { id: 'hidden_admin', name: 'Admin Panel Finder', discovered: false, score: 150 },
  { id: 'fake_vuln_scan', name: 'Security Scanner', discovered: false, score: 200 },
  { id: 'sql_injection', name: 'SQL Injection Attempt', discovered: false, score: 75 },
  { id: 'hidden_comments', name: 'Source Code Explorer', discovered: false, score: 50 },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>(initialEasterEggs);
  const [isKonamiCodeActive, setKonamiCodeActive] = useState(false);
  const [isAdminPanelUnlocked, setIsAdminPanelUnlocked] = useState(false);
  const [vulnerabilitiesFound, setVulnerabilitiesFound] = useState<string[]>([]);

  const totalScore = easterEggs.reduce((sum, egg) => sum + (egg.discovered ? egg.score : 0), 0);
  const hackerLevel = Math.floor(totalScore / 100) + 1;

  const discoverEasterEgg = (eggId: string) => {
    setEasterEggs(prev => 
      prev.map(egg => 
        egg.id === eggId && !egg.discovered
          ? { ...egg, discovered: true, discoveredAt: new Date() }
          : egg
      )
    );
  };

  const unlockAdminPanel = () => {
    setIsAdminPanelUnlocked(true);
    discoverEasterEgg('hidden_admin');
  };

  const addVulnerability = (vuln: string) => {
    if (!vulnerabilitiesFound.includes(vuln)) {
      setVulnerabilitiesFound(prev => [...prev, vuln]);
    }
  };

  const value = {
    easterEggs,
    totalScore,
    hackerLevel,
    discoverEasterEgg,
    isKonamiCodeActive,
    setKonamiCodeActive,
    isAdminPanelUnlocked,
    unlockAdminPanel,
    vulnerabilitiesFound,
    addVulnerability,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};