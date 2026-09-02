// Real-time dynamic user notifications based on actual customer orders & events

export function getRealUserNotifications() {
  if (typeof window === 'undefined') return [];

  let orders = [];
  try {
    const raw = localStorage.getItem('grabit_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) orders = parsed;
    }
  } catch (e) {
    console.warn('Failed to parse grabit_orders:', e);
  }

  // Also check user-specific phone orders
  try {
    const userRaw = localStorage.getItem('grabit_user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const phoneDigits = (user.phone || '').replace(/\D/g, '');
      const custPhone = phoneDigits.length >= 10 ? phoneDigits.slice(-10) : phoneDigits;
      if (custPhone) {
        const userOrdersRaw = localStorage.getItem(`grabit_orders_${custPhone}`);
        if (userOrdersRaw) {
          const userOrders = JSON.parse(userOrdersRaw);
          if (Array.isArray(userOrders)) {
            userOrders.forEach(uo => {
              if (!orders.some(o => (o.id && o.id === uo.id) || (o.rawId && o.rawId === uo.rawId))) {
                orders.push(uo);
              }
            });
          }
        }
      }
    }
  } catch (e) {}

  let readIds = [];
  try {
    readIds = JSON.parse(localStorage.getItem('grabit_read_notifications') || '[]');
  } catch {}

  let dismissedIds = [];
  try {
    dismissedIds = JSON.parse(localStorage.getItem('grabit_dismissed_notifications') || '[]');
  } catch {}

  const realNotifs = [];

  // Generate notifications strictly from actual orders placed by customer
  orders.forEach((o, index) => {
    const orderId = o.id || o.rawId || `GB-${index + 1000}`;
    const notifId = `order-notif-${orderId}`;
    if (dismissedIds.includes(notifId)) return;

    const status = String(o.status || 'placed').toLowerCase();
    const rawItems = Array.isArray(o.items) ? o.items : (() => {
      try { return JSON.parse(o.items || '[]'); } catch { return []; }
    })();
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

  // Any real system notifications in grabit_system_notifications (e.g. wallet added)
  try {
    const extra = JSON.parse(localStorage.getItem('grabit_system_notifications') || '[]');
    if (Array.isArray(extra)) {
      extra.forEach(item => {
        if (!dismissedIds.includes(item.id)) {
          realNotifs.push({
            ...item,
            unread: !readIds.includes(item.id)
          });
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
