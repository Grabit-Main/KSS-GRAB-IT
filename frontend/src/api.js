const API = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000/api'
    : (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://grabit-api.vercel.app/api')
);

// Resolve the best available auth token from all known storage keys safely
function getAuthToken() {
  try {
    return (
      localStorage.getItem('grabit_session') ||
      localStorage.getItem('grabit_seller_access') ||
      localStorage.getItem('grabit_jwt') ||
      localStorage.getItem('grabit_auth_token') ||
      null
    );
  } catch {
    return null;
  }
}

export async function api(path, options = {}) {
  const token = getAuthToken();
  const isGet = !options.method || options.method === 'GET';

  // For public endpoints (orders, products, categories), allow GET requests even without auth token
  const isPublicGet = isGet && (path.startsWith('/orders') || path.startsWith('/products') || path.startsWith('/categories'));
  if (isGet && !token && !isPublicGet) return null;

  // Abort hung GET requests after 4s; allow 15s for mutations/auth calls
  const timeoutMs = isGet ? 4000 : 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API}${path}`, {
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
    if (err.name === 'AbortError') {
      if (isGet) return null; // Timed out GET — treat as no data, caller uses localStorage
      throw new Error('Server request timed out. Please check your network and try again.');
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
  localStorage.removeItem('grabit_addresses_default');
  localStorage.removeItem('grabit_addresses_guest');
  localStorage.removeItem('grabit_delivery_location');
  localStorage.removeItem('grabit_location_confirmed');
  
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
