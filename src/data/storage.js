// ─── Token Management ────────────────────────────────────────────────────────

export const storage = {
  getToken: () => localStorage.getItem('foodshare_token'),
  setToken: (token) => localStorage.setItem('foodshare_token', token),
  removeToken: () => localStorage.removeItem('foodshare_token'),
  get: (key) => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : null; }
    catch { return null; }
  },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); } },
  remove: (key) => localStorage.removeItem(key),
};

// ─── Fetcher ─────────────────────────────────────────────────────────────────

const fetcher = async (url, options = {}) => {
  const token = storage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// ─── Urgency helpers (shared with backend logic) ──────────────────────────────

export function getUrgencyLevel(expiryDate) {
  const hoursLeft = (new Date(expiryDate) - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return 'EXPIRED';
  if (hoursLeft < 2) return 'URGENT';
  if (hoursLeft < 6) return 'HIGH';
  if (hoursLeft < 24) return 'MEDIUM';
  return 'LOW';
}

export function getExpiryStatus(expiryDate) {
  const diff = new Date(expiryDate) - Date.now();
  const hoursLeft = diff / (1000 * 60 * 60);
  if (diff < 0) return 'Expired';
  if (hoursLeft < 1) return `${Math.floor(hoursLeft * 60)}min left`;
  if (hoursLeft < 24) return `${Math.floor(hoursLeft)}h left`;
  return `${Math.floor(hoursLeft / 24)}d left`;
}

// ─── Real API ─────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: async (email, password) => {
    const data = await fetcher('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.token) storage.setToken(data.token);
    return data.user;
  },
  register: async (userData) => {
    const data = await fetcher('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    if (data.token) storage.setToken(data.token);
    return data.user;
  },
  getMe: async () => {
    const data = await fetcher('/api/auth/me');
    return data.user;
  },

  // Food items
  getFoodItems: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.isVeg !== undefined) params.append('isVeg', filters.isVeg);
    return fetcher(`/api/food?${params.toString()}`);
  },
  getFoodById: async (id) => fetcher(`/api/food/${id}`),
  donateFood: async (foodData) => fetcher('/api/food', { method: 'POST', body: JSON.stringify(foodData) }),

  // Smart Matching
  getMatches: async ({ lat, lng, radius = 30, limit = 20 } = {}) => {
    const params = new URLSearchParams({ radius, limit });
    if (lat !== undefined && lng !== undefined) { params.append('lat', lat); params.append('lng', lng); }
    return fetcher(`/api/food/matches?${params.toString()}`);
  },

  // Claims
  claimFood: async (foodId, notes = '') =>
    fetcher('/api/claims', { method: 'POST', body: JSON.stringify({ foodId, notes }) }),
  getUserClaims: async () => fetcher('/api/claims'),
  cancelClaim: async (claimId) =>
    fetcher(`/api/claims/${claimId}`, { method: 'PUT', body: JSON.stringify({ action: 'cancel' }) }),
  completeClaim: async (claimId) =>
    fetcher(`/api/claims/${claimId}`, { method: 'PUT', body: JSON.stringify({ action: 'complete' }) }),

  // Requests
  submitRequest: async (requestData) =>
    fetcher('/api/requests', { method: 'POST', body: JSON.stringify(requestData) }),
  getUserRequests: async () => fetcher('/api/requests'),

  // Profile
  updateProfile: async (userId, updates) =>
    fetcher(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(updates) }),
  getUserProfile: async (userId) => fetcher(`/api/users/${userId}`),

  // Seed (dev only)
  seedData: async () => fetcher('/api/seed', { method: 'POST' }),

  // Payment (simulated)
  processPayment: async (paymentData) => {
    await new Promise((r) => setTimeout(r, 2000));
    if (paymentData.cardNumber.startsWith('0')) throw new Error('Payment declined. Please check your card details.');
    return { transactionId: `TXN${Date.now()}`, status: 'success', amount: paymentData.amount };
  },
};

export const initializeData = () => {};
