import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiTruck,
  FiPackage,
  FiFileText,
  FiCreditCard,
  FiPieChart,
  FiSettings,
  FiUserPlus,
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiMap,
  FiTag,
  FiAward,
  FiShield,
  FiActivity,
  FiLogIn,
  FiKey,
} from 'react-icons/fi';
import AppShell from './AppShell';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  {
    category: 'Overview',
    items: [{ path: '/admin/dashboard', label: 'Dashboard', icon: FiHome }],
  },
  {
    category: 'Operations',
    items: [
      { path: '/admin/pricing', label: 'Pricing', icon: FiTag },
      { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
      { path: '/admin/deliveries', label: 'Deliveries', icon: FiTruck },
      { path: '/admin/trip-overview', label: 'Trip Overview', icon: FiMap },
    ],
  },
  {
    category: 'People',
    items: [
      { path: '/admin/customers', label: 'Customers', icon: FiUsers },
      { path: '/admin/users', label: 'Users', icon: FiUserPlus },
      { path: '/admin/staff', label: 'Staff', icon: FiBriefcase },
      { path: '/admin/vehicles', label: 'Vehicles', icon: FiPackage },
    ],
  },
  {
    category: 'Finance',
    items: [
      { path: '/admin/ledgers', label: 'Ledgers', icon: FiFileText },
      { path: '/admin/expenses', label: 'Expenses', icon: FiClipboard },
      { path: '/admin/salaries', label: 'Salaries', icon: FiAward },
      { path: '/admin/payments', label: 'Payments', icon: FiCreditCard },
      { path: '/admin/cash-verification', label: 'Cash Verification', icon: FiCheckCircle },
      { path: '/admin/reports', label: 'Reports', icon: FiPieChart },
    ],
  },
  {
    category: 'System',
    items: [{ path: '/admin/settings', label: 'Settings', icon: FiSettings }],
  },
];


// Only the super admin sees this section.
const SECURITY_NAV = {
  category: 'Security',
  items: [
    { path: '/superadmin/dashboard', label: 'Control Center', icon: FiShield },
    { path: '/superadmin/activity', label: 'Activity Log', icon: FiActivity },
    { path: '/superadmin/logins', label: 'Login History', icon: FiLogIn },
    { path: '/superadmin/accounts', label: 'Accounts & Passwords', icon: FiKey },
  ],
};

const DashboardLayout = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  return (
    <AppShell
      groups={isSuperAdmin ? [SECURITY_NAV, ...ADMIN_NAV] : ADMIN_NAV}
      portal={isSuperAdmin ? 'Super Admin' : 'Admin Portal'}
      profilePath="/admin/settings"
      refreshProfile
    />
  );
};

export default DashboardLayout;
