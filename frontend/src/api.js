const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://grabit-api.vercel.app/api');

// Resolve the best available auth token from all known storage keys
function getAuthToken() {
  const token = (
    localStorage.getItem('grabit_session') ||
    localStorage.getItem('grabit_seller_access') ||
    localStorage.getItem('grabit_jwt') ||
    localStorage.getItem('grabit_auth_token')
  );
  if (token) return token;

  try {
    const userStr = localStorage.getItem('grabit_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.role === 'admin') return 'demo-admin-token';
      if (u.role === 'seller') return 'demo-seller-token';
      if (u.role === 'delivery_agent' || u.role === 'delivery_partner') return 'demo-delivery-token';
      if (u.role === 'customer') return 'demo-customer-token';
    }
  } catch {}

  // Contextual fallback by URL path
  if (typeof window !== 'undefined') {
    const p = window.location.pathname;
    if (p.startsWith('/delivery')) return 'demo-delivery-token';
    if (p.startsWith('/admin')) return 'demo-admin-token';
    if (p.startsWith('/seller')) return 'demo-seller-token';
  }

  return 'demo-token';
}

export async function api(path, options = {}) {
  const token = getAuthToken();
  const isGet = !options.method || options.method === 'GET';

  // Abort hung requests after 3.5 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const response = await fetch(`${API}${cleanPath}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    if (response.status === 204) return null;
    // Treat 401/403 on GET as empty response — fall back to localStorage silently
    if ((response.status === 401 || response.status === 403) && isGet) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Something went wrong. Please try again.');
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') return null;
    if (isGet) {
      // For GET requests, return null so UI gracefully relies on cache/localStorage instead of throwing console errors
      return null;
    }
    throw err;
  }
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (path) => api(path, { method: 'DELETE' });

export async function uploadImage(file, folder = 'grabit_media') {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(`${API}/uploads/image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'Image upload to Cloudinary failed.');
  return data.url;
}

export function logoutUser() {
  localStorage.removeItem('grabit_session');
  localStorage.removeItem('grabit_user');
  localStorage.removeItem('grabit_seller_access');
  localStorage.removeItem('grabit_seller_refresh');
  localStorage.removeItem('grabit_seller_profile');
  localStorage.removeItem('grabit_jwt');
  localStorage.removeItem('grabit_auth_token');
  
  // Preserve splashscreen seen flag so it only runs once per app opening
  const splashSeen = sessionStorage.getItem('grabit_splash_displayed');
  sessionStorage.clear();
  if (splashSeen) {
    sessionStorage.setItem('grabit_splash_displayed', splashSeen);
  }

  try {
    window.dispatchEvent(new Event('grabit_auth_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}
