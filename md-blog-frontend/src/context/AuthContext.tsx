import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/authApi";
import type { User } from "../api/authApi";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "md-blog.token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    getMe(stored)
      .then((me) => {
        setUser(me);
        setToken(stored);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    const me = await getMe(newToken);
    setUser(me);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    const stored = token ?? localStorage.getItem(TOKEN_KEY);
    if (!stored) return;
    const me = await getMe(stored);
    setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoggedIn: !!user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
