import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type Role = "hr" | "applicant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("smarthire_token");
      if (token) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            localStorage.removeItem("smarthire_token");
          }
        } catch (error) {
          console.error("Auth auto-login error:", error);
          localStorage.removeItem("smarthire_token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("smarthire_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("smarthire_token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <span className="text-sm font-medium text-slate-500">Loading SmartHire...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}