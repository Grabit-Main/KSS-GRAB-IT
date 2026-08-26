import { Order } from '../types/delivery';

export const mockOrdersPool: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#GRB-8491',
    status: 'ASSIGNED',
    merchant: {
      id: 'm-1',
      name: "McDonald's Express (Sector 18)",
      category: 'Fast Food & Beverages',
      address: 'Shop 14, Food Court Floor 1, City Center Mall',
      landmark: 'Near North Gate Escalator',
      phone: '+1 (555) 392-8812',
      pickupInstructions: 'Show order ID #GRB-8491 at Delivery Counter #3. Verify drink seal before packing into thermal bag.',
      prepStatus: 'Food Ready & Packed',
      coordinates: { x: 90, y: 190, lat: 40.7128, lng: -74.006 }
    },
    customer: {
      id: 'c-1',
      name: 'Sarah Jenkins',
      phone: '+1 (555) 720-4491',
      address: '742 Evergreen Terrace, Apt 4B',
      apartment: '4th Floor, Buzz code #4012',
      landmark: 'Opposite Oakwood Community Park',
      deliveryNotes: 'Please ring bell once and leave on the porch shoe stand. Baby sleeping.',
      coordinates: { x: 380, y: 90, lat: 40.7282, lng: -73.9942 }
    },
    items: [
      { id: 'i-1', name: 'Big Mac Meal (L) + Fries', quantity: 2, price: 21.98, category: 'Burgers', temperature: 'Hot' },
      { id: 'i-2', name: '10pc Spicy Chicken McNuggets', quantity: 1, price: 7.49, category: 'Sides', temperature: 'Hot' },
      { id: 'i-3', name: 'Oreo McFlurry', quantity: 2, price: 8.50, category: 'Dessert', temperature: 'Cold' },
      { id: 'i-4', name: 'Coca-Cola Zero Sugar (L)', quantity: 2, price: 4.98, category: 'Beverages', temperature: 'Cold' }
    ],
    paymentMethod: 'PREPAID',
    totalAmount: 42.95,
    distanceKm: 3.4,
    estimatedMinutes: 16,
    isPriority: true,
    specialInstructions: 'Handle dessert McFlurry upright in cold separator pocket.',
    createdAt: 'Just now',
    otp: '4829'
  },
  {
    id: 'ord-102',
    orderNumber: '#GRB-8492',
    status: 'ASSIGNED',
    merchant: {
      id: 'm-2',
      name: 'FreshMart Supermarket',
      category: 'Groceries & Daily Essentials',
      address: 'Avenue Plaza, Block C, Ground Floor',
      landmark: 'Next to Central Metro Station Exit 2',
      phone: '+1 (555) 481-9033',
      pickupInstructions: 'Collect 2 brown paper bags from Online Dispatch bay 7.',
      prepStatus: 'Bags Sealed & Tagged',
      coordinates: { x: 110, y: 80, lat: 40.718, lng: -74.002 }
    },
    customer: {
      id: 'c-2',
      name: 'David Miller',
      phone: '+1 (555) 891-2311',
      address: '215 West 88th St, Penthouse A',
      apartment: 'Elevator access available with doorman',
      landmark: 'Corner of Broadway and 88th',
      deliveryNotes: 'Cash on delivery — exact cash ($38.50) ready at front desk. Please collect before handing over.',
      coordinates: { x: 390, y: 220, lat: 40.732, lng: -73.985 }
    },
    items: [
      { id: 'i-5', name: 'Organic Almond Milk 1L', quantity: 2, price: 7.98, category: 'Dairy', temperature: 'Cold' },
      { id: 'i-6', name: 'Fresh Hass Avocados (Pack of 4)', quantity: 1, price: 5.99, category: 'Produce', temperature: 'Ambient' },
      { id: 'i-7', name: 'Whole Wheat Sourdough Loaf', quantity: 1, price: 4.50, category: 'Bakery', temperature: 'Ambient' },
      { id: 'i-8', name: 'Greek Yogurt 500g Tub', quantity: 2, price: 9.00, category: 'Dairy', temperature: 'Cold' },
      { id: 'i-9', name: 'Premium Arabica Ground Coffee 250g', quantity: 1, price: 11.03, category: 'Pantry', temperature: 'Ambient' }
    ],
    paymentMethod: 'COD',
    codAmount: 38.50,
    totalAmount: 38.50,
    distanceKm: 5.1,
    estimatedMinutes: 24,
    isPriority: false,
    specialInstructions: '⚠️ CASH ON DELIVERY: Collect exactly $38.50 cash from customer upon delivery.',
    createdAt: '1 min ago',
    otp: '7315'
  },
  {
    id: 'ord-103',
    orderNumber: '#GRB-8493',
    status: 'ASSIGNED',
    merchant: {
      id: 'm-3',
      name: 'Tokyo Sushi & Ramen Bar',
      category: 'Japanese Cuisine',
      address: '45 Sakura Lane, Downtown District',
      landmark: 'Near Red Lantern Arcade',
      phone: '+1 (555) 602-1194',
      pickupInstructions: 'Pick up from Japanese Sushi Chef bar. Keep hot ramen broth upright.',
      prepStatus: 'Freshly Prepared',
      coordinates: { x: 70, y: 150, lat: 40.7145, lng: -74.009 }
    },
    customer: {
      id: 'c-3',
      name: 'Elena Rostova',
      phone: '+1 (555) 314-9920',
      address: '512 Riverside Drive, Apt 12C',
      apartment: '12th Floor, Tower East',
      landmark: 'Near Riverwalk Promenade entrance',
      deliveryNotes: 'Call me when downstairs so I can unlock security turnstile.',
      coordinates: { x: 370, y: 260, lat: 40.741, lng: -73.978 }
    },
    items: [
      { id: 'i-10', name: 'Tonkotsu Ramen (Rich Pork Broth)', quantity: 2, price: 34.00, category: 'Ramen', temperature: 'Hot' },
      { id: 'i-11', name: 'Salmon & Tuna Nigiri Combo (12 pcs)', quantity: 1, price: 26.50, category: 'Sushi', temperature: 'Cold' },
      { id: 'i-12', name: 'Crispy Pork Gyoza (6 pcs)', quantity: 1, price: 8.00, category: 'Appetizers', temperature: 'Hot' },
      { id: 'i-13', name: 'Iced Green Tea (Matcha)', quantity: 2, price: 7.00, category: 'Beverages', temperature: 'Cold' }
    ],
    paymentMethod: 'PREPAID',
    totalAmount: 75.50,
    distanceKm: 2.8,
    estimatedMinutes: 14,
    isPriority: true,
    specialInstructions: 'Ramen broth is packed separately. Keep upright to avoid spills.',
    createdAt: 'Just now',
    otp: '9152'
  },
  {
    id: 'ord-104',
    orderNumber: '#GRB-8494',
    status: 'ASSIGNED',
    merchant: {
      id: 'm-4',
      name: 'MedPlus 24/7 Pharmacy',
      category: 'Healthcare & Medicine',
      address: '109 Health Square, Medical Enclave',
      landmark: 'Opposite City General Hospital',
      phone: '+1 (555) 777-0199',
      pickupInstructions: 'Pick up medical tamper-proof sealed envelope from Pharmacist desk.',
      prepStatus: 'Verified & Sealed',
      coordinates: { x: 120, y: 220, lat: 40.710, lng: -74.004 }
    },
    customer: {
      id: 'c-4',
      name: 'Robert Chen',
      phone: '+1 (555) 441-8732',
      address: '88 Lexington Avenue, Unit 302',
      apartment: 'Gate code #9988',
      landmark: 'Beside Grand Central library',
      deliveryNotes: 'Urgent medication delivery for senior family member. Please hurry if possible.',
      coordinates: { x: 350, y: 130, lat: 40.725, lng: -73.991 }
    },
    items: [
      { id: 'i-14', name: 'Prescription Pain Relief Gel 100g', quantity: 2, price: 18.50, category: 'Medicines', temperature: 'Ambient' },
      { id: 'i-15', name: 'Multivitamin Immunity Boost Tabs (60s)', quantity: 1, price: 14.99, category: 'Supplements', temperature: 'Ambient' },
      { id: 'i-16', name: 'Digital Infrared Thermometer', quantity: 1, price: 29.99, category: 'Devices', temperature: 'Ambient' }
    ],
    paymentMethod: 'PREPAID',
    totalAmount: 63.48,
    distanceKm: 2.1,
    estimatedMinutes: 11,
    isPriority: true,
    specialInstructions: '🔴 HIGH PRIORITY: Express medical dispatch. Handle with medical care.',
    createdAt: 'Just now',
    otp: '5621'
  },
  {
    id: 'ord-105',
    orderNumber: '#GRB-8495',
    status: 'ASSIGNED',
    merchant: {
      id: 'm-5',
      name: 'Artisan Crumb Bakery & Cafe',
      category: 'Bakery & Pastries',
      address: '22 Baker Street, Heritage Quarter',
      landmark: 'Near Clock Tower Piazza',
      phone: '+1 (555) 902-3341',
      pickupInstructions: 'Order box is fragile pastry box. Do not stack heavy items on top.',
      prepStatus: 'Box Tied with Ribbon',
      coordinates: { x: 80, y: 110, lat: 40.716, lng: -74.007 }
    },
    customer: {
      id: 'c-5',
      name: 'Amanda Brooks',
      phone: '+1 (555) 655-1289',
      address: '330 Park Avenue South, Suite 801',
      apartment: '8th Floor Corporate Office',
      landmark: 'Gold Star Office Tower',
      deliveryNotes: 'Hand over to reception desk on 8th floor for Amanda. Cash payment upon receipt.',
      coordinates: { x: 400, y: 170, lat: 40.729, lng: -73.988 }
    },
    items: [
      { id: 'i-17', name: 'French Butter Croissants Box (6 pcs)', quantity: 1, price: 18.00, category: 'Pastries', temperature: 'Ambient' },
      { id: 'i-18', name: 'Dark Chocolate Tartelette', quantity: 2, price: 14.00, category: 'Desserts', temperature: 'Cold' },
      { id: 'i-19', name: 'Cold Brew Caramel Latte 500ml', quantity: 2, price: 11.50, category: 'Coffee', temperature: 'Cold' }
    ],
    paymentMethod: 'COD',
    codAmount: 43.50,
    totalAmount: 43.50,
    distanceKm: 4.2,
    estimatedMinutes: 19,
    isPriority: false,
    specialInstructions: '⚠️ CASH ON DELIVERY: Collect exactly $43.50. Fragile pastry box.',
    createdAt: '2 mins ago',
    otp: '3840'
  }
];

export const initialStats = {
  completedToday: 6,
  failedToday: 0,
  returnedToday: 0,
  rating: 4.92,
  onTimePercentage: 98.4,
  totalDistanceKm: 24.8,
  activeShiftMinutes: 215
};

export const initialHistory = [
  {
    orderId: 'ord-098',
    orderNumber: '#GRB-8488',
    merchantName: 'Starbucks Reserve',
    customerName: 'Marcus Vance',
    status: 'DELIVERED' as const,
    timestamp: '35 mins ago',
    totalAmount: 18.25,
    paymentMethod: 'PREPAID' as const,
    distanceKm: 2.4
  },
  {
    orderId: 'ord-099',
    orderNumber: '#GRB-8489',
    merchantName: 'Chipotle Mexican Grill',
    customerName: 'Priya Sharma',
    status: 'DELIVERED' as const,
    timestamp: '1 hr 10m ago',
    totalAmount: 31.40,
    paymentMethod: 'PREPAID' as const,
    distanceKm: 4.1
  },
  {
    orderId: 'ord-100',
    orderNumber: '#GRB-8490',
    merchantName: 'Subway Gourmet Station',
    customerName: 'Jason Taylor',
    status: 'DELIVERED' as const,
    timestamp: '2 hrs ago',
    totalAmount: 22.80,
    paymentMethod: 'COD' as const,
    distanceKm: 3.0
  }
];
