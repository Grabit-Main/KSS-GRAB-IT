import { get } from '../api';
import { inferProductCategory, getCanonicalSlug } from './categories';

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

  // ──────────────────────────────────────────────────────────────────────────
  // 15. BABY CARE & INFANT NEEDS (catKey: 'baby-care')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 71, name: "Pampers All Round Protection Baby Diaper Pants (Medium, 54 Pcs)", weight: "54 Pcs", price: 649, mrp: 899, discount: 28, rating: 4.8, reviews: 3200, image: "category-baby-care.jpg", category: "baby-care", brand: "Pampers", inStock: true, stock_quantity: 40 },
  { id: 72, name: "Johnson's Baby Gentle No Tears Shampoo (500ml)", weight: "500 ml", price: 320, mrp: 395, discount: 19, rating: 4.9, reviews: 1840, image: "category-baby-care.jpg", category: "baby-care", brand: "Johnson's", inStock: true, stock_quantity: 35 },
  { id: 73, name: "Himalaya Gentle Baby Wipes with Aloe Vera & Indian Lotus (72 Wipes)", weight: "72 Wipes", price: 145, mrp: 190, discount: 24, rating: 4.8, reviews: 4500, image: "category-baby-care.jpg", category: "baby-care", brand: "Himalaya", inStock: true, stock_quantity: 60 },
  { id: 74, name: "Nestle Cerelac Baby Cereal with Milk Wheat Apple (300g)", weight: "300 g", price: 290, mrp: 330, discount: 12, rating: 4.7, reviews: 1200, image: "category-baby-care.jpg", category: "baby-care", brand: "Nestle", inStock: true, stock_quantity: 30 },
  { id: 75, name: "Johnson's Baby Nourishing Moisture Lotion (500ml)", weight: "500 ml", price: 335, mrp: 425, discount: 21, rating: 4.9, reviews: 2100, image: "category-baby-care.jpg", category: "baby-care", brand: "Johnson's", inStock: true, stock_quantity: 45 },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. PET CARE & SUPPLIES (catKey: 'pet-care')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 76, name: "Pedigree Adult Dry Dog Food Real Chicken & Meat (3kg)", weight: "3 kg", price: 675, mrp: 810, discount: 17, rating: 4.8, reviews: 2900, image: "category-pet-care.jpg", category: "pet-care", brand: "Pedigree", inStock: true, stock_quantity: 30 },
  { id: 77, name: "Whiskas Adult Wet Cat Food Ocean Fish in Jelly (12 x 85g)", weight: "1.02 kg", price: 480, mrp: 600, discount: 20, rating: 4.9, reviews: 1450, image: "category-pet-care.jpg", category: "pet-care", brand: "Whiskas", inStock: true, stock_quantity: 25 },
  { id: 78, name: "Pedigree Dentastix Daily Oral Care Chews Dog Treats (7 Sticks)", weight: "180 g", price: 180, mrp: 220, discount: 18, rating: 4.8, reviews: 3600, image: "category-pet-care.jpg", category: "pet-care", brand: "Pedigree", inStock: true, stock_quantity: 50 },
  { id: 79, name: "Captain Zack Barking Up The Tea Tree Relieving Dog Shampoo (200ml)", weight: "200 ml", price: 265, mrp: 350, discount: 24, rating: 4.7, reviews: 820, image: "category-pet-care.jpg", category: "pet-care", brand: "Captain Zack", inStock: true, stock_quantity: 30 },
  { id: 80, name: "Drools Absolute Calcium Bone Supplement Treats for Dogs (50 Pcs)", weight: "50 Pcs", price: 299, mrp: 399, discount: 25, rating: 4.8, reviews: 1980, image: "category-pet-care.jpg", category: "pet-care", brand: "Drools", inStock: true, stock_quantity: 40 },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. BEAUTY, SKINCARE & COSMETICS (catKey: 'beauty-cosmetics')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 81, name: "Minimalist 10% Niacinamide Face Serum with Zinc (30ml)", weight: "30 ml", price: 569, mrp: 599, discount: 5, rating: 4.9, reviews: 6200, image: "category-beauty-cosmetics.jpg", category: "beauty-cosmetics", brand: "Minimalist", inStock: true, stock_quantity: 35 },
  { id: 82, name: "Maybelline New York Colossal Bold Black Kajal (0.35g)", weight: "0.35 g", price: 155, mrp: 199, discount: 22, rating: 4.8, reviews: 9400, image: "category-beauty-cosmetics.jpg", category: "beauty-cosmetics", brand: "Maybelline", inStock: true, stock_quantity: 80 },
  { id: 83, name: "Lakme Sun Expert SPF 50 Ultra Matte Sunscreen Lotion (100ml)", weight: "100 ml", price: 375, mrp: 499, discount: 25, rating: 4.7, reviews: 3100, image: "category-beauty-cosmetics.jpg", category: "beauty-cosmetics", brand: "Lakme", inStock: true, stock_quantity: 40 },
  { id: 84, name: "Garnier Skin Naturals Micellar Cleansing Water (125ml)", weight: "125 ml", price: 185, mrp: 249, discount: 26, rating: 4.8, reviews: 4800, image: "category-beauty-cosmetics.jpg", category: "beauty-cosmetics", brand: "Garnier", inStock: true, stock_quantity: 50 },
  { id: 85, name: "Nivea Soft Light Moisturizing Cream with Vitamin E (200ml)", weight: "200 ml", price: 240, mrp: 320, discount: 25, rating: 4.9, reviews: 5400, image: "category-beauty-cosmetics.jpg", category: "beauty-cosmetics", brand: "Nivea", inStock: true, stock_quantity: 60 },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. HEALTH, WELLNESS & PHARMACY (catKey: 'health-wellness')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 86, name: "Dabur Chyawanprash 2X Immunity Booster (1kg)", weight: "1 kg", price: 375, mrp: 450, discount: 17, rating: 4.9, reviews: 7800, image: "category-health-wellness.jpg", category: "health-wellness", brand: "Dabur", inStock: true, stock_quantity: 45 },
  { id: 87, name: "Revital H Daily Health Supplement Multivitamins (30 Capsules)", weight: "30 Capsules", price: 280, mrp: 340, discount: 18, rating: 4.8, reviews: 4200, image: "category-health-wellness.jpg", category: "health-wellness", brand: "Revital", inStock: true, stock_quantity: 50 },
  { id: 88, name: "Volini Instant Pain Relief Spray (100g)", weight: "100 g", price: 195, mrp: 245, discount: 20, rating: 4.9, reviews: 3600, image: "category-health-wellness.jpg", category: "health-wellness", brand: "Volini", inStock: true, stock_quantity: 60 },
  { id: 89, name: "Fast&Up Charge Natural Vitamin C & Zinc Effervescent (20 Tablets)", weight: "20 Tabs", price: 299, mrp: 390, discount: 23, rating: 4.8, reviews: 2900, image: "category-health-wellness.jpg", category: "health-wellness", brand: "Fast&Up", inStock: true, stock_quantity: 40 },
  { id: 90, name: "Dr. Morepen Digital Rigid Tip Medical Thermometer (1 Unit)", weight: "1 Unit", price: 149, mrp: 225, discount: 34, rating: 4.7, reviews: 1800, image: "category-health-wellness.jpg", category: "health-wellness", brand: "Dr. Morepen", inStock: true, stock_quantity: 35 },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. FRESH MEAT, SEAFOOD & EGGS (catKey: 'meat-seafood')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 91, name: "Fresh Farm Tender Chicken Breast Boneless (500g)", weight: "500 g", price: 199, mrp: 260, discount: 23, rating: 4.9, reviews: 3400, image: "category-meat-seafood.jpg", category: "meat-seafood", brand: "Grabit Fresh", inStock: true, stock_quantity: 40 },
  { id: 92, name: "Farm Fresh Country Brown Eggs Pack (12 Pcs)", weight: "12 Pcs", price: 119, mrp: 150, discount: 21, rating: 4.8, reviews: 5200, image: "category-meat-seafood.jpg", category: "meat-seafood", brand: "Grabit Fresh", inStock: true, stock_quantity: 80 },
  { id: 93, name: "Fresh Atlantic Pink Salmon Steaks Cut (500g)", weight: "500 g", price: 699, mrp: 899, discount: 22, rating: 4.9, reviews: 1100, image: "category-meat-seafood.jpg", category: "meat-seafood", brand: "Grabit Fresh", inStock: true, stock_quantity: 20 },
  { id: 94, name: "Fresh Premium Chicken Curry Cut Skinless (1kg)", weight: "1 kg", price: 249, mrp: 320, discount: 22, rating: 4.8, reviews: 4100, image: "category-meat-seafood.jpg", category: "meat-seafood", brand: "Grabit Fresh", inStock: true, stock_quantity: 50 },
  { id: 95, name: "Fresh River Prawns Cleaned & Deveined (250g)", weight: "250 g", price: 289, mrp: 380, discount: 24, rating: 4.7, reviews: 980, image: "category-meat-seafood.jpg", category: "meat-seafood", brand: "Grabit Fresh", inStock: true, stock_quantity: 25 },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. HOME & KITCHEN (catKey: 'home-kitchen')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 96, name: "Prestige Deluxe Alpha Stainless Steel Pressure Cooker (3L)", weight: "3 L", price: 1499, mrp: 2150, discount: 30, rating: 4.8, reviews: 2900, image: "category-home-kitchen.jpg", category: "home-kitchen", brand: "Prestige", inStock: true, stock_quantity: 30 },
  { id: 97, name: "Milton Thermosteel Flip Lid Vacuum Flask Bottle (1000ml)", weight: "1000 ml", price: 799, mrp: 1099, discount: 27, rating: 4.9, reviews: 4600, image: "category-home-kitchen.jpg", category: "home-kitchen", brand: "Milton", inStock: true, stock_quantity: 45 },
  { id: 98, name: "Hawkins Futura Hard Anodised Non-Stick Frying Pan (22cm)", weight: "22 cm", price: 890, mrp: 1175, discount: 24, rating: 4.8, reviews: 3100, image: "category-home-kitchen.jpg", category: "home-kitchen", brand: "Hawkins", inStock: true, stock_quantity: 35 },
  { id: 99, name: "Borosil Glass Lunch Box Meal Container Set with Bag (3 Pcs)", weight: "3 Pcs", price: 945, mrp: 1290, discount: 27, rating: 4.9, reviews: 2400, image: "category-home-kitchen.jpg", category: "home-kitchen", brand: "Borosil", inStock: true, stock_quantity: 25 },
  { id: 100, name: "Pigeon Stainless Steel Kitchen Knife Set with Wooden Block (5 Pcs)", weight: "5 Pcs", price: 449, mrp: 795, discount: 44, rating: 4.7, reviews: 1850, image: "category-home-kitchen.jpg", category: "home-kitchen", brand: "Pigeon", inStock: true, stock_quantity: 40 },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. STATIONERY & OFFICE SUPPLIES (catKey: 'stationery-office')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 101, name: "Classmate Pulse 6-Subject Spiral Notebook (300 Pages)", weight: "300 Pages", price: 180, mrp: 220, discount: 18, rating: 4.8, reviews: 3800, image: "category-stationery-office.jpg", category: "stationery-office", brand: "Classmate", inStock: true, stock_quantity: 60 },
  { id: 102, name: "Parker Jotter Stainless Steel CT Ballpoint Pen (Blue Ink)", weight: "1 Pen", price: 299, mrp: 375, discount: 20, rating: 4.9, reviews: 5100, image: "category-stationery-office.jpg", category: "stationery-office", brand: "Parker", inStock: true, stock_quantity: 50 },
  { id: 103, name: "Faber-Castell Connector Sketch Pen & Marker Set (25 Colors)", weight: "25 Colors", price: 195, mrp: 250, discount: 22, rating: 4.8, reviews: 2900, image: "category-stationery-office.jpg", category: "stationery-office", brand: "Faber-Castell", inStock: true, stock_quantity: 40 },
  { id: 104, name: "Scotch Magic Tape with Dispenser + Precision Scissors Combo", weight: "1 Combo", price: 165, mrp: 225, discount: 27, rating: 4.8, reviews: 1950, image: "category-stationery-office.jpg", category: "stationery-office", brand: "Scotch", inStock: true, stock_quantity: 45 },
  { id: 105, name: "Casio FX-991CW Scientific ClassWiz Calculator (540 Functions)", weight: "1 Unit", price: 1295, mrp: 1495, discount: 13, rating: 4.9, reviews: 6300, image: "category-stationery-office.jpg", category: "stationery-office", brand: "Casio", inStock: true, stock_quantity: 30 },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. SPORTS & FITNESS (catKey: 'sports-fitness')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 106, name: "Yonex Nanoray Carbon Light Badminton Racket with Cover", weight: "1 Racket", price: 1699, mrp: 2490, discount: 32, rating: 4.9, reviews: 4100, image: "category-sports-fitness.jpg", category: "sports-fitness", brand: "Yonex", inStock: true, stock_quantity: 25 },
  { id: 107, name: "MuscleBlaze 100% Raw Whey Protein Concentrate (1kg)", weight: "1 kg", price: 1799, mrp: 2399, discount: 25, rating: 4.8, reviews: 8200, image: "category-sports-fitness.jpg", category: "sports-fitness", brand: "MuscleBlaze", inStock: true, stock_quantity: 35 },
  { id: 108, name: "Boldfit Gym Shaker Bottle with Protein Mixer Whisk Ball (700ml)", weight: "700 ml", price: 249, mrp: 499, discount: 50, rating: 4.8, reviews: 3400, image: "category-sports-fitness.jpg", category: "sports-fitness", brand: "Boldfit", inStock: true, stock_quantity: 50 },
  { id: 109, name: "Nivia Storm Rubber Moulded Tournament Football (Size 5)", weight: "Size 5", price: 475, mrp: 650, discount: 27, rating: 4.7, reviews: 2900, image: "category-sports-fitness.jpg", category: "sports-fitness", brand: "Nivia", inStock: true, stock_quantity: 40 },
  { id: 110, name: "Strava Anti-Slip High Density Eco Yoga Mat with Strap (6mm)", weight: "6 mm", price: 699, mrp: 1299, discount: 46, rating: 4.8, reviews: 2200, image: "category-sports-fitness.jpg", category: "sports-fitness", brand: "Strava", inStock: true, stock_quantity: 30 },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. TOYS & GAMES (catKey: 'toys-games')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 111, name: "LEGO Classic Creative Brick Box Building Toy Set (484 Pcs)", weight: "484 Pcs", price: 1799, mrp: 2299, discount: 22, rating: 4.9, reviews: 3700, image: "category-toys-games.jpg", category: "toys-games", brand: "LEGO", inStock: true, stock_quantity: 20 },
  { id: 112, name: "Monopoly Classic Family Board Game Edition", weight: "1 Box", price: 799, mrp: 999, discount: 20, rating: 4.8, reviews: 5400, image: "category-toys-games.jpg", category: "toys-games", brand: "Hasbro", inStock: true, stock_quantity: 35 },
  { id: 113, name: "Hot Wheels 5-Car Diecast Vehicle Gift Pack Assortment", weight: "5 Cars", price: 599, mrp: 749, discount: 20, rating: 4.9, reviews: 6800, image: "category-toys-games.jpg", category: "toys-games", brand: "Hot Wheels", inStock: true, stock_quantity: 50 },
  { id: 114, name: "Rubik's Original 3x3 Speed Cube Puzzle", weight: "1 Cube", price: 399, mrp: 599, discount: 33, rating: 4.8, reviews: 4200, image: "category-toys-games.jpg", category: "toys-games", brand: "Rubik's", inStock: true, stock_quantity: 45 },
  { id: 115, name: "Barbie Fashionistas Doll with Trendy Outfit & Accessories", weight: "1 Doll", price: 549, mrp: 699, discount: 21, rating: 4.8, reviews: 3100, image: "category-toys-games.jpg", category: "toys-games", brand: "Barbie", inStock: true, stock_quantity: 30 },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. POOJA & SPIRITUAL NEEDS (catKey: 'pooja-needs')
  // ──────────────────────────────────────────────────────────────────────────
  { id: 116, name: "Cycle Pure Agarbatti Lia Fragrance Incense Sticks (120 Sticks)", weight: "120 Sticks", price: 140, mrp: 175, discount: 20, rating: 4.9, reviews: 8100, image: "category-pooja-needs.jpg", category: "pooja-needs", brand: "Cycle Pure", inStock: true, stock_quantity: 90 },
  { id: 117, name: "Mangaldeep Pure Brass Puja Diya Oil Lamp (Medium)", weight: "1 Unit", price: 249, mrp: 350, discount: 29, rating: 4.8, reviews: 2900, image: "category-pooja-needs.jpg", category: "pooja-needs", brand: "Mangaldeep", inStock: true, stock_quantity: 40 },
  { id: 118, name: "Bhimseni Pure Camphor Kapoor Crystals for Pooja (100g)", weight: "100 g", price: 199, mrp: 260, discount: 23, rating: 4.9, reviews: 5700, image: "category-pooja-needs.jpg", category: "pooja-needs", brand: "Bhimseni", inStock: true, stock_quantity: 65 },
  { id: 119, name: "Pooja Pure Ghee Diya Wicks Readymade Batti (50 Pcs)", weight: "50 Pcs", price: 120, mrp: 160, discount: 25, rating: 4.8, reviews: 3600, image: "category-pooja-needs.jpg", category: "pooja-needs", brand: "Shubhkart", inStock: true, stock_quantity: 80 },
  { id: 120, name: "Patanjali Pure Haldi Kumkum & Roli Chawal Festive Set", weight: "1 Set", price: 99, mrp: 130, discount: 24, rating: 4.8, reviews: 2400, image: "category-pooja-needs.jpg", category: "pooja-needs", brand: "Patanjali", inStock: true, stock_quantity: 75 },
];

export let products = [...baseProducts];

export function getProductById(id) {
  return products.find((p) => String(p.id) === String(id));
}

export const SEARCH_SYNONYMS = {
  coke: ['coca-cola', 'coca cola', 'soft drink', 'beverages', 'cold drinks', 'drink', 'soda'],
  pepsi: ['cold drinks', 'soft drink', 'beverages', 'soda'],
  chips: ['lays', 'potato chips', 'namkeen', 'bingo', 'doritos', 'kurkure', 'snacks', 'munchies'],
  wafer: ['wafers', 'chips', 'snacks'],
  milk: ['amul', 'nandini', 'dairy', 'taaza', 'toned', 'cow milk'],
  doodh: ['milk', 'dairy', 'amul'],
  curd: ['dahi', 'yogurt', 'dairy', 'amul'],
  cheese: ['amul', 'slices', 'paneer', 'dairy'],
  butter: ['amul', 'dairy', 'table butter'],
  bread: ['bakery', 'loaf', 'pav', 'dairy-bakery'],
  apple: ['apples', 'fresh', 'fruits', 'produce', 'royal gala'],
  fruits: ['produce', 'fruit', 'apple', 'banana', 'orange', 'fresh', 'fruits-vegetables'],
  fruit: ['produce', 'fruits', 'apple', 'banana', 'fresh', 'fruits-vegetables'],
  vegetables: ['veggies', 'produce', 'fresh', 'tomato', 'potato', 'onion', 'capsicum', 'fruits-vegetables'],
  veggies: ['vegetables', 'produce', 'fresh', 'tomato', 'onion', 'capsicum', 'fruits-vegetables'],
  sabzi: ['vegetables', 'veggies', 'produce'],
  tomato: ['tomatoes', 'produce', 'vegetables'],
  onion: ['onions', 'produce', 'vegetables'],
  banana: ['bananas', 'produce', 'fruits'],
  atta: ['wheat', 'flour', 'aashirvaad', 'chakki', 'staples'],
  rice: ['basmati', 'chawal', 'daawat', 'india gate', 'staples', 'grains'],
  dal: ['dals', 'pulses', 'toor', 'moong', 'chana', 'staples'],
  oil: ['edible oil', 'sunflower', 'mustard', 'fortune', 'ghee'],
  tel: ['oil', 'edible oil', 'ghee'],
  ghee: ['amul', 'pure ghee', 'desi ghee', 'oil', 'dairy'],
  biscuit: ['biscuits', 'cookies', 'parle', 'oreo', 'good day', 'britannia'],
  biscuits: ['biscuit', 'cookies', 'parle', 'oreo', 'good day', 'britannia'],
  cookies: ['biscuits', 'biscuit', 'cookies'],
  chocolate: ['chocolates', 'cadbury', 'silk', 'dairy milk', 'kitkat', 'nestle', 'sweets'],
  chocolates: ['chocolate', 'cadbury', 'silk', 'dairy milk', 'kitkat', 'sweets'],
  sweet: ['sweets', 'mithai', 'chocolate', 'chocolates'],
  icecream: ['ice cream', 'ice-cream', 'amul', 'kwality walls'],
  diaper: ['diapers', 'pampers', 'baby-care', 'huggies', 'pants'],
  diapers: ['diaper', 'pampers', 'baby-care', 'huggies'],
  baby: ['baby-care', 'pampers', 'himalaya', 'johnson', 'cerelac', 'diaper', 'wipes'],
  wipes: ['baby-care', 'himalaya', 'wet wipes'],
  dog: ['pet-care', 'pedigree', 'dog food', 'dentastix', 'drools'],
  cat: ['pet-care', 'whiskas', 'cat food'],
  pet: ['pet-care', 'dog food', 'cat food', 'pedigree', 'whiskas'],
  shampoo: ['personal-care', 'hair', 'head & shoulders', 'pantene', 'dove', 'baby shampoo'],
  soap: ['personal-care', 'bath', 'dettol', 'dove', 'lifebuoy', 'pears', 'lux'],
  toothpaste: ['personal-care', 'colgate', 'pepsodent', 'sensodyne', 'brush'],
  cream: ['beauty-cosmetics', 'personal-care', 'lotion', 'nivea', 'ponds', 'skin'],
  lotion: ['beauty-cosmetics', 'personal-care', 'nivea', 'vaseline', 'moisturizer'],
  lipstick: ['beauty-cosmetics', 'makeup', 'maybelline', 'lakme'],
  makeup: ['beauty-cosmetics', 'lipstick', 'kajal', 'foundation', 'eyeliner'],
  medicine: ['health-wellness', 'pharmacy', 'dettol', 'bandage', 'vicks', 'crocin'],
  health: ['health-wellness', 'wellness', 'vitamins', 'protein', 'dettol'],
  chicken: ['meat-seafood', 'fresh chicken', 'meat', 'poultry'],
  meat: ['meat-seafood', 'chicken', 'mutton', 'fish', 'eggs'],
  egg: ['eggs', 'meat-seafood', 'farm fresh eggs'],
  eggs: ['egg', 'meat-seafood', 'farm fresh eggs'],
  fish: ['meat-seafood', 'seafood', 'prawns'],
  pan: ['home-kitchen', 'cookware', 'kitchen', 'tawa', 'kadhai'],
  kitchen: ['home-kitchen', 'bottle', 'container', 'knife', 'cooker'],
  pen: ['stationery-office', 'pencil', 'notebook', 'parker', 'classmate'],
  notebook: ['stationery-office', 'book', 'paper', 'classmate', 'register'],
  cricket: ['sports-fitness', 'bat', 'ball', 'sports'],
  badminton: ['sports-fitness', 'racket', 'shuttlecock', 'sports'],
  yoga: ['sports-fitness', 'mat', 'fitness'],
  gym: ['sports-fitness', 'fitness', 'protein', 'dumbbell'],
  toy: ['toys-games', 'game', 'puzzle', 'board game', 'car'],
  toys: ['toys-games', 'games', 'puzzle', 'lego'],
  puzzle: ['toys-games', 'puzzles', 'board games'],
  game: ['toys-games', 'games', 'board game'],
  pooja: ['pooja-needs', 'agarbatti', 'diya', 'camphor', 'incense', 'dhoop'],
  agarbatti: ['pooja-needs', 'incense sticks', 'cycle', 'zed black'],
  diya: ['pooja-needs', 'batti', 'wicks', 'oil lamp'],
  tea: ['tea-coffee', 'chai', 'red label', 'tata tea', 'taj mahal'],
  coffee: ['tea-coffee', 'nescafe', 'bru'],
  maggi: ['instant-food', 'noodles', 'instant noodles', 'nestle'],
  noodles: ['instant-food', 'maggi', 'yippee', 'ramen', 'instant noodles']
};

export function searchProducts(query) {
  if (!query || typeof query !== 'string') return [];
  const rawQ = query.trim();
  if (!rawQ) return [];

  const normalize = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizeNoSpace = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const containsWord = (text, word) => new RegExp('\\b' + escapeRe(word) + '\\b', 'i').test(text);
  const startsWithWord = (text, word) => new RegExp('\\b' + escapeRe(word), 'i').test(text);

  const qNorm = normalize(rawQ);
  const qNoSpace = normalizeNoSpace(rawQ);
  if (!qNorm) return [];

  // Special predefined queries
  if (qNorm === 'trending' || qNorm === 'popular' || qNorm === 'top' || qNorm === 'best') {
    return products.filter(p => ['snacks', 'dairy', 'beverages', 'staples', 'household'].includes(p.category || p.category_slug));
  }
  if (qNorm === 'deals' || qNorm === 'offers' || qNorm === 'discount') {
    return products.filter(p => (p.discount || 0) >= 15);
  }
  if (qNorm === 'all') {
    return [...products];
  }

  const queryWords = qNorm.split(' ').filter(Boolean);

  // Synonyms / aliases expansion
  const querySynonyms = new Set();
  queryWords.forEach(w => {
    if (SEARCH_SYNONYMS[w]) {
      SEARCH_SYNONYMS[w].forEach(s => {
        const sNorm = normalize(s);
        if (sNorm && sNorm !== qNorm) querySynonyms.add(sNorm);
      });
    }
  });

  const scored = [];

  for (const p of products) {
    const pNameNorm = normalize(p.name);
    const pBrandNorm = normalize(p.brand);
    const pCatNorm = normalize(p.category + ' ' + (p.category_name || ''));
    const pSubNorm = normalize(p.subCategory || '');
    const pNameNoSpace = normalizeNoSpace(p.name);
    const pBrandNoSpace = normalizeNoSpace(p.brand);

    let score = 0;

    // 1. Exact phrase matches in Name
    if (pNameNorm === qNorm || pNameNoSpace === qNoSpace) {
      score += 500;
    } else if (pNameNorm.startsWith(qNorm) || pNameNoSpace.startsWith(qNoSpace)) {
      score += 350;
    } else if (pNameNorm.includes(qNorm) || pNameNoSpace.includes(qNoSpace)) {
      score += 250;
    }

    // 2. Brand phrase match
    if (pBrandNorm === qNorm || pBrandNoSpace === qNoSpace) {
      score += 300;
    } else if (pBrandNorm.includes(qNorm) || pBrandNoSpace.includes(qNoSpace)) {
      score += 180;
    }

    // 3. Query words matching with word boundary
    for (const qw of queryWords) {
      if (containsWord(pNameNorm, qw)) {
        score += 120;
      } else if (startsWithWord(pNameNorm, qw)) {
        score += 80;
      } else if (containsWord(pBrandNorm, qw)) {
        score += 90;
      } else if (containsWord(pCatNorm, qw) || containsWord(pSubNorm, qw)) {
        score += 50;
      }
    }

    // 4. Synonym / alias matches (only if whole word or exact phrase)
    for (const syn of querySynonyms) {
      if (syn.includes(' ')) {
        if (pNameNorm.includes(syn) || pBrandNorm.includes(syn)) {
          score += 140;
        }
      } else {
        if (containsWord(pNameNorm, syn)) {
          score += 100;
        } else if (containsWord(pBrandNorm, syn)) {
          score += 80;
        } else if (containsWord(pCatNorm, syn)) {
          score += 40;
        }
      }
    }

    // Boost if in stock and high rating
    if (score > 0) {
      if (p.inStock) score += 5;
      score += (p.rating || 0) * 0.5;
      scored.push({ product: p, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.product);
}

export function getProductsByCategory(categorySlug) {
  if (!categorySlug) return [];
  const slug = categorySlug.toLowerCase().trim();
  return products.filter((p) => p.category && p.category.toLowerCase() === slug);
}

// Dynamic sync mechanism with backend API & LocalStorage
export async function syncProductsFromBackend() {
  try {
    let apiProducts = [];
    try {
      const res = await get('/products/').catch(() => []);
      apiProducts = Array.isArray(res) ? res : (res?.results || []);
    } catch {}

    let customSellerProducts = [];
    try {
      customSellerProducts = JSON.parse(localStorage.getItem('grabit_seller_custom_products') || '[]');
    } catch {}

    let deletedIds = new Set();
    try {
      deletedIds = new Set(JSON.parse(localStorage.getItem('grabit_seller_deleted_product_ids') || '[]').map(String));
    } catch {}

    let overrides = {};
    try {
      overrides = JSON.parse(localStorage.getItem('grabit_seller_product_overrides') || '{}');
    } catch {}

    const merged = [];
    const seenIds = new Set();

    // 1. Process custom seller products first
    for (const cp of customSellerProducts) {
      const idStr = String(cp.id);
      if (deletedIds.has(idStr)) continue;
      seenIds.add(idStr);

      const resolvedCategory = inferProductCategory(cp);

      merged.push({
        id: cp.id,
        name: cp.name,
        price: Number(cp.price) || 0,
        mrp: Number(cp.mrp || cp.discount_price || cp.price) || 0,
        discount: cp.mrp ? Math.round(((cp.mrp - cp.price) / cp.mrp) * 100) : 10,
        image: cp.image || cp.image_url || '/grabit-logo.png',
        category: resolvedCategory,
        category_slug: resolvedCategory,
        category_name: cp.category_name || resolvedCategory,
        category_id: cp.category_id || '',
        brand: cp.brand || 'Grabit Seller',
        weight: cp.unit || '1 unit',
        delivery_time: cp.delivery_time || '8 mins',
        rating: Number(cp.rating) || 5.0,
        reviews: Number(cp.reviews) || 1,
        inStock: cp.is_active !== false && (cp.stock_quantity === undefined || Number(cp.stock_quantity) > 0),
        stock_quantity: parseInt(cp.stock_quantity ?? 50, 10),
      });
    }

    // 2. Process API products
    for (const apiProd of apiProducts) {
      const idStr = String(apiProd.id);
      if (deletedIds.has(idStr)) continue;

      const ov = overrides[idStr] || {};
      const resolvedCategory = inferProductCategory({ ...apiProd, ...ov });

      const prodObj = {
        id: apiProd.id,
        name: ov.name || apiProd.name,
        price: Number(ov.price ?? apiProd.price) || 0,
        mrp: Number(ov.mrp ?? apiProd.mrp ?? apiProd.price) || 0,
        discount: 10,
        image: ov.image || apiProd.image_url || apiProd.image || 'default-product.png',
        category: resolvedCategory,
        category_slug: resolvedCategory,
        category_name: ov.category_name || apiProd.category_name || resolvedCategory,
        category_id: apiProd.category_id || '',
        brand: ov.brand || apiProd.brand || 'Grabit Fresh',
        weight: '1 unit',
        rating: 5.0,
        reviews: 1,
        inStock: ov.inStock ?? ((apiProd.stock ?? apiProd.stock_quantity ?? 1) > 0),
        stock_quantity: parseInt(ov.stock_quantity ?? apiProd.stock ?? apiProd.stock_quantity ?? 50, 10),
      };

      if (seenIds.has(idStr)) {
        const idx = merged.findIndex(p => String(p.id) === idStr);
        if (idx >= 0) merged[idx] = { ...merged[idx], ...prodObj };
      } else {
        merged.push(prodObj);
        seenIds.add(idStr);
      }
    }

    // 3. Process base products
    for (const bp of baseProducts) {
      const idStr = String(bp.id);
      if (deletedIds.has(idStr)) continue;
      if (!seenIds.has(idStr)) {
        const ov = overrides[idStr] || {};
        const resolvedCategory = inferProductCategory({ ...bp, ...ov });
        merged.push({
          ...bp,
          ...ov,
          category: resolvedCategory,
          category_slug: resolvedCategory,
          category_name: bp.category_name || resolvedCategory,
        });
        seenIds.add(idStr);
      }
    }

    products.length = 0;
    products.push(...merged);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grabit_products_synced'));
    }
  } catch (err) {
    console.warn('Sync products error:', err);
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncProductsFromBackend();
  }, 0);

  setInterval(() => {
    syncProductsFromBackend();
  }, 3000);

  window.addEventListener('grabit_products_updated', syncProductsFromBackend);
  window.addEventListener('storage', syncProductsFromBackend);
}

