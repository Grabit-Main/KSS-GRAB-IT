// Real-time user notifications without synthetic or fake data

const getCurrentUserPhone = () => {
  try {
    const userRaw = localStorage.getItem('grabit_user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const digits = (user.phone || '').replace(/\D/g, '');
      return digits.length >= 10 ? digits.slice(-10) : digits;
    }
  } catch {}
  return '';
};

const getStorageKey = () => {
  const phone = getCurrentUserPhone();
  return phone ? `grabit_user_notifications_${phone}` : 'grabit_user_notifications_guest';
};

export function getRealUserNotifications() {
  if (typeof window === 'undefined') return [];

  const storageKey = getStorageKey();
  let notifs = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) notifs = parsed;
    }
  } catch {}

  let readIds = [];
  try {
    readIds = JSON.parse(localStorage.getItem('grabit_read_notifications') || '[]');
  } catch {}

  let dismissedIds = [];
  try {
    dismissedIds = JSON.parse(localStorage.getItem('grabit_dismissed_notifications') || '[]');
  } catch {}

  // Filter dismissed & mark read status
  return notifs
    .filter(n => n && n.id && !dismissedIds.includes(n.id))
    .map(n => ({
      ...n,
      unread: !readIds.includes(n.id)
    }));
}

export function addUserNotification({
  title = 'Notification',
  message = '',
  link = '/orders',
  category = 'active',
  statusBadge = '⚡ Express Delivery',
  statusColor = '#0071E3',
  statusBg = '#EFF6FF',
  iconType = 'package',
  orderId = ''
}) {
  if (typeof window === 'undefined') return;

  const storageKey = getStorageKey();
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(existing)) existing = [];
  } catch {}

  // Clean order ID display - never show raw UUIDs
  let cleanOrderId = orderId;
  if (cleanOrderId && cleanOrderId.length > 20 && cleanOrderId.includes('-')) {
    cleanOrderId = `ORD-${cleanOrderId.slice(0, 8).toUpperCase()}`;
  }

  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    message: cleanOrderId && message.includes(orderId) ? message.replace(orderId, cleanOrderId) : message,
    time: 'Just now',
    created_at: new Date().toISOString(),
    link,
    category,
    statusBadge,
    statusColor,
    statusBg,
    iconType,
    unread: true
  };

  // Limit to most recent 20 notifications
  const updated = [newNotif, ...existing].slice(0, 20);
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch {}

  window.dispatchEvent(new Event('grabit_notifications_updated'));
}

export function markAllNotificationsAsRead() {
  if (typeof window === 'undefined') return;
  const notifs = getRealUserNotifications();
  const ids = notifs.map(n => n.id);
  try {
    localStorage.setItem('grabit_read_notifications', JSON.stringify(ids));
  } catch {}
  window.dispatchEvent(new Event('grabit_notifications_updated'));
}

export function markNotificationAsRead(id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const existing = JSON.parse(localStorage.getItem('grabit_read_notifications') || '[]');
    if (!existing.includes(id)) {
      localStorage.setItem('grabit_read_notifications', JSON.stringify([...existing, id]));
    }
  } catch {}
  window.dispatchEvent(new Event('grabit_notifications_updated'));
}

export function dismissNotification(id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const existing = JSON.parse(localStorage.getItem('grabit_dismissed_notifications') || '[]');
    if (!existing.includes(id)) {
      localStorage.setItem('grabit_dismissed_notifications', JSON.stringify([...existing, id]));
    }
  } catch {}
  window.dispatchEvent(new Event('grabit_notifications_updated'));
}

export function clearAllNotifications() {
  if (typeof window === 'undefined') return;
  const storageKey = getStorageKey();
  try {
    localStorage.removeItem(storageKey);
    localStorage.removeItem('grabit_read_notifications');
    localStorage.removeItem('grabit_dismissed_notifications');
  } catch {}
  window.dispatchEvent(new Event('grabit_notifications_updated'));
}
