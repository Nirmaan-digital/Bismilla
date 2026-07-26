import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Pricing from '../pages/admin/Pricing';
import Customers from '../pages/admin/Customers';
import Orders from '../pages/admin/Orders';
import Deliveries from '../pages/admin/Deliveries';
import Vehicles from '../pages/admin/Vehicles';
import Ledgers from '../pages/admin/Ledgers';
import Payments from '../pages/admin/Payments';
import Reports from '../pages/admin/Reports';
import Users from '../pages/admin/Users';
import Staff from '../pages/admin/Staff';
import Settings from '../pages/admin/Settings';

// Placeholder component for pages not yet implemented
const ComingSoon = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-700">Coming Soon</h1>
      <p className="mt-2 text-gray-500">This page is under development</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            {/* Main Admin Pages */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/pricing" element={<Pricing />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/deliveries" element={<Deliveries />} />
            <Route path="/admin/vehicles" element={<Vehicles />} />
            <Route path="/admin/ledgers" element={<Ledgers />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/staff" element={<Staff />} />
            <Route path="/admin/settings" element={<Settings />} />
            
            {/* Additional Admin Pages - Coming Soon */}
            <Route path="/admin/orders/:id" element={<ComingSoon />} />
            <Route path="/admin/retailers" element={<ComingSoon />} />
            <Route path="/admin/drivers" element={<ComingSoon />} />
            <Route path="/admin/products" element={<ComingSoon />} />
            <Route path="/admin/inventory" element={<ComingSoon />} />
            <Route path="/admin/expenses" element={<ComingSoon />} />
          </Route>
        </Route>

        {/* Catch all - 404 */}
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;