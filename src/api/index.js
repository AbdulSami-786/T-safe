import { remoteCall } from './remote';
import { mockCall } from './mock';
import { API_URL } from '../config';

export const DEMO_MODE = !API_URL;
const call = DEMO_MODE ? mockCall : remoteCall;

// Files are sent to Apps Script as base64 inside the JSON body.
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(new Error('Could not read that file.'));
    r.readAsDataURL(file);
  });
}

export const api = {
  products: () => call('products'),
  register: (d) => call('register', d),
  login: (d) => call('login', d),
  me: (token) => call('me', { token }),
  logout: (token) => call('logout', { token }),
  createOrder: (d) => call('createOrder', d),
  myOrders: (token) => call('myOrders', { token }),
  trackOrder: (orderId, phone) => call('trackOrder', { orderId, phone }),
  adminOrders: (token) => call('adminOrders', { token }),
  adminUpdateOrder: (d) => call('adminUpdateOrder', d),
  reviews: () => call('reviews'),
  addReview: (d) => call('addReview', d),
  subscribe: (email) => call('subscribe', { email }),
};
