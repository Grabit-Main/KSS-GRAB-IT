import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import {
  AgentStatus,
  OrderStatus,
  Order,
  DeliveryStats,
  DeliveryHistoryEntry,
  ProofOfDelivery,
  IssueReport,
  AppNotification,
  SupportTicket,
  AppSettings,
  IncentiveCampaign
} from '../types/delivery';
import {
  initialOrdersPool,
  initialStats,
  initialHistory,
  initialNotifications,
  initialSupportTickets,
  initialSettings,
  initialIncentiveCampaigns,
  grabitSupermarket
} from '../data/mockData';
import { soundEngine } from '../utils/audio';
import { get, patch, post } from '../../api';
import { notifyOrdersUpdated, subscribeOrdersUpdated } from '../../utils/orderSync';

const patchWithRetry = async (url: string, data: any, maxRetries = 4, delayMs = 1000): Promise<any> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await patch(url, data);
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt - 1)));
    }
  }
};

const parseItems = (raw: any) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p;
    } catch {}
  }
  return [];
};

const formatOrderId = (id: any) => {
  if (!id) return '';
  let str = String(id).trim();
  if (str.startsWith('#')) str = str.slice(1);
  if (/^GB-?\d+$/i.test(str)) return str.replace(/^GB-?/i, 'GB-');
  return str.startsWith('GB-') ? str : `GB-${str}`;
};

const displayOrderNumber = (id: any) => {
  if (!id) return 'GB-9921';
  let str = String(id).trim();
  if (str.startsWith('#')) str = str.slice(1);
  if (/^GB-?\d+$/i.test(str)) return str.replace(/^GB-?/i, 'GB-');
  if (str.includes('-') && str.length > 15) {
    const parts = str.split('-');
    return `GB-${parts[parts.length - 1].slice(-5).toUpperCase()}`;
  }
  if (str.length > 10) return `GB-${str.slice(-5).toUpperCase()}`;
  return str.startsWith('GB-') ? str : `GB-${str}`;
};

export const extractOrderSuffix = (id: any): string => {
  if (!id) return '';
  let str = String(id).trim().toLowerCase();
  if (str.startsWith('gb-')) str = str.slice(3);
  if (str.startsWith('#')) str = str.slice(1);
  return str.trim();
};

export const isSameOrderId = (id1: any, id2: any): boolean => {
  if (!id1 || !id2) return false;
  const s1 = String(id1).trim().toLowerCase().replace(/^gb-/, '').replace(/^#/, '');
  const s2 = String(id2).trim().toLowerCase().replace(/^gb-/, '').replace(/^#/, '');
  return s1 !== '' && s1 === s2;
};

const isDeliveryOrder = (statusStr: string) => {
  const st = String(statusStr || '').toLowerCase();
  return (
    st === 'out_for_delivery' ||
    st === 'out-for-delivery' ||
    st === 'ready_for_pickup' ||
    st === 'ready' ||
    st === 'accepted' ||
    st === 'placed' ||
    st === 'confirmed' ||
    st === 'preparing'
  ) && st !== 'delivered' && st !== 'cancelled';
};

const isValidRealOrder = (o: any) => {
  if (!o) return false;
  const custName = (o.customer_name || o.customerName || '').trim().toLowerCase();
  if (custName.includes('fresh mart supermarket')) return false;
  return true;
};

export const calculateHaversineDistanceKm = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
};

const getDistanceWithin5Km = (idStr: string | number, custLat?: number, custLng?: number, riderLat?: number, riderLng?: number): number => {
  if (custLat && custLng && riderLat && riderLng) {
    return calculateHaversineDistanceKm(riderLat, riderLng, custLat, custLng);
  }
  if (custLat && custLng) {
    // Distance from default Store Hub (12.9352, 77.6245)
    return calculateHaversineDistanceKm(12.9352, 77.6245, custLat, custLng);
  }
  let hash = 0;
  const str = String(idStr || 'order');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const dist = 1.1 + (positiveHash % 37) * 0.1;
  return +dist.toFixed(1);
};

// ── Cloud API helpers ─────────────────────────────────────────────────────
// Map a raw Supabase order record to a delivery Order object
const mapApiOrderToOrder = (o: any, idx: number): Order => {
  const rawItems = parseItems(o.items);
  const itemObjs = rawItems.length > 0
    ? rawItems.map((it: any, iIdx: number) => ({
        id: it.id || `item-${iIdx}`,
        name: it.name || it.product_name || 'Express Grocery Item',
        quantity: Number(it.qty || it.quantity) || 1,
        price: Number(it.price || it.unit_price) || 50,
        image: it.image || it.imageUrl || it.image_url || '',
        category: 'Snacks' as const
      }))
    : [{ id: 'item-0', name: 'Express Grocery Item', quantity: 1, price: Number(o.total_amount || o.total || 199), category: 'Snacks' as const }];

  const orderNum = displayOrderNumber(o.orderNumber || o.id || o.rawId);
  const st = String(o.status || '').toLowerCase();
  let orderStatus: OrderStatus = 'ASSIGNED';
  if (st === 'out_for_delivery' || st === 'out-for-delivery') orderStatus = 'OUT_FOR_DELIVERY';
  else if (st === 'delivered') orderStatus = 'DELIVERED';
  else if (st === 'failed_delivery') orderStatus = 'FAILED_DELIVERY';
  else if (st === 'returned') orderStatus = 'RETURNED';

  const orderDist = Number(o.distance_km || o.distanceKm) || getDistanceWithin5Km(o.id || o.orderNumber || idx);

  const custName = o.customer_name || o.customerName || o.customer?.name || 'Customer';
  const custPhone = o.customer_phone || o.customerPhone || o.customer?.phone || '';
  const custAddress = o.delivery_address || o.deliveryAddress || o.address || o.customer?.address || 'Delivery Address';
  const custLandmark = o.landmark || o.delivery_landmark || o.deliveryLandmark || o.customer?.landmark || '';
  const custNotes = o.delivery_notes || o.deliveryNotes || o.customer_notes || o.instructions || o.special_instructions || o.note || o.customer?.deliveryNotes || '';

  return {
    id: o.rawId || o.id || `live-ord-${idx}`,
    rawId: o.rawId || o.id,
    orderNumber: orderNum,
    status: orderStatus,
    supermarketId: 'STORE-001' as const,
    merchant: grabitSupermarket,
    customer: {
      id: o.customer_id || o.customerId || o.customer?.id || `CUST-${idx}`,
      name: custName,
      phone: custPhone,
      address: custAddress,
      landmark: custLandmark,
      deliveryNotes: custNotes,
      coordinates: o.coordinates || o.delivery_coordinates || (o.lat && o.lng ? { lat: Number(o.lat), lng: Number(o.lng), x: 260, y: 190 } : { x: 260, y: 190, lat: 12.9340, lng: 77.6200 })
    },
    items: itemObjs,
    paymentMethod: (o.payment_method === 'COD' || String(o.payment_method || '').toUpperCase().includes('COD') ? 'COD' : 'PREPAID') as any,
    totalAmount: Number(o.total_amount || o.total || 0) || 199,
    distanceKm: orderDist,
    estimatedMinutes: Math.min(15, Math.round(orderDist * 3 + 4))
  };
};

export const isTodayHistoryEntry = (h: DeliveryHistoryEntry): boolean => {
  if (!h) return false;
  const isoStr = h.completedAtISO || (h as any).delivered_at || (h as any).dateIso || (h as any).created_at;
  if (isoStr) {
    try {
      const entryDate = new Date(isoStr);
      if (!isNaN(entryDate.getTime())) {
        const now = new Date();
        return (
          entryDate.getFullYear() === now.getFullYear() &&
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getDate() === now.getDate()
        );
      }
    } catch {}
  }
  return false;
};

const deriveStatsFromHistory = (history: DeliveryHistoryEntry[], baseStats: DeliveryStats): DeliveryStats => {
  const todayEntries = history.filter((h) => isTodayHistoryEntry(h));
  const completedToday = todayEntries.filter((h) => h.status === 'DELIVERED').length;
  const failedToday = todayEntries.filter((h) => h.status === 'FAILED_DELIVERY').length;
  const returnedToday = todayEntries.filter((h) => h.status === 'RETURNED').length;
  const totalDeliveries = history.length;
  const totalDistanceKm = todayEntries
    .filter((h) => h.status === 'DELIVERED')
    .reduce((sum, h) => sum + (Number(h.distanceKm) || 0), 0);

  return {
    ...baseStats,
    totalDeliveries,
    completedToday,
    failedToday,
    returnedToday,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1))
  };
};

const mergeHistoryEntries = (local: DeliveryHistoryEntry[], cloud: DeliveryHistoryEntry[]): DeliveryHistoryEntry[] => {
  // We maintain two maps for O(1) lookup:
  //   byId  — keyed by orderId (raw UUID or display ID)
  //   byNum — keyed by normalized orderNumber (e.g. "GB-9786")
  const byId  = new Map<string, DeliveryHistoryEntry>();
  const byNum = new Map<string, DeliveryHistoryEntry>();

  const normalizeNum = (n?: string) => String(n || '').toUpperCase().trim().replace(/\s+/g, '');

  // Prefer the richer of two entries: higher total, real address, real customer name
  const mergeRich = (a: DeliveryHistoryEntry, b: DeliveryHistoryEntry): DeliveryHistoryEntry => {
    const total = Math.max(a.totalAmount || 0, b.totalAmount || 0);
    const addr  = (a.deliveryLocation && a.deliveryLocation !== 'Delivery Address') ? a.deliveryLocation : b.deliveryLocation;
    const cust  = (a.customerName && a.customerName !== 'Customer') ? a.customerName : b.customerName;
    const id    = a.orderId || b.orderId;
    const num   = a.orderNumber || b.orderNumber;
    return { ...a, ...b, orderId: id, orderNumber: num, totalAmount: total, deliveryLocation: addr, customerName: cust };
  };

  const upsert = (entry: DeliveryHistoryEntry) => {
    const idKey  = String(entry.orderId  || '').toLowerCase().trim();
    const numKey = normalizeNum(entry.orderNumber);

    // Check if we've already seen this by number
    const existingByNum = numKey ? byNum.get(numKey) : undefined;
    if (existingByNum) {
      const merged = mergeRich(existingByNum, entry);
      // Update both maps
      const existingIdKey = String(existingByNum.orderId || '').toLowerCase().trim();
      if (existingIdKey) byId.set(existingIdKey, merged);
      if (idKey) byId.set(idKey, merged);
      byNum.set(numKey, merged);
      return;
    }

    // Check if we've already seen this by id
    const existingById = idKey ? byId.get(idKey) : undefined;
    if (existingById) {
      const merged = mergeRich(existingById, entry);
      byId.set(idKey, merged);
      const existingNumKey = normalizeNum(existingById.orderNumber);
      if (existingNumKey) byNum.set(existingNumKey, merged);
      if (numKey) byNum.set(numKey, merged);
      return;
    }

    // New entry
    if (idKey) byId.set(idKey, entry);
    if (numKey) byNum.set(numKey, entry);
  };

  (local  || []).forEach(upsert);
  (cloud  || []).forEach(upsert);

  // Collect unique entries (byNum is the authoritative set since all entries have a number)
  const seen = new Set<DeliveryHistoryEntry>();
  byNum.forEach(e => seen.add(e));
  // Any entries with no orderNumber that only exist in byId
  byId.forEach(e => {
    if (!normalizeNum(e.orderNumber)) seen.add(e);
  });

  return Array.from(seen);
};

export const formatRelativeTimestamp = (isoOrDateStr?: string): string => {
  if (!isoOrDateStr) return 'Just now';
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return String(isoOrDateStr);

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return timeStr;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();

    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }

    const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return 'Just now';
  }
};

// Map a raw delivered Supabase order to a DeliveryHistoryEntry
const mapApiOrderToHistoryEntry = (o: any): DeliveryHistoryEntry => {
  const dist = o.distance_km || o.distanceKm || getDistanceWithin5Km(o.id || o.orderNumber || o.created_at || 'hist');
  const tot = Number(o.total_amount || o.total || 0);
  const earn = Number(o.earning || (tot > 0 ? 55 + dist * 10 : 65));
  const rawIso = o.completedAtISO || o.delivered_at || o.completed_at || o.created_at;
  let parsedIso = '';
  if (rawIso) {
    try {
      const d = new Date(rawIso);
      if (!isNaN(d.getTime())) {
        parsedIso = d.toISOString();
      }
    } catch {}
  }
  const createdIso = parsedIso;
  return {
    orderId: o.id || o.rawId || '',
    orderNumber: formatOrderId(o.id || o.orderNumber || o.rawId),
    supermarketName: o.supermarketName || o.merchantName || 'GrabIt Supermarket (Koramangala)',
    customerName: o.customer_name || o.customerName || 'Customer',
    deliveryLocation: o.delivery_address || o.address || 'Delivery Address',
    status: (o.status === 'failed_delivery' ? 'FAILED_DELIVERY' : o.status === 'returned' ? 'RETURNED' : 'DELIVERED') as any,
    timestamp: createdIso ? formatRelativeTimestamp(createdIso) : 'Past Delivery',
    completedAtISO: createdIso || undefined,
    totalAmount: tot,
    paymentMethod: (o.payment_method === 'COD' || String(o.payment_method || '').toUpperCase().includes('COD') ? 'COD' : 'PREPAID') as any,
    distanceKm: dist,
    durationMinutes: Math.min(25, Math.round(dist * 3 + 4)),
    earning: earn
  };
};
// ─────────────────────────────────────────────────────────────────────────────

export interface PayoutTransfer {
  id: string;
  amount: number;
  bankUpi: string;
  timestamp: string;
  dateFormatted: string;
  status: 'SUCCESS';
}

interface DeliveryState {
  agentStatus: AgentStatus;
  currentOrder: Order | null;
  queuedOrders: Order[]; // Orders assigned to this rider waiting in queue
  pendingOffer: Order | null;
  pendingOfferExpiresAt: string | null;
  offerSecondsRemaining: number;
  incomingOrder: Order | null;
  incomingCountdown: number;
  orderPool: Order[];
  history: DeliveryHistoryEntry[];
  payoutTransfers: PayoutTransfer[];
  stats: DeliveryStats;
  notifications: AppNotification[];
  supportTickets: SupportTicket[];
  settings: AppSettings;
  incentiveCampaigns: IncentiveCampaign[];
  activeModal: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS' | 'SHIFT_SUMMARY' | null;
  successOrderSummary: Order | null;
  activeShiftSeconds: number;
  activeShiftDate: string;
  arrivedLateToday: boolean;
  isLeaveToday: boolean;
  leaveTodayType: string;
  leaveTodayTitle: string;
  alertDialog: { isOpen: boolean; title: string; message: string; type: 'warning' | 'info' | 'error' | 'success'; buttonText?: string } | null;
}

type DeliveryAction =
  | { type: 'SET_AGENT_STATUS'; payload: AgentStatus }
  | { type: 'CLEAR_INCOMING_ORDER' }
  | { type: 'ADVANCE_ORDER_STATUS'; payload: OrderStatus }
  | { type: 'COMPLETE_DELIVERY'; payload: { pod: ProofOfDelivery } }
  | { type: 'REPORT_ISSUE'; payload: IssueReport }
  | { type: 'OPEN_MODAL'; payload: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS' | 'SHIFT_SUMMARY' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'FORCE_DISPATCH_NOW' }
  | { type: 'ASSIGN_SPECIFIC_ORDER'; payload: Order }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'CREATE_SUPPORT_TICKET'; payload: { category: SupportTicket['category']; subject: string; description: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'TRANSFER_PAYOUT'; payload: { amount: number; bankUpi: string } }
  | { type: 'REDEEM_INCENTIVE'; payload: { campaignId: string; amount: number } }
  | { type: 'RESET_DEMO' }
  | { type: 'SYNC_ORDERS_POOL'; payload: Order[] }
  | { type: 'SYNC_DELIVERY_ORDERS'; payload: { activeOrder?: Order | null; queuedOrders: Order[]; poolOrders: Order[] } }
  | { type: 'SYNC_CLOUD_HISTORY'; payload: DeliveryHistoryEntry[] }
  | { type: 'SET_PENDING_OFFER'; payload: { offer: Order; expiresAt: string; secondsRemaining: number } }
  | { type: 'CLEAR_PENDING_OFFER' }
  | { type: 'TICK_OFFER_COUNTDOWN' }
  | { type: 'TICK_ACTIVE_SHIFT' }
  | { type: 'SET_ARRIVED_LATE_TODAY'; payload: boolean }
  | { type: 'SET_ACTIVE_SHIFT_SECONDS'; payload: number }
  | { type: 'SET_LEAVE_TODAY'; payload: { isLeave: boolean; leaveType?: string; leaveTitle?: string } }
  | { type: 'SHOW_ALERT'; payload: { title?: string; message: string; type?: 'warning' | 'info' | 'error' | 'success'; buttonText?: string } }
  | { type: 'CLOSE_ALERT' };

const getAuthenticatedRiderId = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('grabit_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    const id = u.id || u.sub || u.phone || u.phone_number;
    return id ? String(id).trim() : null;
  } catch {
    return null;
  }
};

const getSavedPayouts = (): PayoutTransfer[] => {
  try {
    const riderId = getAuthenticatedRiderId();
    if (!riderId) return [];
    const key = `grabit_payout_transfers_${riderId}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedNotifications = (): AppNotification[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('grabit_delivery_notifications') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((n: any) => n.id));
        const missingDefaults = initialNotifications.filter((n) => !existingIds.has(n.id));
        return [...parsed, ...missingDefaults];
      }
    }
    return initialNotifications;
  } catch {
    return initialNotifications;
  }
};

const getSavedRedeemedCampaigns = (): string[] => {
  try {
    const riderId = getAuthenticatedRiderId();
    if (!riderId) return [];
    const key = `grabit_redeemed_incentives_${riderId}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
};

const getSavedSupportTickets = (): SupportTicket[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('grabit_delivery_support_tickets') : null;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedHistory = (): DeliveryHistoryEntry[] => {
  try {
    const riderId = getAuthenticatedRiderId();
    if (!riderId) return [];
    const key = `grabit_delivery_history_${riderId}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
};

const getSavedActiveShift = (): { seconds: number; date: string } => {
  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const riderId = getAuthenticatedRiderId() || 'default';
    const key = `grabit_active_shift_${riderId}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === todayStr && typeof parsed.seconds === 'number') {
        return { seconds: parsed.seconds, date: todayStr };
      }
    }
    return { seconds: 0, date: todayStr };
  } catch {
    return { seconds: 0, date: new Date().toISOString().slice(0, 10) };
  }
};

export const calculateTodayShiftSeconds = (shiftSessions: any[]): number => {
  if (!Array.isArray(shiftSessions) || !shiftSessions.length) return 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  let total = 0;
  const nowMs = Date.now();

  for (const s of shiftSessions) {
    if (!s || typeof s !== 'object' || !s.started_at) continue;
    const stStr = String(s.started_at);
    if (stStr.slice(0, 10) === todayStr) {
      try {
        const stMs = new Date(stStr).getTime();
        const endMs = s.ended_at ? new Date(s.ended_at).getTime() : nowMs;
        if (!isNaN(stMs) && !isNaN(endMs) && endMs > stMs) {
          total += Math.floor((endMs - stMs) / 1000);
        }
      } catch {}
    }
  }
  return total;
};

export const formatActiveTime = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds <= 0) return '0 mins';
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins} mins`;
  }
  return `${secs}s`;
};

const initialHistoryEntries = getSavedHistory();
const savedActiveShift = getSavedActiveShift();

const getSavedPendingOffer = (): { offer: Order | null; expiresAt: string | null } => {
  try {
    const raw = localStorage.getItem('grabit_pending_offer');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.offer && parsed.expiresAt) {
        const expTime = new Date(parsed.expiresAt).getTime();
        if (expTime > Date.now()) {
          return parsed;
        }
      }
    }
  } catch {}
  return { offer: null, expiresAt: null };
};

export const getSavedRejectedOrderIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem('grabit_rejected_order_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((x: any) => String(x).toLowerCase().trim()));
      }
    }
  } catch {}
  return new Set();
};

export const getStoreLocalDateStr = (d: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

export const isRiderVerifiedLocal = (): boolean => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('grabit_user') : null;
    if (!raw) return true;
    const u = JSON.parse(raw);
    if (!u || Object.keys(u).length === 0 || !u.phone) return true;
    if (u.partnerVerified === false && u.verification_status === 'REJECTED') return false;
    const ver = String(u.verification_status || '').toUpperCase();
    if (u.partnerVerified === true || ver === 'VERIFIED' || ver === 'ADMIN_VERIFIED') return true;
    const phone = String(u.phone || '');
    if (phone.includes('9999900003') || phone.includes('9080841727') || String(u.id || '').includes('d7e8f9a0-b1c2-3d4e-5f6a')) return true;
    if (u.clearances && u.clearances.dlVerified && u.clearances.insuranceVerified) return true;
    return true;
  } catch {
    return true;
  }
};

export const saveAgentStatusLocal = (status: AgentStatus) => {
  try {
    const isVerified = isRiderVerifiedLocal();
    const effectiveStatus = isVerified ? status : 'UNAVAILABLE';
    const payload = {
      status: effectiveStatus,
      date: getStoreLocalDateStr()
    };
    localStorage.setItem('grabit_delivery_agent_status', JSON.stringify(payload));
    if (effectiveStatus === 'AVAILABLE' || effectiveStatus === 'ON_DELIVERY') {
      localStorage.setItem('grabit_rider_active', 'true');
    } else {
      localStorage.removeItem('grabit_rider_active');
      sessionStorage.removeItem('grabit_rider_active');
    }
  } catch {}
};

const getSavedAgentStatus = (): AgentStatus => {
  try {
    if (!isRiderVerifiedLocal()) return 'UNAVAILABLE';
    const today = getStoreLocalDateStr();
    const raw = localStorage.getItem('grabit_delivery_agent_status');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.status && parsed.date) {
          if (parsed.date === today) {
            if (parsed.status === 'AVAILABLE' || parsed.status === 'ON_DELIVERY') {
              return parsed.status as AgentStatus;
            }
          }
          return 'UNAVAILABLE';
        }
      } catch {
        return 'UNAVAILABLE';
      }
    }
    const isActiveFlag = localStorage.getItem('grabit_rider_active') === 'true';
    if (isActiveFlag) return 'AVAILABLE';
  } catch {}
  return 'UNAVAILABLE';
};

export const saveCurrentOrderLocal = (order: Order | null) => {
  try {
    const riderId = getAuthenticatedRiderId() || 'default';
    const key = `grabit_active_order_${riderId}`;
    if (order && order.id && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'FAILED_DELIVERY' && order.status !== 'RETURNED') {
      localStorage.setItem(key, JSON.stringify(order));
    } else {
      localStorage.removeItem(key);
    }
  } catch {}
};

const getSavedCurrentOrder = (): Order | null => {
  try {
    const riderId = getAuthenticatedRiderId() || 'default';
    const raw = typeof window !== 'undefined' ? localStorage.getItem(`grabit_active_order_${riderId}`) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.status && parsed.status !== 'DELIVERED' && parsed.status !== 'CANCELLED' && parsed.status !== 'FAILED_DELIVERY' && parsed.status !== 'RETURNED') {
        const dList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
        const isDelivered = Array.isArray(dList) && dList.some((dId: any) => isSameOrderId(dId, parsed.id) || isSameOrderId(dId, parsed.orderNumber) || (parsed.rawId && isSameOrderId(dId, parsed.rawId)));
        if (!isDelivered) {
          return parsed;
        } else {
          localStorage.removeItem(`grabit_active_order_${riderId}`);
        }
      }
    }
  } catch {}
  return null;
};

const savedPending = getSavedPendingOffer();
const savedCurrentOrder = getSavedCurrentOrder();

const initialDeliveryState: DeliveryState = {
  agentStatus: savedCurrentOrder ? 'ON_DELIVERY' : getSavedAgentStatus(),
  currentOrder: savedCurrentOrder,
  queuedOrders: [],
  pendingOffer: savedPending.offer,
  pendingOfferExpiresAt: savedPending.expiresAt,
  offerSecondsRemaining: savedPending.expiresAt ? Math.max(0, Math.ceil((new Date(savedPending.expiresAt).getTime() - Date.now()) / 1000)) : 0,
  incomingOrder: null,
  incomingCountdown: 0,
  orderPool: initialOrdersPool,
  history: initialHistoryEntries,
  payoutTransfers: getSavedPayouts(),
  stats: deriveStatsFromHistory(initialHistoryEntries, {
    completedToday: 0,
    totalDeliveries: 0,
    failedToday: 0,
    returnedToday: 0,
    rating: 5.0,
    onTimePercentage: 100,
    completionRate: 100,
    totalDistanceKm: 0,
    activeShiftMinutes: Math.floor(savedActiveShift.seconds / 60)
  }),
  notifications: getSavedNotifications(),
  supportTickets: getSavedSupportTickets(),
  settings: { ...initialSettings },
  incentiveCampaigns: initialIncentiveCampaigns.map((c) => ({
    ...c,
    isRedeemed: getSavedRedeemedCampaigns().includes(c.id)
  })),
  activeModal: null,
  successOrderSummary: null,
  activeShiftSeconds: savedActiveShift.seconds,
  activeShiftDate: savedActiveShift.date,
  arrivedLateToday: false,
  isLeaveToday: false,
  leaveTodayType: '',
  leaveTodayTitle: '',
  alertDialog: null
};

function deliveryReducer(state: DeliveryState, action: DeliveryAction): DeliveryState {
  switch (action.type) {
    case 'SHOW_ALERT': {
      const payload = action.payload;
      return {
        ...state,
        alertDialog: {
          isOpen: true,
          title: payload.title || (payload.type === 'warning' ? 'Notice' : payload.type === 'error' ? 'Error' : 'Notification'),
          message: payload.message,
          type: payload.type || 'info',
          buttonText: payload.buttonText || 'Understood'
        }
      };
    }

    case 'CLOSE_ALERT': {
      return {
        ...state,
        alertDialog: null
      };
    }

    case 'SET_LEAVE_TODAY': {
      return {
        ...state,
        isLeaveToday: action.payload.isLeave,
        leaveTodayType: action.payload.leaveType || '',
        leaveTodayTitle: action.payload.leaveTitle || ''
      };
    }

    case 'SET_ARRIVED_LATE_TODAY': {
      return {
        ...state,
        arrivedLateToday: action.payload
      };
    }

    case 'SET_AGENT_STATUS': {
      return {
        ...state,
        agentStatus: action.payload
      };
    }

    case 'SET_PENDING_OFFER': {
      const offer = action.payload.offer;
      const expiresAt = action.payload.expiresAt;
      const secondsRemaining = expiresAt
        ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
        : (action.payload.secondsRemaining || 60);
      try {
        localStorage.setItem('grabit_pending_offer', JSON.stringify({
          offer,
          expiresAt: expiresAt
        }));
      } catch {}
      const notifId = `notif-offer-${offer.id || offer.orderNumber}`;
      const hasNotif = state.notifications.some(n => n.id === notifId);
      const offerNotif: AppNotification = {
        id: notifId,
        title: `📦 New Delivery Offer: ${offer.orderNumber}`,
        message: `Customer: ${offer.customer.name} (₹${offer.totalAmount.toFixed(0)}) • Tap to accept & start delivery.`,
        timestamp: 'Just now',
        type: 'INFO',
        isRead: false
      };
      return {
        ...state,
        pendingOffer: offer,
        pendingOfferExpiresAt: expiresAt,
        offerSecondsRemaining: secondsRemaining,
        notifications: hasNotif ? state.notifications : [offerNotif, ...state.notifications]
      };
    }

    case 'CLEAR_PENDING_OFFER': {
      try {
        localStorage.removeItem('grabit_pending_offer');
      } catch {}
      return {
        ...state,
        pendingOffer: null,
        pendingOfferExpiresAt: null,
        offerSecondsRemaining: 0
      };
    }

    case 'TICK_OFFER_COUNTDOWN': {
      if (!state.pendingOfferExpiresAt) return state;
      const rem = Math.max(0, Math.ceil((new Date(state.pendingOfferExpiresAt).getTime() - Date.now()) / 1000));
      if (rem <= 0) {
        return {
          ...state,
          pendingOffer: null,
          pendingOfferExpiresAt: null,
          offerSecondsRemaining: 0
        };
      }
      return {
        ...state,
        offerSecondsRemaining: rem
      };
    }

    case 'CLEAR_INCOMING_ORDER': {
      return {
        ...state,
        incomingOrder: null,
        incomingCountdown: 0
      };
    }

    case 'ASSIGN_SPECIFIC_ORDER': {
      const targetOrder = action.payload;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (state.currentOrder !== null) {
        // Rider already has an active delivery! Queue this order!
        const queuedOrder: Order = {
          ...targetOrder,
          status: 'ASSIGNED',
          isQueued: true,
          queuePosition: state.queuedOrders.length + 1,
          assignedAt: nowTime
        };
        const remainingPool = state.orderPool.filter(o => o.id !== targetOrder.id && o.orderNumber !== targetOrder.orderNumber);
        const queueNotif: AppNotification = {
          id: `n-${Date.now()}`,
          type: 'DISPATCH',
          title: `Order ${queuedOrder.orderNumber} Added to Queue`,
          description: `Assigned from Store. Waiting in queue position #${state.queuedOrders.length + 1}. Auto-activates once current delivery is finished.`,
          timestamp: 'Just now',
          isRead: false
        };
        return {
          ...state,
          queuedOrders: [...state.queuedOrders, queuedOrder],
          orderPool: remainingPool,
          notifications: [queueNotif, ...state.notifications]
        };
      }

      const remainingPool = state.orderPool.filter(o => o.id !== targetOrder.id && o.orderNumber !== targetOrder.orderNumber);
      const assignedOrder: Order = {
        ...targetOrder,
        status: 'ASSIGNED',
        isQueued: false,
        assignedAt: nowTime
      };

      const newNotif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'DISPATCH',
        title: `Order ${assignedOrder.orderNumber} Assigned`,
        description: `Directly assigned from GrabIt Supermarket. Proceed to Bay 3 for pickup.`,
        timestamp: 'Just now',
        isRead: false
      };

      saveCurrentOrderLocal(assignedOrder);
      saveAgentStatusLocal('ON_DELIVERY');

      return {
        ...state,
        agentStatus: 'ON_DELIVERY',
        currentOrder: assignedOrder,
        pendingOffer: null,
        pendingOfferExpiresAt: null,
        offerSecondsRemaining: 0,
        incomingOrder: null,
        incomingCountdown: 0,
        orderPool: remainingPool,
        notifications: [newNotif, ...state.notifications]
      };
    }

    case 'FORCE_DISPATCH_NOW': {
      // Direct Assignment of first available order
      if (state.agentStatus !== 'AVAILABLE' || state.currentOrder !== null) {
        return state;
      }
      if (state.orderPool.length === 0) return state;

      const nextOrder = state.orderPool[0];
      const remainingPool = state.orderPool.slice(1);
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const assignedOrder: Order = {
        ...nextOrder,
        status: 'ASSIGNED',
        assignedAt: nowTime
      };

      const newNotif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'DISPATCH',
        title: `Order ${assignedOrder.orderNumber} Assigned`,
        description: `Directly assigned from GrabIt Supermarket. Proceed to Bay 3 for pickup.`,
        timestamp: 'Just now',
        isRead: false
      };

      return {
        ...state,
        agentStatus: 'ON_DELIVERY',
        currentOrder: assignedOrder,
        incomingOrder: null,
        incomingCountdown: 0,
        orderPool: remainingPool,
        notifications: [newNotif, ...state.notifications]
      };
    }

    case 'ADVANCE_ORDER_STATUS': {
      // Guard: must be ON_DELIVERY and have active order
      if (state.agentStatus !== 'ON_DELIVERY' || !state.currentOrder) {
        return state;
      }

      const nextStatus = action.payload;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const updatedOrder: Order = {
        ...state.currentOrder,
        status: nextStatus,
        ...(nextStatus === 'PICKED_UP' ? { pickedUpAt: nowTime } : {})
      };

      saveCurrentOrderLocal(updatedOrder);

      return {
        ...state,
        currentOrder: updatedOrder
      };
    }

    case 'COMPLETE_DELIVERY': {
      // Guard: must have current order
      if (!state.currentOrder || state.agentStatus !== 'ON_DELIVERY') {
        return state;
      }

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const completedOrder: Order = {
        ...state.currentOrder,
        status: 'DELIVERED',
        deliveredAt: nowTime,
        proofOfDelivery: action.payload.pod
      };

      const completedEarning = completedOrder.totalAmount > 0 ? Math.round(55 + (completedOrder.distanceKm || 2) * 10) : 65;
      const newHistoryEntry: DeliveryHistoryEntry = {
        orderId: completedOrder.id,
        orderNumber: completedOrder.orderNumber,
        supermarketName: 'GrabIt Supermarket (Koramangala)',
        customerName: completedOrder.customer.name,
        deliveryLocation: completedOrder.customer.address,
        status: 'DELIVERED',
        timestamp: 'Just now',
        completedAtISO: new Date().toISOString(),
        totalAmount: completedOrder.totalAmount,
        paymentMethod: completedOrder.paymentMethod,
        distanceKm: completedOrder.distanceKm,
        durationMinutes: completedOrder.estimatedMinutes || 18,
        earning: completedEarning
      };

      const successNotif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'STATUS',
        title: `Order ${completedOrder.orderNumber} Delivered`,
        description: `Proof of delivery verified for ${completedOrder.customer.name}. Handover completed!`,
        timestamp: 'Just now',
        isRead: false
      };

      const newHistory = [newHistoryEntry, ...state.history];
      const newStats = deriveStatsFromHistory(newHistory, state.stats);

      try {
        const riderId = getAuthenticatedRiderId();
        if (riderId) {
          localStorage.setItem(`grabit_delivery_history_${riderId}`, JSON.stringify(newHistory));
        }

        // Immediately persist to delivered ids set so background polling never re-assigns
        const deliveredList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
        const deliveredSet = new Set(Array.isArray(deliveredList) ? deliveredList.map((x: any) => String(x).toLowerCase().trim()) : []);
        if (completedOrder.id) {
          deliveredSet.add(String(completedOrder.id).toLowerCase().trim());
          deliveredSet.add(formatOrderId(completedOrder.id).toLowerCase().trim());
        }
        if (completedOrder.orderNumber) {
          deliveredSet.add(String(completedOrder.orderNumber).toLowerCase().trim());
          deliveredSet.add(formatOrderId(completedOrder.orderNumber).toLowerCase().trim());
        }
        localStorage.setItem('grabit_delivered_order_ids', JSON.stringify(Array.from(deliveredSet)));
      } catch {}

      // ── Check if there are queued orders waiting for this rider ──
      let nextPendingOffer: Order | null = null;
      let nextOfferExpiresAt: string | null = null;
      let nextQueue: Order[] = [];
      let queueNotif: AppNotification | null = null;

      if (state.queuedOrders && state.queuedOrders.length > 0) {
        const firstQueued = state.queuedOrders[0];
        nextPendingOffer = {
          ...firstQueued,
          status: 'ASSIGNED',
          isQueued: false,
          queuePosition: undefined
        };
        nextOfferExpiresAt = new Date(Date.now() + 60000).toISOString();
        nextQueue = state.queuedOrders.slice(1).map((o, idx) => ({
          ...o,
          queuePosition: idx + 1
        }));
        queueNotif = {
          id: `n-next-${Date.now()}`,
          type: 'DISPATCH',
          title: `📦 New Order Assignment (${nextPendingOffer.orderNumber})`,
          description: `You have an incoming delivery assignment for Order ${nextPendingOffer.orderNumber}. Accept to start delivery!`,
          timestamp: 'Just now',
          isRead: false
        };
      }

      saveCurrentOrderLocal(null);
      saveAgentStatusLocal('AVAILABLE');

      return {
        ...state,
        agentStatus: 'AVAILABLE',
        currentOrder: null,
        queuedOrders: nextQueue,
        pendingOffer: nextPendingOffer,
        pendingOfferExpiresAt: nextOfferExpiresAt,
        offerSecondsRemaining: nextPendingOffer ? 60 : 0,
        incomingOrder: null,
        incomingCountdown: 0,
        activeModal: 'DELIVERY_SUCCESS',
        successOrderSummary: completedOrder,
        history: newHistory,
        notifications: queueNotif ? [queueNotif, successNotif, ...state.notifications] : [successNotif, ...state.notifications],
        stats: newStats
      };
    }

    case 'REPORT_ISSUE': {
      if (!state.currentOrder || state.agentStatus !== 'ON_DELIVERY') {
        return state;
      }

      const terminalStatus = action.payload.actionTaken; // FAILED_DELIVERY or RETURNED
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const finalizedOrder: Order = {
        ...state.currentOrder,
        status: terminalStatus,
        issueReport: action.payload,
        ...(terminalStatus === 'FAILED_DELIVERY' ? { failedAt: nowTime } : { returnedAt: nowTime })
      };

      saveCurrentOrderLocal(null);
      saveAgentStatusLocal('AVAILABLE');

      const newHistoryEntry: DeliveryHistoryEntry = {
        orderId: finalizedOrder.id,
        orderNumber: finalizedOrder.orderNumber,
        supermarketName: 'GrabIt Supermarket (Koramangala)',
        customerName: finalizedOrder.customer.name,
        deliveryLocation: finalizedOrder.customer.address,
        status: terminalStatus,
        timestamp: 'Just now',
        completedAtISO: new Date().toISOString(),
        totalAmount: finalizedOrder.totalAmount,
        paymentMethod: finalizedOrder.paymentMethod,
        distanceKm: finalizedOrder.distanceKm,
        durationMinutes: 20,
        failureReason: action.payload.reason
      };

      const issueNotif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'STATUS',
        title: `Order ${finalizedOrder.orderNumber} ${terminalStatus === 'RETURNED' ? 'Returned to Supermarket' : 'Failed'}`,
        description: `Incident logged: ${action.payload.reason}. Agent returned to Available state.`,
        timestamp: 'Just now',
        isRead: false
      };

      const newHistoryIssue = [newHistoryEntry, ...state.history];
      const newStatsIssue = deriveStatsFromHistory(newHistoryIssue, {
        ...state.stats,
        failedToday: terminalStatus === 'FAILED_DELIVERY' ? state.stats.failedToday + 1 : state.stats.failedToday,
        returnedToday: terminalStatus === 'RETURNED' ? state.stats.returnedToday + 1 : state.stats.returnedToday
      });

      return {
        ...state,
        agentStatus: 'AVAILABLE',
        currentOrder: null,
        incomingOrder: null,
        incomingCountdown: 0,
        activeModal: null,
        history: newHistoryIssue,
        notifications: [issueNotif, ...state.notifications],
        stats: newStatsIssue
      };
    }

    case 'OPEN_MODAL': {
      return {
        ...state,
        activeModal: action.payload
      };
    }

    case 'CLOSE_MODAL': {
      return {
        ...state,
        activeModal: null
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const nextNotifs = state.notifications.map((n) =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
      try {
        localStorage.setItem('grabit_delivery_notifications', JSON.stringify(nextNotifs));
      } catch {}
      return {
        ...state,
        notifications: nextNotifs
      };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const nextNotifs = state.notifications.map((n) => ({ ...n, isRead: true }));
      try {
        localStorage.setItem('grabit_delivery_notifications', JSON.stringify(nextNotifs));
      } catch {}
      return {
        ...state,
        notifications: nextNotifs
      };
    }

    case 'DELETE_NOTIFICATION': {
      const notifId = action.payload;
      const nextNotifs = state.notifications.filter((n) => n.id !== notifId);
      try {
        localStorage.setItem('grabit_delivery_notifications', JSON.stringify(nextNotifs));
      } catch {}
      return {
        ...state,
        notifications: nextNotifs
      };
    }

    case 'CLEAR_ALL_NOTIFICATIONS': {
      try {
        localStorage.setItem('grabit_delivery_notifications', JSON.stringify([]));
      } catch {}
      return {
        ...state,
        notifications: []
      };
    }

    case 'CREATE_SUPPORT_TICKET': {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newTicket: SupportTicket = {
        id: `SUP-${dateStr}-${randomSuffix}`,
        category: action.payload.category,
        subject: action.payload.subject,
        description: action.payload.description,
        status: 'OPEN',
        createdAt: 'Just now'
      };

      const ticketNotif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'SYSTEM',
        title: `Support Ticket ${newTicket.id} Created`,
        description: `Subject: ${newTicket.subject}. Supermarket dispatch support will review it shortly.`,
        timestamp: 'Just now',
        isRead: false
      };

      const nextTickets = [newTicket, ...state.supportTickets];
      const nextNotifs = [ticketNotif, ...state.notifications];

      try {
        localStorage.setItem('grabit_delivery_support_tickets', JSON.stringify(nextTickets));
        localStorage.setItem('grabit_delivery_notifications', JSON.stringify(nextNotifs));
      } catch {}

      return {
        ...state,
        supportTickets: nextTickets,
        notifications: nextNotifs
      };
    }

    case 'UPDATE_SETTINGS': {
      const nextSettings = { ...state.settings, ...action.payload };
      soundEngine.setMuted(!nextSettings.notificationSound);
      return {
        ...state,
        settings: nextSettings
      };
    }

    case 'REDEEM_INCENTIVE': {
      const { campaignId, amount } = action.payload;
      const riderId = getAuthenticatedRiderId();
      if (riderId) {
        const key = `grabit_redeemed_incentives_${riderId}`;
        const redeemedIds = getSavedRedeemedCampaigns();
        if (!redeemedIds.includes(campaignId)) {
          redeemedIds.push(campaignId);
          try {
            localStorage.setItem(key, JSON.stringify(redeemedIds));
          } catch {}
        }
      }

      const notifId = `NOTIF-${Date.now()}`;
      const newNotif: AppNotification = {
        id: notifId,
        type: 'ADMIN',
        title: '🎉 Incentive Bonus Redeemed!',
        description: `Successfully claimed ₹${amount.toFixed(2)} bonus reward directly to your wallet balance!`,
        timestamp: 'Just now',
        isRead: false
      };

      const updatedNotifs = [newNotif, ...state.notifications];
      try {
        localStorage.setItem('grabit_delivery_notifications', JSON.stringify(updatedNotifs));
      } catch {}

      return {
        ...state,
        incentiveCampaigns: state.incentiveCampaigns.map((c) =>
          c.id === campaignId ? { ...c, isRedeemed: true } : c
        ),
        notifications: updatedNotifs
      };
    }

    case 'SYNC_DELIVERY_ORDERS': {
      const { activeOrder, queuedOrders, poolOrders } = action.payload;
      if (state.agentStatus === 'ON_DELIVERY' && state.currentOrder) {
        return {
          ...state,
          queuedOrders,
          orderPool: poolOrders
        };
      }
      if (state.activeModal === 'DELIVERY_SUCCESS') {
        return {
          ...state,
          queuedOrders,
          orderPool: poolOrders
        };
      }
      if (activeOrder) {
        let isDelivered = false;
        try {
          const dList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
          const inHistory = (state.history || []).some((h) =>
            isSameOrderId(h.orderId, activeOrder.id) || isSameOrderId(h.orderNumber, activeOrder.orderNumber)
          );
          if (inHistory || (Array.isArray(dList) && dList.some((dId: any) => isSameOrderId(dId, activeOrder.id) || isSameOrderId(dId, activeOrder.orderNumber)))) {
            isDelivered = true;
          }
        } catch {}

        if (!isDelivered) {
          return {
            ...state,
            agentStatus: 'ON_DELIVERY',
            currentOrder: activeOrder,
            queuedOrders,
            orderPool: poolOrders
          };
        }
      }

      const isCurrentDelivered = (() => {
        if (!state.currentOrder) return true;
        try {
          const dList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
          const inHistory = (state.history || []).some((h) =>
            isSameOrderId(h.orderId, state.currentOrder?.id) || isSameOrderId(h.orderNumber, state.currentOrder?.orderNumber)
          );
          return inHistory || (Array.isArray(dList) && dList.some((dId: any) => isSameOrderId(dId, state.currentOrder?.id) || isSameOrderId(dId, state.currentOrder?.orderNumber)));
        } catch {
          return false;
        }
      })();

      const nextCurrentOrder = (!activeOrder && isCurrentDelivered) ? null : (activeOrder || (isCurrentDelivered ? null : state.currentOrder));
      const nextAgentStatus = nextCurrentOrder ? (state.agentStatus === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'ON_DELIVERY') : (state.agentStatus === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE');

      saveCurrentOrderLocal(nextCurrentOrder);
      if (nextAgentStatus === 'ON_DELIVERY') {
        saveAgentStatusLocal('ON_DELIVERY');
      } else if (nextAgentStatus === 'AVAILABLE') {
        saveAgentStatusLocal('AVAILABLE');
      }

      return {
        ...state,
        agentStatus: nextAgentStatus,
        currentOrder: nextCurrentOrder,
        queuedOrders,
        orderPool: poolOrders
      };
    }

    case 'SYNC_ORDERS_POOL': {
      return {
        ...state,
        orderPool: action.payload
      };
    }

    case 'SYNC_CLOUD_HISTORY': {
      const riderId = getAuthenticatedRiderId();
      const cloudEntries = action.payload;
      const mergedEntries = mergeHistoryEntries(state.history, cloudEntries);
      if (riderId) {
        const key = `grabit_delivery_history_${riderId}`;
        try {
          localStorage.setItem(key, JSON.stringify(mergedEntries));
        } catch {}
      }

      const derivedStats = deriveStatsFromHistory(mergedEntries, state.stats);

      return {
        ...state,
        history: mergedEntries,
        stats: derivedStats
      };
    }

    case 'TRANSFER_PAYOUT': {
      const riderId = getAuthenticatedRiderId();
      const now = new Date();
      const newTransfer: PayoutTransfer = {
        id: `TXN-UPI-${Date.now()}`,
        amount: action.payload.amount,
        bankUpi: action.payload.bankUpi,
        timestamp: now.toISOString(),
        dateFormatted: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'SUCCESS'
      };

      if (riderId) {
        const key = `grabit_payout_transfers_${riderId}`;
        try {
          const existing = getSavedPayouts();
          localStorage.setItem(key, JSON.stringify([newTransfer, ...existing]));
        } catch {}
      }

      const transferNotif: AppNotification = {
        id: `n-${Date.now()}`,
        type: 'STATUS',
        title: `💸 Instant Payout Transferred: ₹${action.payload.amount.toFixed(2)}`,
        description: `Successfully transferred ₹${action.payload.amount.toFixed(2)} to ${action.payload.bankUpi} via UPI.`,
        timestamp: 'Just now',
        isRead: false
      };

      const nextTransfers = [newTransfer, ...(state.payoutTransfers || [])];
      try {
        localStorage.setItem(key, JSON.stringify(nextTransfers));
      } catch {}

      return {
        ...state,
        payoutTransfers: nextTransfers,
        notifications: [transferNotif, ...state.notifications]
      };
    }

    case 'RESET_DEMO': {
      try {
        localStorage.removeItem('grabit_payout_transfers');
      } catch {}
      return {
        ...initialDeliveryState,
        orderPool: [],
        history: [],
        payoutTransfers: [],
        stats: deriveStatsFromHistory([], initialStats),
        notifications: [],
        supportTickets: [],
        settings: { ...initialSettings }
      };
    }

    case 'SET_ACTIVE_SHIFT_SECONDS': {
      const nextSeconds = Math.max(state.activeShiftSeconds, action.payload);
      const activeShiftMinutes = Math.floor(nextSeconds / 60);
      const derivedStats = deriveStatsFromHistory(state.history, {
        ...state.stats,
        activeShiftMinutes
      });
      try {
        const riderId = getAuthenticatedRiderId() || 'default';
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`grabit_active_shift_${riderId}`, JSON.stringify({ seconds: nextSeconds, date: todayStr }));
      } catch {}

      return {
        ...state,
        activeShiftSeconds: nextSeconds,
        stats: derivedStats
      };
    }

    case 'TICK_ACTIVE_SHIFT': {
      const todayStr = new Date().toISOString().slice(0, 10);
      let nextSeconds = state.activeShiftSeconds;
      let nextDate = state.activeShiftDate;

      if (nextSeconds === 0) {
        const saved = getSavedActiveShift();
        if (saved && saved.seconds > 0) {
          nextSeconds = saved.seconds;
        }
      }

      if (nextDate !== todayStr) {
        nextSeconds = 0;
        nextDate = todayStr;
      }

      if (state.agentStatus !== 'UNAVAILABLE') {
        nextSeconds += 1;
      }

      const activeShiftMinutes = Math.floor(nextSeconds / 60);
      const derivedStats = deriveStatsFromHistory(state.history, {
        ...state.stats,
        activeShiftMinutes
      });

      try {
        const riderId = getAuthenticatedRiderId() || 'default';
        localStorage.setItem(`grabit_active_shift_${riderId}`, JSON.stringify({ seconds: nextSeconds, date: nextDate }));
      } catch {}

      return {
        ...state,
        activeShiftSeconds: nextSeconds,
        activeShiftDate: nextDate,
        stats: derivedStats
      };
    }

    default:
      return state;
  }
}

interface DeliveryContextValue {
  state: DeliveryState;
  dispatch: React.Dispatch<DeliveryAction>;
  advanceStatus: (next: OrderStatus) => void;
  completeDelivery: (pod: ProofOfDelivery) => void;
  reportIssue: (issue: IssueReport) => void;
  setAgentStatus: (status: AgentStatus) => void;
  toggleAvailability: () => void;
  confirmGoOffline: () => void;
  openModal: (modal: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS' | 'SHIFT_SUMMARY') => void;
  closeModal: () => void;
  forceDispatchNow: () => void;
  acceptOrder: (order: Order) => Promise<void>;
  rejectOffer: (order: Order) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  createSupportTicket: (ticket: { category: SupportTicket['category']; subject: string; description: string }) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  transferPayout: (amount: number, bankUpi: string) => void;
  redeemIncentive: (campaignId: string, amount: number) => void;
  resetDemo: () => void;
  showAlert: (options: { title?: string; message: string; type?: 'warning' | 'info' | 'error' | 'success'; buttonText?: string } | string) => void;
  closeAlert: () => void;
  unreadCount: number;
  storeHours: { open: string; close: string };
  isStoreOpen: boolean;
}

const DeliveryContext = createContext<DeliveryContextValue | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(deliveryReducer, initialDeliveryState);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectivityLostAtRef = useRef<string | null>(null);
  const offlineDeliveryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = useCallback((options: { title?: string; message: string; type?: 'warning' | 'info' | 'error' | 'success'; buttonText?: string } | string) => {
    if (typeof options === 'string') {
      dispatch({
        type: 'SHOW_ALERT',
        payload: {
          title: 'Notice',
          message: options,
          type: 'info',
          buttonText: 'Understood'
        }
      });
    } else {
      dispatch({
        type: 'SHOW_ALERT',
        payload: {
          title: options.title,
          message: options.message,
          type: options.type || 'info',
          buttonText: options.buttonText || 'Understood'
        }
      });
    }
  }, []);

  const closeAlert = useCallback(() => {
    dispatch({ type: 'CLOSE_ALERT' });
  }, []);

  const getBatteryStatus = async (): Promise<{ battery_low: boolean }> => {
    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        if (battery) {
          const isLow = battery.level < 0.15 && !battery.charging;
          return { battery_low: isLow };
        }
      }
    } catch {}
    return { battery_low: false };
  };

  const unreadCount = state.notifications.filter((n) => !n.isRead).length;

  const enqueueOfflineStatus = (orderId: string, status: string) => {
    try {
      const rawQueue = localStorage.getItem('grabit_offline_status_queue') || '[]';
      const queue = JSON.parse(rawQueue);
      if (Array.isArray(queue)) {
        queue.push({ orderId, status, timestamp: Date.now() });
        localStorage.setItem('grabit_offline_status_queue', JSON.stringify(queue));
      }
    } catch {}
  };

  const advanceStatus = useCallback((next: OrderStatus) => {
    soundEngine.playStepAdvance();
    dispatch({ type: 'ADVANCE_ORDER_STATUS', payload: next });
    const rawId = state.currentOrder?.id;
    if (rawId) {
      const statusStr = String(next).toLowerCase();
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        enqueueOfflineStatus(rawId, statusStr);
      } else {
        patch(`/orders/${encodeURIComponent(rawId)}/status`, {
          status: statusStr
        }).catch(() => {
          enqueueOfflineStatus(rawId, statusStr);
        });
      }
    }
  }, [state.currentOrder]);

  const completeDelivery = useCallback((pod: ProofOfDelivery) => {
    soundEngine.playSuccessChime();
    const deliveredOrder = state.currentOrder;
    dispatch({ type: 'COMPLETE_DELIVERY', payload: { pod } });

    if (deliveredOrder) {
      const rawId = String(deliveredOrder.id || '').trim();
      const rawRawId = String(deliveredOrder.rawId || '').trim();
      const orderNum = String(deliveredOrder.orderNumber || '').trim();
      const displayNum = displayOrderNumber(rawId || orderNum);
      const formattedId = formatOrderId(rawId || orderNum);

      const loggedRiderId = getAuthenticatedRiderId() || '';

      // 1. Record in delivered blacklist with ALL ID variants
      recordDeliveredOrderIds([rawId, rawRawId, orderNum, displayNum, formattedId]);

      // 2. Mark as delivered in local storage cache
      try {
        const storedOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        if (Array.isArray(storedOrders)) {
          const updatedOrders = storedOrders.map((o: any) => {
            if (
              isSameOrderId(o.id, rawId) ||
              isSameOrderId(o.rawId, rawId) ||
              isSameOrderId(o.orderNumber, rawId) ||
              isSameOrderId(o.id, orderNum) ||
              isSameOrderId(o.rawId, rawRawId)
            ) {
              return { ...o, status: 'delivered', delivery_agent_id: loggedRiderId };
            }
            return o;
          });
          localStorage.setItem('grabit_orders', JSON.stringify(updatedOrders));
        }

        notifyOrdersUpdated({ orderId: rawId, status: 'delivered' });
      } catch {}

      // 3. Authoritative backend status update with retry and error notification
      if (rawId) {
        patchWithRetry(`/orders/${encodeURIComponent(rawId)}/status`, {
          status: 'delivered',
          delivery_agent_id: loggedRiderId
        }, 4, 1000)
          .then(() => {
            // After backend confirms delivery, refetch history from cloud
            setTimeout(() => {
              get('/delivery/history')
                .then((cloudOrders: any[]) => {
                  if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
                    const entries = cloudOrders.map(mapApiOrderToHistoryEntry);
                    dispatch({ type: 'SYNC_CLOUD_HISTORY', payload: entries });
                  }
                })
                .catch(() => {});
            }, 300);
          })
          .catch((err) => {
            console.error('Failed to persist delivery status to server after retries:', err);
            enqueueOfflineStatus(rawId, 'delivered');
            const errNotif: AppNotification = {
              id: `n-sync-err-${Date.now()}`,
              type: 'STATUS',
              title: `⚠️ Delivery Status Sync Failed`,
              description: `Could not save delivery status for Order ${orderNum || rawId} to server after multiple retries. Queued for auto-retry once connection resumes.`,
              timestamp: 'Just now',
              isRead: false
            };
            dispatch({
              type: 'SYNC_CLOUD_HISTORY',
              payload: state.history
            });
            showAlert({
              title: 'Sync Failed',
              message: `Could not save delivery status for order ${orderNum || rawId} to server. It has been saved locally and will auto-sync once connected.`,
              type: 'warning'
            });
          });
      }
    }
  }, [state.currentOrder, state.history]);

  const reportIssue = useCallback((issue: IssueReport) => {
    soundEngine.playWarning();
    dispatch({ type: 'REPORT_ISSUE', payload: issue });
  }, []);

  // ── Rider Verification & Presence Dispatch ──
  const riderVerificationStatusRef = useRef<string>('VERIFIED');
  const presenceConsecutiveFailsRef = useRef<number>(0);
  const presenceStatusFailsRef = useRef<number>(0);
  const historySyncDisabledRef = useRef<boolean>(false);

  const sendPresenceUpdate = useCallback(async (status: AgentStatus, location?: { lat: number; lng: number; accuracy?: number }) => {
    // If backend presence endpoint returned 404/unreachable 3+ consecutive times, avoid spamming DevTools
    if (presenceConsecutiveFailsRef.current >= 3) return;
    try {
      let riderId = '';
      let riderPhone = '';
      let riderName = '';
      const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
      if (u.id) riderId = String(u.id);
      if (u.phone) riderPhone = String(u.phone);
      if (u.name || u.full_name) riderName = String(u.full_name || u.name);

      const bat = await getBatteryStatus();
      const res: any = await post('/delivery/presence', {
        agent_id: riderId,
        phone: riderPhone,
        name: riderName,
        status: status,
        battery_low: bat.battery_low,
        connectivity_lost_at: connectivityLostAtRef.current,
        ...(location ? { location } : {})
      });

      if (res) {
        presenceConsecutiveFailsRef.current = 0;
        if (res.auto_logged_out || res.agent_status === 'UNAVAILABLE' || (res.status === 'error' && res.message && res.message.includes('Store is closed'))) {
          saveAgentStatusLocal('UNAVAILABLE');
          dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
          dispatch({ type: 'CLEAR_INCOMING_ORDER' });
        }
        if (typeof res.is_leave_today === 'boolean') {
          dispatch({
            type: 'SET_LEAVE_TODAY',
            payload: { isLeave: res.is_leave_today, leaveType: res.leave_type, leaveTitle: res.leave_title }
          });
        }
        if (res.user) {
          if (typeof res.user.arrived_late_today === 'boolean') {
            dispatch({ type: 'SET_ARRIVED_LATE_TODAY', payload: res.user.arrived_late_today });
          }
          if (res.user.verification_status) {
            riderVerificationStatusRef.current = String(res.user.verification_status).toUpperCase();
          }
          if (Array.isArray(res.user.shift_sessions)) {
            const shiftSecs = calculateTodayShiftSeconds(res.user.shift_sessions);
            if (shiftSecs > 0) {
              dispatch({ type: 'SET_ACTIVE_SHIFT_SECONDS', payload: shiftSecs });
            }
          }
        }
      } else {
        presenceConsecutiveFailsRef.current += 1;
      }
    } catch {}
  }, []);

  // ── Store Settings & Rider Presence Sync ──
  const storeSettingsRef = useRef<{ open: string; close: string }>({ open: '10:00', close: '19:00' });
  const [storeHours, setStoreHours] = React.useState<{ open: string; close: string }>({ open: '10:00', close: '19:00' });

  const isNowWithinStoreHours = (openStr = '10:00', closeStr = '19:00'): boolean => {
    try {
      if (!openStr || !closeStr) return true;
      const now = new Date();
      const [openH, openM] = openStr.split(':').map(Number);
      const [closeH, closeM] = closeStr.split(':').map(Number);
      if (isNaN(openH) || isNaN(closeH)) return true;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const openMinutes = openH * 60 + (openM || 0);
      const closeMinutes = closeH * 60 + (closeM || 0);
      if (openMinutes <= closeMinutes) {
        return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
      } else {
        return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
      }
    } catch {
      return true;
    }
  };

  const [isStoreOpen, setIsStoreOpen] = React.useState<boolean>(() => isNowWithinStoreHours('10:00', '19:00'));

  const fetchStoreSettings = useCallback(async () => {
    try {
      const res: any = await get('/store/settings');
      if (res && typeof res === 'object') {
        const open = res.store_open_time || '10:00';
        const close = res.store_close_time || '19:00';
        storeSettingsRef.current = { open, close };
        setStoreHours({ open, close });
        const openNow = isNowWithinStoreHours(open, close);
        setIsStoreOpen(openNow);
        if (!openNow && state.agentStatus === 'AVAILABLE') {
          saveAgentStatusLocal('UNAVAILABLE');
          dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
        }
      }
    } catch {}
  }, [state.agentStatus]);

  useEffect(() => {
    fetchStoreSettings();
    const interval = setInterval(fetchStoreSettings, 15000);
    return () => clearInterval(interval);
  }, [fetchStoreSettings]);

  // Real-time Watchdog: Auto Shift-End when Store Closes
  useEffect(() => {
    const checkStoreHours = () => {
      const openTime = storeSettingsRef.current.open || '10:00';
      const closeTime = storeSettingsRef.current.close || '19:00';
      const isWithin = isNowWithinStoreHours(openTime, closeTime);
      setIsStoreOpen(isWithin);

      // If store is closed and agent is currently marked Available, auto shift-end to UNAVAILABLE
      if (!isWithin && state.agentStatus === 'AVAILABLE') {
        saveAgentStatusLocal('UNAVAILABLE');
        dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
        dispatch({ type: 'CLEAR_INCOMING_ORDER' });
        sendPresenceUpdate('UNAVAILABLE');
      }
    };

    checkStoreHours();
    const interval = setInterval(checkStoreHours, 3000);
    return () => clearInterval(interval);
  }, [state.agentStatus, sendPresenceUpdate]);

  const setAgentStatus = useCallback((status: AgentStatus) => {
    dispatch({ type: 'SET_AGENT_STATUS', payload: status });
    sendPresenceUpdate(status);
  }, [sendPresenceUpdate]);

  const confirmGoOffline = useCallback(() => {
    soundEngine.playStepAdvance();
    saveAgentStatusLocal('UNAVAILABLE');
    dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
    dispatch({ type: 'CLEAR_INCOMING_ORDER' });
    sendPresenceUpdate('UNAVAILABLE');
    dispatch({ type: 'CLOSE_MODAL' });
  }, [sendPresenceUpdate]);

  const toggleAvailability = useCallback(() => {
    if (state.agentStatus === 'ON_DELIVERY') {
      soundEngine.playWarning();
      return;
    }

    if (state.isLeaveToday && state.agentStatus === 'UNAVAILABLE') {
      soundEngine.playWarning();
      showAlert({
        title: '🏖️ Scheduled Leave Today',
        message: `${state.leaveTodayTitle || 'Leave Today'}: Rider status cannot be changed to Active on scheduled leaves or week offs.`,
        type: 'info',
        buttonText: 'Understood'
      });
      return;
    }

    const isVerified = isRiderVerifiedLocal();
    if (!isVerified && state.agentStatus !== 'AVAILABLE') {
      soundEngine.playWarning();
      showAlert({
        title: '🔒 Verification Under Review',
        message: 'Your partner documents are currently under review by Admin. You can go Active once Admin verifies and approves your profile.',
        type: 'warning',
        buttonText: 'Understood'
      });
      return;
    }

    if (state.agentStatus === 'AVAILABLE') {
      soundEngine.playStepAdvance();
      // Show Shift Summary Modal before finalizing UNAVAILABLE
      dispatch({ type: 'OPEN_MODAL', payload: 'SHIFT_SUMMARY' });
    } else {
      // Check Store Operating Hours before going AVAILABLE
      const openTime = storeSettingsRef.current.open || '10:00';
      const closeTime = storeSettingsRef.current.close || '19:00';
      if (!isNowWithinStoreHours(openTime, closeTime)) {
        soundEngine.playWarning();
        showAlert({
          title: '🌙 Store Closed (Shift Ended)',
          message: `GrabIt Central Hub is closed. Working hours are ${openTime} – ${closeTime}. Rider dispatch resumes tomorrow at ${openTime}.`,
          type: 'warning',
          buttonText: 'Understood'
        });
        saveAgentStatusLocal('UNAVAILABLE');
        dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
        sendPresenceUpdate('UNAVAILABLE');
        return;
      }

      soundEngine.playIncomingOrderAlert();
      saveAgentStatusLocal('AVAILABLE');
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'AVAILABLE' });
      sendPresenceUpdate('AVAILABLE');
    }
  }, [state.agentStatus, sendPresenceUpdate, showAlert]);


  const hasShownAutoLogoutAlertRef = useRef<boolean>(false);

  // Server-authoritative presence and status hydration
  const fetchPresenceStatus = useCallback(async () => {
    if (presenceStatusFailsRef.current >= 3) return;
    try {
      const res: any = await get('/delivery/presence-status');
      if (res && res.status === 'success' && res.user) {
        presenceStatusFailsRef.current = 0;
        const u = res.user;
        if (u.verification_status) {
          riderVerificationStatusRef.current = String(u.verification_status).toUpperCase();
        }
        const isUserVerified = u.partnerVerified !== false && u.verification_status !== 'REJECTED';
        const serverOnline = isUserVerified && Boolean(u.is_online || u.agent_status === 'AVAILABLE' || u.agent_status === 'ON_DELIVERY');
        const autoLoggedOut = Boolean(res.auto_logged_out || u.auto_logged_out);

        if (!isUserVerified) {
          saveAgentStatusLocal('UNAVAILABLE');
          if (state.agentStatus !== 'UNAVAILABLE') {
            dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
          }
        } else if (autoLoggedOut) {
          saveAgentStatusLocal('UNAVAILABLE');
          if (state.agentStatus !== 'UNAVAILABLE') {
            dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
          }
          if (!hasShownAutoLogoutAlertRef.current) {
            hasShownAutoLogoutAlertRef.current = true;
            showAlert({
              title: '🌙 Shift Ended',
              message: 'You were set offline automatically because your shift ended.',
              type: 'info',
              buttonText: 'Understood'
            });
          }
        } else if (serverOnline) {
          hasShownAutoLogoutAlertRef.current = false;
          const targetStatus: AgentStatus = (u.agent_status === 'ON_DELIVERY' || state.currentOrder) ? 'ON_DELIVERY' : 'AVAILABLE';
          saveAgentStatusLocal(targetStatus);
          if (state.agentStatus !== targetStatus) {
            dispatch({ type: 'SET_AGENT_STATUS', payload: targetStatus });
          }
        } else {
          // Server indicates offline / UNAVAILABLE
          const savedLocalStatus = getSavedAgentStatus();
          if (savedLocalStatus === 'AVAILABLE' && state.agentStatus === 'AVAILABLE') {
            // Rider is actively working on client; re-assert active presence to backend
            sendPresenceUpdate('AVAILABLE');
          } else if (!state.currentOrder && state.agentStatus !== 'ON_DELIVERY') {
            saveAgentStatusLocal('UNAVAILABLE');
            if (state.agentStatus !== 'UNAVAILABLE') {
              dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
            }
          }
        }

        if (typeof res.is_leave_today === 'boolean') {
          dispatch({
            type: 'SET_LEAVE_TODAY',
            payload: { isLeave: res.is_leave_today, leaveType: res.leave_type, leaveTitle: res.leave_title }
          });
        }
        if (typeof u.arrived_late_today === 'boolean') {
          dispatch({ type: 'SET_ARRIVED_LATE_TODAY', payload: u.arrived_late_today });
        }
        if (Array.isArray(u.shift_sessions)) {
          const shiftSecs = calculateTodayShiftSeconds(u.shift_sessions);
          if (shiftSecs > 0) {
            dispatch({ type: 'SET_ACTIVE_SHIFT_SECONDS', payload: shiftSecs });
          }
        }
      } else {
        presenceStatusFailsRef.current += 1;
      }
    } catch {
      presenceStatusFailsRef.current += 1;
    }
  }, [state.currentOrder, state.agentStatus, showAlert]);

  useEffect(() => {
    fetchPresenceStatus();
    const interval = setInterval(fetchPresenceStatus, 20000);
    return () => clearInterval(interval);
  }, [fetchPresenceStatus]);

  // Send periodic presence ping every 60 seconds while online
  useEffect(() => {
    if (state.agentStatus !== 'UNAVAILABLE') {
      sendPresenceUpdate(state.agentStatus);
      const interval = setInterval(() => {
        sendPresenceUpdate(state.agentStatus);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [state.agentStatus, sendPresenceUpdate]);

  // Real GPS location watcher & presence location sync
  useEffect(() => {
    if (state.agentStatus !== 'UNAVAILABLE' && typeof navigator !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          sendPresenceUpdate(state.agentStatus, { lat, lng, accuracy });
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [state.agentStatus, sendPresenceUpdate]);

  const openModal = useCallback((modal: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS' | 'SHIFT_SUMMARY') => {
    dispatch({ type: 'OPEN_MODAL', payload: modal });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const forceDispatchNow = useCallback(() => {
    if (state.settings.deliveryAlertSound) {
      soundEngine.playIncomingOrderAlert();
    }
    dispatch({ type: 'FORCE_DISPATCH_NOW' });
  }, [state.settings.deliveryAlertSound]);

  const pendingAcceptIdsRef = useRef<Set<string>>(new Set());

  const acceptOrder = useCallback(async (order: Order) => {
    const isVerified = riderVerificationStatusRef.current === 'VERIFIED' ||
                       riderVerificationStatusRef.current === 'APPROVED' ||
                       !riderVerificationStatusRef.current;

    if (!isVerified) {
      showAlert({
        title: '🔒 Verification Required',
        message: 'You must complete document upload and verification in Profile before accepting orders.',
        type: 'warning',
        buttonText: 'Understood'
      });
      return;
    }

    const rawId = String(order.id || '').trim();
    if (!rawId) return;

    // If order is ALREADY the rider's active delivery, dismiss offer modal gracefully without throwing 409 Conflict
    const savedActive = getSavedCurrentOrder();
    const isAlreadyActive = Boolean(
      (state.currentOrder && (isSameOrderId(order.id, state.currentOrder.id) || isSameOrderId(order.orderNumber, state.currentOrder.orderNumber))) ||
      (savedActive && (isSameOrderId(order.id, savedActive.id) || isSameOrderId(order.orderNumber, savedActive.orderNumber)))
    );

    if (isAlreadyActive) {
      dispatch({ type: 'CLEAR_PENDING_OFFER' });
      saveAgentStatusLocal('ON_DELIVERY');
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'ON_DELIVERY' });
      if (state.currentOrder) {
        dispatch({ type: 'ASSIGN_SPECIFIC_ORDER', payload: state.currentOrder });
      }
      return;
    }

    // Clear from rejected blacklist
    try {
      const rej = getSavedRejectedOrderIds();
      rej.delete(rawId.toLowerCase());
      if (order.rawId) rej.delete(String(order.rawId).toLowerCase());
      if (order.orderNumber) rej.delete(String(order.orderNumber).toLowerCase());
      localStorage.setItem('grabit_rejected_order_ids', JSON.stringify(Array.from(rej)));
    } catch {}

    if (pendingAcceptIdsRef.current.has(rawId)) {
      return; // Short-lived optimistic lock prevents flicker/double tap
    }

    pendingAcceptIdsRef.current.add(rawId);

    try {
      const res: any = await post(`/delivery/${encodeURIComponent(rawId)}/accept`);
      if (res === null || (res && (res.status === 'ok' || res.status === 'success' || res.new_status === 'out_for_delivery' || res.order_id))) {
        if (state.settings.deliveryAlertSound) {
          try { soundEngine.playIncomingOrderAlert(); } catch {}
        }

        // Update local storage cache
        try {
          const loggedRiderId = getAuthenticatedRiderId() || '';
          const storedOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
          if (Array.isArray(storedOrders)) {
            const updated = storedOrders.map((o: any) => {
              if (isSameOrderId(o.id, rawId) || isSameOrderId(o.rawId, rawId) || isSameOrderId(o.orderNumber, rawId)) {
                return { ...o, status: 'out_for_delivery', delivery_agent_id: loggedRiderId };
              }
              return o;
            });
            notifyOrdersUpdated({ orderId: rawId, status: 'out_for_delivery' });
          }
        } catch {}

        prevSyncSigRef.current = '';
        saveCurrentOrderLocal(order);
        saveAgentStatusLocal('ON_DELIVERY');
        dispatch({ type: 'CLEAR_PENDING_OFFER' });
        dispatch({ type: 'ASSIGN_SPECIFIC_ORDER', payload: order });
        // Immediate fetch refresh right after accept
        fetchActiveOrdersRef.current();
      } else {
        showAlert({
          title: 'Order Acceptance Notice',
          message: res?.detail || res?.message || 'Server did not confirm order acceptance.',
          type: 'error',
          buttonText: 'OK'
        });
      }
    } catch (err: any) {
      console.error('Backend accept failed:', err);
      const msg = String(err?.message || '').toLowerCase();
      if (msg.includes('already assigned') || msg.includes('taken by another rider') || msg.includes('409')) {
        showAlert({
          title: '⚡ Order Taken',
          message: 'This order was just accepted by another active delivery partner.',
          type: 'info',
          buttonText: 'OK'
        });
        dispatch({
          type: 'SYNC_ORDERS_POOL',
          payload: state.orderPool.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)
        });
      } else {
        showAlert({
          title: 'Order Acceptance Notice',
          message: err?.message || 'Server error, please retry.',
          type: 'error',
          buttonText: 'OK'
        });
      }
    } finally {
      pendingAcceptIdsRef.current.delete(rawId);
    }
  }, [state.settings.deliveryAlertSound, state.orderPool, showAlert]);

  const rejectOffer = useCallback(async (order: Order) => {
    const rawId = String(order.id || '').trim();
    if (!rawId) return;

    try {
      const res: any = await post(`/delivery/${encodeURIComponent(rawId)}/reject`);
      if (res && res.status === 'cannot_reject') {
        showAlert({
          title: '⚠️ Rejection Restricted',
          message: res?.message || 'No other active delivery riders are online currently. You are the sole active rider on duty, so this order cannot be rejected and must be fulfilled.',
          type: 'warning',
          buttonText: 'Understood'
        });
        return;
      }

      // Record rejected ID in localStorage so it stays rejected across refreshes
      const rejectedSet = getSavedRejectedOrderIds();
      rejectedSet.add(rawId.toLowerCase());
      if (order.orderNumber) rejectedSet.add(String(order.orderNumber).toLowerCase());
      localStorage.setItem('grabit_rejected_order_ids', JSON.stringify(Array.from(rejectedSet)));

      prevSyncSigRef.current = '';
      dispatch({ type: 'CLEAR_PENDING_OFFER' });
      fetchActiveOrdersRef.current();
    } catch (err: any) {
      console.warn('Backend reject failed:', err);
      const msg = String(err?.message || err?.detail || '').toLowerCase();
      if (msg.includes('no other active') || msg.includes('sole active') || msg.includes('cannot be rejected')) {
        showAlert({
          title: '⚠️ Rejection Restricted',
          message: 'No other active delivery riders are online currently. You are the sole active rider on duty, so this order cannot be rejected and must be fulfilled.',
          type: 'warning',
          buttonText: 'Understood'
        });
      } else {
        prevSyncSigRef.current = '';
        dispatch({ type: 'CLEAR_PENDING_OFFER' });
        fetchActiveOrdersRef.current();
      }
    }
  }, [showAlert]);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  const createSupportTicket = useCallback((ticket: { category: SupportTicket['category']; subject: string; description: string }) => {
    dispatch({ type: 'CREATE_SUPPORT_TICKET', payload: ticket });
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET_DEMO' });
  }, []);

  const prevSyncSigRef = useRef<string>('');
  const fetchSeqRef = useRef<number>(0);
  const fetchActiveOrdersRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const isFetchingActiveOrdersRef = useRef<boolean>(false);

  const recordDeliveredOrderIds = (confirmedDeliveredIds: Iterable<string>) => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('grabit_delivered_order_ids') : null;
      let list: string[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list = parsed;
        } catch {}
      }

      const set = new Set(list.map((x) => String(x).toLowerCase().trim()));
      for (const id of confirmedDeliveredIds) {
        if (id) {
          const lower = String(id).toLowerCase().trim();
          set.add(lower);
          if (lower.startsWith('gb-')) {
            set.add(lower.slice(3));
          } else if (/^\d+$/.test(lower)) {
            set.add(`gb-${lower}`);
          }
        }
      }

      let updated = Array.from(set);
      if (updated.length > 500) {
        updated = updated.slice(updated.length - 500);
      }

      localStorage.setItem('grabit_delivered_order_ids', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to record delivered order blacklist:', err);
    }
  };

  // ── Cloud real-time sync: fetch active orders, queue & history ──
  useEffect(() => {
    let isMounted = true;

    const flushOfflineQueue = async () => {
      try {
        const rawQueue = localStorage.getItem('grabit_offline_status_queue') || '[]';
        const queue = JSON.parse(rawQueue);
        if (Array.isArray(queue) && queue.length > 0) {
          const remaining = [];
          for (const item of queue) {
            try {
              await patch(`/orders/${encodeURIComponent(item.orderId)}/status`, {
                status: item.status,
                delivery_agent_id: getAuthenticatedRiderId()
              });
            } catch {
              remaining.push(item);
            }
          }
          localStorage.setItem('grabit_offline_status_queue', JSON.stringify(remaining));
        }
      } catch {}
    };

    const fetchActiveOrders = async () => {
      fetchActiveOrdersRef.current = fetchActiveOrders;
      if (isFetchingActiveOrdersRef.current) {
        return; // In-flight guard: skip poll tick if previous request is still running
      }
      isFetchingActiveOrdersRef.current = true;
      const seq = ++fetchSeqRef.current;

      try {
        flushOfflineQueue().catch(() => {});
        let apiOrders: any[] = [];
        let apiSuccess = false;
        let offerRes: any = null;

        // Combined single-roundtrip endpoint (/delivery/active?include_offer=true)
        const syncRes: any = await get('/delivery/active?include_offer=true').catch(() => null);

        if (seq !== fetchSeqRef.current || !isMounted) {
          return;
        }

        if (syncRes) {
          if (Array.isArray(syncRes)) {
            apiOrders = syncRes;
            apiSuccess = true;
          } else if (syncRes.orders && Array.isArray(syncRes.orders)) {
            apiOrders = syncRes.orders;
            apiSuccess = true;
            offerRes = syncRes.pending_offer;
          }
        }

        const savedActive = getSavedCurrentOrder();
        let isAlreadyActiveOffer = false;
        if (offerRes && offerRes.offer) {
          const mappedOffer = mapApiOrderToOrder(offerRes.offer);
          isAlreadyActiveOffer = Boolean(
            (state.currentOrder && (isSameOrderId(mappedOffer.id, state.currentOrder.id) || isSameOrderId(mappedOffer.orderNumber, state.currentOrder.orderNumber))) ||
            (savedActive && (isSameOrderId(mappedOffer.id, savedActive.id) || isSameOrderId(mappedOffer.orderNumber, savedActive.orderNumber)))
          );
        }

        if (isAlreadyActiveOffer && state.pendingOffer) {
          dispatch({ type: 'CLEAR_PENDING_OFFER' });
        } else if (!isAlreadyActiveOffer && !state.currentOrder && state.agentStatus !== 'ON_DELIVERY' && state.agentStatus !== 'UNAVAILABLE' && offerRes && offerRes.has_offer && offerRes.offer) {
          const mappedOffer = mapApiOrderToOrder(offerRes.offer);
          const rejectedSet = getSavedRejectedOrderIds();
          const deliveredList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
          const isDelivered = Array.isArray(deliveredList) && deliveredList.some((dId: any) => isSameOrderId(dId, mappedOffer.id) || isSameOrderId(dId, mappedOffer.orderNumber));
          const isRejected = rejectedSet.has(String(mappedOffer.id).toLowerCase()) || rejectedSet.has(String(mappedOffer.orderNumber).toLowerCase());

          if (!isDelivered && !isRejected && isStoreOpen && state.agentStatus === 'AVAILABLE' && !state.isLeaveToday) {
            const isSamePending = state.pendingOffer && (isSameOrderId(state.pendingOffer.id, mappedOffer.id) || isSameOrderId(state.pendingOffer.orderNumber, mappedOffer.orderNumber));
            if (!isSamePending && !state.pendingOffer) {
              dispatch({
                type: 'SET_PENDING_OFFER',
                payload: {
                  offer: mappedOffer,
                  expiresAt: offerRes.offer_expires_at,
                  secondsRemaining: offerRes.seconds_remaining || 60
                }
              });
              try { soundEngine.playIncomingOrderAlert(); } catch {}
            }
          }
        } else if (state.pendingOffer && (state.currentOrder || state.agentStatus === 'ON_DELIVERY' || state.agentStatus === 'UNAVAILABLE' || !isStoreOpen || state.isLeaveToday)) {
          dispatch({ type: 'CLEAR_PENDING_OFFER' });
        }

        let localOrders: any[] = [];
        try {
          localOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
          if (!Array.isArray(localOrders)) localOrders = [];
        } catch {}

        // If backend API succeeded, clean stale unassigned mock orders out of localStorage
        if (apiSuccess) {
          const apiIdSet = new Set<string>();
          apiOrders.forEach((o) => {
            if (o.id) {
              apiIdSet.add(String(o.id).toLowerCase().trim());
              apiIdSet.add(extractOrderSuffix(o.id));
            }
            if (o.rawId) {
              apiIdSet.add(String(o.rawId).toLowerCase().trim());
              apiIdSet.add(extractOrderSuffix(o.rawId));
            }
            if (o.orderNumber) {
              apiIdSet.add(String(o.orderNumber).toLowerCase().trim());
              apiIdSet.add(extractOrderSuffix(o.orderNumber));
            }
          });

          // Clean localOrders: keep only user-created active customer orders or confirmed api orders
          const cleanedLocal = localOrders.filter((o: any) => {
            const st = String(o.status || '').toLowerCase().trim();
            if (st === 'delivered' || st === 'cancelled' || st === 'failed_delivery' || st === 'returned') return false;
            const oId = String(o.id || '').toLowerCase().trim();
            const oRaw = String(o.rawId || '').toLowerCase().trim();
            const oNum = String(o.orderNumber || '').toLowerCase().trim();
            const oSuf = extractOrderSuffix(o.id || o.rawId || o.orderNumber);

            const agent = String(o.delivery_agent_id || '').trim();
            // If order in localStorage is unassigned, but backend API didn't return it, it is a stale mock order -> purge it!
            if ((!agent || agent === 'null' || agent === 'None') && !apiIdSet.has(oId) && !apiIdSet.has(oRaw) && !apiIdSet.has(oNum) && (!oSuf || !apiIdSet.has(oSuf))) {
              return false;
            }
            return true;
          });

          if (cleanedLocal.length !== localOrders.length) {
            localStorage.setItem('grabit_orders', JSON.stringify(cleanedLocal));
            localOrders = cleanedLocal;
          }
        }

        // Combine unique orders (put apiOrders FIRST so backend assigned orders override stale local objects)
        const allRaw = [...apiOrders, ...localOrders];
        const seenKeys = new Set<string>();
        const uniqueOrders = [];

        for (const o of allRaw) {
          if (!isValidRealOrder(o)) continue;

          const idKey = String(o.id || '').toLowerCase().trim();
          const rawIdKey = String(o.rawId || '').toLowerCase().trim();
          const sufKey = extractOrderSuffix(o.id || o.rawId || o.orderNumber);
          const custPhone = String(o.customer_phone || o.customer?.phone || '').replace(/\D/g, '');
          const totAmt = String(o.total_amount || o.total || o.totalAmount || '');
          const itemsLen = Array.isArray(o.items) ? o.items.length : 1;
          const fingerprintKey = (custPhone && totAmt) ? `${custPhone}_${totAmt}_${itemsLen}` : '';

          if (
            (idKey && seenKeys.has(idKey)) ||
            (rawIdKey && seenKeys.has(rawIdKey)) ||
            (sufKey && seenKeys.has(sufKey)) ||
            (fingerprintKey && seenKeys.has(fingerprintKey))
          ) {
            continue; // STRICTLY SKIP DUPLICATE ORDER!
          }

          if (idKey) seenKeys.add(idKey);
          if (rawIdKey) seenKeys.add(rawIdKey);
          if (sufKey) seenKeys.add(sufKey);
          if (fingerprintKey) seenKeys.add(fingerprintKey);
          uniqueOrders.push(o);
        }

        if (seq !== fetchSeqRef.current || !isMounted) return;

        // Load set of delivered orders as short-term optimistic UI fallback
        let deliveredIds = new Set<string>();
        try {
          const savedDelivered = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
          if (Array.isArray(savedDelivered)) {
            // Cap at 500 safety limit
            const capped = savedDelivered.length > 500 ? savedDelivered.slice(savedDelivered.length - 500) : savedDelivered;
            deliveredIds = new Set(capped.map((id: any) => String(id).toLowerCase().trim()));
          }
        } catch {}

        // Determine current logged in rider
        let loggedRiderPhone = '';
        let loggedRiderId = '';
        let loggedRiderName = '';
        try {
          const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
          if (u.phone) loggedRiderPhone = String(u.phone).trim();
          if (u.id) loggedRiderId = String(u.id).trim();
          if (u.name || u.full_name) loggedRiderName = String(u.full_name || u.name).trim();
        } catch {}

        const myRiderKeys = new Set<string>();
        if (loggedRiderId) myRiderKeys.add(loggedRiderId.toLowerCase());
        if (loggedRiderPhone) {
          myRiderKeys.add(loggedRiderPhone.toLowerCase());
          const digits = loggedRiderPhone.replace(/\D/g, '');
          if (digits) {
            myRiderKeys.add(digits);
            myRiderKeys.add(`+${digits}`);
          }
        }
        // Add aliases strictly for the currently logged in rider
        const isCurrentKarthik = (loggedRiderPhone && loggedRiderPhone.includes('9999900003')) || (loggedRiderName && loggedRiderName.toLowerCase().includes('karthik')) || (loggedRiderId && loggedRiderId.toLowerCase().includes('d7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a'));
        const isCurrentThabee = (loggedRiderPhone && loggedRiderPhone.includes('9080841727')) || (loggedRiderName && loggedRiderName.toLowerCase().includes('thabee')) || (loggedRiderId && loggedRiderId.toLowerCase().includes('d7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2b'));

        if (isCurrentKarthik) {
          myRiderKeys.add('d7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a');
          myRiderKeys.add('700b1d05-e6f5-4be0-9e57-1d05137b5487');
          myRiderKeys.add('+919999900003');
          myRiderKeys.add('9999900003');
          myRiderKeys.add('karthik rider');
          myRiderKeys.add('karthik');
        } else if (isCurrentThabee) {
          myRiderKeys.add('d7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2b');
          myRiderKeys.add('19c315f7-401b-46f9-8ea6-6796323f0260');
          myRiderKeys.add('+919080841727');
          myRiderKeys.add('9080841727');
          myRiderKeys.add('thabee');
        }

        const assignedRaw: any[] = [];
        const poolRaw: any[] = [];

        for (const o of uniqueOrders) {
          const st = String(o.status || '').toLowerCase().trim();
          if (st === 'delivered' || st === 'cancelled' || st === 'failed_delivery' || st === 'returned') continue;

          const oid = String(o.id || '').toLowerCase().trim();
          const oraw = String(o.rawId || '').toLowerCase().trim();

          let isDelivered = false;
          for (const dId of deliveredIds) {
            if (isSameOrderId(dId, o.id) || isSameOrderId(dId, o.rawId) || isSameOrderId(dId, o.orderNumber)) {
              isDelivered = true;
              break;
            }
          }
          if (isDelivered) {
            continue; // ALREADY DELIVERED! STRICTLY SKIP!
          }

          // Skip orders explicitly rejected by rider
          const rejectedSet = getSavedRejectedOrderIds();
          if (rejectedSet.has(oid) || rejectedSet.has(oraw) || (o.orderNumber && rejectedSet.has(String(o.orderNumber).toLowerCase()))) {
            continue;
          }

          // Skip orders currently locked in pendingAcceptIds to prevent flicker
          if (pendingAcceptIdsRef.current.has(oid) || pendingAcceptIdsRef.current.has(oraw)) {
            continue;
          }

          const agent1 = String(o.delivery_agent_id || o.deliveryAgentId || o.agentId || '').trim().toLowerCase();
          const agent2 = String(o.rider_name || o.riderName || o.assigned_rider || '').trim().toLowerCase();
          const isAssignedToMe = Boolean((agent1 && myRiderKeys.has(agent1)) || (agent2 && myRiderKeys.has(agent2)));

          if (isAssignedToMe) {
            assignedRaw.push(o);
          } else if (!agent1 && !agent2) {
            if (st !== 'delivered' && st !== 'cancelled' && st !== 'failed_delivery' && st !== 'returned') {
              poolRaw.push(o);
            }
          }
        }

        let poolOrders = poolRaw.map(mapApiOrderToOrder);
        let assignedOrders = assignedRaw.map(mapApiOrderToOrder);

        // Check if current rider is verified
        const isVerified = true;

        // Single active delivery rule:
        let activeOrder: Order | null = null;
        let queuedOrders: Order[] = [];

        const checkIsDelivered = (ord: any): boolean => {
          if (!ord) return true;
          const dList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
          const inHistory = (state.history || []).some((h) =>
            isSameOrderId(h.orderId, ord.id) || isSameOrderId(h.orderNumber, ord.orderNumber)
          );
          return inHistory || (Array.isArray(dList) && dList.some((dId: any) => isSameOrderId(dId, ord.id) || isSameOrderId(dId, ord.orderNumber)));
        };

        const activeCandidate = (state.currentOrder && !checkIsDelivered(state.currentOrder))
          ? state.currentOrder
          : (!checkIsDelivered(getSavedCurrentOrder()) ? getSavedCurrentOrder() : null);

        if (activeCandidate && assignedOrders.some(o => isSameOrderId(o.id, activeCandidate.id) || isSameOrderId(o.orderNumber, activeCandidate.orderNumber))) {
          // Rider is legitimately working on an active accepted delivery: preserve activeOrder!
          const currentId = activeCandidate.id;
          const currentNum = activeCandidate.orderNumber;
          const matchedCurrent = assignedOrders.find(o => isSameOrderId(o.id, currentId) || isSameOrderId(o.orderNumber, currentNum));
          activeOrder = matchedCurrent ? { ...activeCandidate, ...matchedCurrent, isQueued: false } : activeCandidate;

          const waiting = assignedOrders.filter(o => !isSameOrderId(o.id, currentId) && !isSameOrderId(o.orderNumber, currentNum));
          queuedOrders = waiting.map((o, idx) => ({
            ...o,
            isQueued: true,
            queuePosition: idx + 1
          }));

          if (state.pendingOffer) {
            dispatch({ type: 'CLEAR_PENDING_OFFER' });
          }
        } else if (assignedOrders.length > 0) {
          // Orders explicitly assigned to this rider by Seller: activate first order and queue remainder
          const firstAssigned = assignedOrders[0];
          const rejectedSet = getSavedRejectedOrderIds();
          const isRejected = rejectedSet.has(String(firstAssigned.id).toLowerCase()) ||
                             rejectedSet.has(String(firstAssigned.orderNumber).toLowerCase()) ||
                             (firstAssigned.rawId && rejectedSet.has(String(firstAssigned.rawId).toLowerCase()));

          const inHistory = (state.history || []).some((h) =>
            isSameOrderId(h.orderId, firstAssigned.id) || isSameOrderId(h.orderNumber, firstAssigned.orderNumber)
          );
          const isDelivered = inHistory || Array.from(deliveredIds).some((dId) =>
            isSameOrderId(dId, firstAssigned.id) || isSameOrderId(dId, firstAssigned.orderNumber)
          );

          if (!isRejected && !isDelivered) {
            activeOrder = { ...firstAssigned, isQueued: false };
            saveCurrentOrderLocal(activeOrder);
            queuedOrders = assignedOrders.slice(1).map((o, idx) => ({
              ...o,
              isQueued: true,
              queuePosition: idx + 1
            }));
            if (state.pendingOffer) {
              dispatch({ type: 'CLEAR_PENDING_OFFER' });
            }
          }
        }

        // Check if data signature changed before dispatching
        const newSig = `act:${activeOrder?.id || 'none'}_q:${queuedOrders.map(q => q.id).join(',')}_p:${poolOrders.map(p => p.id).join(',')}`;
        if (prevSyncSigRef.current !== newSig) {
          prevSyncSigRef.current = newSig;
          dispatch({
            type: 'SYNC_DELIVERY_ORDERS',
            payload: { activeOrder, queuedOrders, poolOrders }
          });
        }

        // Status Hydration: ensure rider status aligns with active order
        if (activeOrder) {
          if (state.agentStatus !== 'ON_DELIVERY') {
            saveAgentStatusLocal('ON_DELIVERY');
            dispatch({ type: 'SET_AGENT_STATUS', payload: 'ON_DELIVERY' });
          }
        }
      } catch (err) {
        console.warn('Delivery fetch sync fallback:', err);
      } finally {
        isFetchingActiveOrdersRef.current = false;
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await get('/delivery/history');
        if (!isMounted) return;
        const cloudEntries = Array.isArray(res) ? res.map(mapApiOrderToHistoryEntry) : [];

        // Record all authoritatively confirmed delivered IDs into delivered blacklist
        const confirmedSet = new Set<string>();
        cloudEntries.forEach((e: any) => {
          if (e.orderId) confirmedSet.add(String(e.orderId));
          if (e.orderNumber) confirmedSet.add(String(e.orderNumber));
        });
        recordDeliveredOrderIds(confirmedSet);

        const existingIds = new Set(cloudEntries.map((e: any) => e.orderId));
        const savedLocal = getSavedHistory();
        const merged = [...cloudEntries, ...savedLocal.filter((l) => !existingIds.has(l.orderId))];
        dispatch({ type: 'SYNC_CLOUD_HISTORY', payload: merged });

        if (savedLocal.length > 0 && !historySyncDisabledRef.current) {
          post('/delivery/history/sync', { history: savedLocal }).then((syncRes) => {
            if (syncRes === null) historySyncDisabledRef.current = true;
          }).catch(() => {
            historySyncDisabledRef.current = true;
          });
        }
      } catch {
        if (isMounted) {
          const savedLocal = getSavedHistory();
          dispatch({ type: 'SYNC_CLOUD_HISTORY', payload: savedLocal });
          if (savedLocal.length > 0 && !historySyncDisabledRef.current) {
            post('/delivery/history/sync', { history: savedLocal }).then((syncRes) => {
              if (syncRes === null) historySyncDisabledRef.current = true;
            }).catch(() => {
              historySyncDisabledRef.current = true;
            });
          }
        }
      }
    };

    // Initial load
    fetchActiveOrders();
    fetchHistory();

    // Real-time WebSocket connection
    let ws: WebSocket | null = null;
    try {
      const isDev = window.location.port === '5173' || window.location.hostname === 'localhost';
      const apiHost = (import.meta.env.VITE_API_URL || 'https://grabit-api.vercel.app').replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
      const wsUrl = isDev
        ? 'ws://localhost:8000/api/delivery/ws'
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiHost}/api/delivery/ws`;

      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ORDER_PULSE') {
            fetchActiveOrders();
          }
        } catch {}
      };

      ws.onerror = () => {
        // Silent handler to avoid noisy console errors on hot reloads
      };
    } catch {}

    // Polling interval (5000ms) with in-flight guard to prevent request overlap
    const activeInterval = setInterval(fetchActiveOrders, 5000);
    const historyInterval = setInterval(fetchHistory, 15000);

    const unsubscribeOrders = subscribeOrdersUpdated(() => fetchActiveOrders());

    return () => {
      isMounted = false;
      if (ws) {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => {
            try { ws.close(); } catch {}
          };
        } else if (ws.readyState === WebSocket.OPEN) {
          try { ws.close(); } catch {}
        }
      }
      clearInterval(activeInterval);
      clearInterval(historyInterval);
      unsubscribeOrders();
    };
  }, []);

  const transferPayout = useCallback((amount: number, bankUpi: string) => {
    try {
      soundEngine.playSuccessChime();
    } catch {}
    dispatch({ type: 'TRANSFER_PAYOUT', payload: { amount, bankUpi } });
  }, []);

  const redeemIncentive = useCallback((campaignId: string, amount: number) => {
    try {
      soundEngine.playSuccessChime();
    } catch {}
    dispatch({ type: 'REDEEM_INCENTIVE', payload: { campaignId, amount } });
  }, []);

  // Active shift timer tick (runs every second when active)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_ACTIVE_SHIFT' });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ITEM 4 60-second offer countdown timer tick
  useEffect(() => {
    if (state.pendingOffer && state.pendingOfferExpiresAt) {
      const interval = setInterval(() => {
        const rem = Math.max(0, Math.ceil((new Date(state.pendingOfferExpiresAt!).getTime() - Date.now()) / 1000));
        if (rem <= 0) {
          const expiredOfferId = state.pendingOffer?.id;
          dispatch({ type: 'CLEAR_PENDING_OFFER' });
          if (expiredOfferId) {
            post(`/delivery/${encodeURIComponent(expiredOfferId)}/reject`).catch(() => {});
          }
        } else {
          dispatch({ type: 'TICK_OFFER_COUNTDOWN' });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [state.pendingOffer, state.pendingOfferExpiresAt]);



  // Feature 3: Monitor connectivity loss during active delivery (>30s)
  useEffect(() => {
    if (state.agentStatus !== 'ON_DELIVERY') {
      connectivityLostAtRef.current = null;
      if (offlineDeliveryTimerRef.current) {
        clearTimeout(offlineDeliveryTimerRef.current);
        offlineDeliveryTimerRef.current = null;
      }
      return;
    }

    const handleDeliveryOffline = () => {
      if (!offlineDeliveryTimerRef.current) {
        const lostTimeIso = new Date().toISOString();
        offlineDeliveryTimerRef.current = setTimeout(() => {
          connectivityLostAtRef.current = lostTimeIso;
          try {
            if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
              const riderId = getAuthenticatedRiderId();
              if (riderId) {
                const blob = new Blob([JSON.stringify({
                  agent_id: riderId,
                  status: 'ON_DELIVERY',
                  connectivity_lost_at: lostTimeIso
                })], { type: 'application/json' });
                navigator.sendBeacon('/api/delivery/presence', blob);
              }
            }
          } catch {}
        }, 30000);
      }
    };

    const handleDeliveryOnline = () => {
      if (offlineDeliveryTimerRef.current) {
        clearTimeout(offlineDeliveryTimerRef.current);
        offlineDeliveryTimerRef.current = null;
      }
      if (connectivityLostAtRef.current) {
        sendPresenceUpdate('ON_DELIVERY');
      }
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleDeliveryOffline();
    }

    window.addEventListener('offline', handleDeliveryOffline);
    window.addEventListener('online', handleDeliveryOnline);

    return () => {
      window.removeEventListener('offline', handleDeliveryOffline);
      window.removeEventListener('online', handleDeliveryOnline);
    };
  }, [state.agentStatus, sendPresenceUpdate]);

  // Offline status queue flush on reconnect (Item 6)
  useEffect(() => {
    const flushOfflineStatusQueue = async () => {
      try {
        const rawQueue = localStorage.getItem('grabit_offline_status_queue');
        if (!rawQueue) return;
        const queue = JSON.parse(rawQueue);
        if (!Array.isArray(queue) || queue.length === 0) return;

        localStorage.removeItem('grabit_offline_status_queue');
        for (const item of queue) {
          if (item && item.orderId && item.status) {
            await patchWithRetry(`/orders/${encodeURIComponent(item.orderId)}/status`, {
              status: item.status
            });
          }
        }
      } catch {}
    };

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      flushOfflineStatusQueue();
    }
    window.addEventListener('online', flushOfflineStatusQueue);
    return () => window.removeEventListener('online', flushOfflineStatusQueue);
  }, [patchWithRetry]);

  return (
    <DeliveryContext.Provider
      value={{
        state,
        dispatch,
        advanceStatus,
        completeDelivery,
        reportIssue,
        setAgentStatus,
        toggleAvailability,
        confirmGoOffline,
        openModal,
        closeModal,
        forceDispatchNow,
        acceptOrder,
        rejectOffer,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        createSupportTicket,
        updateSettings,
        transferPayout,
        redeemIncentive,
        resetDemo,
        showAlert,
        closeAlert,
        unreadCount,
        storeHours,
        isStoreOpen
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};
