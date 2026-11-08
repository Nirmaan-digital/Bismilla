// Shared helpers for the super admin (Security) pages.

// Exact rupees: ₹1,37,902 — paise only when there are some.
export const inr = (amount) => {
  const value = parseFloat(amount) || 0;
  const hasPaise = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const fmtDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : '—';

export const timeAgo = (value) => {
  if (!value) return 'never';
  const s = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 30 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// "Chrome on Android", "Safari on iPhone", … from a browser's user agent.
export const deviceOf = (ua) => {
  if (!ua) return '—';
  const os = /Android/i.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/i.test(ua)
      ? 'iPhone/iPad'
      : /Mac OS X|Macintosh/i.test(ua)
        ? 'Mac'
        : /Windows/i.test(ua)
          ? 'Windows'
          : /Linux/i.test(ua)
            ? 'Linux'
            : 'Unknown device';
  const browser = /wv\)|; wv/i.test(ua)
    ? 'App'
    : /Edg\//i.test(ua)
      ? 'Edge'
      : /OPR\//i.test(ua)
        ? 'Opera'
        : /Chrome\//i.test(ua)
          ? 'Chrome'
          : /Firefox\//i.test(ua)
            ? 'Firefox'
            : /Safari\//i.test(ua)
              ? 'Safari'
              : /curl|axios|node|python|postman/i.test(ua)
                ? 'Script / tool'
                : 'Browser';
  return `${browser} on ${os}`;
};

export const ROLE_STYLE = {
  superadmin: { label: 'Super Admin', cls: 'bg-coal text-gold-light border-coal' },
  admin: { label: 'Admin', cls: 'bg-brand-soft text-brand border-brand/20' },
  retailer: { label: 'Retailer', cls: 'bg-gold-soft text-gold-dark border-gold/25' },
  driver: { label: 'Driver', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  staff: { label: 'Staff', cls: 'bg-success-soft text-success border-success/20' },
};

export const RoleBadge = ({ role }) => {
  const r = ROLE_STYLE[role] || { label: role || 'Unknown', cls: 'bg-cream text-muted border-line' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${r.cls}`}>
      {r.label}
    </span>
  );
};

export const CATEGORIES = [
  { value: '', label: 'All activity' },
  { value: 'login', label: 'Sign-ins' },
  { value: 'security', label: 'Passwords & security' },
  { value: 'user', label: 'Users' },
  { value: 'order', label: 'Orders' },
  { value: 'payment', label: 'Payments' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'customer', label: 'Customers' },
  { value: 'staff', label: 'Staff & vehicles' },
  { value: 'salary', label: 'Salaries' },
  { value: 'expense', label: 'Expenses' },
  { value: 'delivery', label: 'Deliveries & trips' },
  { value: 'settings', label: 'Settings' },
  { value: 'download', label: 'Downloads' },
  { value: 'change', label: 'Other changes' },
];

const CATEGORY_TONE = {
  login: 'bg-sky-50 text-sky-700',
  security: 'bg-brand-soft text-brand',
  payment: 'bg-success-soft text-success',
  order: 'bg-gold-soft text-gold-dark',
  download: 'bg-cream text-muted',
};

export const CategoryBadge = ({ category }) => {
  const label = CATEGORIES.find((c) => c.value === category)?.label || category;
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${CATEGORY_TONE[category] || 'bg-cream text-ink'}`}>
      {label}
    </span>
  );
};

export const ResultDot = ({ success }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${success ? 'text-success' : 'text-danger'}`}>
    <span className={`w-2 h-2 rounded-full ${success ? 'bg-success' : 'bg-danger'}`} />
    {success ? 'Success' : 'Failed'}
  </span>
);

// Page heading in the site's style.
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
    <div>
      <p className="text-[10px] font-semibold tracking-[0.3em] text-gold-dark uppercase">Super admin · Security</p>
      <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);
