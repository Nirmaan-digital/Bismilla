import axios from 'axios';

// ============================================
// Request cache: speed + offline mode
//
// 1. Identical GETs fired at the same moment share one network request, and
//    a GET repeated within TTL_MS (flicking between pages) answers instantly
//    from memory.
// 2. Every successful GET is also saved on the device (localStorage). When
//    there is no internet, pages are answered from that saved copy so the
//    app and website still open with the last data the user saw.
// 3. Saving anything (POST/PUT/PATCH/DELETE) needs the internet: offline it
//    fails straight away with a clear "connect to the internet" message
//    instead of hanging. Any successful write clears the memory cache so
//    fresh numbers are fetched afterwards.
// Blob downloads (Excel/CSV exports) are never cached.
// ============================================
const TTL_MS = 15 * 1000;
const STORE_PREFIX = 'bcc_offline:';
const STORE_MAX_ENTRIES = 60;
const STORE_MAX_BYTES = 600 * 1024; // skip very large responses

const cache = new Map(); // key -> { at, response }
const inflight = new Map(); // key -> Promise<response>
let generation = 0; // bumped on every write so late GETs can't re-cache stale data

// ---- offline state, shared with the UI ----
let offlineServed = false;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(isOffline()));
export const isOffline = () => (typeof navigator !== 'undefined' && navigator.onLine === false) || offlineServed;
export const onOfflineChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineServed = false;
    emit();
  });
  window.addEventListener('offline', emit);
}
const markOnline = () => {
  if (offlineServed) {
    offlineServed = false;
    emit();
  }
};
const markOffline = () => {
  if (!offlineServed) {
    offlineServed = true;
    emit();
  }
};

export const clearHttpCache = () => {
  generation += 1;
  cache.clear();
  inflight.clear();
};

// Wipe saved offline data (on logout, so the next user can't see it).
export const clearOfflineStore = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
};

const keyFor = (config) => {
  const auth = config.headers?.Authorization || config.headers?.authorization || '';
  const params = { ...(config.params || {}) };
  delete params.t; // cache-busting stamps must not split the saved copy
  return `${config.baseURL || ''}|${config.url}|${JSON.stringify(params)}|${String(auth).slice(-16)}`;
};

// ---- device storage ----
const persist = (key, response) => {
  try {
    const body = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    if (!body || body.length > STORE_MAX_BYTES) return;
    const entry = JSON.stringify({ at: Date.now(), status: response.status, data: body });
    const storeKey = STORE_PREFIX + key;
    try {
      localStorage.setItem(storeKey, entry);
    } catch {
      // Storage full: drop the oldest half and retry once.
      pruneStore(Math.floor(STORE_MAX_ENTRIES / 2));
      localStorage.setItem(storeKey, entry);
    }
    pruneStore(STORE_MAX_ENTRIES);
  } catch {
    /* storage unavailable — offline mode just won't have this page */
  }
};

const pruneStore = (keep) => {
  const entries = Object.keys(localStorage)
    .filter((k) => k.startsWith(STORE_PREFIX))
    .map((k) => {
      try {
        return { k, at: JSON.parse(localStorage.getItem(k)).at || 0 };
      } catch {
        return { k, at: 0 };
      }
    })
    .sort((a, b) => b.at - a.at);
  entries.slice(keep).forEach(({ k }) => localStorage.removeItem(k));
};

const fromStore = (key, config) => {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return {
      data: saved.data,
      status: saved.status || 200,
      statusText: 'OK (offline copy)',
      headers: { 'x-offline-copy': '1', 'x-saved-at': String(saved.at) },
      config,
      request: null,
    };
  } catch {
    return null;
  }
};

const isNetworkFailure = (error) => !error.response && error.code !== 'ERR_CANCELED';

const offlineWriteError = (config) => {
  const error = new Error('No internet connection');
  error.code = 'ERR_OFFLINE';
  error.config = config;
  // Pages show error.response.data.message, so give them a friendly one.
  error.response = {
    status: 503,
    statusText: 'Offline',
    headers: {},
    config,
    // Errors thrown by an adapter skip axios' JSON parsing, so this is an object.
    data: {
      success: false,
      message: 'You are offline. Please connect to the internet to place orders or save changes.',
    },
  };
  return error;
};

export const installHttpCache = (instance) => {
  const baseAdapter = axios.getAdapter(instance.defaults.adapter);

  instance.defaults.adapter = async (config) => {
    const method = (config.method || 'get').toLowerCase();

    if (method !== 'get') {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw offlineWriteError(config);
      }
      try {
        const response = await baseAdapter(config);
        clearHttpCache();
        markOnline();
        return response;
      } catch (error) {
        if (isNetworkFailure(error)) {
          markOffline();
          throw offlineWriteError(config);
        }
        clearHttpCache();
        throw error;
      }
    }

    if (config.responseType && config.responseType !== 'json') {
      return baseAdapter(config);
    }

    const key = keyFor(config);
    const bypassMemory = !!config.params?.t;
    const hit = cache.get(key);
    if (!bypassMemory && hit && Date.now() - hit.at < TTL_MS) {
      return { ...hit.response, config };
    }

    // Known offline: answer from the saved copy right away.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const saved = fromStore(key, config);
      if (saved) return saved;
    }

    if (!bypassMemory && inflight.has(key)) {
      const response = await inflight.get(key);
      return { ...response, config };
    }

    const startedAt = generation;
    const request = baseAdapter(config)
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          markOnline();
          if (startedAt === generation) cache.set(key, { at: Date.now(), response });
          persist(key, response);
        }
        return response;
      })
      .catch((error) => {
        if (isNetworkFailure(error)) {
          const saved = fromStore(key, config);
          if (saved) {
            markOffline();
            return saved;
          }
          markOffline();
        }
        throw error;
      })
      .finally(() => {
        if (inflight.get(key) === request) inflight.delete(key);
      });

    inflight.set(key, request);
    return request;
  };

  return instance;
};
