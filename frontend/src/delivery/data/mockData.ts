import {
  Supermarket,
  DeliveryAgent,
  Order,
  DeliveryStats,
  DeliveryHistoryEntry,
  AppNotification,
  SupportTicket,
  AppSettings,
  IncentiveCampaign
} from '../types/delivery';

// EXACTLY ONE SUPERMARKET IN THE ENTIRE SYSTEM
export const grabitSupermarket: Supermarket = {
  id: 'STORE-001',
  name: 'GrabIt Supermarket',
  branch: 'Koramangala Flagship',
  category: 'Supermarket & Groceries',
  address: 'GrabIt Supermarket, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
  landmark: 'Opposite Sony World Signal, 4th Block',
  phone: '+91 (080) 4120-8800',
  pickupInstructions: 'Collect packed grocery bags from Supermarket Dispatch Bay 3. Verify sealed tamper-tape and cold items bag.',
  prepStatus: 'Bags Sealed & Ready at Bay 3',
  coordinates: { x: 80, y: 160, lat: 12.9352, lng: 77.6245 }
};

// MULTIPLE DELIVERY AGENTS SIMULATED IN BACKGROUND
export const mockDeliveryAgents: DeliveryAgent[] = [
  {
    id: 'AG-4492',
    name: 'Alex Mercer', // Currently logged-in agent
    status: 'AVAILABLE',
    currentOrderId: null,
    phone: '+91 98801 24492',
    vehicle: 'Honda Activa 6G (EV Smart)',
    rating: 4.92,
    totalDeliveries: 127
  },
  {
    id: 'AG-4493',
    name: 'Rahul Kumar',
    status: 'ON_DELIVERY',
    currentOrderId: 'ORD-1024',
    phone: '+91 98802 34493',
    vehicle: 'TVS iQube EV',
    rating: 4.88,
    totalDeliveries: 114
  },
  {
    id: 'AG-4494',
    name: 'Arjun Nair',
    status: 'AVAILABLE',
    currentOrderId: null,
    phone: '+91 98803 44494',
    vehicle: 'Ather 450X',
    rating: 4.95,
    totalDeliveries: 142
  },
  {
    id: 'AG-4495',
    name: 'Vikram Singh',
    status: 'ON_DELIVERY',
    currentOrderId: 'ORD-1027',
    phone: '+91 98804 54495',
    vehicle: 'Bajaj Chetak EV',
    rating: 4.85,
    totalDeliveries: 98
  }
];

// SUPERMARKET ORDERS POOL (EMPTY INITIAL STATE - POPULATED ONLY BY REALTIME CUSTOMER ORDERS)
export const initialOrdersPool: Order[] = [];

// INITIAL STATS FOR LOGGED-IN AGENT
export const initialStats: DeliveryStats = {
  completedToday: 0,
  totalDeliveries: 0,
  failedToday: 0,
  returnedToday: 0,
  rating: 5.0,
  onTimePercentage: 100,
  completionRate: 100,
  totalDistanceKm: 0,
  activeShiftMinutes: 0
};

// INITIAL READ-ONLY HISTORY FOR LOGGED-IN AGENT
export const initialHistory: DeliveryHistoryEntry[] = [];

// NOTIFICATIONS BELONGING TO LOGGED-IN AGENT
export const initialNotifications: AppNotification[] = [];

export const initialSupportTickets: SupportTicket[] = [];

export const initialSettings: AppSettings = {
  deliveryNotifications: true,
  supportNotifications: true,
  notificationSound: true,
  deliveryAlertSound: true,
  locationPermission: 'GRANTED',
  mockLocationZone: 'Koramangala'
};

export const agentProfile = {
  name: 'Alex Mercer',
  agentId: 'AG-4492',
  rating: 4.92,
  totalDeliveries: 127,
  completedDeliveries: 125,
  phone: '+91 98801 24492',
  email: 'alex.partner@grabit.com',
  hub: 'GrabIt Supermarket (Koramangala Hub)',
  vehicle: 'Honda Activa 6G (EV Smart)',
  plate: 'KA 05 XX 4492',
  joinedDate: 'March 14, 2024 (1.5 years active)',
  drivingLicense: 'DL-KA-05-2021008892',
  documentStatus: 'Verified',
  backgroundCheck: 'Cleared'
};

export const faqList = [
  {
    q: 'Where do I collect orders from?',
    a: 'All orders originate from GrabIt Supermarket (80 Feet Road, 4th Block, Koramangala). Park in the designated Partner Bay and proceed to Dispatch Bay 3 inside the supermarket.'
  },
  {
    q: 'What should I do if a customer is unreachable at delivery?',
    a: 'Attempt calling the customer at least twice through the in-app dialer. If there is no response after 5 minutes, use the "Report Issue" button and select "Customer unavailable" to initiate the Return to Supermarket workflow.'
  },
  {
    q: 'How does the 4-digit Proof of Delivery (POD) OTP work?',
    a: 'Every customer receives a secure 4-digit verification code via SMS upon order dispatch from GrabIt Supermarket. You must request this code at the customer doorstep and enter it in the Proof of Delivery modal to confirm completion.'
  },
  {
    q: 'Can I accept multiple grocery orders simultaneously?',
    a: 'No. To ensure optimal customer delivery speed and food freshness, GrabIt enforces a strict single active order policy per delivery agent.'
  }
];

export const initialIncentiveCampaigns: IncentiveCampaign[] = [
  {
    id: 'INC-2026-SURGE',
    title: 'Peak Hours Delivery Bonus',
    subtitle: 'Complete orders today from GrabIt Supermarket Flagship Hub to earn extra cash rewards!',
    targetCount: 10,
    bonusAmount: 500,
    expiresAt: 'Ends in 2 days',
    isActive: true,
    tierBreakdown: [
      { level: 1, targetCount: 5, bonusAmount: 200, reached: true },
      { level: 2, targetCount: 10, bonusAmount: 500, reached: false }
    ],
    terms: [
      'Incentive valid for grocery orders completed from GrabIt Supermarket (Koramangala Hub).',
      'Deliveries must be confirmed with 4-digit Proof of Delivery (POD) OTP verification.',
      'Bonus rewards are credited directly to your partner earnings account upon target completion.',
      'Canceled, returned, or unverified orders will not count toward the campaign target.'
    ]
  }
];

