import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiDollarSign, 
  FiArrowRight,
  FiPackage,
  FiCreditCard,
  FiAlertCircle
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

// Mock data - will come from API later
const mockRetailer = {
  id: 'RET-001',
  name: 'Rahul',
  shop: 'Sharma Chicken Corner',
  phone: '9876543210',
  outstanding: 130000,
  availableCredit: 70000,
  creditLimit: 200000,
  pricePerKg: 188,
  currentOrder: {
    id: 'ORD-1001',
    kg: 220,
    amount: 42680,
    status: 'En route',
  },
  lastPayment: {
    amount: 70000,
    method: 'UPI',
    date: '23/7/2026',
  },
};

const RetailerDashboard = () => {
  const [retailer] = useState(mockRetailer);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#151A17]">
          Assalamu Alaikum, {retailer.name} 👋
        </h1>
        <p className="text-sm text-[#6B716D] mt-1">{retailer.shop}</p>
      </div>

      {/* Pricing Card - Only Cash Price */}
      <div className="bg-[#111714] text-white rounded-xl p-6 mb-6">
        <p className="text-sm text-white/60">CASH PRICE</p>
        <p className="text-3xl font-bold mt-1">₹{retailer.pricePerKg}</p>
        <p className="text-xs text-white/40 mt-1">per kg (UPI / Cash)</p>
      </div>

      {/* Place New Order Button */}
      <Link to="/retailer/place-order">
        <Button className="w-full mb-6 py-4 text-base">
          <FiShoppingBag className="w-5 h-5 mr-2" />
          Place New Order
        </Button>
      </Link>

      {/* Outstanding - Highlighted */}
      <div className="bg-[#FDEEEE] border-2 border-[#D14343] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <FiAlertCircle className="w-6 h-6 text-[#D14343]" />
          <div>
            <p className="text-sm font-medium text-[#D14343]">OUTSTANDING BALANCE</p>
            <p className="text-3xl font-bold text-[#D14343]">
              {formatCurrency(retailer.outstanding)}
            </p>
          </div>
        </div>
        <p className="text-xs text-[#D14343]/70 mt-2">
          Please clear your outstanding balance to continue placing orders
        </p>
      </div>

      {/* Current Order */}
      {retailer.currentOrder && (
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#151A17]">Current Order</h3>
            <Badge variant="info">{retailer.currentOrder.status}</Badge>
          </div>
          <p className="text-sm text-[#6B716D]">{retailer.currentOrder.id}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-[#6B716D]">{retailer.currentOrder.kg} kg</span>
            <span className="text-lg font-semibold text-[#151A17]">
              {formatCurrency(retailer.currentOrder.amount)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/retailer/orders" className="bg-white rounded-xl border border-[#E5E8E6] p-4 hover:shadow-md transition text-center">
          <FiPackage className="w-6 h-6 mx-auto text-[#111714] mb-2" />
          <p className="text-sm font-medium text-[#151A17]">My Orders</p>
          <p className="text-xs text-[#6B716D]">View all orders</p>
        </Link>
        <Link to="/retailer/payments" className="bg-white rounded-xl border border-[#E5E8E6] p-4 hover:shadow-md transition text-center">
          <FiCreditCard className="w-6 h-6 mx-auto text-[#111714] mb-2" />
          <p className="text-sm font-medium text-[#151A17]">Payments</p>
          <p className="text-xs text-[#6B716D]">Track payments</p>
        </Link>
        <Link to="/retailer/profile" className="bg-white rounded-xl border border-[#E5E8E6] p-4 hover:shadow-md transition text-center">
          <FiDollarSign className="w-6 h-6 mx-auto text-[#111714] mb-2" />
          <p className="text-sm font-medium text-[#151A17]">Profile</p>
          <p className="text-xs text-[#6B716D]">Your account</p>
        </Link>
      </div>
    </div>
  );
};

export default RetailerDashboard;