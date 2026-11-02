import { FiFileText } from 'react-icons/fi';
import InvoiceButton from './InvoiceButton';

const inr = (n) =>
  '₹' + (parseFloat(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(parseFloat(n) || 0) ? 0 : 2, maximumFractionDigits: 2 });

const METHOD = { cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank transfer', cheque: 'Cheque', online: 'Online' };

// Payments made against one order, each with its invoice.
const OrderPaymentsCard = ({ payments, className = '' }) => {
  if (!payments || payments.length === 0) return null;
  return (
    <div className={`bg-white rounded-xl border border-line p-6 mb-6 ${className}`}>
      <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
        <FiFileText className="w-4 h-4 text-gold-dark" /> Payments &amp; invoices
      </h3>
      <div className="space-y-2">
        {payments.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-cream rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{p.payment_number}</p>
              <p className="text-xs text-muted">
                {METHOD[p.method] || p.method} ·{' '}
                {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-semibold text-success">{inr(p.amount)}</span>
              <InvoiceButton payment={p} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderPaymentsCard;
