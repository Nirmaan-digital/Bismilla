import { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiLoader
} from 'react-icons/fi';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

const RetailerPayments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Live Data States
  const [outstanding, setOutstanding] = useState(0);
  const [totalPaidThisMonth, setTotalPaidThisMonth] = useState(0);
  const [payments, setPayments] = useState([]);

  // ============================================
  // FETCH LIVE DATA FROM BACKEND
  // ============================================
  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Stats (Outstanding & Total Paid)
        const statsRes = await api.get('/retailers/stats');
        if (statsRes.data.success) {
          const stats = statsRes.data.data;
          setOutstanding(stats.outstandingBalance || 0);
          // Calculate "Paid This Month". 
          // If your DB doesn't have a "monthly" column, we just show total_paid.
          // You can refine this later if you add a monthly query.
          setTotalPaidThisMonth(stats.total_paid || 0);
        }

        // 2. Fetch Payment History
        // Note: If you haven't created the backend GET /api/payments route yet, 
        // this will return an empty array silently using the catch block.
        try {
          const paymentsRes = await api.get('/payments');
          if (paymentsRes.data.success) {
            setPayments(paymentsRes.data.data || []);
          }
        } catch (paymentErr) {
          console.log('ℹ️ Payments history endpoint not ready yet, using empty list.');
          setPayments([]);
        }

      } catch (err) {
        console.error('❌ Error fetching payment data:', err);
        setError('Failed to load payment data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Calculate last payment details from the array
  const lastPayment = payments.length > 0 ? payments[0] : null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get status badge variant based on status string
  const getStatusVariant = (status) => {
    if (!status) return 'default';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'paid' || s === 'verified') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'failed' || s === 'cancelled') return 'danger';
    return 'default';
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FiLoader className="w-12 h-12 animate-spin text-[#16834B] mx-auto mb-4" />
          <p className="text-[#6B716D]">Loading payment data...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="bg-[#FDEEEE] border border-[#D14343]/20 rounded-xl p-8 text-center max-w-md mx-auto mt-8">
        <FiAlertCircle className="w-16 h-16 text-[#D14343] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#D14343] mb-2">Unable to Load Payments</h3>
        <p className="text-sm text-[#D14343]/80 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-[#D14343] text-white rounded-lg hover:bg-[#b03939] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ============================================
  // RENDER PAGE
  // ============================================
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#151A17]">Payments</h1>
        <p className="text-sm text-[#6B716D] mt-1">Track your payments and outstanding</p>
      </div>

      {/* Outstanding - Highlighted at Top */}
      <div className="bg-[#FDEEEE] border-2 border-[#D14343] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <FiAlertCircle className="w-6 h-6 text-[#D14343]" />
          <div>
            <p className="text-sm font-medium text-[#D14343]">OUTSTANDING BALANCE</p>
            <p className="text-3xl font-bold text-[#D14343]">
              {formatCurrency(outstanding)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Total Paid</p>
          <p className="text-2xl font-bold text-[#16834B]">
            {formatCurrency(totalPaidThisMonth)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Last Payment</p>
          <p className="text-2xl font-bold text-[#151A17]">
            {lastPayment ? formatCurrency(lastPayment.amount) : '₹0'}
          </p>
          <p className="text-xs text-[#6B716D]">{lastPayment ? formatDate(lastPayment.date) : 'No payments yet'}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Payment Method</p>
          <p className="text-2xl font-bold text-[#151A17]">
            {lastPayment?.method || '-'}
          </p>
          <p className="text-xs text-[#6B716D]">Most recent</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E8E6]">
          <h2 className="text-lg font-semibold text-[#151A17]">Payment History</h2>
        </div>
        
        {payments.length === 0 ? (
          <div className="p-10 text-center text-[#6B716D]">
            <FiCreditCard className="w-12 h-12 mx-auto mb-3 text-[#E5E8E6]" />
            <p>No payment history found.</p>
            <p className="text-sm">Payments will appear here once you make an order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8E6]">
                {payments.map((payment) => (
                  <tr key={payment.id || payment.payment_number} className="hover:bg-[#F6F7F6] transition">
                    <td className="px-6 py-4 text-sm font-medium text-[#151A17]">
                      {payment.payment_number || payment.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B716D]">
                      {formatDate(payment.date || payment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B716D]">
                      {payment.order_id || payment.order_number || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B716D]">
                      {payment.method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-[#16834B]">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status || 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerPayments;