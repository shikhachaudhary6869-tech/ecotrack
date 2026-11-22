import { createContext, useContext, useState } from 'react';
import { KEYS, load, save, remove } from '../utils/storage';

// NOTE: This is a frontend-only DEMO. Passwords are stored in plain text in
// localStorage, which is NOT secure. Never do this in a real application.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => load(KEYS.session, null));

  const signup = ({ name, email, password }) => {
    const users = load(KEYS.users, []);
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser = { id: 'u' + Date.now(), name: name.trim(), email: normalized, password, createdAt: new Date().toISOString() };
    save(KEYS.users, [...users, newUser]);
    const session = { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt };
    save(KEYS.session, session);
    setUser(session);
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const users = load(KEYS.users, []);
    const found = users.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: 'Invalid email or password.' };
    const session = { id: found.id, name: found.name, email: found.email, createdAt: found.createdAt };
    save(KEYS.session, session);
    setUser(session);
    return { ok: true };
  };

  const logout = () => {
    remove(KEYS.session);
    setUser(null);
  };

  const updateProfile = ({ name }) => {
    const users = load(KEYS.users, []);
    save(KEYS.users, users.map((u) => (u.id === user.id ? { ...u, name: name.trim() } : u)));
    const session = { ...user, name: name.trim() };
    save(KEYS.session, session);
    setUser(session);
  };

  const deleteAccount = () => {
    const users = load(KEYS.users, []);
    save(KEYS.users, users.filter((u) => u.id !== user.id));
    remove(KEYS.records(user.id));
    remove(KEYS.challenges(user.id));
    remove(KEYS.tips(user.id));
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
