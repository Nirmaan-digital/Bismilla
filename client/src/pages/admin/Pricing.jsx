import { useState } from 'react';
import { 
  FiDollarSign, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiUser,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../data/mockData';

// Mock data for default prices
const defaultPrices = {
  wholeChicken: 210,
  skinlessChicken: 240,
  chickenBreast: 280,
  chickenLegs: 195,
  chickenWings: 175,
};

// Mock data for user-specific prices
const mockUserPrices = [
  { 
    id: 'CUST-001', 
    name: 'Ahmed Khan', 
    shop: 'Al Madina Chicken Shop',
    phone: '9876543210',
    role: 'retailer',
    defaultPrice: 210,
    customPrice: 205,
    isCustom: true,
    lastUpdated: '24 Jul 2026, 10:30 AM',
  },
  { 
    id: 'CUST-002', 
    name: 'Suresh Reddy', 
    shop: 'Hyderabad Poultry',
    phone: '9876543211',
    role: 'retailer',
    defaultPrice: 210,
    customPrice: null,
    isCustom: false,
    lastUpdated: '-',
  },
  { 
    id: 'CUST-003', 
    name: 'Priya Patel', 
    shop: 'City Chicken Store',
    phone: '9876543212',
    role: 'retailer',
    defaultPrice: 210,
    customPrice: 215,
    isCustom: true,
    lastUpdated: '23 Jul 2026, 02:15 PM',
  },
  { 
    id: 'CUST-004', 
    name: 'Ravi Kumar', 
    shop: 'Fresh Meat Shop',
    phone: '9876543213',
    role: 'retailer',
    defaultPrice: 210,
    customPrice: null,
    isCustom: false,
    lastUpdated: '-',
  },
  { 
    id: 'CUST-005', 
    name: 'Mohan Reddy', 
    shop: 'Lakshmi Poultry',
    phone: '9876543214',
    role: 'retailer',
    defaultPrice: 210,
    customPrice: 200,
    isCustom: true,
    lastUpdated: '22 Jul 2026, 09:45 AM',
  },
];

// Price history mock data
const priceHistory = [
  { date: '24 Jul 2026', price: 210, changedBy: 'Admin', note: 'Daily update' },
  { date: '23 Jul 2026', price: 205, changedBy: 'Admin', note: 'Market adjustment' },
  { date: '22 Jul 2026', price: 208, changedBy: 'Admin', note: 'Weekly revision' },
  { date: '21 Jul 2026', price: 210, changedBy: 'Admin', note: 'Back to regular' },
  { date: '20 Jul 2026', price: 200, changedBy: 'Admin', note: 'Special promotion' },
];

const Pricing = () => {
  const [currentPrice, setCurrentPrice] = useState(210);
  const [isEditingDefault, setIsEditingDefault] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState(currentPrice);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customPriceValue, setCustomPriceValue] = useState('');
  const [userPrices, setUserPrices] = useState(mockUserPrices);
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('24 Jul 2026, 8:25:37 pm');
  const [priceHistoryList, setPriceHistoryList] = useState(priceHistory);

  // Filter users based on search
  const filteredUsers = userPrices.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  // Get users with custom prices
  const customPriceUsers = userPrices.filter(user => user.isCustom);

  // Handle default price update
  const handleDefaultPriceUpdate = () => {
    const newPrice = parseFloat(editPriceValue);
    if (newPrice > 0) {
      // Update current price
      setCurrentPrice(newPrice);
      
      // Update default price for all users
      const updatedUsers = userPrices.map(user => ({
        ...user,
        defaultPrice: newPrice,
        // If user doesn't have custom price, show default
        customPrice: user.isCustom ? user.customPrice : null,
        isCustom: user.isCustom,
        lastUpdated: user.isCustom ? user.lastUpdated : '-'
      }));
      
      setUserPrices(updatedUsers);
      setIsEditingDefault(false);
      
      const now = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setLastUpdated(now);
      
      // Add to price history
      setPriceHistoryList([
        {
          date: formatDate(new Date()),
          price: newPrice,
          changedBy: 'Admin',
          note: 'Daily update'
        },
        ...priceHistoryList
      ]);
    }
  };

  // Handle user custom price update
  const handleUserPriceUpdate = () => {
    if (!selectedUser) return;
    
    const newPrice = parseFloat(customPriceValue);
    if (newPrice > 0) {
      const updatedUsers = userPrices.map(user => 
        user.id === selectedUser.id
          ? { 
              ...user, 
              customPrice: newPrice,
              isCustom: true,
              defaultPrice: currentPrice, // Keep default price updated
              lastUpdated: new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          : user
      );
      setUserPrices(updatedUsers);
      setIsUserModalOpen(false);
      setCustomPriceValue('');
      setSelectedUser(null);
    }
  };

  // Remove custom price from user
  const removeCustomPrice = (userId) => {
    const updatedUsers = userPrices.map(user => 
      user.id === userId
        ? { 
            ...user, 
            customPrice: null, 
            isCustom: false, 
            defaultPrice: currentPrice,
            lastUpdated: '-'
          }
        : user
    );
    setUserPrices(updatedUsers);
  };

  // Open user price modal
  const openUserPriceModal = (user) => {
    setSelectedUser(user);
    setCustomPriceValue(user.customPrice ? user.customPrice.toString() : '');
    setIsUserModalOpen(true);
  };

  // Get displayed price for user
  const getUserDisplayPrice = (user) => {
    if (user.isCustom && user.customPrice !== null) {
      return user.customPrice;
    }
    return currentPrice; // Use current default price
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Price Management</h1>
          <p className="text-sm text-[#6B716D] mt-1">Set today's per-kg rates. Changes apply instantly to the current price.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsPriceHistoryOpen(true)}
          >
            View History
          </Button>
        </div>
      </div>

      {/* Default Price Card */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#F6F7F6] rounded-lg">
                <FiDollarSign className="w-5 h-5 text-[#111714]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#6B716D]">DEFAULT PRICE</p>
                <p className="text-xs text-[#6B716D]">Rate for all retailers (unless custom price is set)</p>
              </div>
            </div>
            
            {isEditingDefault ? (
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl font-bold text-[#151A17]">₹</span>
                <input
                  type="number"
                  value={editPriceValue}
                  onChange={(e) => setEditPriceValue(e.target.value)}
                  className="w-32 px-4 py-2 text-2xl font-bold border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
                  min="0"
                  step="1"
                />
                <span className="text-sm text-[#6B716D]">/ kg</span>
              </div>
            ) : (
              <div className="mt-2">
                <span className="text-4xl font-bold text-[#151A17]">₹{currentPrice}</span>
                <span className="ml-2 text-sm text-[#6B716D]">/ kg</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            {isEditingDefault ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingDefault(false);
                    setEditPriceValue(currentPrice);
                  }}
                >
                  <FiX className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDefaultPriceUpdate}
                >
                  <FiSave className="w-4 h-4 mr-1" />
                  Save Price
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditingDefault(true);
                  setEditPriceValue(currentPrice);
                }}
              >
                <FiEdit2 className="w-4 h-4 mr-1" />
                Update Price
              </Button>
            )}
            <p className="text-xs text-[#6B716D] mt-2">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Quick update info */}
        <div className="mt-4 pt-4 border-t border-[#E5E8E6]">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-[#16834B]" />
              <span className="text-[#6B716D]">Default Price:</span>
              <span className="font-medium text-[#151A17]">₹{currentPrice}/kg</span>
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-[#3B6FD8]" />
              <span className="text-[#6B716D]">Custom Prices:</span>
              <span className="font-medium text-[#151A17]">{customPriceUsers.length} users</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Custom Prices Section */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E8E6] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#151A17]">User Custom Prices</h2>
            <p className="text-sm text-[#6B716D]">Set different prices for individual retailers</p>
          </div>
          <div className="w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F6F7F6]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Default Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Custom Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8E6]">
              {filteredUsers.map((user) => {
                const displayPrice = getUserDisplayPrice(user);
                return (
                  <tr key={user.id} className="hover:bg-[#F6F7F6] transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#151A17]">{user.name}</p>
                        <p className="text-xs text-[#6B716D]">{user.shop}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B716D]">
                      ₹{currentPrice}/kg
                    </td>
                    <td className="px-6 py-4">
                      {user.isCustom ? (
                        <span className="text-sm font-semibold text-[#3B6FD8]">
                          ₹{user.customPrice}/kg
                        </span>
                      ) : (
                        <span className="text-sm text-[#6B716D]">₹{currentPrice}/kg</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isCustom ? (
                        <Badge variant="info">Custom</Badge>
                      ) : (
                        <Badge variant="default">Default</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B716D]">
                      {user.lastUpdated}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.isCustom && (
                          <button
                            onClick={() => removeCustomPrice(user.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Remove Custom Price"
                          >
                            <FiX className="w-4 h-4 text-[#D14343]" />
                          </button>
                        )}
                        <button
                          onClick={() => openUserPriceModal(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title={user.isCustom ? "Edit Custom Price" : "Set Custom Price"}
                        >
                          <FiEdit2 className="w-4 h-4 text-[#6B716D]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Price Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
          setCustomPriceValue('');
        }}
        title={selectedUser?.isCustom ? "Edit Custom Price" : "Set Custom Price"}
        description={`Set custom price for ${selectedUser?.name} (${selectedUser?.shop})`}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsUserModalOpen(false);
                setSelectedUser(null);
                setCustomPriceValue('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUserPriceUpdate}>
              {selectedUser?.isCustom ? "Update Price" : "Set Price"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-[#F6F7F6] rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6B716D]">Default Price</p>
                <p className="font-semibold text-[#151A17]">₹{currentPrice}/kg</p>
              </div>
              <div>
                <p className="text-[#6B716D]">Current Custom Price</p>
                <p className="font-semibold text-[#151A17]">
                  {selectedUser?.isCustom ? `₹${selectedUser?.customPrice}/kg` : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Custom Price (₹/kg)
            </label>
            <input
              type="number"
              value={customPriceValue}
              onChange={(e) => setCustomPriceValue(e.target.value)}
              placeholder="Enter custom price"
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
              min="0"
              step="1"
            />
            <p className="mt-2 text-xs text-[#6B716D]">
              <FiAlertCircle className="inline w-3 h-3 mr-1" />
              Current default price is ₹{currentPrice}/kg
            </p>
          </div>
        </div>
      </Modal>

      {/* Price History Modal */}
      <Modal
        isOpen={isPriceHistoryOpen}
        onClose={() => setIsPriceHistoryOpen(false)}
        title="Price History"
        description="Track all price changes over time"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setIsPriceHistoryOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {priceHistoryList.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-[#E5E8E6] rounded-lg hover:bg-[#F6F7F6] transition">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F6F7F6] flex items-center justify-center">
                  <FiDollarSign className="w-4 h-4 text-[#111714]" />
                </div>
                <div>
                  <p className="font-medium text-[#151A17]">
                    ₹{entry.price}/kg
                  </p>
                  <p className="text-sm text-[#6B716D]">
                    {entry.note}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#6B716D]">{entry.date}</p>
                <p className="text-xs text-[#6B716D]">By: {entry.changedBy}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Pricing;