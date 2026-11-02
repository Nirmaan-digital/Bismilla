import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import Modal from './Modal';
import InvoiceButton from './InvoiceButton';

const inr = (n) =>
  '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(parseFloat(n) || 0) ? 0 : 2, maximumFractionDigits: 2 });

// Shown right after a payment is recorded: the three figures from the
// invoice and a button to download it.
// payment: { id, payment_number, shop_name, amount, balance_before, balance_after }
const PaymentSuccessModal = ({ payment, onClose }) => {
  const cleared = payment && parseFloat(payment.balance_after) < 1;
  return (
    <Modal isOpen={!!payment} onClose={onClose} title="Payment recorded" size="md">
      {payment && (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light flex items-center justify-center shadow-gold"
          >
            <FiCheck className="w-8 h-8 text-coal" strokeWidth={3} />
          </motion.div>
          <p className="mt-4 text-sm text-muted">{payment.shop_name}</p>
          <p className="font-display text-3xl text-ink mt-1">{inr(payment.amount)}</p>
          <p className="text-xs text-muted mt-1">{payment.payment_number}</p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-left">
            <div className="rounded-xl bg-gold-soft border border-gold/20 p-3">
              <p className="text-[10px] font-semibold tracking-wider text-gold-dark uppercase">Balance before</p>
              <p className="mt-1 text-sm font-bold text-ink">{inr(payment.balance_before)}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-brand to-brand-dark p-3">
              <p className="text-[10px] font-semibold tracking-wider text-gold-light uppercase">Paid</p>
              <p className="mt-1 text-sm font-bold text-white">{inr(payment.amount)}</p>
            </div>
            <div className={`rounded-xl p-3 border ${cleared ? 'bg-success-soft border-success/20' : 'bg-brand-soft border-brand/15'}`}>
              <p className="text-[10px] font-semibold tracking-wider text-gold-dark uppercase">Balance due</p>
              <p className={`mt-1 text-sm font-bold ${cleared ? 'text-success' : 'text-brand'}`}>{inr(payment.balance_after)}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <InvoiceButton payment={payment} label="Download invoice" size="lg" variant="gold" className="w-full sm:w-auto" />
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 rounded-xl text-sm font-semibold text-muted hover:text-ink hover:bg-gold-soft transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentSuccessModal;
