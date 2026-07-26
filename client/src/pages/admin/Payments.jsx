import { useState } from 'react';
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiUsers,
  FiSearch,
  FiEye,
  FiPlus,
  FiX,
  FiCheck,
  FiCalendar,
  FiClock,
  FiArrowRight,
  FiFileText,
  FiShoppingBag
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';

// Mock payments data
const mockPayments = [
  {
    id: 'PAY-505',
    customer: 'Khan Poultry',
    customerId: 'RET-002',
    method: 'Office',
    collectedBy: 'Office',
    amount: 10000,
    date: '24 Jul 2026',
    type: 'Office Payment',
    status: 'Completed',
  },
  {
    id: 'PAY-501',
    customer: 'Sharma Chicken Corner',
    customerId: 'RET-001',
    method: 'UPI',
    collectedBy: 'Office',
    amount: 70000,
    date: '23 Jul 2026',
    type: 'Office Payment',
    status: 'Completed',
  },
  {
    id: 'PAY-502',
    customer: 'Khan Poultry',
    customerId: 'RET-002',
    method: 'Cash',
    collectedBy: 'D002',
    amount: 30000,
    date: '23 Jul 2026',
    type: 'Driver Collection',
    status: 'Completed',
  },
  {
    id: 'PAY-503',
    customer: 'Gupta Poultry House',
    customerId: 'RET-005',
    method: 'UPI',
    collectedBy: 'Office',
    amount: 50000,
    date: '22 Jul 2026',
    type: 'Office Payment',
    status: 'Completed',
  },
  {
    id: 'PAY-504',
    customer: 'Reddy Fresh Meats',
    customerId: 'RET-003',
    method: 'Cash',
    collectedBy: 'D001',
    amount: 100000,
    date: '21 Jul 2026',
    type: 'Driver Collection',
    status: 'Completed',
  },
  {
    id: 'PAY-506',
    customer: 'Patel Chicken',
    customerId: 'RET-004',
    method: 'Cash',
    collectedBy: 'Office',
    amount: 22560,
    date: '22 Jul 2026',
    type: 'Office Payment',
    status: 'Completed',
  },
  {
    id: 'PAY-507',
    customer: 'Sharma Chicken Corner',
    customerId: 'RET-001',
    method: 'UPI',
    collectedBy: 'Office',
    amount: 20000,
    date: '22 Jul 2026',
    type: 'Office Payment',
    status: 'Completed',
  },
  {
    id: 'PAY-508',
    customer: 'Reddy Fresh Meats',
    customerId: 'RET-003',
    method: 'Cash',
    collectedBy: 'D001',
    amount: 50000,
    date: '23 Jul 2026',
    type: 'Driver Collection',
    status: 'Completed',
  },
];

// Mock retailers for outstanding balance
const mockRetailers = [
  { id: 'RET-001', name: 'Sharma Chicken Corner', outstanding: 130000, totalOrders: 1250000 },
  { id: 'RET-002', name: 'Khan Poultry', outstanding: 35000, totalOrders: 850000 },
  { id: 'RET-003', name: 'Reddy Fresh Meats', outstanding: 210000, totalOrders: 2100000 },
  { id: 'RET-004', name: 'Patel Chicken', outstanding: 0, totalOrders: 420000 },
  { id: 'RET-005', name: 'Gupta Poultry House', outstanding: 175000, totalOrders: 1560000 },
];

// Mock orders total
const totalOrdersAmount = 6180000; // Sum of all orders from all retailers

const Payments = () => {
  const [payments, setPayments] = useState(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    customer: '',
    amount: '',
    method: 'Cash',
    collectedBy: 'Office',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Calculate statistics
  const totalUPI = payments
    .filter(p => p.method === 'UPI' || p.method === 'Upi')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCash = payments
    .filter(p => p.method === 'Cash')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOfficePayments = payments
    .filter(p => p.collectedBy === 'Office')
    .reduce((sum, p) => sum + p.amount, 0);

  // Total collected = Cash + UPI + Office Payments
  const totalCollected = totalCash + totalUPI + totalOfficePayments;

  // Total outstanding from all retailers
  const totalOutstanding = mockRetailers.reduce((sum, r) => sum + r.outstanding, 0);

  // Filter payments based on search
  const filteredPayments = payments.filter(p =>
    p.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.collectedBy.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle payment submission
  const handlePaymentSubmit = () => {
    if (!paymentForm.customer || !paymentForm.amount) {
      alert('Please select a customer and enter amount');
      return;
    }

    const newPayment = {
      id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
      customer: paymentForm.customer,
      customerId: `RET-${String(mockRetailers.length + 1).padStart(3, '0')}`,
      method: paymentForm.method,
      collectedBy: paymentForm.collectedBy,
      amount: parseFloat(paymentForm.amount),
      date: formatDate(paymentForm.date),
      type: paymentForm.collectedBy === 'Office' ? 'Office Payment' : 'Driver Collection',
      status: 'Completed',
    };

    setPayments([newPayment, ...payments]);
    setIsPaymentModalOpen(false);
    setPaymentForm({
      customer: '',
      amount: '',
      method: 'Cash',
      collectedBy: 'Office',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    alert('Payment recorded successfully!');
  };

  // Get method badge color
  const getMethodColor = (method) => {
    const colors = {
      'Cash': 'success',
      'UPI': 'info',
      'Upi': 'info',
      'Office': 'primary',
      'Bank Transfer': 'warning',
      'Cheque': 'default',
    };
    return colors[method] || 'default';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Payments</h1>
          <p className="text-sm text-[#6B716D] mt-1">All collections across drivers and office</p>
        </div>
        <Button onClick={() => setIsPaymentModalOpen(true)}>
          <FiPlus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F6F7F6] rounded-lg">
              <FiShoppingBag className="w-5 h-5 text-[#151A17]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">Total Orders</p>
              <p className="text-2xl font-semibold text-[#151A17]">{formatCurrency(totalOrdersAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F6F7F6] rounded-lg">
              <FiDollarSign className="w-5 h-5 text-[#111714]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">Cash Collected</p>
              <p className="text-2xl font-semibold text-[#151A17]">{formatCurrency(totalCash)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F6F7F6] rounded-lg">
              <FiCreditCard className="w-5 h-5 text-[#3B6FD8]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">UPI Collected</p>
              <p className="text-2xl font-semibold text-[#151A17]">{formatCurrency(totalUPI)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F6F7F6] rounded-lg">
              <FiFileText className="w-5 h-5 text-[#C47A13]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">Office Payments</p>
              <p className="text-2xl font-semibold text-[#151A17]">{formatCurrency(totalOfficePayments)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F6F7F6] rounded-lg">
              <FiUsers className="w-5 h-5 text-[#D14343]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">Outstanding</p>
              <p className="text-2xl font-semibold text-[#D14343]">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Row - Total Collected */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B716D]">Total Collected:</span>
              <span className="text-lg font-semibold text-[#16834B]">{formatCurrency(totalCollected)}</span>
            </div>
            <div className="w-px h-8 bg-[#E5E8E6]"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B716D]">Total Orders:</span>
              <span className="text-lg font-semibold text-[#151A17]">{formatCurrency(totalOrdersAmount)}</span>
            </div>
            <div className="w-px h-8 bg-[#E5E8E6]"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B716D]">Outstanding:</span>
              <span className="text-lg font-semibold text-[#D14343]">{formatCurrency(totalOutstanding)}</span>
            </div>
          </div>
          <div className="text-sm text-[#6B716D]">
            <span className="font-medium">Collection Rate:</span>{' '}
            <span className="font-semibold text-[#16834B]">
              {totalOrdersAmount > 0 
                ? `${Math.round((totalCollected / totalOrdersAmount) * 100)}%` 
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by payment ID, customer, method, or collector..."
          className="max-w-md"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E8E6]">
          <h2 className="text-lg font-semibold text-[#151A17]">Recent Collections</h2>
        </div>

        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Collected By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8E6]">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#F6F7F6] transition">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#151A17]">{payment.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#151A17]">{payment.customer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getMethodColor(payment.method)}>
                        {payment.method}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#6B716D]">{payment.collectedBy}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-3 h-3 text-[#6B716D]" />
                        <span className="text-sm text-[#6B716D]">{payment.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-[#16834B]">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No payments found"
            description="Try adjusting your search criteria."
            icon={FiCreditCard}
          />
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentForm({
            customer: '',
            amount: '',
            method: 'Cash',
            collectedBy: 'Office',
            date: new Date().toISOString().split('T')[0],
            notes: '',
          });
        }}
        title="Record Payment"
        description="Enter payment details"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPaymentModalOpen(false);
                setPaymentForm({
                  customer: '',
                  amount: '',
                  method: 'Cash',
                  collectedBy: 'Office',
                  date: new Date().toISOString().split('T')[0],
                  notes: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit}>
              <FiCheck className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Customer <span className="text-[#D14343]">*</span>
            </label>
            <select
              value={paymentForm.customer}
              onChange={(e) => setPaymentForm({ ...paymentForm, customer: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="">Select customer...</option>
              {mockRetailers.map((retailer) => (
                <option key={retailer.id} value={retailer.name}>
                  {retailer.name} (Outstanding: {formatCurrency(retailer.outstanding)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Amount <span className="text-[#D14343]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B716D]">₹</span>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Payment Method <span className="text-[#D14343]">*</span>
            </label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Collected By */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Collected By <span className="text-[#D14343]">*</span>
            </label>
            <select
              value={paymentForm.collectedBy}
              onChange={(e) => setPaymentForm({ ...paymentForm, collectedBy: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="Office">Office</option>
              <option value="D001">Driver 1</option>
              <option value="D002">Driver 2</option>
              <option value="D003">Driver 3</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={paymentForm.date}
              onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="Add any additional notes..."
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
              rows="2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;