import { useState, useEffect } from 'react';
import { signInWithYouVersion } from '../../services/youversionService';
import { fetchUserProfile, saveUserProfile } from '../../services/database';

export const useYVAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile().then((p) => {
      if (p && p.bio?.includes('YouVersion')) {
        setUser(p);
      }
    });
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      const res = await signInWithYouVersion();
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const current = await fetchUserProfile();
    if (current) {
      const updated = {
        ...current,
        bio: ''
      };
      await saveUserProfile(updated);
    }
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signOut
  };
};
