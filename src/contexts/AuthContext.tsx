import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role, User } from '@/types';
import { authService, usersService } from '@/services';
import { can as canRole, type Permission } from '@/utils/permissions';

interface AuthCtx {
  user: User | null;
  /** Effective role — staff can "simulate" a lower role in the admin. */
  role: Role | undefined;
  simulatedRole: Role | null;
  simulateRole: (r: Role | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; interests: string[]; newsletter: boolean }) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  can: (p: Permission) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = 'horizonte:session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [simulatedRole, setSimulatedRole] = useState<Role | null>(null);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user));
      else localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    setUser(u);
    setSimulatedRole(null);
    return u;
  }, []);

  const register = useCallback(async (input: Parameters<AuthCtx['register']>[0]) => {
    const u = await authService.register(input);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSimulatedRole(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      if (!user) return;
      const u = await usersService.update(user.id, patch);
      setUser(u);
    },
    [user],
  );

  const role = simulatedRole ?? user?.role;
  const value = useMemo<AuthCtx>(
    () => ({ user, role, simulatedRole, simulateRole: setSimulatedRole, login, register, logout, updateProfile, can: (p) => canRole(role, p) }),
    [user, role, simulatedRole, login, register, logout, updateProfile],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
