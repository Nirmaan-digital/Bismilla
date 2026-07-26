import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiDollarSign, 
  FiCheck,
  FiAlertCircle,
  FiCreditCard,
  FiSmartphone
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const RetailerPlaceOrder = () => {
  const navigate = useNavigate();
  const [kg, setKg] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  // Mock data - will come from API
  const pricePerKg = 188;
  const outstanding = 130000;

  const totalAmount = kg ? parseFloat(kg) * pricePerKg : 0;

  const quickKgOptions = [50, 100, 200, 300, 500];

  const handlePlaceOrder = () => {
    if (!kg || parseFloat(kg) <= 0) {
      alert('Please enter a valid quantity in KG');
      return;
    }
    if (totalAmount > outstanding) {
      alert(`You have outstanding balance of ₹${outstanding.toLocaleString()}. Please clear your dues first.`);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmOrder = () => {
    setIsConfirmModalOpen(false);
    alert('Order placed successfully!');
    navigate('/retailer/orders');
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#151A17]">Place Order</h1>
        <p className="text-sm text-[#6B716D] mt-1">Just enter kilograms. That's it.</p>
      </div>

      {/* Outstanding Warning */}
      <div className="bg-[#FDEEEE] border border-[#D14343] rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="w-5 h-5 text-[#D14343]" />
          <p className="text-sm text-[#D14343]">
            Outstanding Balance: <span className="font-bold">{formatCurrency(outstanding)}</span>
          </p>
        </div>
      </div>

      {/* KG Input */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 mb-6">
        <label className="block text-sm font-medium text-[#151A17] mb-2">
          How many KG?
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="e.g. 220"
            className="flex-1 px-4 py-3 text-lg border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
            min="0"
            step="1"
          />
          <span className="text-lg font-medium text-[#6B716D]">kg</span>
        </div>

        {/* Quick KG Options */}
        <div className="flex flex-wrap gap-2 mt-4">
          {quickKgOptions.map((option) => (
            <button
              key={option}
              onClick={() => setKg(option.toString())}
              className="px-4 py-2 bg-[#F6F7F6] rounded-lg text-sm text-[#151A17] hover:bg-[#E5E8E6] transition"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method - Separate UPI and Cash Cards */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 mb-6">
        <h3 className="font-semibold text-[#151A17] mb-4">Payment Method</h3>
        
        {/* UPI Payment */}
        <button
          onClick={() => setSelectedPayment('upi')}
          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition mb-3 ${
            selectedPayment === 'upi'
              ? 'border-[#111714] bg-[#F6F7F6]'
              : 'border-[#E5E8E6] hover:border-[#111714]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              selectedPayment === 'upi' ? 'bg-[#111714] text-white' : 'bg-[#F6F7F6]'
            }`}>
              <FiSmartphone className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#151A17]">UPI</p>
              <p className="text-sm text-[#6B716D]">₹{pricePerKg}/kg</p>
            </div>
          </div>
          {selectedPayment === 'upi' && (
            <FiCheck className="w-5 h-5 text-[#16834B]" />
          )}
        </button>

        {/* Cash Payment */}
        <button
          onClick={() => setSelectedPayment('cash')}
          className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition ${
            selectedPayment === 'cash'
              ? 'border-[#111714] bg-[#F6F7F6]'
              : 'border-[#E5E8E6] hover:border-[#111714]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              selectedPayment === 'cash' ? 'bg-[#111714] text-white' : 'bg-[#F6F7F6]'
            }`}>
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[#151A17]">Cash</p>
              <p className="text-sm text-[#6B716D]">₹{pricePerKg}/kg</p>
            </div>
          </div>
          {selectedPayment === 'cash' && (
            <FiCheck className="w-5 h-5 text-[#16834B]" />
          )}
        </button>

        {/* Custom Amount Input - Shows for both payment methods */}
        {kg && parseFloat(kg) > 0 && (
          <div className="mt-4 p-4 bg-[#F6F7F6] rounded-lg">
            <p className="text-sm text-[#6B716D] mb-2">
              Total: {kg} kg × ₹{pricePerKg} = ₹{totalAmount.toFixed(0)}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#151A17]">Pay:</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-3 py-2 border border-[#E5E8E6] rounded-lg focus:ring-2 focus:ring-[#111714] focus:border-transparent outline-none transition"
                min="0"
                step="1"
                max={totalAmount}
              />
              <span className="text-sm text-[#6B716D]">Max: ₹{totalAmount.toFixed(0)}</span>
            </div>
            <p className="text-xs text-[#6B716D] mt-2">
              <FiAlertCircle className="inline w-3 h-3 mr-1" />
              Enter custom amount to pay partially, or leave empty for full payment
            </p>
          </div>
        )}
      </div>

      {/* Total & Place Order */}
      <div className="bg-white rounded-xl border border-[#E5E8E6] p-6 sticky bottom-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[#6B716D]">TOTAL</p>
            <p className="text-sm text-[#6B716D]">
              {kg && parseFloat(kg) > 0 
                ? `${kg} kg × ₹${pricePerKg}`
                : '0 kg × ₹188'}
            </p>
            <p className="text-xs text-[#6B716D] mt-1">
              Payment: {selectedPayment === 'upi' ? 'UPI' : 'Cash'}
            </p>
          </div>
          <p className="text-3xl font-bold text-[#111714]">
            {kg && parseFloat(kg) > 0 
              ? `₹${totalAmount.toFixed(0)}`
              : '₹0'}
          </p>
        </div>
        
        {kg && parseFloat(kg) > 0 && totalAmount > outstanding && (
          <p className="text-sm text-[#D14343] mb-3">
            ⚠️ You have outstanding balance. Please clear your dues first.
          </p>
        )}
        
        <Button 
          className="w-full py-4 text-base"
          onClick={handlePlaceOrder}
          disabled={!kg || parseFloat(kg) <= 0 || totalAmount > outstanding}
        >
          <FiShoppingBag className="w-5 h-5 mr-2" />
          Place Order
        </Button>
      </div>

      {/* Confirm Order Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Your Order"
        description="Please review your order details before confirming"
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmOrder}>
              <FiCheck className="w-4 h-4 mr-2" />
              Confirm Order
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F6F7F6] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6B716D]">Quantity</p>
              <p className="text-lg font-semibold text-[#151A17]">{kg} kg</p>
            </div>
            <div className="bg-[#F6F7F6] rounded-lg p-3 text-center">
              <p className="text-xs text-[#6B716D]">Rate</p>
              <p className="text-lg font-semibold text-[#151A17]">₹{pricePerKg}/kg</p>
            </div>
          </div>
          <div className="bg-[#F6F7F6] rounded-lg p-3 text-center">
            <p className="text-xs text-[#6B716D]">Total Amount</p>
            <p className="text-2xl font-bold text-[#151A17]">₹{totalAmount.toFixed(0)}</p>
          </div>
          <div className="bg-[#F6F7F6] rounded-lg p-3">
            <p className="text-xs text-[#6B716D]">Payment Method</p>
            <p className="font-medium text-[#151A17]">
              {selectedPayment === 'upi' ? 'UPI' : 'Cash'}
            </p>
          </div>
          {customAmount && parseFloat(customAmount) > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-[#3B6FD8]">Partial Payment</p>
              <p className="font-medium text-[#151A17]">
                Paying: ₹{parseFloat(customAmount).toFixed(0)} of ₹{totalAmount.toFixed(0)}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RetailerPlaceOrder;