import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import App from "./App";
import api from "./services/api";
import { installHttpCache } from "./services/httpCache";
// Fonts are bundled with the app (no Google Fonts request), so the design
// looks the same offline and inside the Android app.
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "./index.css";

// Pages use both the shared `api` instance and plain axios; cache both.
installHttpCache(axios);
installHttpCache(api);

// When the server rejects the session (expired, or the account was
// deactivated), sign out and go back to the login screen instead of leaving
// the user on a page full of errors.
const onUnauthorized = (error) => {
  const url = error.config?.url || '';
  if (error.response?.status === 401 && !url.includes('/auth/login') && localStorage.getItem('token')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') window.location.replace('/login');
  }
  return Promise.reject(error);
};
axios.interceptors.response.use((r) => r, onUnauthorized);
api.interceptors.response.use((r) => r, onUnauthorized);

// Website: register the service worker straight away so the site keeps
// working offline and can receive push alerts. (The Android app ships its
// pages inside the app, so it doesn't need one.)
if (!Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
