import { Navigate } from 'react-router-dom';
import { useAuth } from '../data/AuthContext';
import Layout from './Layout';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}
