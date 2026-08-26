const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://grabit-api.vercel.app/api');

export async function api(path, options = {}) {
  const token = localStorage.getItem('grabit_session');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'Something went wrong. Please try again.');
  return data;
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (path) => api(path, { method: 'DELETE' });

export async function uploadImage(file, folder = 'grabit_media') {
  const token = localStorage.getItem('grabit_session');
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
}
