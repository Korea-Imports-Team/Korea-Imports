import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(auth) {
  localStorage.setItem('accessToken', auth.accessToken);
  localStorage.setItem('refreshToken', auth.refreshToken);
  const user = {
    id: auth.userId,
    name: auth.name,
    displayName: auth.name,
    email: auth.email,
    role: auth.role,
  };
  localStorage.setItem('authUser', JSON.stringify(user));
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [loading] = useState(false);
  const pendingGoogleAuth = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-hidden'),
      { theme: 'outline', size: 'large', width: 280 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleCredential(response) {
    try {
      const auth = await api.post('/auth/google', { idToken: response.credential }, { auth: false });
      setUser(persistSession(auth));
      pendingGoogleAuth.current?.resolve(auth);
    } catch (err) {
      pendingGoogleAuth.current?.reject(err);
    } finally {
      pendingGoogleAuth.current = null;
    }
  }

  function loginWithGoogle() {
    return new Promise((resolve, reject) => {
      const btn = document.querySelector('#google-signin-hidden div[role="button"]');
      if (!btn) {
        reject(new Error('Google ainda não carregou. Recarregue a página.'));
        return;
      }
      pendingGoogleAuth.current = { resolve, reject };
      btn.click();
    });
  }

  async function loginWithEmail(email, password) {
    const auth = await api.post('/auth/login', { email, password }, { auth: false });
    setUser(persistSession(auth));
  }

  async function registerWithEmail(name, email, password) {
    const auth = await api.post('/auth/register', { name, email, password }, { auth: false });
    setUser(persistSession(auth));
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      <div id="google-signin-hidden" style={{ position: 'fixed', top: -9999, left: -9999 }} />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}