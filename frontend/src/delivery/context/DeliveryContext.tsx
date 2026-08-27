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

function getLiveOrdersPool(): Order[] {
  try {
    const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
    let currentRiderId = '';
    try {
      const userStr = localStorage.getItem('grabit_user');
      const user = userStr ? JSON.parse(userStr) : null;
      currentRiderId = user ? String(user.id || user.sub || '') : '';
    } catch {}

    // ✅ REAL-WORLD RULE: Rider only sees orders the seller has marked "Ready for Pickup".
    // Orders still being prepared are NOT shown to the rider yet.
    const liveOrders: Order[] = stored
      .filter((o: any) => 
        (o.status === 'ready_for_pickup' || o.status === 'ready') &&
        (!o.delivery_agent_id || String(o.delivery_agent_id) === currentRiderId)
      )
      .map((o: any, idx: number) => ({
        id: o.rawId || o.id || `live-ord-${idx}`,
        orderNumber: o.id || o.orderNumber || `ORD-${8900 + idx}`,
        status: 'ASSIGNED' as OrderStatus,
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
        items: (o.items || []).map((it: any, iIdx: number) => ({
          id: `item-${iIdx}`,
          name: it.name,
          quantity: it.qty || it.quantity || 1,
          price: it.price || 50,
          category: 'Snacks' as const
        })),
        paymentMethod: (o.payment_method === 'COD' ? 'COD' : 'PREPAID') as any,
        totalAmount: Number(o.total_amount || o.total || 0) || 199,
        distanceKm: 2.2,
        estimatedMinutes: 12
      }));

    return liveOrders;
  } catch {}
  return [];
}

interface DeliveryState {
  agentStatus: AgentStatus;
  currentOrder: Order | null;
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
  | { type: 'SYNC_ORDERS_POOL'; payload: Order[] };

const initialDeliveryState: DeliveryState = {
  agentStatus: 'AVAILABLE',
  currentOrder: null,
  incomingOrder: null,
  incomingCountdown: 0,
  orderPool: getLiveOrdersPool(),
  history: [],
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
      if (state.agentStatus !== 'AVAILABLE' || state.currentOrder !== null) {
        return state;
      }
      const targetOrder = action.payload;
      const remainingPool = state.orderPool.filter(o => o.id !== targetOrder.id && o.orderNumber !== targetOrder.orderNumber);
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const assignedOrder: Order = {
        ...targetOrder,
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

      return {
        ...state,
        agentStatus: 'AVAILABLE',
        currentOrder: null,
        incomingOrder: null,
        incomingCountdown: 0,
        activeModal: 'DELIVERY_SUCCESS',
        successOrderSummary: completedOrder,
        history: [newHistoryEntry, ...state.history],
        notifications: [successNotif, ...state.notifications],
        stats: {
          ...state.stats,
          completedToday: state.stats.completedToday + 1,
          totalDeliveries: state.stats.totalDeliveries + 1,
          totalDistanceKm: +(state.stats.totalDistanceKm + completedOrder.distanceKm).toFixed(1)
        }
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

      return {
        ...state,
        agentStatus: 'AVAILABLE',
        currentOrder: null,
        incomingOrder: null,
        incomingCountdown: 0,
        activeModal: null,
        history: [newHistoryEntry, ...state.history],
        notifications: [issueNotif, ...state.notifications],
        stats: {
          ...state.stats,
          failedToday: terminalStatus === 'FAILED_DELIVERY' ? state.stats.failedToday + 1 : state.stats.failedToday,
          returnedToday: terminalStatus === 'RETURNED' ? state.stats.returnedToday + 1 : state.stats.returnedToday
        }
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

    case 'SYNC_ORDERS_POOL': {
      return {
        ...state,
        orderPool: action.payload
      };
    }

    case 'RESET_DEMO': {
      return {
        ...initialDeliveryState,
        orderPool: getLiveOrdersPool(),
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

    try {
      const orderNum = state.currentOrder?.orderNumber;
      const rawId = state.currentOrder?.id;
      if (orderNum || rawId) {
        const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        const updated = stored.map((o: any) => {
          if (o.id === orderNum || o.orderNumber === orderNum || o.rawId === rawId || o.id === rawId) {
            return { ...o, status: next === 'DELIVERED' ? 'delivered' : 'out_for_delivery' };
          }
          return o;
        });
        localStorage.setItem('grabit_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('grabit_orders_updated'));
      }

      if (rawId) {
        patch(`/orders/${encodeURIComponent(rawId)}/status`, {
          status: next === 'DELIVERED' ? 'delivered' : 'out_for_delivery'
        }).catch(() => {});
      }
    } catch {}
  }, [state.currentOrder]);

  const completeDelivery = useCallback((pod: ProofOfDelivery) => {
    soundEngine.playSuccessChime();
    dispatch({ type: 'COMPLETE_DELIVERY', payload: { pod } });

    try {
      const orderNum = state.currentOrder?.orderNumber;
      const rawId = state.currentOrder?.id;
      if (orderNum || rawId) {
        const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
        const updated = stored.map((o: any) => {
          if (o.id === orderNum || o.orderNumber === orderNum || o.rawId === rawId || o.id === rawId) {
            return { ...o, status: 'delivered' };
          }
          return o;
        });
        localStorage.setItem('grabit_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('grabit_orders_updated'));
      }

      if (rawId) {
        patch(`/orders/${encodeURIComponent(rawId)}/status`, { status: 'delivered' }).catch(() => {});
      }
    } catch {}
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

  // ✅ REAL-WORLD FLOW: When rider accepts an order, immediately write 'out_for_delivery'
  // to localStorage and backend so seller + customer see the status change right away.
  const acceptOrder = useCallback(async (order: Order) => {
    const rawId = order.id;         // order.id is always the full UUID (rawId)
    const orderNum = order.orderNumber;

    let currentRiderId = '';
    try {
      const userStr = localStorage.getItem('grabit_user');
      const user = userStr ? JSON.parse(userStr) : null;
      currentRiderId = user ? String(user.id || user.sub || '') : '3';
    } catch {}

    // 1. Optimistically update localStorage → seller sees order leave their queue,
    //    customer sees "Out for Delivery" immediately
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      const updated = stored.map((o: any) => {
        if (
          o.rawId === rawId ||
          o.id === rawId ||
          o.id === orderNum ||
          o.orderNumber === orderNum
        ) {
          return { ...o, status: 'out_for_delivery', delivery_agent_id: currentRiderId };
        }
        return o;
      });
      localStorage.setItem('grabit_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('grabit_orders_updated'));
    } catch {}

    // 2. Persist to backend (best-effort)
    try {
      await post(`/delivery/${encodeURIComponent(rawId)}/accept`);
    } catch (err) {
      console.warn('Backend status update failed on rider accept:', err);
    }

    // 3. Update internal rider state
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

  // Real-time synchronization with Cloud Database and localStorage customer orders
  useEffect(() => {
    const handleSyncOrders = async () => {
      let currentRiderId = '';
      try {
        const userStr = localStorage.getItem('grabit_user');
        const user = userStr ? JSON.parse(userStr) : null;
        currentRiderId = user ? String(user.id || user.sub || '') : '';
      } catch {}

      let apiOrders: any[] = [];
      try {
        const res = await get('/orders/');
        if (Array.isArray(res)) apiOrders = res;
      } catch {}

      let localOrders: any[] = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('grabit_orders') || '[]');
      } catch {}

      const allRaw = [...localOrders, ...apiOrders];
      const seenKeys = new Set();
      const seenFingerprints = new Set();
      const unique: any[] = [];

      for (const o of allRaw) {
        const key = o.rawId || o.id;
        const totalAmt = Number(o.total_amount || o.total || 0);
        const custName = (o.customer_name || 'Customer').toLowerCase().trim();
        const itemLen = Array.isArray(o.items) ? o.items.length : 0;
        const fingerprint = `${custName}_${totalAmt}_${itemLen}`;

        if (key && seenKeys.has(key)) continue;
        if (fingerprint && seenFingerprints.has(fingerprint)) continue;

        if (key) seenKeys.add(key);
        if (fingerprint) seenFingerprints.add(fingerprint);
        unique.push(o);
      }

      // ✅ REAL-WORLD RULE: Only orders with status 'ready_for_pickup' go into the rider's
      // order pool. 'preparing'/'placed' orders are invisible to the rider.
      // 'out_for_delivery' orders are handled as currentOrder, NOT in the pool.
      const liveOrders: Order[] = unique
        .filter((o: any) =>
          (o.status === 'ready_for_pickup' || o.status === 'ready') &&
          (!o.delivery_agent_id || String(o.delivery_agent_id) === currentRiderId) &&
          Array.isArray(o.items) && o.items.length > 0 &&
          Number(o.total_amount || o.total || 0) > 0
        )
        .map((o: any, idx: number) => ({
          id: o.rawId || o.id || `live-ord-${idx}`,
          orderNumber: o.id || o.orderNumber || `ORD-${8900 + idx}`,
          status: 'ASSIGNED' as OrderStatus,
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
          items: (o.items || []).map((it: any, iIdx: number) => ({
            id: `item-${iIdx}`,
            name: it.name,
            quantity: it.qty || it.quantity || 1,
            price: it.price || 50,
            category: 'Snacks' as const
          })),
          paymentMethod: (o.payment_method === 'COD' ? 'COD' : 'PREPAID') as any,
          totalAmount: Number(o.total_amount || o.total || 0),
          distanceKm: 2.2,
          estimatedMinutes: 12
        }));

      dispatch({ type: 'SYNC_ORDERS_POOL', payload: liveOrders });
    };

    handleSyncOrders();
    window.addEventListener('storage', handleSyncOrders);
    window.addEventListener('grabit_orders_updated', handleSyncOrders);
    const interval = setInterval(handleSyncOrders, 2500);

    return () => {
      window.removeEventListener('storage', handleSyncOrders);
      window.removeEventListener('grabit_orders_updated', handleSyncOrders);
      clearInterval(interval);
    };
  }, []);

  // No automated order simulation timer; orders must be real seller/customer orders

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
