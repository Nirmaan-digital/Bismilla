import { useState } from 'react';
import { 
  FiCreditCard, 
  FiDollarSign, 
  FiClock,
  FiCalendar,
  FiAlertCircle
} from 'react-icons/fi';
import Badge from '../../components/common/Badge';

// Mock payments data
const mockPayments = [
  {
    id: 'PAY-501',
    date: '23/7/2026',
    order: 'ORD-1001',
    amount: 70000,
    method: 'UPI',
    status: 'Completed',
  },
  {
    id: 'PAY-502',
    date: '22/7/2026',
    order: 'ORD-1005',
    amount: 34200,
    method: 'Cash',
    status: 'Completed',
  },
  {
    id: 'PAY-503',
    date: '20/7/2026',
    order: 'ORD-1002',
    amount: 10000,
    method: 'Bank Transfer',
    status: 'Pending',
  },
];

const RetailerPayments = () => {
  const [payments] = useState(mockPayments);

  // Calculate totals
  const totalOutstanding = 130000;
  const totalPaidThisMonth = 104200;
  const lastPayment = payments[0];

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
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Paid This Month</p>
          <p className="text-2xl font-bold text-[#16834B]">
            {formatCurrency(totalPaidThisMonth)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-4">
          <p className="text-sm text-[#6B716D]">Last Payment</p>
          <p className="text-2xl font-bold text-[#151A17]">
            {formatCurrency(lastPayment?.amount || 0)}
          </p>
          <p className="text-xs text-[#6B716D]">{lastPayment?.date || '-'}</p>
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
                <tr key={payment.id} className="hover:bg-[#F6F7F6] transition">
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{payment.id}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{payment.date}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{payment.order}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{payment.method}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-[#16834B]">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={payment.status === 'Completed' ? 'success' : 'warning'}>
                      {payment.status}
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

export default RetailerPayments;