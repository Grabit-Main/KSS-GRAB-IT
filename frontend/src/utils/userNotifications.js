// Real-time dynamic user notifications based strictly on actual customer orders & events

const safeParseItems = (rawItems) => {
  if (Array.isArray(rawItems)) return rawItems;
  if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
};

const isValidRealOrder = (o) => {
  if (!o || typeof o !== 'object') return false;
  const addr = (o.delivery_address || o.address || '').trim().toLowerCase();
  if (!addr || addr === 'enter your delivery address' || addr.length < 5) return false;
  const custName = (o.customer_name || '').trim().toLowerCase();
  if (custName.includes('fresh mart supermarket')) return false;
  const itemsList = safeParseItems(o.items);
  if (!Array.isArray(itemsList) || itemsList.length === 0) return false;
  const total = Number(o.total_amount || o.total || 0);
  if (total <= 0) return false;
  return true;
};

export function getRealUserNotifications() {
  if (typeof window === 'undefined') return [];

  let currentUserPhone = '';
  let currentUserName = '';
  try {
    const userRaw = localStorage.getItem('grabit_user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const phoneDigits = (user.phone || '').replace(/\D/g, '');
      currentUserPhone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;
      currentUserName = (user.full_name || user.name || '').trim().toLowerCase();
    }
  } catch (e) {}

  let orders = [];

  // Load user-specific orders
  if (currentUserPhone) {
    try {
      const userOrdersRaw = localStorage.getItem(`grabit_orders_${currentUserPhone}`);
      if (userOrdersRaw) {
        const parsed = JSON.parse(userOrdersRaw);
        if (Array.isArray(parsed)) orders.push(...parsed);
      }
    } catch (e) {}

    // Also check global grabit_orders, but strictly filter for this user's phone
    try {
      const globalRaw = localStorage.getItem('grabit_orders');
      if (globalRaw) {
        const parsed = JSON.parse(globalRaw);
        if (Array.isArray(parsed)) {
          const GENERIC_NAMES = ['customer', 'user', 'guest', 'admin', 'test', 'unknown', ''];
          parsed.forEach(o => {
            const oPhoneDigits = (o.customer_phone || o.phone || '').replace(/\D/g, '');
            const oCustPhone = oPhoneDigits.length >= 10 ? oPhoneDigits.slice(-10) : oPhoneDigits;
            const oName = (o.customer_name || '').trim().toLowerCase();

            const matchesPhone = oCustPhone && currentUserPhone && oCustPhone === currentUserPhone;
            const matchesSpecificName = currentUserName &&
              !GENERIC_NAMES.includes(currentUserName) &&
              !GENERIC_NAMES.includes(oName) &&
              oName === currentUserName;

            if (matchesPhone || matchesSpecificName) {
              if (!orders.some(existing => (existing.id && existing.id === o.id) || (existing.rawId && existing.rawId === o.rawId))) {
                orders.push(o);
              }
            }
          });
        }
      }
    } catch (e) {}
  } else {
    // Guest user (not logged in) - only load guest orders placed in current session
    try {
      const guestRaw = localStorage.getItem('grabit_orders_guest');
      if (guestRaw) {
        const parsed = JSON.parse(guestRaw);
        if (Array.isArray(parsed)) orders.push(...parsed);
      }
    } catch (e) {}
  }

  // Filter for valid real orders only
  const validOrders = orders.filter(isValidRealOrder);

  let readIds = [];
  try {
    readIds = JSON.parse(localStorage.getItem('grabit_read_notifications') || '[]');
  } catch {}

  let dismissedIds = [];
  try {
    dismissedIds = JSON.parse(localStorage.getItem('grabit_dismissed_notifications') || '[]');
  } catch {}

  const realNotifs = [];

  // Generate notifications strictly from actual orders placed by this customer
  validOrders.forEach((o, index) => {
    const orderId = o.id || o.rawId || `GB-${index + 1000}`;
    const notifId = `order-notif-${orderId}`;
    if (dismissedIds.includes(notifId)) return;

    const status = String(o.status || 'placed').toLowerCase();
    const rawItems = safeParseItems(o.items);
    const itemNames = rawItems.slice(0, 2).map(it => it.name || it.product_name || 'Item').join(', ') +
      (rawItems.length > 2 ? ` +${rawItems.length - 2} more` : '');

    let title = 'Order Placed';
    let tag = 'NEW';
    let message = `Order #${orderId} received. Store is preparing your items.`;
    let iconType = 'package';
    let statusBadge = '⚡ ~15-20 min';
    let statusColor = '#0071E3';
    let statusBg = '#EFF6FF';
    let actionText = 'Track';
    let category = 'active';

    if (status === 'delivered') {
      title = 'Order Delivered';
      tag = 'COMPLETED';
      message = `Order #${orderId} (${itemNames || 'Items'}) was delivered successfully.`;
      iconType = 'package';
      statusBadge = '📦 Delivered';
      statusColor = '#475569';
      statusBg = '#F1F5F9';
      actionText = 'Receipt';
      category = 'completed';
    } else if (status === 'out_for_delivery' || status === 'out-for-delivery') {
      title = 'Out for Delivery';
      tag = 'LIVE';
      message = `Rider is on the way with order #${orderId} (${itemNames || 'Items'}).`;
      iconType = 'truck';
      statusBadge = '⚡ On the way';
      statusColor = '#0071E3';
      statusBg = '#EFF6FF';
      actionText = 'Track';
      category = 'active';
    } else if (status === 'ready' || status === 'ready_for_pickup') {
      title = 'Order Packed';
      tag = 'PACKED';
      message = `Order #${orderId} is packed and awaiting rider pickup.`;
      iconType = 'package';
      statusBadge = '📦 Ready';
      statusColor = '#D97706';
      statusBg = '#FFFBEB';
      actionText = 'Track';
      category = 'active';
    } else if (status === 'preparing' || status === 'confirmed') {
      title = 'Store Preparing';
      tag = 'PREPARING';
      message = `Store is packing ${itemNames || 'your items'} for order #${orderId}.`;
      iconType = 'truck';
      statusBadge = '🍳 Packing';
      statusColor = '#0071E3';
      statusBg = '#EFF6FF';
      actionText = 'Track';
      category = 'active';
    } else if (status === 'cancelled') {
      title = 'Order Cancelled';
      tag = 'CANCELLED';
      message = `Order #${orderId} was cancelled. Refund will be processed if applicable.`;
      iconType = 'refund';
      statusBadge = '✕ Cancelled';
      statusColor = '#DC2626';
      statusBg = '#FEF2F2';
      actionText = 'Details';
      category = 'refunds';
    }

    const timeStr = o.date ? `${o.date}` : (o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recent');

    realNotifs.push({
      id: notifId,
      category,
      title,
      tag,
      message,
      time: timeStr,
      unread: !readIds.includes(notifId),
      link: '/orders',
      actionText,
      iconType,
      statusBadge,
      statusColor,
      statusBg
    });
  });

  // Any real user system notifications in grabit_system_notifications (e.g. real wallet added by user)
  try {
    const extra = JSON.parse(localStorage.getItem('grabit_system_notifications') || '[]');
    if (Array.isArray(extra)) {
      extra.forEach(item => {
        if (!dismissedIds.includes(item.id)) {
          const itemPhone = item.phone || item.user_phone;
          if (!itemPhone || !currentUserPhone || itemPhone === currentUserPhone) {
            realNotifs.push({
              ...item,
              unread: !readIds.includes(item.id)
            });
          }
        }
      });
    }
  } catch {}

  return realNotifs;
}

export function markAllNotificationsAsRead() {
  if (typeof window === 'undefined') return;
  const notifs = getRealUserNotifications();
  const ids = notifs.map(n => n.id);
  localStorage.setItem('grabit_read_notifications', JSON.stringify(ids));
  window.dispatchEvent(new Event('grabit_notifications_updated'));
}

export function dismissNotification(id) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem('grabit_dismissed_notifications') || '[]');
    if (!existing.includes(id)) {
      localStorage.setItem('grabit_dismissed_notifications', JSON.stringify([...existing, id]));
    }
  } catch {}
  window.dispatchEvent(new Event('grabit_notifications_updated'));
}

export function markNotificationAsRead(id) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem('grabit_read_notifications') || '[]');
    if (!existing.includes(id)) {
      localStorage.setItem('grabit_read_notifications', JSON.stringify([...existing, id]));
    }
  } catch {}
  window.dispatchEvent(new Event('grabit_notifications_updated'));
}
