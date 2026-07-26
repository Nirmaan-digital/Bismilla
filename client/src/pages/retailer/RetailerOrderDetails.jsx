import { useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiCreditCard, 
  FiTruck,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiCircle
} from 'react-icons/fi';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

// Mock order details - will come from API
const mockOrderDetails = {
  id: 'ORD-1001',
  date: '24 Jul 2026',
  time: '10:30 AM',
  status: 'En route',
  items: [
    { name: 'Whole Chicken', quantity: 70, rate: 210, total: 14700 },
    { name: 'Chicken Breast', quantity: 50, rate: 198, total: 9900 },
    { name: 'Chicken Legs', quantity: 100, rate: 180, total: 18000 },
  ],
  totalWeight: 220,
  subtotal: 42600,
  discount: 0,
  deliveryCharge: 80,
  grandTotal: 42680,
  paidAmount: 15000,
  balance: 27680,
  paymentStatus: 'Partial',
  driver: 'Ramesh Kumar',
  driverPhone: '9876543220',
  vehicle: 'KA-01-AB-1234',
  deliveryStatus: 'En route',
  timeline: [
    { status: 'Order Placed', completed: true, time: '10:30 AM' },
    { status: 'Confirmed', completed: true, time: '11:00 AM' },
    { status: 'Processing', completed: true, time: '11:30 AM' },
    { status: 'Out for Delivery', completed: true, time: '02:00 PM' },
    { status: 'Delivered', completed: false, time: '-' },
  ],
};

const RetailerOrderDetails = () => {
  const { id } = useParams();
  const [order] = useState(mockOrderDetails);

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
      {/* Back Button */}
      <Link to="/retailer/orders" className="inline-flex items-center gap-2 text-[#6B716D] hover:text-[#151A17] mb-6 transition">
        <FiArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Order #{order.id}</h1>
          <p className="text-sm text-[#6B716D] mt-1">
            Placed on {order.date} at {order.time}
          </p>
        </div>
        <Badge variant="info">{order.status}</Badge>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
            <h3 className="font-semibold text-[#151A17] mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-[#E5E8E6] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#151A17]">{item.name}</p>
                    <p className="text-xs text-[#6B716D]">{item.quantity} kg × ₹{item.rate}</p>
                  </div>
                  <span className="text-sm font-medium text-[#151A17]">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#E5E8E6] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B716D]">Subtotal</span>
                <span className="text-[#151A17]">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B716D]">Discount</span>
                <span className="text-[#151A17]">{formatCurrency(order.discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B716D]">Delivery Charge</span>
                <span className="text-[#151A17]">{formatCurrency(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-[#E5E8E6]">
                <span>Grand Total</span>
                <span className="text-[#151A17]">{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
            <h3 className="font-semibold text-[#151A17] mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {order.timeline.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  {step.completed ? (
                    <FiCheckCircle className="w-5 h-5 text-[#16834B] mt-0.5" />
                  ) : (
                    <FiCircle className="w-5 h-5 text-[#6B716D] mt-0.5" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${step.completed ? 'text-[#151A17]' : 'text-[#6B716D]'}`}>
                      {step.status}
                    </p>
                    <p className="text-xs text-[#6B716D]">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Payment & Delivery */}
        <div className="space-y-6">
          {/* Payment Details */}
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
            <h3 className="font-semibold text-[#151A17] mb-4">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B716D]">Total Amount</span>
                <span className="font-medium">{formatCurrency(order.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B716D]">Paid Amount</span>
                <span className="font-medium text-[#16834B]">{formatCurrency(order.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-[#6B716D]">Balance</span>
                <span className="text-[#D14343]">{formatCurrency(order.balance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B716D]">Payment Status</span>
                <Badge variant="warning">{order.paymentStatus}</Badge>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
            <h3 className="font-semibold text-[#151A17] mb-4">Delivery Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiTruck className="w-4 h-4 text-[#6B716D]" />
                <div>
                  <p className="text-sm font-medium text-[#151A17]">{order.driver}</p>
                  <p className="text-xs text-[#6B716D]">{order.driverPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiPackage className="w-4 h-4 text-[#6B716D]" />
                <span className="text-sm text-[#151A17]">{order.vehicle}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiClock className="w-4 h-4 text-[#6B716D]" />
                <span className="text-sm text-[#151A17]">{order.deliveryStatus}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
            <h3 className="font-semibold text-[#151A17] mb-4">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full">
                <FiCreditCard className="w-4 h-4 mr-2" />
                Make Payment
              </Button>
              <Button variant="outline" className="w-full">
                <FiPackage className="w-4 h-4 mr-2" />
                Reorder
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerOrderDetails;