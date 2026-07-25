import { useState } from 'react';
import { 
  FiSearch,
  FiEye,
  FiEdit2,
  FiPrinter,
  FiDownload,
  FiTruck,
  FiUser,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiPackage
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-1001',
    customer: 'Sharma Chicken Corner',
    phone: '9876543210',
    date: '24/7/2026',
    kg: 220,
    rate: 194,
    amount: 42680,
    payment: 'Credit',
    delivery: 'In Transit',  // Changed from 'En route' to 'In Transit'
    assigned: 'Ramesh Kumar',
    vehicle: 'KA-01-AB-1234',
  },
  {
    id: 'ORD-1002',
    customer: 'Khan Poultry',
    phone: '9876543211',
    date: '24/7/2026',
    kg: 150,
    rate: 188,
    amount: 28200,
    payment: 'Paid',
    delivery: 'Delivered',
    assigned: 'Salim Ahmed',
    vehicle: 'KA-01-CD-5678',
  },
  {
    id: 'ORD-1003',
    customer: 'Reddy Fresh Meats',
    phone: '9876543212',
    date: '24/7/2026',
    kg: 400,
    rate: 194,
    amount: 77600,
    payment: 'Credit',
    delivery: 'Pending',
    assigned: 'Ramesh Kumar',
    vehicle: 'KA-01-AB-1234',
  },
  {
    id: 'ORD-1004',
    customer: 'Gupta Poultry House',
    phone: '9876543214',
    date: '23/7/2026',
    kg: 300,
    rate: 188,
    amount: 56400,
    payment: 'Paid',
    delivery: 'Delivered',
    assigned: 'Salim Ahmed',
    vehicle: 'KA-01-CD-5678',
  },
  {
    id: 'ORD-1005',
    customer: 'Sharma Chicken Corner',
    phone: '9876543210',
    date: '23/7/2026',
    kg: 180,
    rate: 190,
    amount: 34200,
    payment: 'Paid',
    delivery: 'Delivered',
    assigned: 'Ramesh Kumar',
    vehicle: 'KA-01-AB-1234',
  },
  {
    id: 'ORD-1006',
    customer: 'Patel Chicken',
    phone: '9876543213',
    date: '22/7/2026',
    kg: 120,
    rate: 188,
    amount: 22560,
    payment: 'Paid',
    delivery: 'Delivered',
    assigned: 'Ganesh Rao',
    vehicle: 'KA-01-EF-9012',
  },
  {
    id: 'ORD-1007',
    customer: 'Khan Poultry',
    phone: '9876543211',
    date: '21/7/2026',
    kg: 200,
    rate: 194,
    amount: 38800,
    payment: 'Credit',
    delivery: 'Delivered',
    assigned: 'Salim Ahmed',
    vehicle: 'KA-01-CD-5678',
  },
  {
    id: 'ORD-1008',
    customer: 'Reddy Fresh Meats',
    phone: '9876543212',
    date: '24/7/2026',
    kg: 500,
    rate: 188,
    amount: 94000,
    payment: 'Paid',
    delivery: 'Pending',
    assigned: '—',
    vehicle: '—',
  },
];

const Orders = () => {
  const [orders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Get filtered counts
  const getFilterCounts = () => {
    const all = orders.length;
    const pending = orders.filter(o => o.delivery === 'Pending').length;
    const inTransit = orders.filter(o => o.delivery === 'In Transit').length;
    const delivered = orders.filter(o => o.delivery === 'Delivered').length;
    return { all, pending, inTransit, delivered };
  };

  const counts = getFilterCounts();

  // Filter orders based on search and active filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.phone.includes(searchTerm);
    
    let matchesFilter = true;
    switch(activeFilter) {
      case 'pending':
        matchesFilter = order.delivery === 'Pending';
        break;
      case 'inTransit':
        matchesFilter = order.delivery === 'In Transit';
        break;
      case 'delivered':
        matchesFilter = order.delivery === 'Delivered';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get delivery status color
  const getDeliveryColor = (status) => {
    const colors = {
      'Delivered': 'success',
      'In Transit': 'info',
      'Pending': 'warning',
    };
    return colors[status] || 'default';
  };

  // Get payment status color
  const getPaymentColor = (status) => {
    const colors = {
      'Paid': 'success',
      'Credit': 'warning',
      'Pending': 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Orders</h1>
          <p className="text-sm text-[#6B716D] mt-1">All orders across cash, UPI, and store credit</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={FiPrinter}>
            Print
          </Button>
          <Button variant="outline" icon={FiDownload}>
            Export
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeFilter === 'all'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeFilter === 'pending'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => setActiveFilter('inTransit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeFilter === 'inTransit'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          In Transit ({counts.inTransit})
        </button>
        <button
          onClick={() => setActiveFilter('delivered')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeFilter === 'delivered'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Delivered ({counts.delivered})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search order ID, customer..."
          className="max-w-md"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">KG</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Delivery</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8E6]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F6F7F6] transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#151A17]">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#151A17]">{order.customer}</p>
                        <p className="text-xs text-[#6B716D] flex items-center gap-1">
                          <FiPhone className="w-3 h-3" />
                          {order.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B716D]">{order.date}</td>
                    <td className="px-6 py-4 text-sm text-[#151A17]">{order.kg} kg</td>
                    <td className="px-6 py-4 text-sm text-[#151A17]">₹{order.rate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#151A17]">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getPaymentColor(order.payment)}>
                        {order.payment}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getDeliveryColor(order.delivery)}>
                        {order.delivery}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {order.assigned !== '—' ? (
                        <div>
                          <p className="text-sm text-[#151A17]">{order.assigned}</p>
                          <p className="text-xs text-[#6B716D]">{order.vehicle}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-[#6B716D]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No orders found"
            description="Try adjusting your search or filter criteria."
            icon={FiSearch}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;