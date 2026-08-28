// ==========================================================================
// Grabit Quick Commerce - Mock Backend Database & LocalStorage Engine
// Fully functional client-side store for offline/standalone execution
// ==========================================================================

const STORAGE_KEYS = {
  SELLER: 'grabit_seller_profile',
  TOKEN: 'grabit_seller_access',
  CATEGORIES: 'grabit_mock_categories',
  PRODUCTS: 'grabit_mock_products',
  ORDERS: 'grabit_mock_orders',
};

const INITIAL_SELLER = {
  id: 1,
  email: 'seller@grabit.com',
  store_name: 'GrabIt Store',
  phone: '+91 98765 43210',
  business_address: 'Shop 14, High Street Avenue, Indiranagar, Bangalore 560038',
  gstin: '29ABCDE1234F1Z5',
  status: 'approved',
  created_at: new Date().toISOString(),
};

const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'Snacks & Munchies',
    slug: 'snacks-munchies',
    description: 'Crisps, potato chips, nachos, roasted nuts, and savory namkeen.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645158/grabit_media/snacks_munchies.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645158/grabit_media/snacks_munchies.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Dairy & Bakery',
    slug: 'dairy-bakery',
    description: 'Fresh butter, artisanal bread, paneer, cheese, milk, and bakery treats.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645165/grabit_media/dairy_bakery.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645165/grabit_media/dairy_bakery.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Cold Drinks & Juices',
    slug: 'cold-drinks-juices',
    description: 'Sparkling soft drinks, cold pressed juices, flavored sodas, and energy drinks.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645163/grabit_media/cold_drinks.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645163/grabit_media/cold_drinks.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Atta, Rice & Dal',
    slug: 'atta-rice-dal',
    description: 'Whole wheat atta, premium basmati rice, organic pulses, and lentils.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645167/grabit_media/atta_rice_dal.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645167/grabit_media/atta_rice_dal.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Chocolates & Sweets',
    slug: 'chocolates-sweets',
    description: 'Milk chocolate bars, candies, Indian sweets, toffees, and gourmet desserts.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645164/grabit_media/chocolates_sweets.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645164/grabit_media/chocolates_sweets.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Body wash, soaps, hair shampoo, dental care, and skincare essentials.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645162/grabit_media/personal_care.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645162/grabit_media/personal_care.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    name: 'Household Essentials',
    slug: 'household-essentials',
    description: 'Fabric detergents, floor cleaners, kitchen rolls, and sanitizers.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645166/grabit_media/household_essentials.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645166/grabit_media/household_essentials.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    name: 'Fresh Fruits & Veggies',
    slug: 'fresh-fruits-veggies',
    description: 'Farm-fresh apples, bananas, leafy greens, onions, and root vegetables.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645161/grabit_media/fresh_fruits_veggies.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645161/grabit_media/fresh_fruits_veggies.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 9,
    name: 'Tea, Coffee & Drinks',
    slug: 'tea-coffee-drinks',
    description: 'Instant coffee powder, premium tea leaves, green tea, and health drinks.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645159/grabit_media/tea_coffee_drinks.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645159/grabit_media/tea_coffee_drinks.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    name: 'Biscuits & Cookies',
    slug: 'biscuits-cookies',
    description: 'Choco cream cookies, digestive biscuits, butter crackers, and tea rusks.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645166/grabit_media/biscuits_cookies.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645166/grabit_media/biscuits_cookies.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 11,
    name: 'Instant & Frozen Food',
    slug: 'instant-frozen-food',
    description: 'Instant noodles, ready-to-eat pasta, frozen fries, and snack bites.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645163/grabit_media/instant_frozen_food.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645163/grabit_media/instant_frozen_food.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 12,
    name: 'Edible Oils & Ghee',
    slug: 'edible-oils-ghee',
    description: 'Refined sunflower oil, mustard oil, cold-pressed olive oil, and desi cow ghee.',
    image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645160/grabit_media/edible_oils_ghee.jpg',
    image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645160/grabit_media/edible_oils_ghee.jpg',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 13,
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    description: 'Fast charging cables, powerbanks, wireless earphones, and headphones.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 14,
    name: 'Fashion & Accessories',
    slug: 'fashion-accessories',
    description: 'Athletic footwear, casual socks, belts, wallets, and daily wearables.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    parent: null,
    parent_details: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Green Chilli (Menasinakayi)',
    category: 3,
    category_name: 'Farm Fresh Fruits & Vegetables',
    price: '12.00',
    discount_price: '11.00',
    delivery_time: '8 mins',
    deal_seconds: 4890,
    rating: '4.8',
    reviews: 340,
    recipes_count: 9,
    stock_quantity: 45,
    unit: '100 g',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Fresh Red Onion (Eerulli)',
    category: 3,
    category_name: 'Farm Fresh Fruits & Vegetables',
    price: '57.00',
    discount_price: '50.00',
    delivery_time: '8 mins',
    deal_seconds: 11867,
    rating: '4.9',
    reviews: 512,
    recipes_count: 30,
    options_text: '2 options',
    stock_quantity: 60,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Coriander Bunch (Kottambari Soppu)',
    category: 3,
    category_name: 'Farm Fresh Fruits & Vegetables',
    price: '16.00',
    discount_price: '13.00',
    delivery_time: '8 mins',
    deal_seconds: 1845,
    rating: '4.7',
    reviews: 189,
    recipes_count: 8,
    stock_quantity: 2, // Low stock: 2 Left!
    unit: '100 g',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Fresh Potato (Alugadde)',
    category: 3,
    category_name: 'Farm Fresh Fruits & Vegetables',
    price: '32.00',
    discount_price: '25.00',
    delivery_time: '8 mins',
    deal_seconds: 19430,
    rating: '4.8',
    reviews: 420,
    recipes_count: 24,
    options_text: '2 options',
    stock_quantity: 1, // Low stock: 1 Left!
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Amul Taaza Homogenised Toned Milk 1L',
    category: 2,
    category_name: 'Milk & Cream',
    price: '74.00',
    discount_price: '68.00',
    delivery_time: '8 mins',
    deal_seconds: 6432,
    rating: '4.9',
    reviews: 420,
    recipes_count: 14,
    stock_quantity: 35,
    unit: '1 L Tetra Pack',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Raw Cold Pressed Valencia Orange Juice 250ml',
    category: 5,
    category_name: 'Snacks & Cold Beverages',
    price: '90.00',
    discount_price: '80.00',
    delivery_time: '10 mins',
    deal_seconds: 9800,
    rating: '4.6',
    reviews: 95,
    stock_quantity: 0, // Out of Stock!
    unit: '250 ml Bottle',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// No initial seed orders — only real customer orders are shown
const INITIAL_ORDERS = [];

// Helper database manager for localStorage
export const mockDb = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    // Do NOT auto-seed orders — they must come from real customer purchases
    if (!localStorage.getItem(STORAGE_KEYS.SELLER)) {
      localStorage.setItem(STORAGE_KEYS.SELLER, JSON.stringify(INITIAL_SELLER));
    }
  },

  getSeller() {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.SELLER);
    return data ? JSON.parse(data) : INITIAL_SELLER;
  },

  saveSeller(seller) {
    localStorage.setItem(STORAGE_KEYS.SELLER, JSON.stringify(seller));
    return seller;
  },

  getCategories() {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    let cats = INITIAL_CATEGORIES;
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cats = parsed.map((cat) => {
            const initialMatch = INITIAL_CATEGORIES.find((ic) => ic.id === cat.id || ic.slug === cat.slug);
            if (initialMatch) {
              return {
                ...cat,
                name: initialMatch.name,
                image: initialMatch.image,
                image_url: initialMatch.image_url,
              };
            }
            return cat;
          });
          INITIAL_CATEGORIES.forEach((ic) => {
            if (!cats.some((c) => c.id === ic.id || c.slug === ic.slug)) {
              cats.push(ic);
            }
          });
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
        } else {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
          cats = INITIAL_CATEGORIES;
        }
      } catch {
        cats = INITIAL_CATEGORIES;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    const prods = this.getProducts();

    // Dynamically calculate counts
    return cats.map((cat) => {
      const subCount = cats.filter((c) => c.parent === cat.id).length;
      const prodCount = prods.filter((p) => p.category === cat.id).length;
      const parentObj = cat.parent ? cats.find((c) => c.id === cat.parent) : null;

      return {
        ...cat,
        subcategory_count: subCount,
        product_count: prodCount,
        parent_details: parentObj ? { id: parentObj.id, name: parentObj.name, slug: parentObj.slug } : null,
      };
    });
  },

  saveCategories(categories) {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('LocalStorage quota limit reached. Optimizing category payloads...', e);
      try {
        const trimmed = categories.map((c) => {
          if (c.image && typeof c.image === 'string' && c.image.length > 150000) {
            return { ...c, image: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645161/grabit_media/fresh_fruits_veggies.jpg', image_url: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645161/grabit_media/fresh_fruits_veggies.jpg' };
          }
          return c;
        });
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(trimmed));
      } catch (err) {
        console.error('Failed to persist categories to localStorage:', err);
      }
    }
  },

  getProducts() {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) return INITIAL_PRODUCTS;
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage quota limit reached. Optimizing product payloads...', e);
      try {
        const trimmed = products.map((p) => {
          if (p.image && typeof p.image === 'string' && p.image.length > 150000) {
            return { ...p, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80' };
          }
          return p;
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(trimmed));
      } catch (err) {
        console.error('Failed to persist products to localStorage:', err);
      }
    }
  },

  getOrders() {
    this.init();
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : INITIAL_ORDERS;
  },

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }
};
