// Auth context for KrishiBundle
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole, Language } from '../types';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  userPhone: string | null;
  userRole: UserRole | null;
  language: Language;
}

interface AuthContextType extends AuthState {
  login: (userId: string, name: string, phone: string, role: UserRole, lang?: Language) => Promise<void>;
  logout: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    userId: null,
    userName: null,
    userPhone: null,
    userRole: null,
    language: 'en',
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [userId, userName, userPhone, userRole, language] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('userPhone'),
        AsyncStorage.getItem('userRole'),
        AsyncStorage.getItem('language'),
      ]);

      if (userId && userRole) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          userId,
          userName,
          userPhone,
          userRole: userRole as UserRole,
          language: (language as Language) || 'en',
        });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  };

  const login = async (userId: string, name: string, phone: string, role: UserRole, lang: Language = 'en') => {
    // 1. Sync to Supabase
    try {
      const { upsertUserProfile } = require('../services/dbService');
      await upsertUserProfile({ phone, name, role, language: lang });
    } catch (e) {
      console.warn('Supabase profile sync failed:', e);
    }

    await Promise.all([
      AsyncStorage.setItem('userId', userId),
      AsyncStorage.setItem('userName', name),
      AsyncStorage.setItem('userPhone', phone),
      AsyncStorage.setItem('userRole', role),
      AsyncStorage.setItem('language', lang),
    ]);

    // Apply language dynamically to app i18n
    try {
      const { setAppLanguage } = require('../i18n');
      setAppLanguage(lang);
    } catch {}

    setState({
      isLoading: false,
      isAuthenticated: true,
      userId,
      userName: name,
      userPhone: phone,
      userRole: role,
      language: lang,
    });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userId', 'userName', 'userPhone', 'userRole', 'language']);
    setState({
      isLoading: false,
      isAuthenticated: false,
      userId: null,
      userName: null,
      userPhone: null,
      userRole: null,
      language: 'en',
    });
  };

  const setLanguage = async (lang: Language) => {
    // 1. Sync to Supabase
    if (state.userPhone && state.userName && state.userRole) {
      try {
        const { upsertUserProfile } = require('../services/dbService');
        await upsertUserProfile({
          phone: state.userPhone,
          name: state.userName,
          role: state.userRole,
          language: lang,
        });
      } catch (e) {
        console.warn('Supabase language sync failed:', e);
      }
    }

    await AsyncStorage.setItem('language', lang);

    // Apply language dynamically to app i18n
    try {
      const { setAppLanguage } = require('../i18n');
      setAppLanguage(lang);
    } catch {}

    setState(s => ({ ...s, language: lang }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
