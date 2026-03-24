// context/authContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 1. Updated role to match your Mongoose model exactly: "school owner"
interface UserPayload {
  role: "admin" | "user" | "school owner";
  hasSchool: boolean;
  first_name: string;
  last_name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isCheckingAuth: boolean;
  user: UserPayload | null;
  loginUser: (accessToken: string, refreshToken: string, userData: UserPayload) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [user, setUser] = useState<UserPayload | null>(null);

  // Check storage on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setIsLoggedIn(true);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.clear();
      }
    }
    setIsCheckingAuth(false);
  }, []);

  const loginUser = (accessToken: string, refreshToken: string, userData: UserPayload) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logoutUser = () => {
    localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
    // REMOVED navigate('/') from here to prevent context errors
    window.location.href = '/'; // Use this for a clean, hard redirect on logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isCheckingAuth, user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};