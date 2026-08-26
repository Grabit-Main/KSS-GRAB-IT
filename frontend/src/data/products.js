import { get } from '../api';

// Official Catalog: 14 Categories × 5 Curated Products with Clean Background-less Media (70 Products)
export const baseProducts = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. FRESH FRUITS & VEGGIES (catKey: 'produce')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 1, name: "Fresh Royal Gala Red Apples (4 Pcs)", weight: "4 Pcs (~500g)", price: 149, mrp: 180, discount: 17, rating: 4.8, reviews: 610, image: "fresh-red-apples.jpg", category: "produce", brand: "Grabit Fresh", inStock: true, stock_quantity: 45 },
  { id: 2, name: "Fresh Robusta Sweet Bananas (1 kg)", weight: "1 kg", price: 49, mrp: 65, discount: 25, rating: 4.9, reviews: 1420, image: "apples-real.jpg", category: "produce", brand: "Grabit Fresh", inStock: true, stock_quantity: 60 },
  { id: 3, name: "Fresh Farm Hybrid Tomatoes (1 kg)", weight: "1 kg", price: 32, mrp: 45, discount: 29, rating: 4.7, reviews: 1890, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", brand: "Grabit Fresh", inStock: true, stock_quantity: 80 },
  { id: 4, name: "Fresh Sweet Green Capsicum (250g)", weight: "250g", price: 28, mrp: 40, discount: 30, rating: 4.8, reviews: 520, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", brand: "Grabit Fresh", inStock: true, stock_quantity: 35 },
  { id: 5, name: "Fresh Farm Red Onions (1 kg)", weight: "1 kg", price: 28, mrp: 40, discount: 30, rating: 4.8, reviews: 2450, image: "fresh-fruits-veggies-hero-transparent.png", category: "produce", brand: "Grabit Fresh", inStock: true, stock_quantity: 90 },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SNACKS & MUNCHIES (catKey: 'snacks' / 'snacks-munchies')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 6, name: "Lay's American Style Cream & Onion 50g", weight: "50g", price: 20, mrp: 25, discount: 20, rating: 4.8, reviews: 320, image: "lays-cream-onion.png", category: "snacks", brand: "Lay's", inStock: true, stock_quantity: 50 },
  { id: 7, name: "Doritos Nacho Cheese Tortilla Chips 82g", weight: "82g", price: 50, mrp: 60, discount: 17, rating: 4.7, reviews: 245, image: "doritos-nacho.png", category: "snacks", brand: "Doritos", inStock: true, stock_quantity: 40 },
  { id: 8, name: "Lay's India's Magic Masala Potato Chips 52g", weight: "52g", price: 20, mrp: 25, discount: 20, rating: 4.9, reviews: 512, image: "lays-magic-masala.png", category: "snacks", brand: "Lay's", inStock: true, stock_quantity: 65 },
  { id: 9, name: "Pringles Original Potato Chips 107g Can", weight: "107g", price: 115, mrp: 135, discount: 15, rating: 4.7, reviews: 390, image: "snack-pringles-1.png", category: "snacks", brand: "Pringles", inStock: true, stock_quantity: 30 },
  { id: 10, name: "Kurkure Masala Munch Crunchy Snacks 90g", weight: "90g", price: 20, mrp: 25, discount: 20, rating: 4.8, reviews: 680, image: "lays-sizzlin-hot.png", category: "snacks", brand: "Kurkure", inStock: true, stock_quantity: 55 },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. DAIRY & BAKERY (catKey: 'dairy' / 'dairy-bakery')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 11, name: "Amul Pasteurised Salted Butter 100g", weight: "100g", price: 56, mrp: 60, discount: 7, rating: 4.9, reviews: 980, image: "amul-butter-real.jpg", category: "dairy", brand: "Amul", inStock: true, stock_quantity: 70 },
  { id: 12, name: "Amul Taaza Homogenised Toned Milk 1L", weight: "1L", price: 74, mrp: 76, discount: 3, rating: 4.8, reviews: 1420, image: "amul-butter-real.jpg", category: "dairy", brand: "Amul", inStock: true, stock_quantity: 85 },
  { id: 13, name: "Amul Processed Cheese Slices 200g (10 Slices)", weight: "200g", price: 135, mrp: 145, discount: 7, rating: 4.8, reviews: 630, image: "amul-butter-real.jpg", category: "dairy", brand: "Amul", inStock: true, stock_quantity: 40 },
  { id: 14, name: "Mother Dairy Malai Fresh Paneer 200g", weight: "200g", price: 92, mrp: 100, discount: 8, rating: 4.7, reviews: 510, image: "amul-butter-real.jpg", category: "dairy", brand: "Mother Dairy", inStock: true, stock_quantity: 30 },
  { id: 15, name: "Britannia Brown Bread Whole Wheat 400g", weight: "400g", price: 45, mrp: 50, discount: 10, rating: 4.6, reviews: 420, image: "amul-butter-real.jpg", category: "dairy", brand: "Britannia", inStock: true, stock_quantity: 25 },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. COLD DRINKS & JUICES (catKey: 'beverages')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 16, name: "Coca-Cola Original Taste Soft Drink 750ml", weight: "750ml", price: 40, mrp: 45, discount: 11, rating: 4.8, reviews: 890, image: "coca-cola-real.jpg", category: "beverages", brand: "Coca-Cola", inStock: true, stock_quantity: 90 },
  { id: 17, name: "Thums Up Strong Soft Drink 750ml Bottle", weight: "750ml", price: 40, mrp: 45, discount: 11, rating: 4.9, reviews: 1100, image: "coca-cola-real.jpg", category: "beverages", brand: "Thums Up", inStock: true, stock_quantity: 75 },
  { id: 18, name: "Sprite Lime Soft Drink 750ml Bottle", weight: "750ml", price: 40, mrp: 45, discount: 11, rating: 4.7, reviews: 650, image: "coca-cola-real.jpg", category: "beverages", brand: "Sprite", inStock: true, stock_quantity: 60 },
  { id: 19, name: "Red Bull Energy Drink 250ml Can", weight: "250ml", price: 120, mrp: 125, discount: 4, rating: 4.8, reviews: 780, image: "coca-cola-real.jpg", category: "beverages", brand: "Red Bull", inStock: true, stock_quantity: 50 },
  { id: 20, name: "Real Fruit Power Alphonso Mango Juice 1L", weight: "1L", price: 110, mrp: 130, discount: 15, rating: 4.7, reviews: 430, image: "coca-cola-real.jpg", category: "beverages", brand: "Real", inStock: true, stock_quantity: 45 },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ATTA, RICE & DAL (catKey: 'staples')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 21, name: "Aashirvaad Shuddh Chakki Whole Wheat Atta 5kg", weight: "5kg", price: 245, mrp: 295, discount: 17, rating: 4.9, reviews: 1650, image: "aashirvaad-atta-real.jpg", category: "staples", brand: "Aashirvaad", inStock: true, stock_quantity: 40 },
  { id: 22, name: "Daawat Rozana Super Basmati Rice 5kg", weight: "5kg", price: 385, mrp: 450, discount: 14, rating: 4.8, reviews: 780, image: "aashirvaad-atta-real.jpg", category: "staples", brand: "Daawat", inStock: true, stock_quantity: 35 },
  { id: 23, name: "Tata Sampann Unpolished Toor Dal 1kg", weight: "1kg", price: 165, mrp: 195, discount: 15, rating: 4.8, reviews: 820, image: "aashirvaad-atta-real.jpg", category: "staples", brand: "Tata Sampann", inStock: true, stock_quantity: 50 },
  { id: 24, name: "Tata Salt Vacuum Evaporated Iodised Salt 1kg", weight: "1kg", price: 25, mrp: 28, discount: 11, rating: 4.9, reviews: 3100, image: "aashirvaad-atta-real.jpg", category: "staples", brand: "Tata Salt", inStock: true, stock_quantity: 120 },
  { id: 25, name: "Tata Sampann Premium Moong Dal Split 1kg", weight: "1kg", price: 145, mrp: 175, discount: 17, rating: 4.7, reviews: 590, image: "aashirvaad-atta-real.jpg", category: "staples", brand: "Tata Sampann", inStock: true, stock_quantity: 45 },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. CHOCOLATES & SWEETS (catKey: 'chocolates')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 26, name: "Cadbury Dairy Milk Silk Chocolate Bar 150g", weight: "150g", price: 165, mrp: 180, discount: 8, rating: 4.9, reviews: 1540, image: "cadbury-silk-real.jpg", category: "chocolates", brand: "Cadbury", inStock: true, stock_quantity: 60 },
  { id: 27, name: "Ferrero Rocher Premium Hazelnut Chocolates 16 Pcs", weight: "200g", price: 499, mrp: 599, discount: 17, rating: 4.9, reviews: 920, image: "cadbury-silk-real.jpg", category: "chocolates", brand: "Ferrero", inStock: true, stock_quantity: 25 },
  { id: 28, name: "KitKat 4-Finger Crisp Wafer Chocolate 38.5g", weight: "38.5g", price: 30, mrp: 35, discount: 14, rating: 4.8, reviews: 830, image: "cadbury-silk-real.jpg", category: "chocolates", brand: "KitKat", inStock: true, stock_quantity: 80 },
  { id: 29, name: "Nutella Hazelnut Cocoa Spread 350g Jar", weight: "350g", price: 360, mrp: 410, discount: 12, rating: 4.9, reviews: 1240, image: "cadbury-silk-real.jpg", category: "chocolates", brand: "Nutella", inStock: true, stock_quantity: 30 },
  { id: 30, name: "Cadbury Celebrations Gift Pack 177g", weight: "177g", price: 135, mrp: 150, discount: 10, rating: 4.9, reviews: 1430, image: "cadbury-silk-real.jpg", category: "chocolates", brand: "Cadbury", inStock: true, stock_quantity: 40 },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. PERSONAL CARE (catKey: 'personal-care')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 31, name: "Dettol Original Liquid Handwash 250ml", weight: "250ml", price: 95, mrp: 110, discount: 14, rating: 4.9, reviews: 1420, image: "dettol-handwash-real.jpg", category: "personal-care", brand: "Dettol", inStock: true, stock_quantity: 65 },
  { id: 32, name: "Head & Shoulders Smooth Anti-Dandruff Shampoo 340ml", weight: "340ml", price: 285, mrp: 340, discount: 16, rating: 4.8, reviews: 890, image: "dettol-handwash-real.jpg", category: "personal-care", brand: "Head & Shoulders", inStock: true, stock_quantity: 40 },
  { id: 33, name: "Dove Cream Beauty Bathing Soap Bar 125g (Pack of 3)", weight: "375g", price: 185, mrp: 215, discount: 14, rating: 4.9, reviews: 1120, image: "dettol-handwash-real.jpg", category: "personal-care", brand: "Dove", inStock: true, stock_quantity: 50 },
  { id: 34, name: "Colgate Strong Teeth Toothpaste 500g Combo", weight: "500g", price: 235, mrp: 275, discount: 15, rating: 4.9, reviews: 2340, image: "dettol-handwash-real.jpg", category: "personal-care", brand: "Colgate", inStock: true, stock_quantity: 75 },
  { id: 35, name: "Nivea Soft Light Moisturizing Cream 200ml", weight: "200ml", price: 299, mrp: 360, discount: 17, rating: 4.8, reviews: 760, image: "dettol-handwash-real.jpg", category: "personal-care", brand: "Nivea", inStock: true, stock_quantity: 35 },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. HOUSEHOLD ESSENTIALS (catKey: 'household')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 36, name: "Surf Excel Easy Wash Detergent Powder 1kg", weight: "1kg", price: 140, mrp: 160, discount: 13, rating: 4.9, reviews: 1890, image: "surf-excel-real.jpg", category: "household", brand: "Surf Excel", inStock: true, stock_quantity: 55 },
  { id: 37, name: "Vim Lemon Dishwash Gel Bottle 500ml", weight: "500ml", price: 110, mrp: 125, discount: 12, rating: 4.8, reviews: 1450, image: "surf-excel-real.jpg", category: "household", brand: "Vim", inStock: true, stock_quantity: 70 },
  { id: 38, name: "Harpic Powerplus Toilet Cleaner Liquid 1L", weight: "1L", price: 195, mrp: 230, discount: 15, rating: 4.9, reviews: 2100, image: "surf-excel-real.jpg", category: "household", brand: "Harpic", inStock: true, stock_quantity: 60 },
  { id: 39, name: "Lizol Disinfectant Surface Floor Cleaner Citrus 1L", weight: "1L", price: 210, mrp: 245, discount: 14, rating: 4.9, reviews: 1650, image: "surf-excel-real.jpg", category: "household", brand: "Lizol", inStock: true, stock_quantity: 45 },
  { id: 40, name: "Colin Glass & Surface Cleaner Spray 500ml", weight: "500ml", price: 105, mrp: 120, discount: 13, rating: 4.8, reviews: 890, image: "surf-excel-real.jpg", category: "household", brand: "Colin", inStock: true, stock_quantity: 50 },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. TEA, COFFEE & DRINKS (catKey: 'tea-coffee')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 41, name: "Nescafe Classic Pure Instant Coffee Jar 100g", weight: "100g", price: 330, mrp: 385, discount: 14, rating: 4.9, reviews: 1420, image: "tea-coffee-hero-transparent.png", category: "tea-coffee", brand: "Nescafe", inStock: true, stock_quantity: 60 },
  { id: 42, name: "Brooke Bond Red Label Premium Tea 500g", weight: "500g", price: 280, mrp: 330, discount: 15, rating: 4.9, reviews: 1890, image: "tea-coffee-hero-transparent.png", category: "tea-coffee", brand: "Red Label", inStock: true, stock_quantity: 75 },
  { id: 43, name: "Tata Tea Gold Assam Premium Tea 500g", weight: "500g", price: 310, mrp: 360, discount: 14, rating: 4.8, reviews: 1340, image: "tea-coffee-hero-transparent.png", category: "tea-coffee", brand: "Tata Tea", inStock: true, stock_quantity: 50 },
  { id: 44, name: "Nescafe Sunrise Instant Coffee Powder 200g Pouch", weight: "200g", price: 380, mrp: 440, discount: 14, rating: 4.8, reviews: 670, image: "tea-coffee-hero-transparent.png", category: "tea-coffee", brand: "Nescafe", inStock: true, stock_quantity: 35 },
  { id: 45, name: "Tata Coffee Grand Instant Coffee 50g", weight: "50g", price: 130, mrp: 155, discount: 16, rating: 4.6, reviews: 290, image: "tea-coffee-hero-transparent.png", category: "tea-coffee", brand: "Tata Coffee", inStock: true, stock_quantity: 40 },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. BISCUITS & COOKIES (catKey: 'biscuits')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 46, name: "Oreo Original Chocolate Cream Biscuit 120g", weight: "120g", price: 35, mrp: 40, discount: 13, rating: 4.8, reviews: 920, image: "oreo-biscuits-real.jpg", category: "biscuits", brand: "Oreo", inStock: true, stock_quantity: 80 },
  { id: 47, name: "Parle-G Original Glucose Biscuits 800g Family Pack", weight: "800g", price: 85, mrp: 95, discount: 11, rating: 4.9, reviews: 3100, image: "oreo-biscuits-real.jpg", category: "biscuits", brand: "Parle", inStock: true, stock_quantity: 110 },
  { id: 48, name: "Parle Hide & Seek Chocolate Chip Cookies 200g", weight: "200g", price: 50, mrp: 60, discount: 17, rating: 4.8, reviews: 1420, image: "oreo-biscuits-real.jpg", category: "biscuits", brand: "Parle", inStock: true, stock_quantity: 65 },
  { id: 49, name: "Britannia Good Day Cashew Biscuits 200g", weight: "200g", price: 45, mrp: 55, discount: 18, rating: 4.9, reviews: 1680, image: "oreo-biscuits-real.jpg", category: "biscuits", brand: "Britannia", inStock: true, stock_quantity: 70 },
  { id: 50, name: "Sunfeast Dark Fantasy Choco Fills Cookies 300g", weight: "300g", price: 140, mrp: 170, discount: 18, rating: 4.9, reviews: 2150, image: "oreo-biscuits-real.jpg", category: "biscuits", brand: "Sunfeast", inStock: true, stock_quantity: 45 },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. INSTANT & FROZEN FOOD (catKey: 'instant-food')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 51, name: "Maggi 2-Minute Masala Instant Noodles 420g (Pack of 6)", weight: "420g", price: 84, mrp: 96, discount: 13, rating: 4.9, reviews: 2450, image: "instant-noodles-hero-transparent.png", category: "instant-food", brand: "Maggi", inStock: true, stock_quantity: 95 },
  { id: 52, name: "Yippee! Magic Masala Instant Noodles 240g (Pack of 4)", weight: "240g", price: 48, mrp: 56, discount: 14, rating: 4.6, reviews: 780, image: "instant-noodles-hero-transparent.png", category: "instant-food", brand: "Yippee!", inStock: true, stock_quantity: 60 },
  { id: 53, name: "Knorr Classic Thick Tomato Soup (Pack of 4)", weight: "176g", price: 60, mrp: 70, discount: 14, rating: 4.7, reviews: 560, image: "instant-noodles-hero-transparent.png", category: "instant-food", brand: "Knorr", inStock: true, stock_quantity: 40 },
  { id: 54, name: "Ching's Secret Hakka Noodles Veg 150g", weight: "150g", price: 35, mrp: 40, discount: 13, rating: 4.8, reviews: 890, image: "instant-noodles-hero-transparent.png", category: "instant-food", brand: "Ching's Secret", inStock: true, stock_quantity: 50 },
  { id: 55, name: "MTR Ready to Eat Paneer Butter Masala 300g", weight: "300g", price: 125, mrp: 145, discount: 14, rating: 4.8, reviews: 620, image: "instant-noodles-hero-transparent.png", category: "instant-food", brand: "MTR", inStock: true, stock_quantity: 35 },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. EDIBLE OILS & GHEE (catKey: 'oil')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 56, name: "Fortune Sunlite Refined Sunflower Oil 1L Pouch", weight: "1L", price: 135, mrp: 165, discount: 18, rating: 4.8, reviews: 1250, image: "fortune-oil-real.jpg", category: "oil", brand: "Fortune", inStock: true, stock_quantity: 75 },
  { id: 57, name: "Fortune Kachi Ghani Pure Mustard Oil 1L Bottle", weight: "1L", price: 155, mrp: 185, discount: 16, rating: 4.9, reviews: 1680, image: "fortune-oil-real.jpg", category: "oil", brand: "Fortune", inStock: true, stock_quantity: 60 },
  { id: 58, name: "Amul Pure Cow Ghee 1L Tin", weight: "1L", price: 580, mrp: 650, discount: 11, rating: 4.9, reviews: 2450, image: "fortune-oil-real.jpg", category: "oil", brand: "Amul", inStock: true, stock_quantity: 40 },
  { id: 59, name: "Saffola Gold Pro Healthy Refined Oil 1L", weight: "1L", price: 165, mrp: 195, discount: 15, rating: 4.8, reviews: 920, image: "fortune-oil-real.jpg", category: "oil", brand: "Saffola", inStock: true, stock_quantity: 50 },
  { id: 60, name: "Borges Extra Virgin Olive Oil 500ml Glass Bottle", weight: "500ml", price: 549, mrp: 750, discount: 27, rating: 4.9, reviews: 890, image: "fortune-oil-real.jpg", category: "oil", brand: "Borges", inStock: true, stock_quantity: 25 },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. ELECTRONICS & GADGETS (catKey: 'electronics')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 61, name: "Sony WH-CH520 Wireless On-Ear Headphones 50H Battery", weight: "1 Unit", price: 3990, mrp: 4990, discount: 20, rating: 4.8, reviews: 1420, image: "electronics-hero-banner.jpg", category: "electronics", brand: "Sony", inStock: true, stock_quantity: 20 },
  { id: 62, name: "JBL Go 3 Ultra Portable Waterproof Bluetooth Speaker", weight: "1 Unit", price: 2499, mrp: 3999, discount: 38, rating: 4.9, reviews: 2150, image: "electronics-hero-banner.jpg", category: "electronics", brand: "JBL", inStock: true, stock_quantity: 30 },
  { id: 63, name: "boAt Wave Call 2 Smartwatch with Bluetooth Calling", weight: "1 Unit", price: 1299, mrp: 4990, discount: 74, rating: 4.7, reviews: 3450, image: "electronics-hero-banner.jpg", category: "electronics", brand: "boAt", inStock: true, stock_quantity: 45 },
  { id: 64, name: "boAt Airdopes 141 TWS Earbuds 42H Playtime", weight: "1 Unit", price: 999, mrp: 2990, discount: 67, rating: 4.6, reviews: 5600, image: "electronics-hero-banner.jpg", category: "electronics", brand: "boAt", inStock: true, stock_quantity: 50 },
  { id: 65, name: "Mi Power Bank 3i 20000mAh 18W Fast Charging", weight: "1 Unit", price: 1899, mrp: 2499, discount: 24, rating: 4.8, reviews: 3450, image: "electronics-hero-banner.jpg", category: "electronics", brand: "Xiaomi", inStock: true, stock_quantity: 35 },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. FASHION & ACCESSORIES (catKey: 'fashion')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 66, name: "Nike Revolution 6 Next Nature Men's Running Shoes", weight: "1 Pair", price: 2995, mrp: 3695, discount: 19, rating: 4.8, reviews: 890, image: "sneakers.jpg", category: "fashion", brand: "Nike", inStock: true, stock_quantity: 25 },
  { id: 67, name: "Ray-Ban Aviator Classic UV Protection Sunglasses", weight: "1 Unit", price: 5490, mrp: 6590, discount: 17, rating: 4.9, reviews: 420, image: "sneakers.jpg", category: "fashion", brand: "Ray-Ban", inStock: true, stock_quantity: 15 },
  { id: 68, name: "Titan Karishma Analog Dial Leather Men's Watch", weight: "1 Unit", price: 1895, mrp: 2295, discount: 17, rating: 4.8, reviews: 670, image: "sneakers.jpg", category: "fashion", brand: "Titan", inStock: true, stock_quantity: 20 },
  { id: 69, name: "Puma Mens Comet 2 Alt Running Shoes", weight: "1 Pair", price: 1999, mrp: 3999, discount: 50, rating: 4.7, reviews: 1120, image: "sneakers.jpg", category: "fashion", brand: "Puma", inStock: true, stock_quantity: 30 },
  { id: 70, name: "Wildhorn Genuine Leather Men's RFID Wallet", weight: "1 Unit", price: 449, mrp: 1499, discount: 70, rating: 4.8, reviews: 2340, image: "sneakers.jpg", category: "fashion", brand: "Wildhorn", inStock: true, stock_quantity: 40 },
];

export let products = [...baseProducts];

export function getProductById(id) {
  return products.find((p) => String(p.id) === String(id));
}

export function searchProducts(query) {
  if (!query || typeof query !== 'string') return [];
  const q = query.toLowerCase().trim();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q))
  );
}

export function getProductsByCategory(categorySlug) {
  if (!categorySlug) return [];
  const slug = categorySlug.toLowerCase().trim();
  return products.filter((p) => p.category && p.category.toLowerCase() === slug);
}

// Dynamic sync mechanism with backend API & LocalStorage
export async function syncProductsFromBackend() {
  try {
    const res = await get('/products/').catch(() => []);
    const apiProducts = Array.isArray(res) ? res : (res?.results || []);
    if (apiProducts.length > 0) {
      const merged = [...baseProducts];
      const seenIds = new Set(merged.map((p) => String(p.id)));

      for (const apiProd of apiProducts) {
        const prodIdStr = String(apiProd.id);
        if (!seenIds.has(prodIdStr)) {
          merged.push({
            id: apiProd.id,
            name: apiProd.name,
            price: Number(apiProd.price) || 0,
            mrp: Number(apiProd.mrp || apiProd.price) || 0,
            image: apiProd.image_url || apiProd.image || 'default-product.png',
            category: apiProd.category_slug || apiProd.category_id || 'produce',
            brand: apiProd.brand || 'Grabit Fresh',
            inStock: (apiProd.stock ?? apiProd.stock_quantity ?? 1) > 0,
            stock_quantity: parseInt(apiProd.stock ?? apiProd.stock_quantity ?? 50, 10),
          });
          seenIds.add(prodIdStr);
        }
      }

      products.length = 0;
      products.push(...merged);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('grabit_products_synced'));
      }
    }
  } catch (err) {
    console.warn('Sync products error:', err);
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncProductsFromBackend();
  }, 0);

  window.addEventListener('grabit_products_updated', syncProductsFromBackend);
  window.addEventListener('storage', syncProductsFromBackend);
}

