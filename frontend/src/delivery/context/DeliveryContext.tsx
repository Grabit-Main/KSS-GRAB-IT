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
  const addr = (o.delivery_address || o.address || '').trim().toLowerCase();
  if (!addr || addr === 'enter your delivery address' || addr.length < 4) return false;
  const custName = (o.customer_name || '').trim().toLowerCase();
  if (custName.includes('fresh mart supermarket')) return false;
  const itemsList = parseItems(o.items);
  if (!Array.isArray(itemsList) || itemsList.length === 0) return false;
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

  const orderNum = formatOrderId(o.id || o.orderNumber || o.rawId);
  const st = String(o.status || '').toLowerCase();
  let orderStatus: OrderStatus = 'ASSIGNED';
  if (st === 'out_for_delivery' || st === 'out-for-delivery') orderStatus = 'OUT_FOR_DELIVERY';
  else if (st === 'delivered') orderStatus = 'DELIVERED';
  else if (st === 'failed_delivery') orderStatus = 'FAILED_DELIVERY';
  else if (st === 'returned') orderStatus = 'RETURNED';

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
    distanceKm: 2.2,
    estimatedMinutes: 12
  };
};

// Map a raw delivered Supabase order to a DeliveryHistoryEntry
const mapApiOrderToHistoryEntry = (o: any): DeliveryHistoryEntry => ({
  orderId: o.id || o.rawId || '',
  orderNumber: formatOrderId(o.id || o.orderNumber || o.rawId),
  supermarketName: 'GrabIt Supermarket',
  customerName: o.customer_name || 'Customer',
  deliveryLocation: o.delivery_address || o.address || 'Delivery Address',
  status: 'DELIVERED',
  timestamp: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Delivered',
  totalAmount: Number(o.total_amount || o.total || 0),
  paymentMethod: (o.payment_method === 'COD' || String(o.payment_method || '').toUpperCase().includes('COD') ? 'COD' : 'PREPAID') as any,
  distanceKm: 2.2,
  durationMinutes: 18
});
// ─────────────────────────────────────────────────────────────────────────────

interface DeliveryState {
  agentStatus: AgentStatus;
  currentOrder: Order | null;
  queuedOrders: Order[]; // Orders assigned to this rider waiting in queue
  incomingOrder: Order | null;
  incomingCountdown: number;
  orderPool: Order[];
  history: DeliveryHistoryEntry[];
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
  | { type: 'RESET_DEMO' }
  | { type: 'SYNC_ORDERS_POOL'; payload: Order[] }
  | { type: 'SYNC_DELIVERY_ORDERS'; payload: { activeOrder?: Order | null; queuedOrders: Order[]; poolOrders: Order[] } }
  | { type: 'SYNC_CLOUD_HISTORY'; payload: DeliveryHistoryEntry[] };

const initialDeliveryState: DeliveryState = {
  agentStatus: 'AVAILABLE',
  currentOrder: null,
  queuedOrders: [],
  incomingOrder: null,
  incomingCountdown: 0,
  orderPool: [],  // Loaded from cloud on mount
  history: [],    // Loaded from cloud on mount
  stats: {
    completedToday: 0,
    totalDeliveries: 0,
    failedToday: 0,
    returnedToday: 0,
    rating: 5.0,
    onTimePercentage: 100,
    completionRate: 100,
    totalDistanceKm: 0,
    activeShiftMinutes: 0
  },
  notifications: [],
  supportTickets: [],
  settings: { ...initialSettings },
  incentiveCampaigns: [...initialIncentiveCampaigns],
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

      const newHistoryEntry: DeliveryHistoryEntry = {
        orderId: completedOrder.id,
        orderNumber: completedOrder.orderNumber,
        supermarketName: 'GrabIt Supermarket (Koramangala)',
        customerName: completedOrder.customer.name,
        deliveryLocation: completedOrder.customer.address,
        status: 'DELIVERED',
        timestamp: 'Just now',
        totalAmount: completedOrder.totalAmount,
        paymentMethod: completedOrder.paymentMethod,
        distanceKm: completedOrder.distanceKm,
        durationMinutes: completedOrder.estimatedMinutes || 18
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
      const newStats = {
        ...state.stats,
        completedToday: state.stats.completedToday + 1,
        totalDeliveries: state.stats.totalDeliveries + 1,
        totalDistanceKm: +(state.stats.totalDistanceKm + completedOrder.distanceKm).toFixed(1)
      };

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
      const newStatsIssue = {
        ...state.stats,
        failedToday: terminalStatus === 'FAILED_DELIVERY' ? state.stats.failedToday + 1 : state.stats.failedToday,
        returnedToday: terminalStatus === 'RETURNED' ? state.stats.returnedToday + 1 : state.stats.returnedToday
      };

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
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, isRead: true } : n
        )
      };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
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

      return {
        ...state,
        supportTickets: [newTicket, ...state.supportTickets],
        notifications: [ticketNotif, ...state.notifications]
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
      // If rider was available and has received an assigned active order from seller
      if (activeOrder) {
        return {
          ...state,
          agentStatus: 'ON_DELIVERY',
          currentOrder: activeOrder,
          queuedOrders,
          orderPool: poolOrders
        };
      }
      return {
        ...state,
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
      // Replace in-memory history with fresh data from cloud API
      const cloudEntries = action.payload;
      const deliveredCount = cloudEntries.filter(e => e.status === 'DELIVERED').length;
      return {
        ...state,
        history: cloudEntries,
        stats: {
          ...state.stats,
          completedToday: deliveredCount,
          totalDeliveries: cloudEntries.length
        }
      };
    }

    case 'RESET_DEMO': {
      return {
        ...initialDeliveryState,
        orderPool: [],
        history: [],
        stats: { ...initialStats },
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
    dispatch({ type: 'COMPLETE_DELIVERY', payload: { pod } });
    // Persist delivered status to cloud only
    const rawId = state.currentOrder?.id;
    if (rawId) {
      patch(`/orders/${encodeURIComponent(rawId)}/status`, {
        status: 'delivered',
        delivery_agent_id: 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a'
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
    if (state.agentStatus === 'AVAILABLE') {
      soundEngine.playStepAdvance();
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'UNAVAILABLE' });
      dispatch({ type: 'CLEAR_INCOMING_ORDER' });
    } else {
      soundEngine.playIncomingOrderAlert();
      dispatch({ type: 'SET_AGENT_STATUS', payload: 'AVAILABLE' });
    }
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

        // Combine unique orders
        const allRaw = [...localOrders, ...apiOrders];
        const seenKeys = new Set();
        const uniqueOrders = [];

        for (const o of allRaw) {
          if (!isValidRealOrder(o)) continue;
          const key = String(o.rawId || o.id || o.orderNumber || '').trim();
          if (!key || seenKeys.has(key)) continue;
          seenKeys.add(key);
          uniqueOrders.push(o);
        }

        if (!isMounted) return;

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
          const st = String(o.status || '').toLowerCase();
          if (st === 'delivered' || st === 'cancelled') continue;

          const agent = String(o.delivery_agent_id || '').trim();
          if (
            agent === loggedRiderId ||
            agent === loggedRiderPhone ||
            agent === '+919999900003' ||
            agent === '3' ||
            agent === 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a'
          ) {
            assignedRaw.push(o);
          } else if (!agent || agent === 'null' || agent === 'None') {
            poolRaw.push(o);
          }
        }

        const poolOrders = poolRaw.map(mapApiOrderToOrder);
        const assignedOrders = assignedRaw.map(mapApiOrderToOrder);

        // Single active delivery rule:
        let activeOrder: Order | null = null;
        let queuedOrders: Order[] = [];

        if (state.currentOrder) {
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
        if (!isMounted || !Array.isArray(res)) return;
        const entries = res.map(mapApiOrderToHistoryEntry);
        dispatch({ type: 'SYNC_CLOUD_HISTORY', payload: entries });
      } catch {}
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
