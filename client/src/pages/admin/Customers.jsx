import { useState } from 'react';
import { 
  FiUsers, 
  FiPhone,
  FiShoppingBag,
  FiDownload
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';

// Mock customer data
const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'Sharma Chicken Corner',
    phone: '9876543210',
    shop: 'Sharma Chicken Corner',
    address: '12 Market Road, Hyderabad',
    outstanding: 130000,
    totalPurchase: 1250000,
    orders: 45,
    status: 'Active',
    joined: '15 Jan 2024',
  },
  {
    id: 'CUST-002',
    name: 'Khan Poultry',
    phone: '9876543211',
    shop: 'Khan Poultry',
    address: '45 Main Street, Secunderabad',
    outstanding: 35000,
    totalPurchase: 850000,
    orders: 32,
    status: 'Active',
    joined: '22 Mar 2024',
  },
  {
    id: 'CUST-003',
    name: 'Reddy Fresh Meats',
    phone: '9876543212',
    shop: 'Reddy Fresh Meats',
    address: '78 IT Park, Gachibowli',
    outstanding: 210000,
    totalPurchase: 2100000,
    orders: 68,
    status: 'Active',
    joined: '10 Jun 2024',
  },
  {
    id: 'CUST-004',
    name: 'Patel Chicken',
    phone: '9876543213',
    shop: 'Patel Chicken',
    address: '234 Jubilee Hills',
    outstanding: 0,
    totalPurchase: 420000,
    orders: 18,
    status: 'Active',
    joined: '05 Sep 2024',
  },
  {
    id: 'CUST-005',
    name: 'Gupta Poultry House',
    phone: '9876543214',
    shop: 'Gupta Poultry House',
    address: '56 Banjara Hills',
    outstanding: 175000,
    totalPurchase: 1560000,
    orders: 52,
    status: 'Active',
    joined: '20 Oct 2024',
  },
];

const Customers = () => {
  const [customers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Customers</h1>
          <p className="text-sm text-[#6B716D] mt-1">{customers.length} retailers on the network</p>
        </div>
        <Button variant="outline" icon={FiDownload}>
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, shop, phone..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-[#E5E8E6] rounded-lg bg-white focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Outstanding</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Total Purchase</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8E6]">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#F6F7F6] transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#151A17]">{customer.name}</p>
                        <p className="text-xs text-[#6B716D]">{customer.shop}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiPhone className="w-3 h-3 text-[#6B716D]" />
                        <span className="text-sm text-[#151A17]">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        customer.outstanding > 0 ? 'text-[#D14343]' : 'text-[#16834B]'
                      }`}>
                        {formatCurrency(customer.outstanding)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#151A17]">
                      {formatCurrency(customer.totalPurchase)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiShoppingBag className="w-3 h-3 text-[#6B716D]" />
                        <span className="text-sm text-[#151A17]">{customer.orders}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={customer.status === 'Active' ? 'success' : 'default'}>
                        {customer.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No customers found"
            description="Try adjusting your search or filter criteria."
            icon={FiUsers}
          />
        )}
      </div>
    </div>
  );
};

export default Customers;