import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './data/AuthContext';
import { DataProvider } from './data/DataContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockEntry from './pages/StockEntry';
import Sales from './pages/Sales';
import Stock from './pages/Stock';
import Customers from './pages/Customers';
import Consignments from './pages/Consignments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/entrada" element={<ProtectedRoute><StockEntry /></ProtectedRoute>} />
          <Route path="/vendas" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/estoque" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/consignacoes" element={<ProtectedRoute><Consignments /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}
