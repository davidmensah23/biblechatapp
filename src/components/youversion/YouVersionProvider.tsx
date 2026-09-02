import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile } from '../../services/database';

interface YouVersionContextType {
  appKey: string;
  theme: 'system' | 'light' | 'dark';
  currentVersionId: number;
  setCurrentVersionId: (id: number) => void;
  user: any | null;
  isAuthenticated: boolean;
}

const YouVersionContext = createContext<YouVersionContextType>({
  appKey: '',
  theme: 'system',
  currentVersionId: 111, // Default NIV 2011
  setCurrentVersionId: () => {},
  user: null,
  isAuthenticated: false,
});

export interface YouVersionProviderProps {
  appKey: string;
  theme?: 'system' | 'light' | 'dark';
  children: React.ReactNode;
}

export const YouVersionProvider: React.FC<YouVersionProviderProps> = ({
  appKey,
  theme = 'system',
  children,
}) => {
  const [currentVersionId, setCurrentVersionId] = useState<number>(111);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    fetchUserProfile().then((p) => {
      if (p && p.bio?.includes('YouVersion')) {
        setUser(p);
      }
    });
  }, []);

  return (
    <YouVersionContext.Provider
      value={{
        appKey,
        theme,
        currentVersionId,
        setCurrentVersionId,
        user,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </YouVersionContext.Provider>
  );
};

export const useYouVersion = () => useContext(YouVersionContext);
