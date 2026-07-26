import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiEye,
  FiFileText,
  FiCalendar,
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
    date: '24/7/2026',
    kg: 220,
    amount: 42680,
    status: 'En route',
    payment: 'Partial',
    items: 3,
  },
  {
    id: 'ORD-1005',
    date: '23/7/2026',
    kg: 180,
    amount: 34200,
    status: 'Delivered',
    payment: 'Paid',
    items: 2,
  },
  {
    id: 'ORD-1002',
    date: '22/7/2026',
    kg: 150,
    amount: 28200,
    status: 'Delivered',
    payment: 'Paid',
    items: 2,
  },
  {
    id: 'ORD-1007',
    date: '21/7/2026',
    kg: 200,
    amount: 38800,
    status: 'Delivered',
    payment: 'Credit',
    items: 4,
  },
  {
    id: 'ORD-1006',
    date: '20/7/2026',
    kg: 120,
    amount: 22560,
    status: 'Delivered',
    payment: 'Paid',
    items: 2,
  },
];

const RetailerOrders = () => {
  const [orders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Get filter counts
  const getFilterCounts = () => {
    const all = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const processing = orders.filter(o => o.status === 'Processing').length;
    const enroute = orders.filter(o => o.status === 'En route').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    return { all, pending, processing, enroute, delivered };
  };

  const counts = getFilterCounts();

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch(activeFilter) {
      case 'pending':
        matchesFilter = order.status === 'Pending';
        break;
      case 'processing':
        matchesFilter = order.status === 'Processing';
        break;
      case 'enroute':
        matchesFilter = order.status === 'En route';
        break;
      case 'delivered':
        matchesFilter = order.status === 'Delivered';
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

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'success',
      'En route': 'info',
      'Processing': 'primary',
      'Pending': 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Orders</h1>
          <p className="text-sm text-[#6B716D] mt-1">View all your orders</p>
        </div>
        <Link to="/retailer/place-order">
          <Button>
            <FiPackage className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </Link>
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
          onClick={() => setActiveFilter('processing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeFilter === 'processing'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Processing ({counts.processing})
        </button>
        <button
          onClick={() => setActiveFilter('enroute')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeFilter === 'enroute'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          En route ({counts.enroute})
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
          placeholder="Search by order ID..."
          className="max-w-md"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-[#E5E8E6] p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#151A17]">{order.id}</h3>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#6B716D]">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {order.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiPackage className="w-3 h-3" />
                      {order.kg} kg
                    </span>
                    <span className="font-medium text-[#151A17]">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/retailer/orders/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      <FiEye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <FiFileText className="w-4 h-4 text-[#6B716D]" />
                  </button>
                </div>
              </div>
            </div>
          ))
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

export default RetailerOrders;