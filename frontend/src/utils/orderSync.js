/**
 * Real-Time Cross-Tab & Cross-Portal Order Synchronization System
 * Connects Customer, Seller, Delivery, and Admin Portals in real-time across browser tabs & windows.
 */

const SYNC_CHANNEL_NAME = 'grabit_orders_realtime_channel';

let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel initialization fallback:', e);
  }
}

/**
 * Broadcasts a real-time order status update across current tab AND all open tabs/windows
 */
export function notifyOrdersUpdated(data = {}) {
  if (typeof window === 'undefined') return;

  const timestamp = Date.now();

  // 1. Dispatch custom events to local window listeners
  try {
    window.dispatchEvent(new CustomEvent('grabit_orders_updated', { detail: { ...data, timestamp } }));
    window.dispatchEvent(new Event('grabit_orders_updated'));
  } catch (e) {}

  // 2. Post message to all other open tabs/windows via BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'GRABIT_ORDERS_UPDATED', timestamp, data });
    } catch (e) {}
  }

  // 3. Fallback: Update localStorage heartbeat key to trigger native 'storage' event across tabs
  try {
    localStorage.setItem('grabit_orders_heartbeat', String(timestamp));
  } catch (e) {}
}

/**
 * Subscribes a component to real-time order updates from any tab, window, or API update
 * Returns an unsubscribe cleanup function.
 */
export function subscribeOrdersUpdated(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') return () => {};

  const handleUpdate = (evt) => {
    try {
      callback(evt);
    } catch (err) {
      console.warn('Order update listener error:', err);
    }
  };

  // 1. Listen for current-window custom events
  window.addEventListener('grabit_orders_updated', handleUpdate);

  // 2. Listen for BroadcastChannel messages from other tabs
  let channelListener = null;
  if (broadcastChannel) {
    channelListener = (evt) => {
      if (evt?.data?.type === 'GRABIT_ORDERS_UPDATED') {
        handleUpdate(evt.data);
      }
    };
    broadcastChannel.addEventListener('message', channelListener);
  }

  // 3. Listen for native storage events from other tabs
  const handleStorage = (evt) => {
    if (evt.key === 'grabit_orders_heartbeat' || evt.key === 'grabit_orders' || evt.key === 'grabit_active_orders') {
      handleUpdate({ type: 'STORAGE_EVENT', key: evt.key });
    }
  };
  window.addEventListener('storage', handleStorage);

  // Return cleanup function
  return () => {
    window.removeEventListener('grabit_orders_updated', handleUpdate);
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel && channelListener) {
      broadcastChannel.removeEventListener('message', channelListener);
    }
  };
}
