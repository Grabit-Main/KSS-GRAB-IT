import { mockDb } from './mockData';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async register(data) {
    await delay();
    const newSeller = {
      id: Date.now(),
      email: data.email,
      store_name: data.store_name,
      phone: data.phone,
      business_address: data.business_address,
      gstin: data.gstin || '',
      status: 'approved',
      created_at: new Date().toISOString(),
    };
    mockDb.saveSeller(newSeller);
    localStorage.setItem('grabit_seller_access', 'seller-token');
    localStorage.setItem('grabit_session', 'seller-token');
    return { seller: newSeller, access: 'seller-token' };
  },

  async login(credentials) {
    await delay();
    const existing = mockDb.getSeller();
    if (credentials.email) {
      existing.email = credentials.email;
    }
    mockDb.saveSeller(existing);
    localStorage.setItem('grabit_seller_access', 'seller-token');
    localStorage.setItem('grabit_session', 'seller-token');
    return { seller: existing, access: 'seller-token' };
  },

  async getProfile() {
    await delay();
    if (!this.isAuthenticated()) return null;
    return mockDb.getSeller();
  },

  async updateProfile(data) {
    await delay();
    const seller = mockDb.getSeller();
    const updated = { ...seller, ...data };
    mockDb.saveSeller(updated);
    return updated;
  },

  logout() {
    localStorage.removeItem('grabit_seller_access');
    localStorage.removeItem('grabit_seller_refresh');
    localStorage.removeItem('grabit_seller_profile');
    localStorage.removeItem('grabit_session');
  },

  getCurrentSeller() {
    if (!this.isAuthenticated()) return null;
    return mockDb.getSeller();
  },

  isAuthenticated() {
    return !!(localStorage.getItem('grabit_seller_access') || localStorage.getItem('grabit_session'));
  }
};
