import { useState } from 'react';
import { 
  FiFileText, 
  FiUser, 
  FiSearch,
  FiEye,
  FiPlus,
  FiX,
  FiCheck,
  FiDollarSign,
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiClock,
  FiArrowRight
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';

// Mock retailers with ledger data
const mockRetailers = [
  {
    id: 'RET-001',
    name: 'Sharma Chicken Corner',
    phone: '9876543210',
    shop: 'Sharma Chicken Corner',
    creditLimit: 200000,
    outstanding: 130000,
    totalPurchase: 1250000,
    totalPayment: 1120000,
    balance: 130000,
    transactions: [
      { id: 'TRX-001', type: 'debit', amount: 24600, description: 'Order ORD-1042', date: '24 Jul 2026', billId: 'ORD-1042' },
      { id: 'TRX-002', type: 'credit', amount: 10000, description: 'Payment Received - Cash', date: '24 Jul 2026', billId: 'ORD-1042' },
      { id: 'TRX-003', type: 'debit', amount: 34200, description: 'Order ORD-1005', date: '23 Jul 2026', billId: 'ORD-1005' },
      { id: 'TRX-004', type: 'credit', amount: 20000, description: 'Payment Received - UPI', date: '22 Jul 2026', billId: 'ORD-1005' },
      { id: 'TRX-005', type: 'debit', amount: 42680, description: 'Order ORD-1001', date: '21 Jul 2026', billId: 'ORD-1001' },
    ]
  },
  {
    id: 'RET-002',
    name: 'Khan Poultry',
    phone: '9876543211',
    shop: 'Khan Poultry',
    creditLimit: 150000,
    outstanding: 35000,
    totalPurchase: 850000,
    totalPayment: 815000,
    balance: 35000,
    transactions: [
      { id: 'TRX-006', type: 'debit', amount: 28200, description: 'Order ORD-1002', date: '24 Jul 2026', billId: 'ORD-1002' },
      { id: 'TRX-007', type: 'credit', amount: 28200, description: 'Payment Received - UPI', date: '24 Jul 2026', billId: 'ORD-1002' },
      { id: 'TRX-008', type: 'debit', amount: 38800, description: 'Order ORD-1007', date: '21 Jul 2026', billId: 'ORD-1007' },
    ]
  },
  {
    id: 'RET-003',
    name: 'Reddy Fresh Meats',
    phone: '9876543212',
    shop: 'Reddy Fresh Meats',
    creditLimit: 300000,
    outstanding: 210000,
    totalPurchase: 2100000,
    totalPayment: 1890000,
    balance: 210000,
    transactions: [
      { id: 'TRX-009', type: 'debit', amount: 77600, description: 'Order ORD-1003', date: '24 Jul 2026', billId: 'ORD-1003' },
      { id: 'TRX-010', type: 'debit', amount: 94000, description: 'Order ORD-1008', date: '24 Jul 2026', billId: 'ORD-1008' },
      { id: 'TRX-011', type: 'credit', amount: 50000, description: 'Payment Received - Cash', date: '23 Jul 2026', billId: 'ORD-1003' },
    ]
  },
  {
    id: 'RET-004',
    name: 'Patel Chicken',
    phone: '9876543213',
    shop: 'Patel Chicken',
    creditLimit: 100000,
    outstanding: 0,
    totalPurchase: 420000,
    totalPayment: 420000,
    balance: 0,
    transactions: [
      { id: 'TRX-012', type: 'debit', amount: 22560, description: 'Order ORD-1006', date: '22 Jul 2026', billId: 'ORD-1006' },
      { id: 'TRX-013', type: 'credit', amount: 22560, description: 'Payment Received - Cash', date: '22 Jul 2026', billId: 'ORD-1006' },
    ]
  },
  {
    id: 'RET-005',
    name: 'Gupta Poultry House',
    phone: '9876543214',
    shop: 'Gupta Poultry House',
    creditLimit: 250000,
    outstanding: 175000,
    totalPurchase: 1560000,
    totalPayment: 1385000,
    balance: 175000,
    transactions: [
      { id: 'TRX-014', type: 'debit', amount: 56400, description: 'Order ORD-1004', date: '23 Jul 2026', billId: 'ORD-1004' },
      { id: 'TRX-015', type: 'credit', amount: 56400, description: 'Payment Received - UPI', date: '23 Jul 2026', billId: 'ORD-1004' },
    ]
  },
];

const Ledgers = () => {
  const [retailers, setRetailers] = useState(mockRetailers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Filter retailers
  const filteredRetailers = retailers.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phone.includes(searchTerm)
  );

  // Open retailer ledger
  const openRetailerLedger = (retailer) => {
    setSelectedRetailer(retailer);
  };

  // Close retailer ledger
  const closeRetailerLedger = () => {
    setSelectedRetailer(null);
  };

  // Open payment modal
  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
    setPaymentAmount('');
    setPaymentMethod('Cash');
  };

  // Get unpaid bills with FIFO order (oldest first)
  const getUnpaidBills = () => {
    if (!selectedRetailer) return [];
    
    // Get all debit transactions (orders)
    const debitTransactions = selectedRetailer.transactions.filter(t => t.type === 'debit');
    
    // Calculate balance for each bill
    const bills = debitTransactions.map(bill => {
      const payments = selectedRetailer.transactions.filter(
        t => t.billId === bill.billId && t.type === 'credit'
      );
      const totalPaid = payments.reduce((sum, t) => sum + t.amount, 0);
      const balance = bill.amount - totalPaid;
      
      return {
        billId: bill.billId,
        description: bill.description,
        amount: bill.amount,
        paid: totalPaid,
        balance: balance,
        date: bill.date,
        // Sort by date (oldest first for FIFO)
        sortDate: new Date(bill.date.split(' ').join(' ')),
      };
    }).filter(bill => bill.balance > 0)
    .sort((a, b) => a.sortDate - b.sortDate); // Oldest first

    return bills;
  };

  // Auto-calculate payment allocation based on amount
  const getPaymentAllocation = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !selectedRetailer) return [];

    const unpaidBills = getUnpaidBills();
    let remainingAmount = amount;
    const allocation = [];

    for (const bill of unpaidBills) {
      if (remainingAmount <= 0) break;
      
      const payAmount = Math.min(remainingAmount, bill.balance);
      allocation.push({
        billId: bill.billId,
        description: bill.description,
        billBalance: bill.balance,
        amountToPay: payAmount,
        remainingAfterPayment: bill.balance - payAmount,
        date: bill.date,
      });
      
      remainingAmount -= payAmount;
    }

    // If there's remaining amount that couldn't be allocated
    if (remainingAmount > 0) {
      allocation.push({
        billId: 'EXCESS',
        description: 'Excess payment (no more bills)',
        billBalance: 0,
        amountToPay: remainingAmount,
        remainingAfterPayment: 0,
        date: '-',
      });
    }

    return allocation;
  };

  // Handle payment submission with automatic allocation
  const handlePaymentSubmit = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const unpaidBills = getUnpaidBills();
    
    if (unpaidBills.length === 0) {
      alert('No unpaid bills found for this retailer');
      return;
    }

    // Calculate total outstanding
    const totalOutstanding = unpaidBills.reduce((sum, bill) => sum + bill.balance, 0);
    
    if (amount > totalOutstanding) {
      alert(`Amount cannot exceed total outstanding of ₹${totalOutstanding.toLocaleString()}`);
      return;
    }

    // Create payment transactions for each bill
    let remainingAmount = amount;
    const newTransactions = [];
    let paymentDescription = `Payment Received - ${paymentMethod}`;

    for (const bill of unpaidBills) {
      if (remainingAmount <= 0) break;
      
      const payAmount = Math.min(remainingAmount, bill.balance);
      
      newTransactions.push({
        id: `TRX-${Date.now()}-${bill.billId}`,
        type: 'credit',
        amount: payAmount,
        description: paymentDescription,
        date: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        billId: bill.billId,
      });
      
      remainingAmount -= payAmount;
    }

    // Update retailer data with all new transactions
    const updatedRetailer = {
      ...selectedRetailer,
      transactions: [...selectedRetailer.transactions, ...newTransactions],
      totalPayment: selectedRetailer.totalPayment + amount,
      outstanding: selectedRetailer.outstanding - amount,
      balance: selectedRetailer.balance - amount,
    };

    // Update retailers list
    const updatedRetailers = retailers.map(r =>
      r.id === selectedRetailer.id ? updatedRetailer : r
    );

    setRetailers(updatedRetailers);
    setSelectedRetailer(updatedRetailer);
    setIsPaymentModalOpen(false);
    
    alert(`Payment of ₹${amount.toLocaleString()} recorded successfully against ${newTransactions.length} bill(s)!`);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get payment allocation for display
  const paymentAllocation = getPaymentAllocation();

  // Get total outstanding
  const getTotalOutstanding = () => {
    const unpaidBills = getUnpaidBills();
    return unpaidBills.reduce((sum, bill) => sum + bill.balance, 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Ledgers</h1>
          <p className="text-sm text-[#6B716D] mt-1">Manage retailer accounts and payments</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, shop, or phone..."
          className="max-w-md"
        />
      </div>

      {/* Retailers Table */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
        {filteredRetailers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Retailer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Total Purchase</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Total Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Remaining Balance</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8E6]">
                {filteredRetailers.map((retailer) => (
                  <tr key={retailer.id} className="hover:bg-[#F6F7F6] transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#151A17]">{retailer.name}</p>
                        <p className="text-xs text-[#6B716D]">{retailer.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#151A17]">
                      {formatCurrency(retailer.totalPurchase)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#16834B]">
                      {formatCurrency(retailer.totalPayment)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        retailer.balance > 0 ? 'text-[#D14343]' : 'text-[#16834B]'
                      }`}>
                        {formatCurrency(retailer.balance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openRetailerLedger(retailer)}
                          className="px-4 py-2 bg-[#111714] text-white rounded-lg text-sm hover:bg-[#29312d] transition"
                        >
                          <FiEye className="w-4 h-4 inline mr-1" />
                          View Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No retailers found"
            description="Try adjusting your search criteria."
            icon={FiUser}
          />
        )}
      </div>

      {/* Retailer Ledger Modal */}
      <Modal
        isOpen={!!selectedRetailer}
        onClose={closeRetailerLedger}
        title={selectedRetailer?.name}
        description={`${selectedRetailer?.shop} • ${selectedRetailer?.phone}`}
        size="xl"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={closeRetailerLedger}>
              Close
            </Button>
            <Button onClick={openPaymentModal}>
              <FiPlus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        }
      >
        {selectedRetailer && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F6F7F6] rounded-lg p-4 text-center">
                <p className="text-xs text-[#6B716D]">Total Purchase</p>
                <p className="text-xl font-semibold text-[#151A17]">
                  {formatCurrency(selectedRetailer.totalPurchase)}
                </p>
              </div>
              <div className="bg-[#F6F7F6] rounded-lg p-4 text-center">
                <p className="text-xs text-[#6B716D]">Total Paid</p>
                <p className="text-xl font-semibold text-[#16834B]">
                  {formatCurrency(selectedRetailer.totalPayment)}
                </p>
              </div>
              <div className="bg-[#F6F7F6] rounded-lg p-4 text-center">
                <p className="text-xs text-[#6B716D]">Remaining Balance</p>
                <p className={`text-xl font-semibold ${
                  selectedRetailer.balance > 0 ? 'text-[#D14343]' : 'text-[#16834B]'
                }`}>
                  {formatCurrency(selectedRetailer.balance)}
                </p>
              </div>
            </div>

            {/* Unpaid Bills (FIFO Order with Dates) */}
            {getUnpaidBills().length > 0 && (
              <div>
                <h4 className="font-medium text-[#151A17] mb-3">Unpaid Bills (Oldest First)</h4>
                <div className="border border-[#E5E8E6] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F6F7F6]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Bill ID</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Total</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Paid</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8E6]">
                      {getUnpaidBills().map((bill) => (
                        <tr key={bill.billId} className="hover:bg-[#F6F7F6] transition">
                          <td className="px-4 py-2 text-sm text-[#6B716D]">{bill.billId}</td>
                          <td className="px-4 py-2 text-sm text-[#151A17]">{bill.description}</td>
                          <td className="px-4 py-2 text-sm text-[#6B716D]">
                            <div className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              {bill.date}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-[#151A17]">
                            {formatCurrency(bill.amount)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-[#16834B]">
                            {formatCurrency(bill.paid)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-[#D14343]">
                            {formatCurrency(bill.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div>
              <h4 className="font-medium text-[#151A17] mb-3">Transaction History</h4>
              <div className="border border-[#E5E8E6] rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-[#F6F7F6] sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Bill ID</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Debit</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E8E6]">
                    {selectedRetailer.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-[#F6F7F6] transition">
                        <td className="px-4 py-2 text-sm text-[#6B716D]">
                          {transaction.billId || '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#151A17]">
                          {transaction.description}
                        </td>
                        <td className="px-4 py-2 text-sm text-[#6B716D]">
                          {transaction.date}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-medium text-[#D14343]">
                          {transaction.type === 'debit' ? formatCurrency(transaction.amount) : '-'}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-medium text-[#16834B]">
                          {transaction.type === 'credit' ? formatCurrency(transaction.amount) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Payment Modal with Auto Allocation */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
        description={`Enter payment details for ${selectedRetailer?.name}`}
        size="lg"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentModalOpen(false)}
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
          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Amount <span className="text-[#D14343]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B716D]">₹</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full pl-8 pr-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
                min="0"
                step="1"
              />
            </div>
            <p className="mt-1 text-xs text-[#6B716D]">
              Total Outstanding: {formatCurrency(getTotalOutstanding())}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-[#151A17] mb-1.5">
              Payment Method <span className="text-[#D14343]">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Automatic Allocation Summary */}
          {paymentAmount && parseFloat(paymentAmount) > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#151A17] mb-2">Payment Allocation</h4>
              <div className="border border-[#E5E8E6] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F6F7F6]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Bill</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Bill Balance</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Paying</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E8E6]">
                    {paymentAllocation.map((alloc, index) => (
                      <tr key={index} className="hover:bg-[#F6F7F6] transition">
                        <td className="px-3 py-2 text-sm">
                          {alloc.billId === 'EXCESS' ? (
                            <span className="text-[#D14343] font-medium">⚠️ {alloc.description}</span>
                          ) : (
                            <span className="font-medium text-[#151A17]">{alloc.billId}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-[#6B716D]">
                          {alloc.billId !== 'EXCESS' ? alloc.date : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-[#6B716D]">
                          {alloc.billId !== 'EXCESS' ? formatCurrency(alloc.billBalance) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium text-[#16834B]">
                          {formatCurrency(alloc.amountToPay)}
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-medium">
                          {alloc.billId === 'EXCESS' ? (
                            <span className="text-[#D14343]">Not enough bills</span>
                          ) : (
                            <span className={alloc.remainingAfterPayment > 0 ? 'text-[#D14343]' : 'text-[#16834B]'}>
                              {formatCurrency(alloc.remainingAfterPayment)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-[#F6F7F6] rounded-lg">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B716D]">Customer</span>
                <span className="font-medium text-[#151A17]">{selectedRetailer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B716D]">Total Purchase</span>
                <span className="font-medium text-[#151A17]">
                  {formatCurrency(selectedRetailer?.totalPurchase || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B716D]">Total Paid</span>
                <span className="font-medium text-[#16834B]">
                  {formatCurrency(selectedRetailer?.totalPayment || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B716D]">Remaining Balance</span>
                <span className="font-medium text-[#D14343]">
                  {formatCurrency(selectedRetailer?.outstanding || 0)}
                </span>
              </div>
              {paymentAmount && parseFloat(paymentAmount) > 0 && (
                <div className="flex justify-between border-t border-[#16834B]/30 pt-1 mt-1">
                  <span className="text-[#6B716D] font-medium">New Balance</span>
                  <span className="font-medium text-[#16834B]">
                    {formatCurrency((selectedRetailer?.outstanding || 0) - parseFloat(paymentAmount))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Ledgers;