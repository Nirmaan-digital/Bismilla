import { useState } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const Payments = () => {
  const [payments] = useState([
    { id: 'PAY-001', retailer: 'Al Madina Chicken Shop', order: 'ORD-1042', amount: '₹10,000', method: 'Cash', status: 'Partial', date: '24 Jul 2026' },
    { id: 'PAY-002', retailer: 'Hyderabad Poultry', order: 'ORD-1041', amount: '₹17,425', method: 'UPI', status: 'Paid', date: '24 Jul 2026' },
    { id: 'PAY-003', retailer: 'Fresh Meat Shop', order: 'ORD-1039', amount: '₹5,000', method: 'Bank Transfer', status: 'Partial', date: '23 Jul 2026' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Payments</h1>
          <p className="text-sm text-[#6B716D]">Manage all payments and collections</p>
        </div>
        <Button>+ Record Payment</Button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Retailer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8E6]">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{payment.id}</td>
                  <td className="px-6 py-4 text-sm text-[#151A17]">{payment.retailer}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{payment.order}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{payment.method}</td>
                  <td className="px-6 py-4">
                    <Badge variant={payment.status === 'Paid' ? 'success' : 'warning'}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{payment.date}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">View</Button>
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

export default Payments;