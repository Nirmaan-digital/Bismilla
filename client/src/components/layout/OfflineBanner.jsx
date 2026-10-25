import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiWifiOff } from 'react-icons/fi';
import { isOffline, onOfflineChange } from '../../services/httpCache';

// Shown at the top of every page while there is no internet.
const OfflineBanner = () => {
  const [offline, setOffline] = useState(isOffline);

  useEffect(() => onOfflineChange(setOffline), []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-coal text-white"
          role="status"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm">
            <FiWifiOff className="w-4 h-4 text-gold-light shrink-0" />
            <span>
              You&apos;re offline — showing saved data. <span className="text-gold-light font-semibold">Placing orders and saving need internet.</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
