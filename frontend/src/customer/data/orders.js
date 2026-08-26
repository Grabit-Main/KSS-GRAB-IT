export const orders = [
  {
    id: "GB123456789",
    date: "22 May 2025, 10:30 AM",
    status: "delivered",
    items: [
      { name: "Lay's Classic Salted", qty: 2, price: 40, image: "lays-classic" },
      { name: "Kurkure Masala Munch", qty: 3, price: 60, image: "kurkure-masala" },
      { name: "Doritos Nacho Cheese", qty: 1, price: 20, image: "doritos-nacho" },
      { name: "Pepsi 500ml", qty: 2, price: 90, image: "pepsi" },
      { name: "Cadbury Dairy Milk", qty: 4, price: 100, image: "dairy-milk" },
    ],
    totalItems: 10,
    total: 847,
    address: "#12, 3rd Cross, Banaswadi Main Road, Bengaluru 560043",
    paymentMethod: "UPI",
    deliverySlot: "As soon as possible",
    discount: 80
  },
  {
    id: "GB123456788",
    date: "22 May 2026, 09:15 AM",
    status: "out-for-delivery",
    eta: "Arriving in 15 min",
    trackerStep: 2,
    items: [
      { name: "Lay's Magic Masala", qty: 2, price: 52, image: "lays-magic-masala" },
      { name: "Bingo Original", qty: 1, price: 20, image: "bingo-original" },
      { name: "Pringles Original", qty: 1, price: 20, image: "pringles" },
      { name: "Lay's Cream & Onion", qty: 1, price: 24, image: "lays-cream-onion" },
    ],
    totalItems: 7,
    total: 598,
    address: "#12, 3rd Cross, Banaswadi Main Road, Bengaluru 560043",
    paymentMethod: "UPI",
    deliverySlot: "As soon as possible",
    discount: 40
  }
];

export const orderStats = {
  total: 24,
  delivered: 18,
  ongoing: 2,
  cancelled: 4,
  totalSpent: 7892
};

export const trackerSteps = ["Confirmed", "Packed", "On the way", "Delivered"];
