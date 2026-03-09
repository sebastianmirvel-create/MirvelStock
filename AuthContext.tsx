'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'employee' | string;

export interface User {
  name: string;
  role: UserRole;
  companyId: string | null; // null para el Super Admin
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isPinModalOpen: boolean;
  openPinModal: (userToAuth: User) => void;
  closePinModal: () => void;
  attemptAdminLogin: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinModalOpen, setPinModalOpen] = useState(false);
  const [userToAuth, setUserToAuth] = useState<User | null>(null); // User waiting for PIN auth

  useEffect(() => {
    // Use sessionStorage to logout when tab is closed
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const openPinModal = (user: User) => {
    setUserToAuth(user);
    setPinModalOpen(true);
  };
  const closePinModal = () => setPinModalOpen(false);

  const attemptAdminLogin = (pin: string): boolean => {
    // En una app real, esto debería estar en una variable de entorno
    const ADMIN_PIN = '1234'; 

    if (pin === ADMIN_PIN && userToAuth) {
      login(userToAuth);
      closePinModal();
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, isPinModalOpen, openPinModal, closePinModal, attemptAdminLogin }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};