import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/api/http';
import type { User } from '@/api/types';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Toast Context ---
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

// --- Workspace Context ---
interface WorkspaceContextType {
  workspaceName: string;
  selectedPeriod: string;
  setSelectedPeriod: (p: string) => void;
  isDemoMode: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaceName: 'Acme Enterprise Analytics',
  selectedPeriod: 'Q3 2026',
  setSelectedPeriod: () => {},
  isDemoMode: true,
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q3 2026');

  const addToast = (title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial auth load
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await api.auth.getMe();
        setUser(currentUser);
      } catch {
        // Fallback default demo user in demo mode
        setUser({
          id: 'user-demo-admin',
          email: 'demo@analystai.local',
          full_name: 'Alex Mercer (Demo Lead)',
          role: 'Admin',
          is_active: true,
        });
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.auth.login(email, pass);
    localStorage.setItem('analystai_token', res.access_token);
    setUser(res.user);
    addToast('Welcome back', `Signed in as ${res.user.email}`, 'success');
  };

  const logout = () => {
    localStorage.removeItem('analystai_token');
    setUser(null);
    addToast('Signed out', 'You have been logged out.', 'info');
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <AuthContext.Provider
        value={{
          user,
          loading,
          login,
          logout,
          isAuthenticated: !!user,
        }}
      >
        <WorkspaceContext.Provider
          value={{
            workspaceName: 'Acme Enterprise Analytics',
            selectedPeriod,
            setSelectedPeriod,
            isDemoMode: true,
          }}
        >
          {children}

          {/* Toast rendering portal */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((t) => {
              const icons = {
                success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
                error: <XCircle className="w-5 h-5 text-red-600 shrink-0" />,
                warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
                info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
              };
              return (
                <div
                  key={t.id}
                  className="pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-slate-200 animate-in slide-in-from-right duration-200"
                >
                  {icons[t.type]}
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-slate-900">{t.title}</p>
                    {t.message && <p className="text-slate-500 mt-0.5">{t.message}</p>}
                  </div>
                  <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </WorkspaceContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
}
