import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiKey, FiActivity, FiEye, FiEyeOff, FiCheck, FiPower } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import BrandLoader from '../../components/brand/BrandLoader';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge, timeAgo, fmtDateTime, PageHeader } from './shared';

const input =
  'h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/15';

// How strong a new password is (shown while typing).
const strength = (p) => {
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return [
    { label: 'Too short', cls: 'bg-danger', w: '15%' },
    { label: 'Weak', cls: 'bg-danger', w: '30%' },
    { label: 'Fair', cls: 'bg-gold', w: '55%' },
    { label: 'Good', cls: 'bg-gold-dark', w: '75%' },
    { label: 'Strong', cls: 'bg-success', w: '90%' },
    { label: 'Very strong', cls: 'bg-success', w: '100%' },
  ][p.length < 8 ? 0 : score];
};

const PasswordField = ({ label, value, onChange, autoComplete }) => {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-xs font-semibold text-ink">{label}</span>
      <span className="relative mt-1 block">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`${input} pr-10`}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </span>
    </label>
  );
};

const Accounts = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [accounts, setAccounts] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/superadmin/accounts', { params: { t: Date.now() } });
      setAccounts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load accounts');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (accounts || []).filter(
      (a) =>
        (role === 'all' || a.role === role) &&
        (!s || [a.name, a.phone, a.email].some((v) => String(v || '').toLowerCase().includes(s)))
    );
  }, [accounts, search, role]);

  const openPassword = (a) => {
    setEditing(a);
    setForm({ current: '', next: '', confirm: '' });
    setFormError('');
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setFormError('');
    if (form.next.length < 8) return setFormError('Use at least 8 characters.');
    if (form.next !== form.confirm) return setFormError('The two new passwords do not match.');
    setSaving(true);
    try {
      const res = await api.put(`/superadmin/accounts/${editing.id}/password`, {
        newPassword: form.next,
        currentPassword: editing.is_you ? form.current : undefined,
      });
      if (res.data.self) {
        // Your own password changed: every session, this one too, now needs it.
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setEditing(null);
      setNotice(res.data.message);
      setTimeout(() => setNotice(''), 6000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not change the password.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (a) => {
    const status = a.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`${status === 'inactive' ? 'Deactivate' : 'Activate'} ${a.name}?${status === 'inactive' ? ' They will be signed out and unable to sign in.' : ''}`)) return;
    try {
      const res = await api.patch(`/superadmin/accounts/${a.id}/status`, { status });
      setNotice(res.data.message);
      setTimeout(() => setNotice(''), 5000);
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Could not change the status.');
    }
  };

  if (!accounts && !error) {
    return (
      <div className="flex items-center justify-center py-24">
        <BrandLoader />
      </div>
    );
  }

  const meter = strength(form.next);

  return (
    <div>
      <PageHeader
        title="Accounts & Passwords"
        subtitle="Every account in the system, including admins. Change anyone's password; they are signed out of all devices at once."
      />

      {notice && (
        <div className="mb-4 rounded-xl border border-success/25 bg-success-soft px-4 py-3 text-sm text-success flex items-center gap-2">
          <FiCheck /> {notice}
        </div>
      )}
      {error && <div className="mb-4 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>}

      <div className="bg-white rounded-2xl border border-line p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone or email…" className={`${input} pl-9`} />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
        >
          <option value="all">All roles</option>
          <option value="superadmin">Super admin</option>
          <option value="admin">Admins</option>
          <option value="retailer">Retailers</option>
          <option value="driver">Drivers</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream">
              <tr className="text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last sign-in</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((a) => (
                <tr key={a.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-ink whitespace-nowrap">
                      {a.name} {a.is_you && <span className="text-[11px] font-semibold text-gold-dark">(you)</span>}
                    </p>
                    <p className="text-xs text-muted">{[a.phone, a.email].filter(Boolean).join(' · ') || '—'}</p>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={a.role} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${a.status === 'active' ? 'text-success' : 'text-danger'}`}>
                      {a.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <p className="text-ink" title={fmtDateTime(a.last_login)}>{timeAgo(a.last_login)}</p>
                    <p className="text-[11px] font-mono text-muted">{a.last_login_ip || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <p className="text-ink">{a.actions} changes</p>
                    <p className="text-[11px] text-muted">{a.last_activity ? `last ${timeAgo(a.last_activity)}` : 'none yet'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/superadmin/activity?user=${a.id}&name=${encodeURIComponent(a.name)}`}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-line text-xs font-semibold text-ink hover:border-gold/50"
                        title="Everything this account did, and changes made to it"
                      >
                        <FiActivity /> Activity
                      </Link>
                      <button
                        onClick={() => openPassword(a)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gold-soft border border-gold/30 text-xs font-semibold text-gold-dark hover:bg-gold/20"
                      >
                        <FiKey /> Password
                      </button>
                      {a.role !== 'superadmin' && (
                        <button
                          onClick={() => toggleStatus(a)}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-semibold ${
                            a.status === 'active' ? 'border-danger/30 text-danger hover:bg-danger-soft' : 'border-success/30 text-success hover:bg-success-soft'
                          }`}
                        >
                          <FiPower /> {a.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!shown.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">No accounts match.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!editing}
        onClose={() => !saving && setEditing(null)}
        title={editing?.is_you ? 'Change your password' : `Change password · ${editing?.name || ''}`}
        size="md"
      >
        {editing && (
          <form onSubmit={savePassword} className="space-y-4">
            <p className="text-sm text-muted">
              {editing.is_you
                ? 'After saving you will be signed out everywhere, including here. Sign in again with the new password.'
                : `${editing.name} will be signed out of every device and must use the new password. This change is recorded with your IP address.`}
            </p>
            {editing.is_you && (
              <PasswordField label="Current password" value={form.current} onChange={(v) => setForm((f) => ({ ...f, current: v }))} autoComplete="current-password" />
            )}
            <PasswordField label="New password" value={form.next} onChange={(v) => setForm((f) => ({ ...f, next: v }))} autoComplete="new-password" />
            {form.next && (
              <div>
                <div className="h-1.5 rounded-full bg-cream overflow-hidden">
                  <div className={`h-full ${meter.cls} transition-all`} style={{ width: meter.w }} />
                </div>
                <p className="mt-1 text-[11px] text-muted">{meter.label} · use 8+ characters with upper and lower case, a number and a symbol</p>
              </div>
            )}
            <PasswordField label="Confirm new password" value={form.confirm} onChange={(v) => setForm((f) => ({ ...f, confirm: v }))} autoComplete="new-password" />
            {formError && <p className="text-sm text-danger">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} disabled={saving} className="h-11 px-5 rounded-xl text-sm font-semibold text-muted hover:bg-gold-soft">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="h-11 px-5 rounded-xl bg-brand text-white text-sm font-semibold disabled:opacity-60">
                {saving ? 'Saving…' : 'Change password'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Accounts;
