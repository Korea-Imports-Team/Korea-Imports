// ─── src/components/ProtectedRoute.jsx ───────────────────────────────────────
// Crie este arquivo separado e importe no App.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/entrar" replace />;
  return children;
}