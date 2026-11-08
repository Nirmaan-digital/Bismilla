import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FiShield,
  FiAlertTriangle,
  FiLogIn,
  FiKey,
  FiEdit3,
  FiArrowRight,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';
import api from '../../services/api';
import BrandLoader from '../../components/brand/BrandLoader';
import { CAT, inrShort, axisProps, ChartCard, Legend, ChartTooltip } from '../../components/charts/ChartKit';
import { inr, timeAgo, RoleBadge, CategoryBadge, ROLE_STYLE, PageHeader } from './shared';

const dayLabel = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

// Big figure that is never cut off.
const Figure = ({ label, value, note, tone = 'text-ink', icon: Icon, accent = 'bg-cream text-ink', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    className="bg-white rounded-2xl border border-line p-5"
  >
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      {Icon && (
        <span className={`p-2 rounded-lg ${accent}`}>
          <Icon className="w-4 h-4" />
        </span>
      )}
    </div>
    <p className={`mt-2 font-bold tabular-nums whitespace-nowrap text-[clamp(1.3rem,2vw,1.7rem)] ${tone}`}>{value}</p>
    {note && <p className="mt-1 text-xs text-muted">{note}</p>}
  </motion.div>
);

const STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const ControlCenter = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/superadmin/overview', { params: { t: Date.now() } });
      setData(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center py-24">
        <BrandLoader />
      </div>
    );
  }
  if (!data) {
    return <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-danger">{error}</div>;
  }

  const { finance, orders, trend, users, security, recent, topDues } = data;
  const totalUsers = users.reduce((s, u) => s + u.total, 0);

  return (
    <div>
      <PageHeader
        title="Control Center"
        subtitle="Money, orders, people and every action taken in the system — in one place."
        action={
          <button
            onClick={load}
            disabled={refreshing}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-line bg-white text-sm font-semibold text-ink hover:border-gold/50 transition disabled:opacity-60"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      {/* Security strip */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coal-3 via-coal-2 to-coal p-5 sm:p-6 mb-6 text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-xl bg-gold/15 text-gold-light">
              <FiShield className="w-6 h-6" />
            </span>
            <div>
              <p className="font-display text-xl">Security today</p>
              <p className="text-xs text-white/60">Sign-ins, failed attempts and changes are recorded with IP address and device.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            {[
              { label: 'Sign-ins today', value: security.loginsToday, icon: FiLogIn, tone: 'text-white' },
              { label: 'Failed today', value: security.failedToday, icon: FiAlertTriangle, tone: security.failedToday ? 'text-[#ff8a80]' : 'text-white' },
              { label: 'Changes today', value: security.changesToday, icon: FiEdit3, tone: 'text-white' },
              { label: 'Password changes (30 d)', value: security.passwordChanges30d, icon: FiKey, tone: 'text-gold-light' },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 min-w-[130px]">
                <p className="text-[11px] text-white/60 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </p>
                <p className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
        {security.failedIps.length > 0 && (
          <div className="relative mt-4 rounded-xl bg-[#ff8a80]/10 border border-[#ff8a80]/25 px-4 py-3 text-sm">
            <p className="font-semibold text-[#ffb4ab] flex items-center gap-2">
              <FiAlertTriangle /> Failed sign-ins in the last 24 hours
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {security.failedIps.map((f) => (
                <Link
                  key={f.ip || 'unknown'}
                  to={`/superadmin/logins?q=${encodeURIComponent(f.ip || '')}`}
                  className="rounded-lg bg-black/25 px-2.5 py-1 text-xs text-white/85 hover:bg-black/40"
                >
                  {f.ip || 'unknown IP'} · {f.attempts} {f.attempts === 1 ? 'attempt' : 'attempts'} · {timeAgo(f.last_at)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Finance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Figure label="Total billed" value={inr(finance.totalBilled)} icon={FiShoppingBag} note={`${finance.ordersCount} orders${finance.openingBalance ? ` + opening balances ${inr(finance.openingBalance)}` : ''}`} />
        <Figure label="Received" value={inr(finance.received)} tone="text-success" icon={FiTrendingUp} accent="bg-success-soft text-success" note="Paid against bills" delay={0.05} />
        <Figure label="Outstanding" value={inr(finance.outstanding)} tone="text-danger" icon={FiUsers} accent="bg-danger-soft text-danger" note={`From ${finance.shopsWithDues} ${finance.shopsWithDues === 1 ? 'shop' : 'shops'}`} delay={0.1} />
        <Figure label="Collection rate" value={`${finance.collectionRate}%`} icon={FiShield} accent="bg-gold-soft text-gold-dark" note="Received ÷ total billed" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <ChartCard
          title="Last 30 days"
          subtitle="Amount billed vs. payments recorded, per day"
          className="xl:col-span-2"
          action={<Legend items={[{ label: 'Billed', color: CAT[0] }, { label: 'Paid', color: CAT[3] }]} />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barGap={1} barCategoryGap="20%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f0e8db" vertical={false} />
                <XAxis dataKey="day" tickFormatter={dayLabel} {...axisProps} minTickGap={18} />
                <YAxis tickFormatter={inrShort} {...axisProps} width={56} />
                <Tooltip content={<ChartTooltip labelFormat={dayLabel} valueFormat={inr} />} cursor={{ fill: 'rgba(201,151,63,0.08)' }} />
                <Bar dataKey="billed" name="Billed" fill={CAT[0]} radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="paid" name="Paid" fill={CAT[3]} radius={[3, 3, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Orders" subtitle="Excluding cancelled orders">
          <div className="space-y-3">
            {[
              ['Today', orders.today],
              ['Last 7 days', orders.week],
              ['Last 30 days', orders.month],
            ].map(([label, o]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-cream/70 px-4 py-3">
                <div>
                  <p className="text-xs text-muted">{label}</p>
                  <p className="text-sm font-semibold text-ink">{o.count} orders</p>
                </div>
                <p className="font-bold text-ink tabular-nums whitespace-nowrap">{inr(o.amount)}</p>
              </div>
            ))}
            <div className="pt-1">
              <p className="text-xs font-semibold text-muted mb-2">By status (all time)</p>
              <div className="flex flex-wrap gap-2">
                {orders.byStatus.map((s) => (
                  <span key={s.status} className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink">
                    {STATUS_LABEL[s.status] || s.status}: <b>{s.count}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <ChartCard title="People" subtitle={`${totalUsers} accounts`}>
          <div className="divide-y divide-line">
            {users.map((u) => (
              <div key={u.role} className="flex items-center justify-between py-2.5">
                <RoleBadge role={u.role} />
                <p className="text-sm text-muted">
                  <b className="text-ink">{u.total}</b> total · {u.active} active · {u.recent} signed in this week
                </p>
              </div>
            ))}
          </div>
          <Link to="/superadmin/accounts" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:text-brand">
            Manage accounts & passwords <FiArrowRight />
          </Link>
        </ChartCard>

        <ChartCard title="Biggest dues" subtitle="Shops with the most outstanding">
          {topDues.length ? (
            <div className="divide-y divide-line">
              {topDues.map((r) => (
                <div key={r.shop_name + r.phone} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{r.shop_name}</p>
                    <p className="text-xs text-muted">{r.owner_name} · {r.phone}</p>
                  </div>
                  <p className="font-bold text-danger tabular-nums whitespace-nowrap">{inr(r.outstanding)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No outstanding dues.</p>
          )}
        </ChartCard>

        <ChartCard title="Payments recorded" subtitle={`${finance.payments.count} payments · ${inr(finance.payments.total)}`}>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Cash', finance.payments.cash],
              ['UPI / Online', finance.payments.upi],
              ['Bank / Cheque', finance.payments.bank],
              ['At office', finance.payments.office],
              ['By drivers', finance.payments.driver],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-cream/70 px-3 py-2.5">
                <p className="text-xs text-muted">{label}</p>
                <p className="text-sm font-semibold text-ink tabular-nums whitespace-nowrap">{inr(value)}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Latest activity"
        subtitle="Everything people did, newest first"
        action={
          <Link to="/superadmin/activity" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dark hover:text-brand">
            Full activity log <FiArrowRight />
          </Link>
        }
      >
        <div className="divide-y divide-line">
          {recent.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${a.success ? 'bg-success' : 'bg-danger'}`} />
              <p className="text-sm text-ink min-w-0 flex-1">
                <b>{a.actor_name || 'Unknown'}</b>{' '}
                {a.actor_role && <span className="text-xs text-muted">({ROLE_STYLE[a.actor_role]?.label || a.actor_role})</span>}{' '}
                — {a.action}
                {a.target_name && <span className="text-muted"> · {a.target_name}</span>}
                {a.summary && <span className="text-muted"> · {a.summary}</span>}
              </p>
              <CategoryBadge category={a.category} />
              <span className="text-xs text-muted whitespace-nowrap">{a.ip || '—'}</span>
              <span className="text-xs text-muted whitespace-nowrap w-20 text-right">{timeAgo(a.created_at)}</span>
            </div>
          ))}
          {!recent.length && <p className="py-4 text-sm text-muted">Nothing recorded yet.</p>}
        </div>
      </ChartCard>
    </div>
  );
};

export default ControlCenter;
