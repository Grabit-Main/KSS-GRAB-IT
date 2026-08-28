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

// INITIAL READ-ONLY HISTORY FOR LOGGED-IN AGENT (24 COMPLETED TRIPS)
export const initialHistory: DeliveryHistoryEntry[] = [
  {
    orderId: 'ORD-8824',
    orderNumber: '#8824',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Aarav Sharma',
    deliveryLocation: 'Koramangala 3rd Block, 10th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-28T12:15:00.000Z',
    totalAmount: 850,
    paymentMethod: 'PREPAID',
    distanceKm: 2.4,
    durationMinutes: 14,
    earning: 85
  },
  {
    orderId: 'ORD-8823',
    orderNumber: '#8823',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Diya Kapoor',
    deliveryLocation: 'HSR Layout Sector 3, 14th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-28T10:30:00.000Z',
    totalAmount: 1120,
    paymentMethod: 'COD',
    distanceKm: 3.7,
    durationMinutes: 20,
    earning: 92
  },
  {
    orderId: 'ORD-8822',
    orderNumber: '#8822',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Devansh Verma',
    deliveryLocation: 'Koramangala 5th Block, 1st Cross',
    status: 'DELIVERED',
    timestamp: '2026-08-27T18:45:00.000Z',
    totalAmount: 640,
    paymentMethod: 'PREPAID',
    distanceKm: 1.9,
    durationMinutes: 11,
    earning: 78
  },
  {
    orderId: 'ORD-8821',
    orderNumber: '#8821',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Priya Sharma',
    deliveryLocation: 'Koramangala 4th Block, 80 Feet Road, Apt 304',
    status: 'DELIVERED',
    timestamp: '2026-08-27T16:20:00.000Z',
    totalAmount: 780,
    paymentMethod: 'PREPAID',
    distanceKm: 2.8,
    durationMinutes: 16,
    earning: 83
  },
  {
    orderId: 'ORD-8820',
    orderNumber: '#8820',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Rohan Mehta',
    deliveryLocation: 'HSR Layout Sector 1, 27th Main Rd',
    status: 'DELIVERED',
    timestamp: '2026-08-26T14:10:00.000Z',
    totalAmount: 1250,
    paymentMethod: 'COD',
    distanceKm: 4.1,
    durationMinutes: 22,
    earning: 96
  },
  {
    orderId: 'ORD-8819',
    orderNumber: '#8819',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Ananya Reddy',
    deliveryLocation: 'Indiranagar 100ft Road, 12th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-26T11:50:00.000Z',
    totalAmount: 490,
    paymentMethod: 'PREPAID',
    distanceKm: 3.2,
    durationMinutes: 18,
    earning: 87
  },
  {
    orderId: 'ORD-8818',
    orderNumber: '#8818',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Karthik V.',
    deliveryLocation: 'BTM Layout 2nd Stage, 7th Cross',
    status: 'DELIVERED',
    timestamp: '2026-08-25T19:30:00.000Z',
    totalAmount: 1890,
    paymentMethod: 'PREPAID',
    distanceKm: 4.5,
    durationMinutes: 24,
    earning: 100
  },
  {
    orderId: 'ORD-8817',
    orderNumber: '#8817',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Sneha Patel',
    deliveryLocation: 'Koramangala 6th Block, 5th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-25T17:15:00.000Z',
    totalAmount: 620,
    paymentMethod: 'COD',
    distanceKm: 1.8,
    durationMinutes: 12,
    earning: 73
  },
  {
    orderId: 'ORD-8816',
    orderNumber: '#8816',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Ishaan Gupta',
    deliveryLocation: 'HSR Layout Sector 2, 19th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-24T15:40:00.000Z',
    totalAmount: 930,
    paymentMethod: 'PREPAID',
    distanceKm: 3.5,
    durationMinutes: 19,
    earning: 90
  },
  {
    orderId: 'ORD-8815',
    orderNumber: '#8815',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Kavya Singh',
    deliveryLocation: 'Koramangala 1st Block, 4th Cross',
    status: 'DELIVERED',
    timestamp: '2026-08-24T13:20:00.000Z',
    totalAmount: 510,
    paymentMethod: 'PREPAID',
    distanceKm: 2.2,
    durationMinutes: 13,
    earning: 80
  },
  {
    orderId: 'ORD-8814',
    orderNumber: '#8814',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Manish Iyer',
    deliveryLocation: 'BTM Layout 1st Stage, 20th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-23T18:10:00.000Z',
    totalAmount: 1650,
    paymentMethod: 'COD',
    distanceKm: 5.0,
    durationMinutes: 26,
    earning: 110
  },
  {
    orderId: 'ORD-8813',
    orderNumber: '#8813',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Meera Das',
    deliveryLocation: 'Koramangala 4th Block, 17th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-22T16:05:00.000Z',
    totalAmount: 380,
    paymentMethod: 'PREPAID',
    distanceKm: 1.2,
    durationMinutes: 9,
    earning: 65
  },
  {
    orderId: 'ORD-8812',
    orderNumber: '#8812',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Nitin Rao',
    deliveryLocation: 'HSR Layout Sector 4, 7th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-21T14:30:00.000Z',
    totalAmount: 1340,
    paymentMethod: 'PREPAID',
    distanceKm: 4.0,
    durationMinutes: 21,
    earning: 95
  },
  {
    orderId: 'ORD-8811',
    orderNumber: '#8811',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Pooja Hegde',
    deliveryLocation: 'Koramangala 7th Block, 8th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-20T17:50:00.000Z',
    totalAmount: 890,
    paymentMethod: 'COD',
    distanceKm: 3.1,
    durationMinutes: 17,
    earning: 88
  },
  {
    orderId: 'ORD-8810',
    orderNumber: '#8810',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Rahul Dravid',
    deliveryLocation: 'Indiranagar 80ft Road, 6th Block',
    status: 'DELIVERED',
    timestamp: '2026-08-19T12:40:00.000Z',
    totalAmount: 1520,
    paymentMethod: 'PREPAID',
    distanceKm: 4.8,
    durationMinutes: 25,
    earning: 105
  },
  {
    orderId: 'ORD-8809',
    orderNumber: '#8809',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Riya Pillai',
    deliveryLocation: 'Koramangala 2nd Block, 3rd Main',
    status: 'DELIVERED',
    timestamp: '2026-08-18T19:15:00.000Z',
    totalAmount: 430,
    paymentMethod: 'PREPAID',
    distanceKm: 1.5,
    durationMinutes: 10,
    earning: 75
  },
  {
    orderId: 'ORD-8808',
    orderNumber: '#8808',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Siddharth Roy',
    deliveryLocation: 'HSR Layout Sector 6, 11th Cross',
    status: 'DELIVERED',
    timestamp: '2026-08-17T15:20:00.000Z',
    totalAmount: 1180,
    paymentMethod: 'COD',
    distanceKm: 4.2,
    durationMinutes: 23,
    earning: 98
  },
  {
    orderId: 'ORD-8807',
    orderNumber: '#8807',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Tanya Joshi',
    deliveryLocation: 'Koramangala 8th Block, 12th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-16T11:10:00.000Z',
    totalAmount: 760,
    paymentMethod: 'PREPAID',
    distanceKm: 2.7,
    durationMinutes: 15,
    earning: 82
  },
  {
    orderId: 'ORD-8806',
    orderNumber: '#8806',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Utkarsh Saxena',
    deliveryLocation: 'BTM Layout 2nd Stage, 16th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-15T18:30:00.000Z',
    totalAmount: 1980,
    paymentMethod: 'PREPAID',
    distanceKm: 5.5,
    durationMinutes: 28,
    earning: 115
  },
  {
    orderId: 'ORD-8805',
    orderNumber: '#8805',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Vidya Balan',
    deliveryLocation: 'Koramangala 4th Block, 5th Cross',
    status: 'DELIVERED',
    timestamp: '2026-08-14T16:00:00.000Z',
    totalAmount: 390,
    paymentMethod: 'COD',
    distanceKm: 1.3,
    durationMinutes: 10,
    earning: 70
  },
  {
    orderId: 'ORD-8804',
    orderNumber: '#8804',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Yashwardhan K.',
    deliveryLocation: 'HSR Layout Sector 5, 8th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-12T14:45:00.000Z',
    totalAmount: 870,
    paymentMethod: 'PREPAID',
    distanceKm: 3.4,
    durationMinutes: 18,
    earning: 89
  },
  {
    orderId: 'ORD-8803',
    orderNumber: '#8803',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Zoya Akhtar',
    deliveryLocation: 'Koramangala 5th Block, 14th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-10T13:15:00.000Z',
    totalAmount: 1100,
    paymentMethod: 'PREPAID',
    distanceKm: 3.9,
    durationMinutes: 21,
    earning: 94
  },
  {
    orderId: 'ORD-8802',
    orderNumber: '#8802',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Aditya Birla',
    deliveryLocation: 'Koramangala 1st Block, 10th Main',
    status: 'DELIVERED',
    timestamp: '2026-08-08T11:00:00.000Z',
    totalAmount: 580,
    paymentMethod: 'COD',
    distanceKm: 2.1,
    durationMinutes: 12,
    earning: 76
  },
  {
    orderId: 'ORD-8801',
    orderNumber: '#8801',
    supermarketName: 'GrabIt Supermarket (Koramangala Hub)',
    customerName: 'Bhavana Menon',
    deliveryLocation: 'Indiranagar 100ft Road, 4th Cross',
    status: 'DELIVERED',
    timestamp: '2026-08-05T17:40:00.000Z',
    totalAmount: 1420,
    paymentMethod: 'PREPAID',
    distanceKm: 4.6,
    durationMinutes: 24,
    earning: 102
  }
];

// NOTIFICATIONS BELONGING TO LOGGED-IN AGENT
export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-surge',
    type: 'DISPATCH',
    title: '⚡ Peak Demand Surge Active (+₹25 / Trip)',
    description: 'High order volume detected at GrabIt Supermarket Koramangala Hub. Extra surge pay applied to all trips.',
    timestamp: '10 mins ago',
    isRead: false
  },
  {
    id: 'notif-shift',
    type: 'STATUS',
    title: '🚀 Shift On Duty • Agent Status ACTIVE',
    description: 'You are marked Available for incoming supermarket grocery dispatches.',
    timestamp: '1 hour ago',
    isRead: true
  },
  {
    id: 'notif-bay3',
    type: 'DISPATCH',
    title: '📦 Supermarket Dispatch Bay 3 Notice',
    description: 'Fresh produce & dairy orders prepped and waiting at Bay 3. Handle temperature-sensitive items with care.',
    timestamp: '2 hours ago',
    isRead: true
  },
  {
    id: 'notif-incentive',
    type: 'ADMIN',
    title: '🎉 Milestone Goal Unlocked: 10 Deliveries!',
    description: 'You completed 10 deliveries today! Claim your ₹500.00 incentive bonus directly to your wallet.',
    timestamp: '3 hours ago',
    isRead: true
  }
];

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

