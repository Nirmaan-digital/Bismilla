import { useState } from 'react';
import Button from '../../components/common/Button';

const Ledgers = () => {
  const [ledgers] = useState([
    { id: 1, date: '24 Jul 2026', description: 'Order ORD-1042', retailer: 'Al Madina Chicken Shop', debit: '₹24,600', credit: '-', balance: '₹1,24,800' },
    { id: 2, date: '24 Jul 2026', description: 'Payment Received', retailer: 'Hyderabad Poultry', debit: '-', credit: '₹17,425', balance: '₹1,07,375' },
    { id: 3, date: '23 Jul 2026', description: 'Order ORD-1040', retailer: 'City Chicken Store', debit: '₹30,750', credit: '-', balance: '₹1,38,125' },
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Ledgers</h1>
          <p className="text-sm text-[#6B716D]">View all financial transactions</p>
        </div>
        <Button>Export Ledger</Button>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Retailer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Debit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Credit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8E6]">
              {ledgers.map((ledger) => (
                <tr key={ledger.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-[#6B716D]">{ledger.date}</td>
                  <td className="px-6 py-4 text-sm text-[#151A17]">{ledger.description}</td>
                  <td className="px-6 py-4 text-sm text-[#151A17]">{ledger.retailer}</td>
                  <td className="px-6 py-4 text-sm font-medium text-red-600">{ledger.debit}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">{ledger.credit}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{ledger.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ledgers;