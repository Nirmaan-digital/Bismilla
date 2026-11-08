import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  CATEGORIES,
  CategoryBadge,
  ResultDot,
  ROLE_STYLE,
  deviceOf,
  fmtDateTime,
  timeAgo,
  PageHeader,
} from './shared';

const input =
  'h-10 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/15';

// Searchable, filterable list of recorded activity. `fixedCategory` locks it
// to one kind (Login History uses 'login').
export const ActivityTable = ({ fixedCategory }) => {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  const q = params.get('q') || '';
  const category = fixedCategory || params.get('category') || '';
  const success = params.get('success') || '';
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const actorId = params.get('user') || '';
  const actorName = params.get('name') || '';
  const page = Number(params.get('page')) || 1;
  const [search, setSearch] = useState(q);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/activity', {
        params: { q, category, success, from, to, actorId, page, limit: 50, t: Date.now() },
      });
      setRows(res.data.data);
      setMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the activity log');
    } finally {
      setLoading(false);
    }
  }, [q, category, success, from, to, actorId, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setSearch(q), [q]);

  return (
    <div>
      <div className="bg-white rounded-2xl border border-line p-4 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <form
            className="relative flex-1 min-w-[220px]"
            onSubmit={(e) => {
              e.preventDefault();
              setParam('q', search.trim());
            }}
          >
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => search.trim() !== q && setParam('q', search.trim())}
              placeholder="Search name, action, IP address…"
              className={`${input} w-full pl-9`}
            />
          </form>
          {!fixedCategory && (
            <select value={category} onChange={(e) => setParam('category', e.target.value)} className={input}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          )}
          <select value={success} onChange={(e) => setParam('success', e.target.value)} className={input}>
            <option value="">Any result</option>
            <option value="1">Successful</option>
            <option value="0">Failed</option>
          </select>
          <label className="text-xs text-muted">
            From
            <input type="date" value={from} onChange={(e) => setParam('from', e.target.value)} className={`${input} block mt-1`} />
          </label>
          <label className="text-xs text-muted">
            To
            <input type="date" value={to} onChange={(e) => setParam('to', e.target.value)} className={`${input} block mt-1`} />
          </label>
          <button onClick={load} className={`${input} inline-flex items-center gap-2 font-semibold hover:border-gold/50`}>
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        {(actorId || q || success || from || to || (!fixedCategory && category)) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {actorId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-1 text-gold-dark font-semibold">
                Person: {actorName || `#${actorId}`}
                <button onClick={() => { const n = new URLSearchParams(params); n.delete('user'); n.delete('name'); setParams(n, { replace: true }); }}>
                  <FiX />
                </button>
              </span>
            )}
            <button onClick={() => setParams({}, { replace: true })} className="text-muted hover:text-brand underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="px-5 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">{meta.total.toLocaleString('en-IN')} records</p>
          <p className="text-xs text-muted">Tap a row for full details</p>
        </div>
        {error && <p className="p-5 text-sm text-danger">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream">
              <tr className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">What</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">IP address</th>
                <th className="px-4 py-3">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} onClick={() => setOpen(r)} className="cursor-pointer hover:bg-cream/70 transition">
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <p className="text-ink">{timeAgo(r.created_at)}</p>
                    <p className="text-[11px] text-muted">{fmtDateTime(r.created_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <p className="font-semibold text-ink whitespace-nowrap">{r.actor_name || 'Unknown'}</p>
                    <p className="text-[11px] text-muted">{ROLE_STYLE[r.actor_role]?.label || r.actor_role || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm min-w-[260px]">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={r.category} />
                      <span className="font-medium text-ink">{r.action}</span>
                    </div>
                    {(r.target_name || r.summary) && (
                      <p className="mt-0.5 text-xs text-muted">
                        {[r.target_name, r.summary].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3"><ResultDot success={!!r.success} /></td>
                  <td className="px-4 py-3 text-sm font-mono text-ink whitespace-nowrap">{r.ip || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{deviceOf(r.user_agent)}</td>
                </tr>
              ))}
              {!loading && !rows.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">Nothing matches these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-line flex items-center justify-between">
          <p className="text-xs text-muted">Page {meta.page} of {meta.pages}</p>
          <div className="flex gap-2">
            <button disabled={meta.page <= 1} onClick={() => setParam('page', String(meta.page - 1))} className={`${input} disabled:opacity-40`}>
              <FiChevronLeft />
            </button>
            <button disabled={meta.page >= meta.pages} onClick={() => setParam('page', String(meta.page + 1))} className={`${input} disabled:opacity-40`}>
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={!!open} onClose={() => setOpen(null)} title="Activity details" size="lg">
        {open && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['When', fmtDateTime(open.created_at)],
                ['Result', open.success ? 'Successful' : `Failed${open.status_code ? ` (${open.status_code})` : ''}`],
                ['Who', `${open.actor_name || 'Unknown'}${open.actor_role ? ` · ${ROLE_STYLE[open.actor_role]?.label || open.actor_role}` : ''}${open.actor_id ? ` · account #${open.actor_id}` : ''}`],
                ['What', open.action],
                ['Affected', open.target_name || (open.target_id ? `${open.target_type} #${open.target_id}` : '—')],
                ['Note', open.summary || '—'],
                ['IP address', open.ip || '—'],
                ['Device', deviceOf(open.user_agent)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-cream/70 px-3 py-2">
                  <p className="text-[11px] text-muted">{k}</p>
                  <p className="font-medium text-ink break-words">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-cream/70 px-3 py-2">
              <p className="text-[11px] text-muted">Request</p>
              <p className="font-mono text-xs text-ink break-all">{open.method} {open.path}</p>
              <p className="mt-1 text-[11px] text-muted break-all">{open.user_agent || ''}</p>
            </div>
            {open.details && (
              <div>
                <p className="text-[11px] text-muted mb-1">Data sent (passwords and secrets are hidden)</p>
                <pre className="max-h-72 overflow-auto rounded-xl bg-coal text-gold-light/90 p-3 text-xs leading-5">
                  {JSON.stringify(open.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const ActivityLog = () => (
  <div>
    <PageHeader
      title="Activity Log"
      subtitle="Every change made by anyone — who, what, when, from which IP address and device. Records cannot be edited or deleted."
    />
    <ActivityTable />
  </div>
);

export default ActivityLog;
