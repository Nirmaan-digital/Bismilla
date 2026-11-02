import { Capacitor } from '@capacitor/core';
import api from './api';

// ============================================
// Payment invoice download (PDF made by the server).
// Website: fetched with the login token and saved as a file.
// Android app: a WebView can't save files, so the server gives a
// 10-minute link and the phone's browser opens/downloads the PDF.
// ============================================

const fileName = (payment) =>
  `Invoice-${payment.payment_number || payment.id}${payment.shop_name ? `-${payment.shop_name}` : ''}.pdf`
    .replace(/[^a-z0-9.-]+/gi, '-')
    .replace(/-+/g, '-');

const readError = async (error) => {
  // Blob responses carry the server's JSON message inside the blob.
  const data = error.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message;
    } catch {
      /* not JSON */
    }
  }
  return data?.message || error.message;
};

export const downloadInvoice = async (payment) => {
  const id = payment.id || payment.payment_id;
  if (!id) throw new Error('This payment has no invoice yet.');

  try {
    if (Capacitor.isNativePlatform()) {
      const { data } = await api.post(`/payments/${id}/invoice-link`);
      // Navigating to another site hands it to the phone's browser.
      window.location.href = data.data.url;
      return;
    }

    const res = await api.get(`/payments/${id}/invoice`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName(payment);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (error) {
    throw new Error((await readError(error)) || 'Could not download the invoice. Please try again.');
  }
};
