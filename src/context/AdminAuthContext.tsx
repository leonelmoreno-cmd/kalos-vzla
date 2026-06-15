import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'jcf.admin.authed.v1';

interface AdminAuthValue {
  isAuthed: boolean;
  /** Attempt login with a passcode. Returns true on success. */
  login: (passcode: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

/**
 * Lightweight admin gate for the first iteration. Compares against
 * VITE_ADMIN_PASSCODE and remembers the session in sessionStorage.
 *
 * TODO: replace with Supabase Auth + role checks before production.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(
    () => sessionStorage.getItem(STORAGE_KEY) === '1',
  );

  const value = useMemo<AdminAuthValue>(
    () => ({
      isAuthed,
      login: (passcode: string) => {
        const expected = (import.meta.env.VITE_ADMIN_PASSCODE as string | undefined) ?? 'changeme';
        if (passcode === expected) {
          sessionStorage.setItem(STORAGE_KEY, '1');
          setIsAuthed(true);
          return true;
        }
        return false;
      },
      logout: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setIsAuthed(false);
      },
    }),
    [isAuthed],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within an AdminAuthProvider.');
  return ctx;
}
