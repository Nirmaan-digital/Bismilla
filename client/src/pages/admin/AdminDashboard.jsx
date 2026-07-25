import { Link } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiDollarSign, 
  FiPackage, 
  FiUsers,
  FiCreditCard,
  FiTruck,
  FiClock,
  FiEye,
  FiTrendingUp,
  FiPieChart,
  FiCalendar
} from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const AdminDashboard = () => {
  // Mock data
  const stats = [
    { 
      title: "Today's Orders", 
      value: 0, 
      icon: FiShoppingBag,
    },
    { 
      title: "Today's Revenue", 
      value: '₹0', 
      icon: FiDollarSign,
    },
    { 
      title: 'KG Ordered', 
      value: '0 kg',
      subtitle: '0 kg delivered',
      icon: FiPackage,
    },
    { 
      title: 'Active Customers', 
      value: 5, 
      icon: FiUsers,
    },
    { 
      title: 'Cash Collection', 
      value: '₹0', 
      icon: FiCreditCard,
    },
    { 
      title: 'UPI Collection', 
      value: '₹0', 
      icon: FiCreditCard,
    },
    { 
      title: 'Outstanding', 
      value: '₹5,50,000', 
      icon: FiDollarSign,
      change: 'Total pending payments',
    },
    { 
      title: 'Pending Deliveries', 
      value: 3,
      subtitle: '0 completed',
      icon: FiTruck,
    },
  ];

  // Additional metrics
  const additionalStats = [
    { title: "Today's Total Hens", value: 0, icon: FiPackage },
    { title: "Today's Total Trays", value: 0, icon: FiPackage },
  ];

  // Weekly revenue data
  const weeklyRevenue = [
    { day: 'Sun', amount: 0 },
    { day: 'Mon', amount: 0 },
    { day: 'Tue', amount: 0 },
    { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 0 },
    { day: 'Fri', amount: 0 },
    { day: 'Sat', amount: 0 },
  ];

  const maxRevenue = 200000;

  // Recent orders
  const recentOrders = [
    { id: 'ORD-1042', retailer: 'Al Madina Chicken Shop', amount: 24600, status: 'Out for Delivery', payment: 'Partial' },
    { id: 'ORD-1041', retailer: 'Hyderabad Poultry', amount: 17425, status: 'Delivered', payment: 'Paid' },
    { id: 'ORD-1040', retailer: 'City Chicken Store', amount: 30750, status: 'Pending', payment: 'Pending' },
  ];

  // Cash vs Credit data
  const paymentStats = {
    upiCash: 0,
    store: 0,
    credit: 0,
  };

  const totalPayments = paymentStats.upiCash + paymentStats.store + paymentStats.credit;

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'success',
      'Out for Delivery': 'info',
      'Processing': 'primary',
      'Pending': 'warning',
      'Cancelled': 'danger',
    };
    return colors[status] || 'default';
  };

  const getPaymentColor = (status) => {
    const colors = {
      'Paid': 'success',
      'Partial': 'warning',
      'Pending': 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#151A17]">Good morning, Owner</h1>
            <p className="text-sm text-[#6B716D] mt-1">Here's what's happening at Bismillah Chicken Center today.</p>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-[#6B716D]" />
            <span className="text-sm text-[#6B716D]">25 Jul 2026</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.slice(0, 4).map((stat) => (
          <StatCard 
            key={stat.title} 
            title={stat.title} 
            value={stat.value} 
            icon={stat.icon}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Stats Grid - Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.slice(4, 8).map((stat) => (
          <StatCard 
            key={stat.title} 
            title={stat.title} 
            value={stat.value} 
            icon={stat.icon}
            subtitle={stat.subtitle}
            change={stat.change}
          />
        ))}
      </div>

      {/* Additional Stats - Hens and Trays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {additionalStats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-[#E5E8E6] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6B716D]">{stat.title}</p>
                <p className="mt-2 text-3xl font-semibold text-[#151A17]">{stat.value}</p>
              </div>
              <div className="p-3 bg-[#F6F7F6] rounded-lg">
                <stat.icon className="w-5 h-5 text-[#111714]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[#151A17]">Daily Revenue</h3>
              <p className="text-sm text-[#6B716D]">Weekly revenue overview</p>
            </div>
            <FiTrendingUp className="w-5 h-5 text-[#6B716D]" />
          </div>
          
          <div className="space-y-2">
            {/* Y-axis labels */}
            <div className="flex justify-between text-xs text-[#6B716D] px-2">
              <span>₹2L</span>
              <span>₹1.5L</span>
              <span>₹1L</span>
              <span>₹50K</span>
              <span>₹0</span>
            </div>
            
            {/* Chart bars */}
            <div className="flex items-end h-48 gap-3">
              {weeklyRevenue.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-[#111714] rounded-t transition-all duration-500 hover:opacity-80"
                    style={{ 
                      height: `${(day.amount / maxRevenue) * 100}%`,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-[#6B716D]">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cash vs Credit Chart */}
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[#151A17]">Cash vs Credit</h3>
              <p className="text-sm text-[#6B716D]">Payment method breakdown</p>
            </div>
            <FiPieChart className="w-5 h-5 text-[#6B716D]" />
          </div>

          <div className="flex flex-col items-center">
            {/* Pie Chart Representation */}
            <div className="relative w-48 h-48 mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#151A17]">₹0</p>
                  <p className="text-xs text-[#6B716D]">Total Collections</p>
                </div>
              </div>
              {/* Placeholder for pie chart - you can replace with actual chart library */}
              <div className="w-full h-full rounded-full border-8 border-[#E5E8E6] flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-[#F6F7F6] flex items-center justify-center">
                  <p className="text-sm text-[#6B716D]">No data</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#16834B]"></div>
                <span className="text-xs text-[#6B716D]">UPI / Cash</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C47A13]"></div>
                <span className="text-xs text-[#6B716D]">Store</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#D14343]"></div>
                <span className="text-xs text-[#6B716D]">Credit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E8E6] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#151A17]">Recent Orders</h2>
            <p className="text-sm text-[#6B716D]">Latest orders from your retailers</p>
          </div>
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F6]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Retailer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8E6]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F6F7F6] transition">
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[#151A17]">{order.retailer}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">₹{order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={getPaymentColor(order.payment)}>
                      {order.payment}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm" icon={FiEye} iconPosition="left">
                        View
                      </Button>
                    </Link>
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

export default AdminDashboard;