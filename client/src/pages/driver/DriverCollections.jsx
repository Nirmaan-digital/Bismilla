import { useState } from 'react';
import { 
  FiDollarSign, 
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiCalendar,
  FiArrowRight
} from 'react-icons/fi';
import Badge from '../../components/common/Badge';

// Mock data - will come from API
const mockCollections = [
  {
    id: 'COL-001',
    orderId: 'ORD-1001',
    retailer: 'Sharma Chicken Corner',
    amount: 15000,
    method: 'Cash',
    date: '24 Jul 2026',
    status: 'Pending Verification',
    tripId: 'TRIP-001',
  },
  {
    id: 'COL-002',
    orderId: 'ORD-1002',
    retailer: 'Reddy Fresh Meats',
    amount: 33840,
    method: 'Cash',
    date: '23 Jul 2026',
    status: 'Verified',
    tripId: 'TRIP-002',
  },
  {
    id: 'COL-003',
    orderId: 'ORD-1005',
    retailer: 'Khan Poultry',
    amount: 41360,
    method: 'UPI',
    date: '24 Jul 2026',
    status: 'Pending Verification',
    tripId: 'TRIP-001',
  },
];

const DriverCollections = () => {
  const [collections] = useState(mockCollections);

  // Calculate totals
  const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);
  const pendingVerification = collections.filter(c => c.status === 'Pending Verification').length;
  const verified = collections.filter(c => c.status === 'Verified').length;

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
        <h1 className="text-2xl font-semibold text-[#151A17]">Collections</h1>
        <p className="text-sm text-[#6B716D] mt-1">Track all your cash collections</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Total Collected</p>
          <p className="text-2xl font-bold text-[#16834B]">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Pending Verification</p>
          <p className="text-2xl font-bold text-[#C47A13]">{pendingVerification}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Verified</p>
          <p className="text-2xl font-bold text-[#16834B]">{verified}</p>
        </div>
      </div>

      {/* Collections List */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E8E6]">
          <h2 className="text-lg font-semibold text-[#151A17]">Collection History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F6]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Collection ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Retailer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8E6]">
              {collections.map((collection) => (
                <tr key={collection.id} className="hover:bg-[#F6F7F6] transition">
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{collection.id}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{collection.orderId}</td>
                  <td className="px-6 py-4 text-sm text-[#151A17]">{collection.retailer}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{collection.method}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{collection.date}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-[#16834B]">
                    {formatCurrency(collection.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={collection.status === 'Verified' ? 'success' : 'warning'}>
                      {collection.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverCollections;