import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { Capacitor } from '@capacitor/core';
import { enablePush, pushPermission, pushSupported } from '../../services/pushNotifications';

const DISMISS_KEY = 'bcc_notif_prompt_dismissed';

// Asks for notification permission as soon as someone opens the app/website
// (after login, because alerts are sent to a signed-in user).
// - Android app: shows the system "Allow notifications?" dialog directly.
// - Browsers only allow that dialog after a tap, so the website shows this
//   card first; its "Allow" button opens the browser's permission dialog.
const NotificationPrompt = () => {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pushSupported()) return;
      const permission = await pushPermission();
      if (cancelled || permission !== 'default') return;
      if (Capacitor.isNativePlatform()) {
        enablePush().catch(() => {});
        return;
      }
      let dismissed = false;
      try {
        dismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
      } catch {
        /* ignore */
      }
      if (!dismissed) setTimeout(() => !cancelled && setShow(true), 1200);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allow = async () => {
    setBusy(true);
    try {
      await enablePush();
    } finally {
      setBusy(false);
      setShow(false);
    }
  };

  const later = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-coal/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={later}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-brand via-gold to-brand" />
            <div className="p-6 text-center">
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gold-light to-gold-dark text-coal flex items-center justify-center shadow-gold"
                animate={{ rotate: [0, -12, 10, -6, 4, 0] }}
                transition={{ duration: 0.9, delay: 0.3 }}
              >
                <FiBell className="w-7 h-7" />
              </motion.div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">Turn on notifications</h3>
              <p className="mt-2 text-sm text-muted leading-6">
                Get instant alerts for price changes, new orders, deliveries and payments — even when the app is closed.
              </p>
              <button
                onClick={allow}
                disabled={busy}
                className="mt-5 w-full h-12 rounded-xl bg-brand text-white font-semibold tracking-wide disabled:opacity-60"
              >
                {busy ? 'Turning on…' : 'Allow notifications'}
              </button>
              <button onClick={later} className="mt-2 w-full h-10 text-sm text-muted hover:text-ink">
                Not now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
