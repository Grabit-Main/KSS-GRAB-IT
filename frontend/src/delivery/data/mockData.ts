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

// SUPERMARKET ORDERS POOL (ALL ORIGINATING FROM GRABIT SUPERMARKET STORE-001)
export const initialOrdersPool: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#GRB-8491',
    status: 'ASSIGNED',
    supermarketId: 'STORE-001',
    merchant: grabitSupermarket,
    assignedAgentId: 'AG-4492',
    customer: {
      id: 'c-1',
      name: 'Priya Nair',
      phone: '+91 98450 12891',
      address: 'Flat 402, Green Glen Towers, 14th Main, HSR Layout Sector 2',
      apartment: '4th Floor, Tower B, Gate Buzzer #402',
      landmark: 'Near BDA Complex & Agara Lake Park',
      deliveryNotes: 'Please ring bell once and leave on the shoe cabinet. Baby sleeping.',
      coordinates: { x: 420, y: 80, lat: 12.9116, lng: 77.6389 }
    },
    items: [
      { id: 'i-1', name: 'Fresh Farm Organic Milk 1L', quantity: 2, price: 68.00, category: 'Dairy & Eggs', temperature: 'Cold' },
      { id: 'i-2', name: 'Hass Avocados (Pack of 4)', quantity: 1, price: 180.00, category: 'Produce', temperature: 'Ambient' },
      { id: 'i-3', name: 'Artisan Whole Wheat Sourdough Bread', quantity: 1, price: 95.00, category: 'Bakery', temperature: 'Ambient' },
      { id: 'i-4', name: 'Greek Yogurt 400g Tub (Blueberry)', quantity: 2, price: 160.00, category: 'Dairy & Eggs', temperature: 'Cold' },
      { id: 'i-5', name: 'Organic Cold-Pressed Coconut Oil 500ml', quantity: 1, price: 240.00, category: 'Pantry', temperature: 'Ambient' }
    ],
    paymentMethod: 'PREPAID',
    totalAmount: 811.00,
    distanceKm: 3.4,
    estimatedMinutes: 16,
    isPriority: true,
    specialInstructions: 'Dairy and Greek yogurt are packed in thermal chiller pouch. Keep upright.',
    createdAt: 'Just now',
    otp: '4829'
  },
  {
    id: 'ord-102',
    orderNumber: '#GRB-8492',
    status: 'ASSIGNED',
    supermarketId: 'STORE-001',
    merchant: grabitSupermarket,
    assignedAgentId: 'AG-4492',
    customer: {
      id: 'c-2',
      name: 'David Miller',
      phone: '+91 97311 84210',
      address: 'Villa 18, Palm Meadows, 100 Feet Road, Indiranagar',
      apartment: 'Gated Villa with security doorman',
      landmark: 'Near 12th Main Corner Cafe',
      deliveryNotes: 'Cash on delivery — exact cash (₹650) ready at front porch. Please collect cash before handover.',
      coordinates: { x: 410, y: 100, lat: 12.9719, lng: 77.6412 }
    },
    items: [
      { id: 'i-6', name: 'Alphonso Mangoes (1kg Box)', quantity: 1, price: 350.00, category: 'Produce', temperature: 'Ambient' },
      { id: 'i-7', name: 'Farm Fresh Brown Eggs (Pack of 12)', quantity: 1, price: 120.00, category: 'Dairy & Eggs', temperature: 'Ambient' },
      { id: 'i-8', name: 'Premium Arabica Ground Coffee 250g', quantity: 1, price: 180.00, category: 'Pantry', temperature: 'Ambient' }
    ],
    paymentMethod: 'COD',
    codAmount: 650.00,
    totalAmount: 650.00,
    distanceKm: 4.8,
    estimatedMinutes: 22,
    isPriority: false,
    specialInstructions: '⚠️ CASH ON DELIVERY: Collect exactly ₹650 cash from customer upon delivery.',
    createdAt: '1 min ago',
    otp: '7315'
  },
  {
    id: 'ord-103',
    orderNumber: '#GRB-8493',
    status: 'ASSIGNED',
    supermarketId: 'STORE-001',
    merchant: grabitSupermarket,
    assignedAgentId: 'AG-4492',
    customer: {
      id: 'c-3',
      name: 'Ananya Sharma',
      phone: '+91 96200 45199',
      address: 'Apartment 804, Sobha Magnolia, 1st Cross, BTM Layout 2nd Stage',
      apartment: '8th Floor, Tower 1, Elevator access',
      landmark: 'Behind BTM Water Tank',
      deliveryNotes: 'Please call me when you reach gate so I can buzz the security guard.',
      coordinates: { x: 430, y: 70, lat: 12.9165, lng: 77.6101 }
    },
    items: [
      { id: 'i-9', name: 'Fresh Malai Paneer 500g', quantity: 2, price: 190.00, category: 'Dairy & Eggs', temperature: 'Cold' },
      { id: 'i-10', name: 'Cold Brew Caramel Latte 500ml', quantity: 2, price: 210.00, category: 'Beverages', temperature: 'Cold' },
      { id: 'i-11', name: 'Multi-Grain Atta 5kg Bag', quantity: 1, price: 295.00, category: 'Pantry', temperature: 'Ambient' },
      { id: 'i-12', name: 'Premium Basmati Rice 1kg', quantity: 2, price: 220.00, category: 'Pantry', temperature: 'Ambient' }
    ],
    paymentMethod: 'PREPAID',
    totalAmount: 915.00,
    distanceKm: 2.8,
    estimatedMinutes: 14,
    isPriority: true,
    specialInstructions: 'Heavy 5kg Atta bag in bottom compartment; cold paneer in insulated top pocket.',
    createdAt: 'Just now',
    otp: '9152'
  },
  {
    id: 'ord-104',
    orderNumber: '#GRB-8494',
    status: 'ASSIGNED',
    supermarketId: 'STORE-001',
    merchant: grabitSupermarket,
    assignedAgentId: 'AG-4492',
    customer: {
      id: 'c-4',
      name: 'Robert Chen',
      phone: '+91 98860 33412',
      address: 'Unit 201, Prestige Ivy Terraces, Marathahalli-Sarjapur Outer Ring Road',
      apartment: 'Gate code #9988',
      landmark: 'Opposite Bellandur EcoWorld Tech Park',
      deliveryNotes: 'Express delivery requested. Leave with building security if unable to reach.',
      coordinates: { x: 400, y: 90, lat: 12.9284, lng: 77.6834 }
    },
    items: [
      { id: 'i-13', name: 'Organic Almond Milk 1L (Unsweetened)', quantity: 3, price: 360.00, category: 'Dairy & Eggs', temperature: 'Cold' },
      { id: 'i-14', name: 'Granola & Chia Breakfast Cereal 500g', quantity: 1, price: 280.00, category: 'Pantry', temperature: 'Ambient' },
      { id: 'i-15', name: 'Sparkling Mineral Water (Pack of 6)', quantity: 1, price: 190.00, category: 'Beverages', temperature: 'Cold' }
    ],
    paymentMethod: 'PREPAID',
    totalAmount: 830.00,
    distanceKm: 4.1,
    estimatedMinutes: 19,
    isPriority: true,
    specialInstructions: '🔴 EXPRESS DISPATCH: Customer is at Tech Park reception.',
    createdAt: 'Just now',
    otp: '5621'
  }
];

// INITIAL STATS FOR LOGGED-IN AGENT ALEX MERCER (#AG-4492)
export const initialStats: DeliveryStats = {
  completedToday: 6,
  totalDeliveries: 127,
  failedToday: 0,
  returnedToday: 0,
  rating: 4.92,
  onTimePercentage: 96,
  completionRate: 98,
  totalDistanceKm: 24.8,
  activeShiftMinutes: 215
};

// INITIAL READ-ONLY HISTORY FOR LOGGED-IN AGENT ALEX MERCER (#AG-4492)
export const initialHistory: DeliveryHistoryEntry[] = [
  {
    orderId: 'ord-098',
    orderNumber: '#GRB-8488',
    supermarketName: 'GrabIt Supermarket (Koramangala)',
    customerName: 'Marcus Vance',
    deliveryLocation: '445 5th Block, Koramangala',
    status: 'DELIVERED',
    timestamp: '35 mins ago',
    totalAmount: 480.00,
    paymentMethod: 'PREPAID',
    distanceKm: 2.4,
    durationMinutes: 14
  },
  {
    orderId: 'ord-099',
    orderNumber: '#GRB-8489',
    supermarketName: 'GrabIt Supermarket (Koramangala)',
    customerName: 'Rohit Verma',
    deliveryLocation: '120 Sector 3, HSR Layout',
    status: 'DELIVERED',
    timestamp: '1 hr 10m ago',
    totalAmount: 720.00,
    paymentMethod: 'PREPAID',
    distanceKm: 3.8,
    durationMinutes: 19
  },
  {
    orderId: 'ord-100',
    orderNumber: '#GRB-8490',
    supermarketName: 'GrabIt Supermarket (Koramangala)',
    customerName: 'Jason Taylor',
    deliveryLocation: '88 100 Feet Road, Indiranagar',
    status: 'DELIVERED',
    timestamp: '2 hrs ago',
    totalAmount: 540.00,
    paymentMethod: 'COD',
    distanceKm: 4.2,
    durationMinutes: 21
  },
  {
    orderId: 'ord-095',
    orderNumber: '#GRB-8485',
    supermarketName: 'GrabIt Supermarket (Koramangala)',
    customerName: 'Liam O’Connor',
    deliveryLocation: '300 Ejipura Main Road',
    status: 'RETURNED',
    timestamp: 'Yesterday, 8:40 PM',
    totalAmount: 390.00,
    paymentMethod: 'PREPAID',
    distanceKm: 2.9,
    durationMinutes: 24,
    failureReason: 'Customer unavailable'
  },
  {
    orderId: 'ord-094',
    orderNumber: '#GRB-8484',
    supermarketName: 'GrabIt Supermarket (Koramangala)',
    customerName: 'Nina Patel',
    deliveryLocation: '55 1st Main, Domlur Layout',
    status: 'FAILED_DELIVERY',
    timestamp: 'Yesterday, 6:15 PM',
    totalAmount: 610.00,
    paymentMethod: 'COD',
    distanceKm: 3.5,
    durationMinutes: 28,
    failureReason: 'Wrong address'
  }
];

// NOTIFICATIONS BELONGING TO LOGGED-IN AGENT ALEX MERCER (#AG-4492)
export const initialNotifications: AppNotification[] = [
  {
    id: 'n-1',
    type: 'DISPATCH',
    title: 'Supermarket Grocery Surge in Koramangala',
    description: 'High grocery order volume at GrabIt Supermarket. Stay online for express assignments.',
    timestamp: '10 mins ago',
    isRead: false
  },
  {
    id: 'n-2',
    type: 'STATUS',
    title: 'Thermal Bag Check Reminder',
    description: 'Ensure your insulated grocery delivery bag is ready for dairy and frozen items.',
    timestamp: '45 mins ago',
    isRead: false
  },
  {
    id: 'n-3',
    type: 'ADMIN',
    title: 'Partner Milestone: 4.92 ★ Rating',
    description: 'Congratulations! You are recognized as a Top Rated GrabIt Delivery Partner.',
    timestamp: '2 hrs ago',
    isRead: true
  },
  {
    id: 'n-4',
    type: 'SYSTEM',
    title: 'Supermarket Dispatch System Optimized',
    description: 'Order dispatch server calibration completed. All systems operational.',
    timestamp: 'Yesterday',
    isRead: true
  }
];

export const initialSupportTickets: SupportTicket[] = [
  {
    id: 'SUP-20260824-1001',
    category: 'Navigation problem',
    subject: 'Road closure on 80 Feet Road near Sony World',
    description: 'Reported construction diversion near 4th Block signal for supermarket route update.',
    status: 'RESOLVED',
    createdAt: 'Yesterday, 2:30 PM'
  }
];

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

