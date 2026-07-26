import { useState } from 'react';
import { 
  FiCalendar, 
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiClock,
  FiArrowRight,
  FiCheckCircle
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';

// Mock data - will come from API
const mockHistory = [
  {
    id: 'TRIP-002',
    date: '23 Jul 2026',
    orders: 1,
    totalKg: 180,
    totalAmount: 33840,
    status: 'Completed',
    cashCollected: 33840,
    expenses: {
      diesel: 1500,
      hens: 360,
    },
  },
  {
    id: 'TRIP-003',
    date: '22 Jul 2026',
    orders: 2,
    totalKg: 320,
    totalAmount: 60160,
    status: 'Completed',
    cashCollected: 50000,
    expenses: {
      diesel: 2000,
      hens: 640,
    },
  },
  {
    id: 'TRIP-004',
    date: '21 Jul 2026',
    orders: 1,
    totalKg: 150,
    totalAmount: 28200,
    status: 'Completed',
    cashCollected: 28200,
    expenses: {
      diesel: 1200,
      hens: 300,
    },
  },
];

const DriverHistory = () => {
  const [history] = useState(mockHistory);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(trip =>
    trip.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const totalTrips = history.length;
  const totalKg = history.reduce((sum, t) => sum + t.totalKg, 0);
  const totalCollected = history.reduce((sum, t) => sum + t.cashCollected, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#151A17]">History</h1>
        <p className="text-sm text-[#6B716D] mt-1">View all your completed trips</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <FiTruck className="w-5 h-5 mx-auto text-[#6B716D] mb-1" />
          <p className="text-xl font-semibold text-[#151A17]">{totalTrips}</p>
          <p className="text-xs text-[#6B716D]">Total Trips</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <FiPackage className="w-5 h-5 mx-auto text-[#6B716D] mb-1" />
          <p className="text-xl font-semibold text-[#151A17]">{totalKg} kg</p>
          <p className="text-xs text-[#6B716D]">Total KG Delivered</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <FiDollarSign className="w-5 h-5 mx-auto text-[#6B716D] mb-1" />
          <p className="text-xl font-semibold text-[#16834B]">{formatCurrency(totalCollected)}</p>
          <p className="text-xs text-[#6B716D]">Total Collected</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by trip ID..."
          className="max-w-md"
        />
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl border border-[#E5E8E6] p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#151A17]">{trip.id}</h3>
                    <Badge variant="success">Completed</Badge>
                  </div>
                  <p className="text-sm text-[#6B716D] mt-1">{trip.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#16834B]">{formatCurrency(trip.cashCollected)}</p>
                  <p className="text-xs text-[#6B716D]">Collected</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#E5E8E6]">
                <div>
                  <p className="text-xs text-[#6B716D]">Orders</p>
                  <p className="font-medium text-[#151A17]">{trip.orders}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B716D]">Total KG</p>
                  <p className="font-medium text-[#151A17]">{trip.totalKg} kg</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B716D]">Total Amount</p>
                  <p className="font-medium text-[#151A17]">{formatCurrency(trip.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B716D]">Expenses</p>
                  <p className="font-medium text-[#151A17]">₹{trip.expenses.diesel}</p>
                  <p className="text-xs text-[#6B716D]">{trip.expenses.hens} hens</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-12 text-center">
            <FiClock className="w-12 h-12 mx-auto text-[#6B716D] mb-3" />
            <p className="text-lg font-medium text-[#151A17]">No history found</p>
            <p className="text-sm text-[#6B716D]">Complete your first trip to see history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverHistory;