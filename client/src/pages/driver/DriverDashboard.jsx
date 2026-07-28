import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiTruck, 
  FiPackage, 
  FiDollarSign,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiLogOut
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

// Mock data for now - will be replaced with API
const mockTrips = [
  {
    id: 'TRIP-001',
    date: '24 Jul 2026',
    orders: [
      {
        id: 'ORD-1001',
        retailer: 'Sharma Chicken Corner',
        address: '12 Market Road, Hyderabad',
        phone: '9876543210',
        kg: 150,
        amount: 28200,
        status: 'pending',
        paymentStatus: 'Partial',
      },
      {
        id: 'ORD-1005',
        retailer: 'Khan Poultry',
        address: '45 Main Street, Secunderabad',
        phone: '9876543211',
        kg: 220,
        amount: 41360,
        status: 'pending',
        paymentStatus: 'Pending',
      },
    ],
    totalKg: 370,
    totalOrders: 2,
    status: 'assigned',
  },
];

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState(mockTrips);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isTripStarted, setIsTripStarted] = useState(false);
  const [tripData, setTripData] = useState({
    totalHens: '',
    dieselAmount: '',
    dieselPhoto: null,
    dieselPhotoPreview: null,
    orders: [],
  });

  // Log user data on mount
  useEffect(() => {
    console.log('👤 Current user:', user);
    console.log('📦 User from localStorage:', localStorage.getItem('user'));
    console.log('🔑 Token from localStorage:', localStorage.getItem('token') ? 'Exists' : 'None');
  }, [user]);

  const currentTrip = trips.length > 0 ? trips[0] : null;
  const totalOrders = currentTrip?.orders?.length || 0;
  const totalKg = currentTrip?.totalKg || 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStartTrip = () => {
    setIsTripStarted(true);
    setActiveTrip(currentTrip);
    setTripData({
      ...tripData,
      orders: currentTrip.orders.map(order => ({
        ...order,
        actualKg: order.kg,
        cashCollected: 0,
        delivered: false,
      })),
    });
  };

  const handleCompleteTrip = async () => {
    try {
      alert('Trip completed successfully!');
      setIsTripStarted(false);
      setActiveTrip(null);
      setTripData({
        totalHens: '',
        dieselAmount: '',
        dieselPhoto: null,
        dieselPhotoPreview: null,
        orders: [],
      });
    } catch (error) {
      console.error('Error completing trip:', error);
      alert('Error completing trip. Please try again.');
    }
  };

  const handleOrderDelivered = (orderId) => {
    const updatedOrders = tripData.orders.map(order =>
      order.id === orderId ? { ...order, delivered: true } : order
    );
    setTripData({ ...tripData, orders: updatedOrders });

    const allDelivered = updatedOrders.every(order => order.delivered);
    if (allDelivered) {
      alert('All orders delivered! You can now complete the trip.');
    }
  };

  const updateOrderKg = (orderId, newKg) => {
    const updatedOrders = tripData.orders.map(order =>
      order.id === orderId ? { ...order, actualKg: parseFloat(newKg) || 0 } : order
    );
    setTripData({ ...tripData, orders: updatedOrders });
  };

  const updateCashCollected = (orderId, amount) => {
    const updatedOrders = tripData.orders.map(order =>
      order.id === orderId ? { ...order, cashCollected: parseFloat(amount) || 0 } : order
    );
    setTripData({ ...tripData, orders: updatedOrders });
  };

  const getDeliveredCount = () => {
    return tripData.orders.filter(o => o.delivered).length;
  };

  const getTotalDeliveredKg = () => {
    return tripData.orders.reduce((sum, o) => sum + (o.actualKg || 0), 0);
  };

  const getTotalCashCollected = () => {
    return tripData.orders.reduce((sum, o) => sum + (o.cashCollected || 0), 0);
  };

  const totalKgFromHens = tripData.totalHens ? parseFloat(tripData.totalHens) * 0.5 : 0;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // If trip is started, show the trip details view
  if (isTripStarted && activeTrip) {
    const allDelivered = tripData.orders.every(order => order.delivered);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#151A17]">Start Trip</h1>
            <p className="text-sm text-[#6B716D] mt-1">{activeTrip.id} - {activeTrip.date}</p>
          </div>
          <Badge variant="info">In Progress</Badge>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#6B716D]">Progress:</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#16834B] transition-all duration-500"
                  style={{ width: `${totalOrders > 0 ? (getDeliveredCount() / totalOrders) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[#151A17]">
                {getDeliveredCount()}/{totalOrders} Orders
              </span>
            </div>
            <span className="text-sm text-[#6B716D]">
              {totalOrders > 0 ? Math.round((getDeliveredCount() / totalOrders) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Hens Input */}
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 mb-6">
          <h3 className="font-semibold text-[#151A17] mb-4">Total Hens Loaded</h3>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={tripData.totalHens}
              onChange={(e) => setTripData({ ...tripData, totalHens: e.target.value })}
              placeholder="Enter total hens"
              className="w-40 px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
              min="0"
              step="1"
            />
            <span className="text-sm text-[#6B716D]">hens</span>
            <div className="ml-4 p-2 bg-[#F6F7F6] rounded-lg">
              <span className="text-sm text-[#6B716D]">= </span>
              <span className="font-semibold text-[#151A17]">
                {totalKgFromHens ? `${totalKgFromHens.toFixed(1)} kg` : '0 kg'}
              </span>
              <span className="text-xs text-[#6B716D] ml-2">(× 0.5)</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 mb-6">
          <h3 className="font-semibold text-[#151A17] mb-4">Expenses</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#6B716D] mb-1.5">Diesel Amount</label>
              <input
                type="number"
                value={tripData.dieselAmount}
                onChange={(e) => setTripData({ ...tripData, dieselAmount: e.target.value })}
                placeholder="Enter diesel amount"
                className="w-full max-w-xs px-4 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
                min="0"
                step="1"
              />
            </div>
            <div>
              <label className="block text-sm text-[#6B716D] mb-1.5">Upload Photo</label>
              <div className="border-2 border-dashed border-[#E5E8E6] rounded-lg p-6 text-center hover:border-[#111714] transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="diesel-photo"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setTripData({ 
                        ...tripData, 
                        dieselPhoto: e.target.files[0],
                        dieselPhotoPreview: URL.createObjectURL(e.target.files[0])
                      });
                    }
                  }}
                />
                <label htmlFor="diesel-photo" className="cursor-pointer">
                  {tripData.dieselPhotoPreview ? (
                    <div>
                      <img 
                        src={tripData.dieselPhotoPreview} 
                        alt="Diesel" 
                        className="w-32 h-32 object-cover mx-auto rounded-lg"
                      />
                      <p className="text-sm text-[#16834B] mt-2">Photo uploaded</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 bg-[#F6F7F6] rounded-full flex items-center justify-center mx-auto">
                        <FiTruck className="w-6 h-6 text-[#6B716D]" />
                      </div>
                      <p className="text-sm text-[#6B716D] mt-2">Click to upload diesel photo</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-[#151A17]">Orders to Deliver</h3>
          {tripData.orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-[#E5E8E6] p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-[#151A17]">{order.id}</h4>
                    <Badge variant={order.delivered ? 'success' : 'warning'}>
                      {order.delivered ? 'Delivered' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-[#151A17] mt-1">{order.retailer}</p>
                </div>
                <span className="text-sm font-medium text-[#151A17]">
                  {formatCurrency(order.amount)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-[#6B716D]">
                  <FiMapPin className="w-4 h-4" />
                  {order.address}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B716D]">
                  <FiPhone className="w-4 h-4" />
                  {order.phone}
                </div>
              </div>

              {!order.delivered ? (
                <div className="space-y-3 pt-3 border-t border-[#E5E8E6]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#6B716D] mb-1">Ordered KG</label>
                      <input
                        type="number"
                        value={order.kg}
                        disabled
                        className="w-full px-3 py-2 border border-[#E5E8E6] rounded-lg bg-gray-50 text-[#6B716D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#6B716D] mb-1">Actual Delivered (KG)</label>
                      <input
                        type="number"
                        value={order.actualKg || ''}
                        onChange={(e) => updateOrderKg(order.id, e.target.value)}
                        placeholder="Enter actual kg"
                        className="w-full px-3 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
                        min="0"
                        step="0.5"
                      />
                      {order.actualKg && order.actualKg !== order.kg && (
                        <p className="text-xs text-[#C47A13] mt-1">
                          ⚠️ {order.actualKg > order.kg ? '+' : ''}{order.actualKg - order.kg} kg difference
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B716D] mb-1">Cash Collected (₹)</label>
                    <input
                      type="number"
                      value={order.cashCollected || ''}
                      onChange={(e) => updateCashCollected(order.id, e.target.value)}
                      placeholder="Enter cash collected"
                      className="w-full px-3 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
                      min="0"
                      step="1"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => handleOrderDelivered(order.id)}
                  >
                    <FiCheckCircle className="w-4 h-4 mr-2" />
                    Mark as Delivered
                  </Button>
                </div>
              ) : (
                <div className="pt-3 border-t border-[#E5E8E6]">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#6B716D]">Ordered KG</p>
                      <p className="font-medium text-[#151A17]">{order.kg} kg</p>
                    </div>
                    <div>
                      <p className="text-[#6B716D]">Delivered KG</p>
                      <p className="font-medium text-[#151A17]">{order.actualKg || order.kg} kg</p>
                    </div>
                    <div>
                      <p className="text-[#6B716D]">Cash Collected</p>
                      <p className="font-medium text-[#16834B]">{formatCurrency(order.cashCollected || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B716D]">Status</p>
                      <Badge variant="success">✓ Delivered</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary & Complete Trip */}
        {getDeliveredCount() > 0 && (
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 sticky bottom-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-[#6B716D]">Orders</p>
                <p className="text-lg font-semibold text-[#151A17]">{getDeliveredCount()}/{totalOrders}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#6B716D]">Total KG</p>
                <p className="text-lg font-semibold text-[#151A17]">{getTotalDeliveredKg().toFixed(1)} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#6B716D]">Cash Collected</p>
                <p className="text-lg font-semibold text-[#16834B]">{formatCurrency(getTotalCashCollected())}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#6B716D]">Total Hens</p>
                <p className="text-lg font-semibold text-[#151A17]">{tripData.totalHens || 0}</p>
              </div>
            </div>

            <Button 
              className="w-full py-3 text-base"
              onClick={handleCompleteTrip}
              disabled={!allDelivered}
            >
              {allDelivered ? (
                <>
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  Complete Trip
                </>
              ) : (
                <>
                  <FiAlertCircle className="w-5 h-5 mr-2" />
                  Deliver all orders to complete trip
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Dashboard View (when no trip is started)
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">
            {getGreeting()}, {user?.name || 'Driver'} 👋
          </h1>
          <p className="text-sm text-[#6B716D] mt-1">
            {trips.length > 0 ? 'Your assigned trips for today' : 'No trips assigned for today'}
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B716D] hover:text-[#D14343] transition"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <FiTruck className="w-5 h-5 mx-auto text-[#6B716D] mb-1" />
          <p className="text-xl font-semibold text-[#151A17]">{trips.length}</p>
          <p className="text-xs text-[#6B716D]">Trips Today</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <FiPackage className="w-5 h-5 mx-auto text-[#6B716D] mb-1" />
          <p className="text-xl font-semibold text-[#151A17]">{totalOrders}</p>
          <p className="text-xs text-[#6B716D]">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 text-center">
          <FiDollarSign className="w-5 h-5 mx-auto text-[#6B716D] mb-1" />
          <p className="text-xl font-semibold text-[#151A17]">{totalKg} kg</p>
          <p className="text-xs text-[#6B716D]">Total Weight</p>
        </div>
      </div>

      {/* Assigned Trips */}
      {trips.length > 0 ? (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl border border-[#E5E8E6] p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-[#151A17]">{trip.id}</h3>
                    <Badge variant="info">Assigned</Badge>
                  </div>
                  <p className="text-sm text-[#6B716D] mt-1">{trip.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#6B716D]">Orders</p>
                  <p className="font-semibold text-[#151A17]">{trip.totalOrders}</p>
                </div>
              </div>

              {/* Order Previews */}
              <div className="space-y-2 mb-4">
                {trip.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm bg-[#F6F7F6] p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-[#151A17]">{order.retailer}</p>
                      <p className="text-xs text-[#6B716D]">{order.id} • {order.kg} kg</p>
                    </div>
                    <span className="text-sm font-medium text-[#151A17]">{formatCurrency(order.amount)}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full"
                onClick={handleStartTrip}
              >
                <FiTruck className="w-4 h-4 mr-2" />
                Start Trip
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-12 text-center">
          <FiCheckCircle className="w-12 h-12 mx-auto text-[#16834B] mb-3" />
          <p className="text-lg font-medium text-[#151A17]">No trips assigned</p>
          <p className="text-sm text-[#6B716D]">You have no trips scheduled for today</p>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;