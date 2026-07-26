import { useState } from 'react';
import { 
  FiDollarSign, 
  FiCheckCircle, 
  FiXCircle,
  FiClock,
  FiUser,
  FiPhone,
  FiCalendar,
  FiSearch,
  FiAlertCircle,
  FiEye,
  FiFilter,
  FiDownload,
  FiCheck,
  FiX
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate } from '../../data/mockData';

// Mock cash collections awaiting verification
const mockCashCollections = [
  {
    id: 'COL-001',
    orderId: 'ORD-1001',
    retailer: 'Sharma Chicken Corner',
    retailerPhone: '9876543210',
    driver: 'Sameer Khan',
    driverPhone: '9876543220',
    amount: 15000,
    method: 'Cash',
    date: '24 Jul 2026',
    time: '10:30 AM',
    status: 'pending',
    tripId: 'TRIP-001',
    notes: 'Retailer paid cash at delivery',
    proofImage: null,
  },
  {
    id: 'COL-002',
    orderId: 'ORD-1005',
    retailer: 'Khan Poultry',
    retailerPhone: '9876543211',
    driver: 'Sameer Khan',
    driverPhone: '9876543220',
    amount: 41360,
    method: 'Cash',
    date: '24 Jul 2026',
    time: '11:45 AM',
    status: 'pending',
    tripId: 'TRIP-001',
    notes: 'Full payment received in cash',
    proofImage: null,
  },
  {
    id: 'COL-003',
    orderId: 'ORD-1003',
    retailer: 'Reddy Fresh Meats',
    retailerPhone: '9876543212',
    driver: 'Salim Ahmed',
    driverPhone: '9876543221',
    amount: 50000,
    method: 'Cash',
    date: '23 Jul 2026',
    time: '09:15 AM',
    status: 'pending',
    tripId: 'TRIP-002',
    notes: 'Partial payment - remaining to be collected',
    proofImage: null,
  },
  {
    id: 'COL-004',
    orderId: 'ORD-1007',
    retailer: 'Gupta Poultry House',
    retailerPhone: '9876543214',
    driver: 'Ganesh Rao',
    driverPhone: '9876543222',
    amount: 56400,
    method: 'Cash',
    date: '23 Jul 2026',
    time: '02:30 PM',
    status: 'pending',
    tripId: 'TRIP-003',
    notes: 'Cash collected',
    proofImage: null,
  },
];

// Mock verified collections (history)
const mockVerifiedCollections = [
  {
    id: 'COL-005',
    orderId: 'ORD-1002',
    retailer: 'Reddy Fresh Meats',
    retailerPhone: '9876543212',
    driver: 'Ramesh Kumar',
    driverPhone: '9876543220',
    amount: 28200,
    method: 'Cash',
    date: '23 Jul 2026',
    time: '10:00 AM',
    status: 'verified',
    tripId: 'TRIP-004',
    verifiedBy: 'Admin',
    verifiedDate: '23 Jul 2026',
    notes: 'Payment verified',
  },
  {
    id: 'COL-006',
    orderId: 'ORD-1004',
    retailer: 'Patel Chicken',
    retailerPhone: '9876543213',
    driver: 'Ramesh Kumar',
    driverPhone: '9876543220',
    amount: 22560,
    method: 'Cash',
    date: '22 Jul 2026',
    time: '11:30 AM',
    status: 'verified',
    tripId: 'TRIP-005',
    verifiedBy: 'Admin',
    verifiedDate: '22 Jul 2026',
    notes: 'Payment verified',
  },
];

const CashVerification = () => {
  const [pendingCollections, setPendingCollections] = useState(mockCashCollections);
  const [verifiedCollections] = useState(mockVerifiedCollections);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verified'

  // Filter pending collections
  const filteredPending = pendingCollections.filter(c => {
    const matchesSearch = c.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.driver.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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

  // Handle verify payment
  const handleVerifyPayment = (collection) => {
    setSelectedCollection(collection);
    setIsVerificationModalOpen(true);
  };

  // Confirm verification
  const confirmVerification = () => {
    // Move from pending to verified
    const updatedPending = pendingCollections.filter(c => c.id !== selectedCollection.id);
    setPendingCollections(updatedPending);
    
    // Add to verified list (in real app, this would be an API call)
    const verifiedCollection = {
      ...selectedCollection,
      status: 'verified',
      verifiedBy: 'Admin',
      verifiedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
    };
    
    // Here you would also update the retailer's outstanding balance
    // and update the ledger
    
    setIsVerificationModalOpen(false);
    setSelectedCollection(null);
    alert(`Payment of ${formatCurrency(selectedCollection.amount)} verified successfully!`);
  };

  // Handle reject payment
  const handleRejectPayment = (collection) => {
    if (window.confirm(`Are you sure you want to reject this payment of ${formatCurrency(collection.amount)}?`)) {
      const updatedPending = pendingCollections.filter(c => c.id !== collection.id);
      setPendingCollections(updatedPending);
      alert(`Payment rejected. Driver will be notified.`);
    }
  };

  // Calculate totals
  const totalPending = pendingCollections.reduce((sum, c) => sum + c.amount, 0);
  const totalVerified = verifiedCollections.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#151A17]">Cash Verification</h1>
          <p className="text-sm text-[#6B716D] mt-1">Verify cash payments collected by drivers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={FiDownload}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FDEEEE] rounded-lg">
              <FiClock className="w-5 h-5 text-[#C47A13]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">Pending Verification</p>
              <p className="text-2xl font-semibold text-[#151A17]">{pendingCollections.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EAF7EF] rounded-lg">
              <FiCheckCircle className="w-5 h-5 text-[#16834B]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">Verified</p>
              <p className="text-2xl font-semibold text-[#151A17]">{verifiedCollections.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E8E6] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F6F7F6] rounded-lg">
              <FiDollarSign className="w-5 h-5 text-[#111714]" />
            </div>
            <div>
              <p className="text-sm text-[#6B716D]">Total Pending Amount</p>
              <p className="text-2xl font-semibold text-[#D14343]">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'pending'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Verification ({pendingCollections.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'verified'
              ? 'bg-[#111714] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Verified ({verifiedCollections.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-4 mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by order ID, retailer, or driver..."
          className="max-w-md"
        />
      </div>

      {/* Pending Collections Table */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
          {filteredPending.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F7F6]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Collection ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Retailer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8E6]">
                  {filteredPending.map((collection) => (
                    <tr key={collection.id} className="hover:bg-[#F6F7F6] transition">
                      <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{collection.id}</td>
                      <td className="px-6 py-4 text-sm text-[#6B716D]">{collection.orderId}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#151A17]">{collection.retailer}</p>
                          <p className="text-xs text-[#6B716D]">{collection.retailerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-[#151A17]">{collection.driver}</p>
                          <p className="text-xs text-[#6B716D]">{collection.driverPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B716D]">
                        {collection.date}
                        <p className="text-xs">{collection.time}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-[#16834B]">
                        {formatCurrency(collection.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="warning">Pending</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerifyPayment(collection)}
                            className="p-2 bg-[#16834B] text-white rounded-lg hover:bg-[#13703A] transition"
                            title="Verify Payment"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectPayment(collection)}
                            className="p-2 bg-[#D14343] text-white rounded-lg hover:bg-[#B83A3A] transition"
                            title="Reject Payment"
                          >
                            <FiX className="w-4 h-4" />
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
              title="No pending collections"
              description="All cash collections have been verified"
              icon={FiCheckCircle}
            />
          )}
        </div>
      )}

      {/* Verified Collections Table */}
      {activeTab === 'verified' && (
        <div className="bg-white rounded-xl border border-[#E5E8E6] overflow-hidden">
          {verifiedCollections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F6F7F6]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Collection ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Retailer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Verified By</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B716D] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8E6]">
                  {verifiedCollections.map((collection) => (
                    <tr key={collection.id} className="hover:bg-[#F6F7F6] transition">
                      <td className="px-6 py-4 text-sm font-medium text-[#151A17]">{collection.id}</td>
                      <td className="px-6 py-4 text-sm text-[#6B716D]">{collection.orderId}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-[#151A17]">{collection.retailer}</p>
                          <p className="text-xs text-[#6B716D]">{collection.retailerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#151A17]">{collection.driver}</td>
                      <td className="px-6 py-4 text-sm text-[#6B716D]">
                        {collection.verifiedBy}
                        <p className="text-xs">{collection.verifiedDate}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-[#16834B]">
                        {formatCurrency(collection.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success">Verified</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No verified collections"
              description="No collections have been verified yet"
              icon={FiCheckCircle}
            />
          )}
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSelectedCollection(null);
        }}
        title="Verify Cash Payment"
        description="Confirm the cash payment collected by driver"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsVerificationModalOpen(false);
                setSelectedCollection(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={confirmVerification}>
              <FiCheckCircle className="w-4 h-4 mr-2" />
              Verify Payment
            </Button>
          </>
        }
      >
        {selectedCollection && (
          <div className="space-y-4">
            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F6F7F6] rounded-lg p-3">
                <p className="text-xs text-[#6B716D]">Order ID</p>
                <p className="font-medium text-[#151A17]">{selectedCollection.orderId}</p>
              </div>
              <div className="bg-[#F6F7F6] rounded-lg p-3">
                <p className="text-xs text-[#6B716D]">Amount</p>
                <p className="font-medium text-[#16834B] text-lg">{formatCurrency(selectedCollection.amount)}</p>
              </div>
            </div>

            {/* Retailer Info */}
            <div className="bg-[#F6F7F6] rounded-lg p-3">
              <p className="text-xs text-[#6B716D]">Retailer</p>
              <p className="font-medium text-[#151A17]">{selectedCollection.retailer}</p>
              <p className="text-sm text-[#6B716D]">{selectedCollection.retailerPhone}</p>
            </div>

            {/* Driver Info */}
            <div className="bg-[#F6F7F6] rounded-lg p-3">
              <p className="text-xs text-[#6B716D]">Collected By (Driver)</p>
              <p className="font-medium text-[#151A17]">{selectedCollection.driver}</p>
              <p className="text-sm text-[#6B716D]">{selectedCollection.driverPhone}</p>
            </div>

            {/* Collection Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F6F7F6] rounded-lg p-3">
                <p className="text-xs text-[#6B716D]">Date</p>
                <p className="font-medium text-[#151A17]">{selectedCollection.date}</p>
              </div>
              <div className="bg-[#F6F7F6] rounded-lg p-3">
                <p className="text-xs text-[#6B716D]">Time</p>
                <p className="font-medium text-[#151A17]">{selectedCollection.time}</p>
              </div>
            </div>

            {/* Notes */}
            {selectedCollection.notes && (
              <div className="bg-[#F6F7F6] rounded-lg p-3">
                <p className="text-xs text-[#6B716D]">Notes</p>
                <p className="text-sm text-[#151A17]">{selectedCollection.notes}</p>
              </div>
            )}

            {/* Verification Notice */}
            <div className="bg-[#EAF7EF] rounded-lg p-3 border border-[#16834B]/20">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 text-[#16834B]" />
                <p className="text-sm text-[#16834B]">
                  Verifying this payment will deduct it from the retailer's outstanding balance
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashVerification;