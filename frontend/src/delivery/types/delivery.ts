export type AgentStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_DELIVERY';

export type OrderStatus =
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'FAILED_DELIVERY'
  | 'RETURNED'
  | 'ACCEPTED'
  | 'REACHED_PICKUP';

export type PaymentMethod = 'PREPAID' | 'COD';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: 'Produce' | 'Dairy & Eggs' | 'Bakery' | 'Pantry' | 'Beverages' | 'Personal Care' | 'Frozen' | 'Snacks';
  temperature?: 'Hot' | 'Cold' | 'Ambient';
}

export interface Supermarket {
  id: 'STORE-001';
  name: 'GrabIt Supermarket';
  branch: 'Koramangala Flagship';
  category: 'Supermarket & Groceries';
  address: 'GrabIt Supermarket, 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034';
  landmark: 'Opposite Sony World Signal, 4th Block';
  phone: '+91 (080) 4120-8800';
  pickupInstructions: 'Collect packed grocery bags from Supermarket Dispatch Bay 3. Verify sealed tamper-tape before loading into insulated delivery bag.';
  prepStatus: 'Bags Sealed & Ready at Bay 3';
  coordinates: { x: 80, y: 160, lat: 12.9352, lng: 77.6245 };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  apartment?: string;
  landmark: string;
  deliveryNotes: string;
  coordinates: { x: number; y: number; lat: number; lng: number };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  supermarketId: 'STORE-001';
  merchant: Supermarket; // Single GrabIt Supermarket
  customer: Customer;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  codAmount?: number; // Only for COD
  totalAmount: number;
  distanceKm: number;
  estimatedMinutes: number;
  isPriority: boolean;
  specialInstructions?: string;
  createdAt: string;
  assignedAt?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  returnedAt?: string;
  otp: string; // 4-digit OTP for POD
  assignedAgentId: string;
  proofOfDelivery?: ProofOfDelivery;
  issueReport?: IssueReport;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  status: AgentStatus;
  currentOrderId: string | null;
  phone: string;
  vehicle: string;
  rating: number;
  totalDeliveries: number;
}

export interface ProofOfDelivery {
  otpEntered: string;
  photoUrl?: string;
  signatureDataUrl?: string;
  gpsCoords: {
    lat: number;
    lng: number;
    accuracy: number;
    capturedAt: string;
  };
  notes?: string;
}

export interface IssueReport {
  reason:
    | 'Customer unavailable'
    | 'Wrong address'
    | 'Customer refused'
    | 'Package damaged'
    | 'Unable to contact customer'
    | 'Vehicle issue'
    | 'Other';
  notes?: string;
  photoUrl?: string;
  actionTaken: 'FAILED_DELIVERY' | 'RETURNED';
  reportedAt: string;
}

export interface DeliveryStats {
  completedToday: number;
  totalDeliveries: number;
  failedToday: number;
  returnedToday: number;
  rating: number; // e.g. 4.92
  onTimePercentage: number; // e.g. 96
  completionRate: number; // e.g. 98
  totalDistanceKm: number;
  activeShiftMinutes: number;
}

export interface DeliveryHistoryEntry {
  orderId: string;
  orderNumber: string;
  supermarketName: string;
  customerName: string;
  deliveryLocation: string;
  status: 'DELIVERED' | 'FAILED_DELIVERY' | 'RETURNED';
  timestamp: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  distanceKm: number;
  durationMinutes: number;
  failureReason?: string;
}

export interface AppNotification {
  id: string;
  type: 'DISPATCH' | 'STATUS' | 'CUSTOMER' | 'SYSTEM' | 'ADMIN';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

export interface SupportTicket {
  id: string;
  category: 'App problem' | 'Navigation problem' | 'Customer issue' | 'Pickup issue' | 'Delivery issue' | 'Other';
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

export interface AppSettings {
  deliveryNotifications: boolean;
  supportNotifications: boolean;
  notificationSound: boolean;
  deliveryAlertSound: boolean;
  locationPermission: 'GRANTED' | 'DENIED' | 'PROMPT';
  mockLocationZone: 'Koramangala' | 'Indiranagar' | 'Whitefield' | 'HSR Layout';
}

export interface IncentiveTier {
  level: number;
  targetCount: number;
  bonusAmount: number;
  reached: boolean;
}

export interface IncentiveCampaign {
  id: string;
  title: string;
  subtitle: string;
  targetCount: number;
  bonusAmount: number;
  completedCount?: number;
  expiresAt: string;
  isActive: boolean;
  tierBreakdown?: IncentiveTier[];
  terms: string[];
}

