import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const TOKEN_KEY = 'ts_token';
const readToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!readToken());

  const store = (t) => {
    setToken(t);
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
  };

  // Restore the session on first load.
  useEffect(() => {
    if (!token) return;
    let alive = true;
    api.me(token)
      .then((r) => alive && setUser(r.user))
      .catch(() => alive && (store(''), setUser(null)))
      .finally(() => alive && setReady(true));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (identifier, password) => {
    const r = await api.login({ identifier, password });
    store(r.token); setUser(r.user);
    return r.user;
  }, []);

  const register = useCallback(async (data) => {
    const r = await api.register(data);
    store(r.token); setUser(r.user);
    return r.user;
  }, []);

  const logout = useCallback(async () => {
    const t = token;
    store(''); setUser(null);
    try { await api.logout(t); } catch { /* ignore */ }
  }, [token]);

  return <Ctx.Provider value={{ token, user, ready, login, register, logout, isAdmin: user?.role === 'admin' }}>{children}</Ctx.Provider>;
}
