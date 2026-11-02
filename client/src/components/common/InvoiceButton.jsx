import { useState } from 'react';
import { FiDownload, FiLoader } from 'react-icons/fi';
import { downloadInvoice } from '../../services/invoice';

// "Invoice" download button for any payment row. `payment` needs an id
// (or payment_id) and, for the file name, payment_number / shop_name.
const InvoiceButton = ({ payment, label = 'Invoice', size = 'sm', variant = 'soft', className = '' }) => {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');

  if (!payment || !(payment.id || payment.payment_id)) return null;

  const onClick = async (e) => {
    e.stopPropagation();
    setBusy(true);
    setFailed('');
    try {
      await downloadInvoice(payment);
    } catch (error) {
      setFailed(error.message);
      setTimeout(() => setFailed(''), 4000);
    } finally {
      setBusy(false);
    }
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-5 text-sm gap-2',
  };
  const variants = {
    soft: 'bg-gold-soft text-gold-dark border border-gold/30 hover:bg-gradient-to-r hover:from-gold-dark hover:via-gold hover:to-gold-light hover:text-coal hover:border-transparent',
    gold: 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-coal shadow-gold hover:brightness-105',
    dark: 'bg-coal text-gold-light border border-gold/30 hover:bg-coal-2',
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        title={failed || `Download invoice ${payment.payment_number || ''}`.trim()}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-70 ${sizes[size]} ${variants[variant]} ${className}`}
      >
        {busy ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiDownload className="w-3.5 h-3.5" />}
        {busy ? 'Preparing…' : label}
      </button>
      {failed && (
        <span className="absolute right-0 top-full mt-1.5 z-20 w-56 rounded-lg bg-danger text-white text-[11px] leading-4 px-2.5 py-1.5 shadow-lg">
          {failed}
        </span>
      )}
    </span>
  );
};

export default InvoiceButton;
