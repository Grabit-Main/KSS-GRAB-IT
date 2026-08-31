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

// ── Cloud API helpers ─────────────────────────────────────────────────────
// Map a raw Supabase order record to a delivery Order object
const mapApiOrderToOrder = (o: any, idx: number): Order => {
  const rawItems = parseItems(o.items);
  const itemObjs = rawItems.length > 0
    ? rawItems.map((it: any, iIdx: number) => ({
        id: `item-${iIdx}`,
        name: it.name || it.product_name || 'Express Grocery Item',
        quantity: Number(it.qty || it.quantity) || 1,
        price: Number(it.price || it.unit_price) || 50,
        category: 'Snacks' as const
      }))
    : [{ id: 'item-0', name: 'Express Grocery Item', quantity: 1, price: Number(o.total_amount || o.total || 199), category: 'Snacks' as const }];

// Helper to generate deterministic distance strictly within 5km hub radius (1.1 km – 4.7 km)
const getDistanceWithin5Km = (idStr: string | number): number => {
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

  const orderNum = formatOrderId(o.id || o.orderNumber || o.rawId);
  const st = String(o.status || '').toLowerCase();
  let orderStatus: OrderStatus = 'ASSIGNED';
  if (st === 'out_for_delivery' || st === 'out-for-delivery') orderStatus = 'OUT_FOR_DELIVERY';
  else if (st === 'delivered') orderStatus = 'DELIVERED';
  else if (st === 'failed_delivery') orderStatus = 'FAILED_DELIVERY';
  else if (st === 'returned') orderStatus = 'RETURNED';

  const orderDist = o.distance_km || o.distanceKm || getDistanceWithin5Km(o.id || o.orderNumber || idx);

  return {
    id: o.rawId || o.id || `live-ord-${idx}`,
    orderNumber: orderNum,
    status: orderStatus,
    supermarketId: 'STORE-001' as const,
    merchant: grabitSupermarket,
    customer: {
      id: `CUST-${idx}`,
      name: o.customer_name || 'Customer',
      phone: o.customer_phone || '',
      address: o.delivery_address || o.address || 'Delivery Address',
      landmark: 'Customer Location',
      deliveryNotes: '10-minute instant delivery',
      coordinates: { x: 260, y: 190, lat: 12.9340, lng: 77.6200 }
    },
    items: itemObjs,
    paymentMethod: (o.payment_method === 'COD' || String(o.payment_method || '').toUpperCase().includes('COD') ? 'COD' : 'PREPAID') as any,
    totalAmount: Number(o.total_amount || o.total || 0) || 199,
    distanceKm: orderDist,
    estimatedMinutes: Math.min(15, Math.round(orderDist * 3 + 4))
  };
};

const isTodayHistoryEntry = (h: DeliveryHistoryEntry): boolean => {
  if (!h) return false;
  const isoStr = h.completedAtISO || (h as any).dateIso || (h as any).created_at;
  if (isoStr) {
    try {
      const entryDate = new Date(isoStr);
      if (!isNaN(entryDate.getTime())) {
        return entryDate.toDateString() === new Date().toDateString();
      }
    } catch {}
  }
  if (h.timestamp === 'Just now' || /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test((h.timestamp || '').trim())) {
    return true;
  }
  return false;
};

const deriveStatsFromHistory = (history: DeliveryHistoryEntry[], baseStats: DeliveryStats): DeliveryStats => {
  const completedToday = history.filter((h) => h.status === 'DELIVERED' && isTodayHistoryEntry(h)).length;
  const totalDeliveries = history.length;

  return {
    ...baseStats,
    totalDeliveries,
    completedToday
  };
};

const mergeHistoryEntries = (local: DeliveryHistoryEntry[], cloud: DeliveryHistoryEntry[]): DeliveryHistoryEntry[] => {
  const map = new Map<string, DeliveryHistoryEntry>();

  const getDedupeKey = (e: DeliveryHistoryEntry, idx: number): string => {
    const numKey = formatOrderId(e.orderNumber || e.orderId).toLowerCase().trim();
    if (numKey) return `num:${numKey}`;
    const idKey = String(e.orderId || '').toLowerCase().trim();
    if (idKey) return `id:${idKey}`;
    return `idx:${idx}_${Date.now()}`;
  };

  (local || []).forEach((entry, i) => {
    const key = getDedupeKey(entry, i);
    map.set(key, entry);
  });

  (cloud || []).forEach((entry, i) => {
    const key = getDedupeKey(entry, i);
    if (!map.has(key)) {
      map.set(key, entry);
    } else {
      const existing = map.get(key)!;
      map.set(key, { ...existing, ...entry });
    }
  });

  return Array.from(map.values());
};

// Map a raw delivered Supabase order to a DeliveryHistoryEntry
const mapApiOrderToHistoryEntry = (o: any): DeliveryHistoryEntry => {
  const dist = o.distance_km || o.distanceKm || getDistanceWithin5Km(o.id || o.orderNumber || o.created_at || 'hist');
  const tot = Number(o.total_amount || o.total || 0);
  const earn = Number(o.earning || (tot > 0 ? 55 + dist * 10 : 65));
  return {
    orderId: o.id || o.rawId || '',
    orderNumber: formatOrderId(o.id || o.orderNumber || o.rawId),
    supermarketName: 'GrabIt Supermarket',
    customerName: o.customer_name || 'Customer',
    deliveryLocation: o.delivery_address || o.address || 'Delivery Address',
    status: 'DELIVERED',
    timestamp: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered',
    completedAtISO: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
    totalAmount: tot,
    paymentMethod: (o.payment_method === 'COD' || String(o.payment_method || '').toUpperCase().includes('COD') ? 'COD' : 'PREPAID') as any,
    distanceKm: dist,
    durationMinutes: Math.min(18, Math.round(dist * 3 + 5)),
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
  activeModal: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS' | null;
  successOrderSummary: Order | null;
}

type DeliveryAction =
  | { type: 'SET_AGENT_STATUS'; payload: AgentStatus }
  | { type: 'CLEAR_INCOMING_ORDER' }
  | { type: 'ADVANCE_ORDER_STATUS'; payload: OrderStatus }
  | { type: 'COMPLETE_DELIVERY'; payload: { pod: ProofOfDelivery } }
  | { type: 'REPORT_ISSUE'; payload: IssueReport }
  | { type: 'OPEN_MODAL'; payload: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'FORCE_DISPATCH_NOW' }
  | { type: 'ASSIGN_SPECIFIC_ORDER'; payload: Order }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CREATE_SUPPORT_TICKET'; payload: { category: SupportTicket['category']; subject: string; description: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'TRANSFER_PAYOUT'; payload: { amount: number; bankUpi: string } }
  | { type: 'REDEEM_INCENTIVE'; payload: { campaignId: string; amount: number } }
  | { type: 'RESET_DEMO' }
  | { type: 'SYNC_ORDERS_POOL'; payload: Order[] }
  | { type: 'SYNC_DELIVERY_ORDERS'; payload: { activeOrder?: Order | null; queuedOrders: Order[]; poolOrders: Order[] } }
  | { type: 'SYNC_CLOUD_HISTORY'; payload: DeliveryHistoryEntry[] };

const getSavedPayouts = (): PayoutTransfer[] => {
  try {
    let riderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
    try {
      const u = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('grabit_user') || '{}' : '{}');
      if (u.id) riderId = String(u.id);
      else if (u.phone) riderId = String(u.phone);
    } catch {}

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
    let riderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
    try {
      const u = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('grabit_user') || '{}' : '{}');
      if (u.id) riderId = String(u.id);
      else if (u.phone) riderId = String(u.phone);
    } catch {}

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
    let riderId = 'default';
    try {
      const u = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('grabit_user') || '{}' : '{}');
      if (u.id) riderId = String(u.id);
      else if (u.phone) riderId = String(u.phone);
    } catch {}

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

const initialHistoryEntries = getSavedHistory();

const initialDeliveryState: DeliveryState = {
  agentStatus: 'AVAILABLE',
  currentOrder: null,
  queuedOrders: [],
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
    activeShiftMinutes: 0
  }),
  notifications: getSavedNotifications(),
  supportTickets: getSavedSupportTickets(),
  settings: { ...initialSettings },
  incentiveCampaigns: initialIncentiveCampaigns.map((c) => ({
    ...c,
    isRedeemed: getSavedRedeemedCampaigns().includes(c.id)
  })),
  activeModal: null,
  successOrderSummary: null
};

function deliveryReducer(state: DeliveryState, action: DeliveryAction): DeliveryState {
  switch (action.type) {
    case 'SET_AGENT_STATUS': {
      return {
        ...state,
        agentStatus: action.payload
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
        let riderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
        const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
        if (u.id) riderId = String(u.id);
        else if (u.phone) riderId = String(u.phone);
        localStorage.setItem(`grabit_delivery_history_${riderId}`, JSON.stringify(newHistory));

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
      let nextActive: Order | null = null;
      let nextQueue: Order[] = [];
      let nextAgentStatus: AgentStatus = 'AVAILABLE';
      let queueNotif: AppNotification | null = null;

      if (state.queuedOrders && state.queuedOrders.length > 0) {
        const firstQueued = state.queuedOrders[0];
        nextActive = {
          ...firstQueued,
          status: 'ASSIGNED',
          isQueued: false,
          queuePosition: undefined,
          assignedAt: nowTime
        };
        nextQueue = state.queuedOrders.slice(1).map((o, idx) => ({
          ...o,
          queuePosition: idx + 1
        }));
        nextAgentStatus = 'ON_DELIVERY';
        queueNotif = {
          id: `n-next-${Date.now()}`,
          type: 'DISPATCH',
          title: `🚀 Next Order Activated (${nextActive.orderNumber})`,
          description: `Order ${nextActive.orderNumber} is now your active delivery. Head to GrabIt Supermarket Dispatch Bay 3!`,
          timestamp: 'Just now',
          isRead: false
        };
      }

      return {
        ...state,
        agentStatus: nextAgentStatus,
        currentOrder: nextActive,
        queuedOrders: nextQueue,
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
      let riderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
      try {
        const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
        if (u.id) riderId = String(u.id);
        else if (u.phone) riderId = String(u.phone);
      } catch {}

      const key = `grabit_redeemed_incentives_${riderId}`;
      const redeemedIds = getSavedRedeemedCampaigns();
      if (!redeemedIds.includes(campaignId)) {
        redeemedIds.push(campaignId);
        try {
          localStorage.setItem(key, JSON.stringify(redeemedIds));
        } catch {}
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
      // If already on delivery, retain current active delivery state so progress isn't interrupted
      if (state.agentStatus === 'ON_DELIVERY' && state.currentOrder) {
        return {
          ...state,
          queuedOrders,
          orderPool: poolOrders
        };
      }
      // If rider is currently viewing delivery success modal, do not re-assign
      if (state.activeModal === 'DELIVERY_SUCCESS') {
        return {
          ...state,
          queuedOrders,
          orderPool: poolOrders
        };
      }
      // If rider was available and has received an assigned active order from seller
      if (activeOrder) {
        let isDelivered = false;
        try {
          const dList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
          const dSet = new Set(Array.isArray(dList) ? dList.map((x: any) => String(x).toLowerCase().trim()) : []);
          const aId = String(activeOrder.id || '').toLowerCase().trim();
          const aNum = String(activeOrder.orderNumber || '').toLowerCase().trim();
          const aFmt = formatOrderId(activeOrder.orderNumber || activeOrder.id).toLowerCase().trim();

          const inHistory = (state.history || []).some(h => {
            const hNum = formatOrderId(h.orderNumber || h.orderId).toLowerCase().trim();
            const hId = String(h.orderId || '').toLowerCase().trim();
            return (aFmt && hNum === aFmt) || (hId && hId === aId) || (hNum && hNum === aNum);
          });

          if (dSet.has(aId) || dSet.has(aNum) || (aFmt && dSet.has(aFmt)) || inHistory) {
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
      return {
        ...state,
        agentStatus: state.currentOrder ? state.agentStatus : 'AVAILABLE',
        currentOrder: state.currentOrder && (state.history || []).some(h => formatOrderId(h.orderNumber || h.orderId).toLowerCase().trim() === formatOrderId(state.currentOrder?.orderNumber || state.currentOrder?.id).toLowerCase().trim()) ? null : state.currentOrder,
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
      let riderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
      try {
        const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
        if (u.id) riderId = String(u.id);
        else if (u.phone) riderId = String(u.phone);
      } catch {}

      const key = `grabit_delivery_history_${riderId}`;
      const cloudEntries = action.payload;
      const mergedEntries = mergeHistoryEntries(state.history, cloudEntries);
      try {
        localStorage.setItem(key, JSON.stringify(mergedEntries));
      } catch {}

      const derivedStats = deriveStatsFromHistory(mergedEntries, state.stats);

      return {
        ...state,
        history: mergedEntries,
        stats: derivedStats
      };
    }

    case 'TRANSFER_PAYOUT': {
      let riderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
      try {
        const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
        if (u.id) riderId = String(u.id);
        else if (u.phone) riderId = String(u.phone);
      } catch {}

      const key = `grabit_payout_transfers_${riderId}`;
      const now = new Date();
      const newTransfer: PayoutTransfer = {
        id: `TXN-UPI-${Date.now()}`,
        amount: action.payload.amount,
        bankUpi: action.payload.bankUpi,
        timestamp: now.toISOString(),
        dateFormatted: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: 'SUCCESS'
      };

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
  openModal: (modal: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS') => void;
  closeModal: () => void;
  forceDispatchNow: () => void;
  acceptOrder: (order: Order) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  createSupportTicket: (ticket: { category: SupportTicket['category']; subject: string; description: string }) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  transferPayout: (amount: number, bankUpi: string) => void;
  resetDemo: () => void;
  unreadCount: number;
}

const DeliveryContext = createContext<DeliveryContextValue | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(deliveryReducer, initialDeliveryState);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const unreadCount = state.notifications.filter((n) => !n.isRead).length;

  // Actions
  const advanceStatus = useCallback((next: OrderStatus) => {
    soundEngine.playStepAdvance();
    dispatch({ type: 'ADVANCE_ORDER_STATUS', payload: next });
    // Persist status change to cloud only
    const rawId = state.currentOrder?.id;
    if (rawId) {
      patch(`/orders/${encodeURIComponent(rawId)}/status`, {
        status: next === 'DELIVERED' ? 'delivered' : 'out_for_delivery'
      }).catch(() => {});
    }
  }, [state.currentOrder]);

  const completeDelivery = useCallback((pod: ProofOfDelivery) => {
    soundEngine.playSuccessChime();
    const deliveredOrder = state.currentOrder;
    dispatch({ type: 'COMPLETE_DELIVERY', payload: { pod } });

    if (deliveredOrder) {
      const rawId = String(deliveredOrder.id || '');
      const orderNum = String(deliveredOrder.orderNumber || '');

      let loggedRiderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
      try {
        const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
        if (u.id) loggedRiderId = String(u.id);
      } catch {}

      // 1. Mark in delivered IDs set so polling never brings it back
      try {
        const deliveredList = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
        const deliveredSet = new Set(Array.isArray(deliveredList) ? deliveredList.map((x: any) => String(x).toLowerCase().trim()) : []);
        if (rawId) deliveredSet.add(rawId.toLowerCase().trim());
        if (orderNum) deliveredSet.add(orderNum.toLowerCase().trim());
        localStorage.setItem('grabit_delivered_order_ids', JSON.stringify(Array.from(deliveredSet)));
      } catch {}

      // 2. Mark as delivered in grabit_orders
      try {
        const storedOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        if (Array.isArray(storedOrders)) {
          const updatedOrders = storedOrders.map((o: any) => {
            const oId = String(o.id || '').toLowerCase().trim();
            const oRaw = String(o.rawId || '').toLowerCase().trim();
            const oNum = String(o.orderNumber || '').toLowerCase().trim();
            const rLower = rawId.toLowerCase().trim();
            const nLower = orderNum.toLowerCase().trim();

            if (oId === rLower || oId === nLower || oRaw === rLower || oRaw === nLower || oNum === rLower || oNum === nLower) {
              return { ...o, status: 'delivered', delivery_agent_id: loggedRiderId };
            }
            return o;
          });
          localStorage.setItem('grabit_orders', JSON.stringify(updatedOrders));
        }

        // 3. Mark as delivered in all user-specific order stores (grabit_orders_<phone>)
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('grabit_orders_')) {
            try {
              const uOrders = JSON.parse(localStorage.getItem(k) || '[]');
              if (Array.isArray(uOrders)) {
                const updatedU = uOrders.map((uo: any) => {
                  const uId = String(uo.id || '').toLowerCase().trim();
                  const uRaw = String(uo.rawId || '').toLowerCase().trim();
                  const uNum = String(uo.orderNumber || '').toLowerCase().trim();
                  const rLower = rawId.toLowerCase().trim();
                  const nLower = orderNum.toLowerCase().trim();

                  if (uId === rLower || uId === nLower || uRaw === rLower || uRaw === nLower || uNum === rLower || uNum === nLower) {
                    return { ...uo, status: 'delivered', delivery_agent_id: loggedRiderId };
                  }
                  return uo;
                });
                localStorage.setItem(k, JSON.stringify(updatedU));
              }
            } catch {}
          }
        }

        window.dispatchEvent(new Event('grabit_orders_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      // 4. Persist delivered status to cloud
      if (rawId) {
        patch(`/orders/${encodeURIComponent(rawId)}/status`, {
          status: 'delivered',
          delivery_agent_id: loggedRiderId
        })
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
          .catch(() => {});
      }
    }
  }, [state.currentOrder]);

  const reportIssue = useCallback((issue: IssueReport) => {
    soundEngine.playWarning();
    dispatch({ type: 'REPORT_ISSUE', payload: issue });
  }, []);

  const setAgentStatus = useCallback((status: AgentStatus) => {
    dispatch({ type: 'SET_AGENT_STATUS', payload: status });
  }, []);

  const toggleAvailability = useCallback(() => {
    if (state.agentStatus === 'ON_DELIVERY') {
      soundEngine.playWarning();
      return;
    }
    const isVerified = true;

    if (!isVerified) {
      soundEngine.playWarning();
      alert('🔒 Verification Required: You cannot go Online until your clearance documents and facial biometrics are verified. Please check your Profile tab.');
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
      return;
    }

    if (state.agentStatus === 'AVAILABLE') {
      soundEngine.playStepAdvance();
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
      dispatch({ type: 'CLEAR_INCOMING_ORDER' });
    } else {
      soundEngine.playIncomingOrderAlert();
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'AVAILABLE' });
    }
  }, [state.agentStatus]);

  // Strict Verification Guard: Keep rider active when online
  useEffect(() => {
    try {
      const isFullyVerified = true;

      if (!isFullyVerified && state.agentStatus !== 'UNAVAILABLE') {
        dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
        try {
          localStorage.setItem('grabit_delivery_agent_status', 'UNAVAILABLE');
        } catch {}
      }
    } catch {}
  }, [state.agentStatus]);

  const openModal = useCallback((modal: 'CALL' | 'CHAT' | 'MERCHANT_CALL' | 'SOS' | 'REPORT_ISSUE' | 'POD' | 'DELIVERY_SUCCESS' | 'INCENTIVE_DETAILS') => {
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

  const acceptOrder = useCallback(async (order: Order) => {
    const isVerified = true;

    if (!isVerified) {
      alert('🔒 Verification Required: You must complete document upload and verification in Profile before accepting orders.');
      return;
    }

    const rawId = order.id;
    if (!rawId) return;
    try {
      // Tell backend this rider is accepting the order
      await post(`/delivery/${encodeURIComponent(rawId)}/accept`);
    } catch (err) {
      console.warn('Backend accept failed:', err);
    }
    if (state.settings.deliveryAlertSound) {
      soundEngine.playIncomingOrderAlert();
    }
    dispatch({ type: 'ASSIGN_SPECIFIC_ORDER', payload: order });
  }, [state.settings.deliveryAlertSound]);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
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

  // ── Cloud real-time sync: fetch active orders, queue & history ──
  useEffect(() => {
    let isMounted = true;

    const fetchActiveOrders = async () => {
      try {
        let apiOrders: any[] = [];
        try {
          const res = await get('/delivery/active');
          if (Array.isArray(res)) apiOrders = res;
        } catch {}

        let localOrders: any[] = [];
        try {
          localOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
          if (!Array.isArray(localOrders)) localOrders = [];
        } catch {}

        // Combine unique orders, ensuring initial seller orders pool is always available
        const allRaw = [...localOrders, ...apiOrders, ...initialOrdersPool];
        const seenKeys = new Set<string>();
        const uniqueOrders = [];

        for (const o of allRaw) {
          if (!isValidRealOrder(o)) continue;

          const numKey = formatOrderId(o.orderNumber || o.id || o.rawId).toLowerCase().trim();
          const idKey = String(o.id || '').toLowerCase().trim();
          const rawIdKey = String(o.rawId || '').toLowerCase().trim();

          if (
            (numKey && seenKeys.has(numKey)) ||
            (idKey && seenKeys.has(idKey)) ||
            (rawIdKey && seenKeys.has(rawIdKey))
          ) {
            continue; // STRICTLY SKIP DUPLICATE ORDER!
          }

          if (numKey) seenKeys.add(numKey);
          if (idKey) seenKeys.add(idKey);
          if (rawIdKey) seenKeys.add(rawIdKey);
          uniqueOrders.push(o);
        }

        if (!isMounted) return;

        // Load set of delivered orders to strictly prevent re-assigning finished deliveries
        let deliveredIds = new Set<string>();
        try {
          const savedDelivered = JSON.parse(localStorage.getItem('grabit_delivered_order_ids') || '[]');
          if (Array.isArray(savedDelivered)) {
            deliveredIds = new Set(savedDelivered.map((id: any) => String(id).toLowerCase().trim()));
          }
        } catch {}

        // Determine current logged in rider
        let loggedRiderPhone = '+919999900003';
        let loggedRiderId = 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a';
        try {
          const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
          if (u.phone) loggedRiderPhone = u.phone;
          if (u.id) loggedRiderId = String(u.id);
        } catch {}

        const assignedRaw: any[] = [];
        const poolRaw: any[] = [];

        for (const o of uniqueOrders) {
          const st = String(o.status || '').toLowerCase().trim();
          if (st === 'delivered' || st === 'cancelled') continue;

          const oid = String(o.id || '').toLowerCase().trim();
          const oraw = String(o.rawId || '').toLowerCase().trim();
          const onum = String(o.orderNumber || '').toLowerCase().trim();
          const ofmt = formatOrderId(o.orderNumber || o.id || o.rawId).toLowerCase().trim();

          if (
            deliveredIds.has(oid) ||
            deliveredIds.has(oraw) ||
            deliveredIds.has(onum) ||
            (ofmt && deliveredIds.has(ofmt))
          ) {
            continue; // ALREADY DELIVERED! STRICTLY SKIP!
          }

          const agent = String(o.delivery_agent_id || '').trim();
          if (
            agent &&
            (agent === loggedRiderId || agent === loggedRiderPhone)
          ) {
            assignedRaw.push(o);
          } else if (!agent || agent === 'null' || agent === 'None') {
            poolRaw.push(o);
          }
        }

        let poolOrders = poolRaw.map(mapApiOrderToOrder);
        let assignedOrders = assignedRaw.map(mapApiOrderToOrder);

        // Check if current rider is verified
        const isVerified = (() => {
          try {
            const u = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('grabit_user') || '{}' : '{}');
            if (u.partnerVerified === true) return true;
            const clearances = u.clearances || {};
            const ts = u.clearanceTimestamps || u.clearance_timestamps || {};
            const ONE_HOUR = 60 * 60 * 1000;
            const now = Date.now();
            const biometricsDone = !!(u.biometricsDone || u.selfieImage || u.avatar_url || u.selfie_image);
            const dlSubmitted = !!(u.drivingLicense || u.driving_license || u.vehicle || u.plate);
            const dlTs = ts.dl;
            const dlVerified = dlSubmitted && dlTs && (now - dlTs >= ONE_HOUR);
            return biometricsDone && dlVerified;
          } catch {
            return false;
          }
        })();

        // Single active delivery rule:
        let activeOrder: Order | null = null;
        let queuedOrders: Order[] = [];

        if (!isVerified || state.agentStatus === 'UNAVAILABLE') {
          // Unverified or Inactive riders CANNOT get active or queued orders!
          activeOrder = null;
          queuedOrders = [];
          poolOrders = [];
        } else if (state.currentOrder) {
          // Rider is already working on an active delivery:
          // Any other assigned orders go into queuedOrders
          const currentId = state.currentOrder.id;
          const currentNum = state.currentOrder.orderNumber;
          const waiting = assignedOrders.filter(o => o.id !== currentId && o.orderNumber !== currentNum);
          queuedOrders = waiting.map((o, idx) => ({
            ...o,
            isQueued: true,
            queuePosition: idx + 1
          }));
        } else if (assignedOrders.length > 0) {
          // Rider has no active order yet: 1st assigned order becomes active delivery!
          activeOrder = {
            ...assignedOrders[0],
            isQueued: false,
            queuePosition: undefined,
            status: 'ASSIGNED'
          };
          queuedOrders = assignedOrders.slice(1).map((o, idx) => ({
            ...o,
            isQueued: true,
            queuePosition: idx + 1
          }));
        }

        // Check if data signature changed before dispatching
        const newSig = `act:${activeOrder?.id || 'none'}_q:${queuedOrders.map(q => q.id).join(',')}_p:${poolOrders.map(p => p.id).join(',')}`;
        if (prevSyncSigRef.current === newSig) {
          return;
        }
        prevSyncSigRef.current = newSig;

        dispatch({
          type: 'SYNC_DELIVERY_ORDERS',
          payload: { activeOrder, queuedOrders, poolOrders }
        });
      } catch (err) {
        console.warn('Delivery fetch sync fallback:', err);
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await get('/delivery/history');
        if (!isMounted) return;
        const cloudEntries = Array.isArray(res) ? res.map(mapApiOrderToHistoryEntry) : [];
        const existingIds = new Set(cloudEntries.map((e: any) => e.orderId));
        const savedLocal = getSavedHistory();
        const merged = [...cloudEntries, ...savedLocal.filter((l) => !existingIds.has(l.orderId))];
        dispatch({ type: 'SYNC_CLOUD_HISTORY', payload: merged });
      } catch {
        if (isMounted) {
          dispatch({ type: 'SYNC_CLOUD_HISTORY', payload: getSavedHistory() });
        }
      }
    };

    // Initial load
    fetchActiveOrders();
    fetchHistory();

    // Poll active orders every 3 seconds for real-time responsiveness
    const activeInterval = setInterval(fetchActiveOrders, 3000);
    const historyInterval = setInterval(fetchHistory, 30000);

    const handleStorageUpdate = () => fetchActiveOrders();
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('grabit_orders_updated', handleStorageUpdate);

    return () => {
      isMounted = false;
      clearInterval(activeInterval);
      clearInterval(historyInterval);
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('grabit_orders_updated', handleStorageUpdate);
    };
  }, [state.currentOrder]);

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
        openModal,
        closeModal,
        forceDispatchNow,
        acceptOrder,
        markNotificationRead,
        markAllNotificationsRead,
        createSupportTicket,
        updateSettings,
        transferPayout,
        redeemIncentive,
        resetDemo,
        unreadCount
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
