// Central Order Sync Utility for Grabit Quick-Commerce Platform

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('grabit_orders_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not available:', e);
}

export function isValidRealOrder(o) {
  if (!o) return false;
  const addr = (o.delivery_address || o.address || '').trim().toLowerCase();
  if (!addr || addr === 'enter your delivery address' || addr.length < 3) return false;
  const custName = (o.customer_name || '').trim().toLowerCase();
  if (custName.includes('fresh mart supermarket')) return false;
  let itemsList = [];
  if (Array.isArray(o.items)) itemsList = o.items;
  else if (typeof o.items === 'string') {
    try { itemsList = JSON.parse(o.items); } catch {}
  }
  if (!Array.isArray(itemsList) || itemsList.length === 0) return false;
  const total = Number(o.total_amount || o.total || 0);
  if (total <= 0) return false;
  return true;
}

export function getAllSystemOrders() {
  if (typeof window === 'undefined') return [];
  const allOrdersMap = new Map();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('grabit_orders')) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(parsed)) {
          parsed.forEach((order) => {
            if (isValidRealOrder(order)) {
              const orderId = String(order.id || order.rawId || order.orderNumber || '').trim().toUpperCase();
              if (orderId && !allOrdersMap.has(orderId)) {
                allOrdersMap.set(orderId, order);
              }
            }
          });
        }
      } catch (err) {
        console.warn('Error parsing order key:', key, err);
      }
    }
  }

  const mergedList = Array.from(allOrdersMap.values());
  mergedList.sort((a, b) => new Date(b.created_at || b.date || Date.now()) - new Date(a.created_at || a.date || Date.now()));

  // Ensure clean master storage
  try {
    localStorage.setItem('grabit_orders', JSON.stringify(mergedList));
  } catch (err) {}

  return mergedList;
}

export function notifyOrderUpdate(payload = {}) {
  if (typeof window === 'undefined') return;

  // Consolidate orders across storage
  getAllSystemOrders();

  // Dispatch window events for same-window updates
  window.dispatchEvent(new Event('grabit_orders_updated'));
  window.dispatchEvent(new Event('storage'));

  // Broadcast to other tabs/windows in real time
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'ORDERS_UPDATED', ...payload, timestamp: Date.now() });
    } catch (e) {}
  }
}

export function subscribeOrderUpdates(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleEvent = () => {
    const orders = getAllSystemOrders();
    callback(orders);
  };

  window.addEventListener('grabit_orders_updated', handleEvent);
  window.addEventListener('storage', handleEvent);

  let onBroadcast = null;
  if (broadcastChannel) {
    onBroadcast = (event) => {
      if (event.data && (event.data.type === 'ORDERS_UPDATED' || event.data.type === 'NEW_ORDER')) {
        handleEvent();
      }
    };
    broadcastChannel.addEventListener('message', onBroadcast);
  }

  return () => {
    window.removeEventListener('grabit_orders_updated', handleEvent);
    window.removeEventListener('storage', handleEvent);
    if (broadcastChannel && onBroadcast) {
      broadcastChannel.removeEventListener('message', onBroadcast);
    }
  };
}
