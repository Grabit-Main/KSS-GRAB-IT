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

// DELIVERY AGENTS POOL (POPULATED FROM AUTH & BACKEND API)
export const mockDeliveryAgents: DeliveryAgent[] = [];

// SUPERMARKET ORDERS POOL (EMPTY MOCK STATE - POPULATED DYNAMICALLY ONLY FROM SELLER & BACKEND API)
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

// INITIAL HISTORY FOR LOGGED-IN AGENT
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
  name: 'Delivery Partner',
  agentId: 'AG-P0000',
  rating: 5.00,
  totalDeliveries: 0,
  completedDeliveries: 0,
  phone: '',
  email: '',
  hub: 'GrabIt Supermarket (Koramangala Hub)',
  vehicle: '',
  plate: '',
  joinedDate: '',
  drivingLicense: '',
  documentStatus: 'Pending',
  backgroundCheck: 'Pending'
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

