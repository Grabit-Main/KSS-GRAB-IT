import categoryService from '../seller/services/categoryService';

export const baseCategories = [
  { id: 1,  name: 'Snacks & Munchies', slug: 'snacks-munchies', icon: '/category-snacks-banner.png' },
  { id: 2,  name: 'Dairy & Bakery', slug: 'dairy-bakery', icon: '/amul-butter-real.jpg' },
  { id: 3,  name: 'Cold Drinks & Juices', slug: 'beverages', icon: '/coca-cola-real.jpg' },
  { id: 4,  name: 'Atta, Rice & Dal', slug: 'staples', icon: '/aashirvaad-atta-real.jpg' },
  { id: 5,  name: 'Chocolates & Sweets', slug: 'chocolates', icon: '/cadbury-silk-real.jpg' },
  { id: 6,  name: 'Personal Care', slug: 'personal-care', icon: '/dettol-handwash-real.jpg' },
  { id: 7,  name: 'Household Essentials', slug: 'household', icon: '/surf-excel-real.jpg' },
  { id: 8,  name: 'Fresh Fruits & Veggies', slug: 'produce', icon: '/fresh-produce-splash.jpg' },
  { id: 9,  name: 'Tea, Coffee & Drinks', slug: 'tea-coffee', icon: '/nescafe-coffee-real.jpg' },
  { id: 10, name: 'Biscuits & Cookies', slug: 'biscuits', icon: '/oreo-biscuits-real.jpg' },
  { id: 11, name: 'Instant & Frozen Food', slug: 'instant-food', icon: '/maggi-noodles-real.jpg' },
  { id: 12, name: 'Edible Oils & Ghee', slug: 'oil', icon: '/fortune-oil-real.jpg' },
  { id: 13, name: 'Electronics & Gadgets', slug: 'electronics', icon: '/electronics-hero-banner.jpg' },
  { id: 14, name: 'Fashion & Accessories', slug: 'fashion', icon: '/sneakers.jpg' },
];

export const subCategories = {
  'snacks-munchies': [
    { name: 'All', count: 5 },
    { name: 'Potato Chips', count: 3 },
    { name: 'Tortilla & Corn', count: 1 },
    { name: 'Namkeen & Crunch', count: 1 },
  ],
  'dairy-bakery': [
    { name: 'All', count: 5 },
    { name: 'Milk & Butter', count: 2 },
    { name: 'Cheese & Paneer', count: 2 },
    { name: 'Fresh Bread', count: 1 },
  ],
  'beverages': [
    { name: 'All', count: 5 },
    { name: 'Soft Drinks & Sodas', count: 3 },
    { name: 'Energy Drinks', count: 1 },
    { name: 'Fruit Juices', count: 1 },
  ],
  'staples': [
    { name: 'All', count: 5 },
    { name: 'Atta & Flours', count: 1 },
    { name: 'Basmati Rice', count: 1 },
    { name: 'Dals & Pulses', count: 2 },
    { name: 'Salt & Spices', count: 1 },
  ],
  'chocolates': [
    { name: 'All', count: 5 },
    { name: 'Premium Chocolates', count: 2 },
    { name: 'Wafer Bars', count: 1 },
    { name: 'Spreads & Gifts', count: 2 },
  ],
  'personal-care': [
    { name: 'All', count: 5 },
    { name: 'Handwash & Hygiene', count: 1 },
    { name: 'Hair Care', count: 1 },
    { name: 'Bath & Body Soaps', count: 1 },
    { name: 'Oral Care & Skin', count: 2 },
  ],
  'household': [
    { name: 'All', count: 5 },
    { name: 'Detergents & Wash', count: 1 },
    { name: 'Dishwash & Cleaners', count: 2 },
    { name: 'Disinfectants', count: 1 },
    { name: 'Glass Cleaners', count: 1 },
  ],
  'produce': [
    { name: 'All', count: 5 },
    { name: 'Fresh Fruits', count: 2 },
    { name: 'Fresh Vegetables', count: 3 },
  ],
  'tea-coffee': [
    { name: 'All', count: 5 },
    { name: 'Instant Coffee', count: 3 },
    { name: 'Premium Tea Powder', count: 2 },
  ],
  'biscuits': [
    { name: 'All', count: 5 },
    { name: 'Cream Biscuits', count: 2 },
    { name: 'Glucose & Cookies', count: 3 },
  ],
  'instant-food': [
    { name: 'All', count: 5 },
    { name: 'Instant Noodles', count: 2 },
    { name: 'Soups & Chinese', count: 2 },
    { name: 'Ready to Eat Curries', count: 1 },
  ],
  'oil': [
    { name: 'All', count: 5 },
    { name: 'Sunflower & Mustard Oil', count: 2 },
    { name: 'Pure Desi Ghee', count: 1 },
    { name: 'Olive & Heart Care Oils', count: 2 },
  ],
  'electronics': [
    { name: 'All', count: 5 },
    { name: 'Headphones & TWS', count: 2 },
    { name: 'Bluetooth Speakers', count: 1 },
    { name: 'Smartwatches', count: 1 },
    { name: 'Power Banks & Accessories', count: 1 },
  ],
  'fashion': [
    { name: 'All', count: 5 },
    { name: 'Men Running Shoes', count: 2 },
    { name: 'Designer Sunglasses', count: 1 },
    { name: 'Watches & Wallets', count: 2 },
  ],
};

export const brands = {
  'snacks-munchies': [
    { name: "Lay's", count: 2 },
    { name: 'Doritos', count: 1 },
    { name: 'Pringles', count: 1 },
    { name: 'Kurkure', count: 1 },
  ],
  'dairy-bakery': [
    { name: 'Amul', count: 3 },
    { name: 'Mother Dairy', count: 1 },
    { name: 'Britannia', count: 1 },
  ],
  'beverages': [
    { name: 'Coca-Cola', count: 1 },
    { name: 'Thums Up', count: 1 },
    { name: 'Sprite', count: 1 },
    { name: 'Red Bull', count: 1 },
    { name: 'Real', count: 1 },
  ],
  'staples': [
    { name: 'Aashirvaad', count: 1 },
    { name: 'Daawat', count: 1 },
    { name: 'Tata Sampann', count: 2 },
    { name: 'Tata Salt', count: 1 },
  ],
  'chocolates': [
    { name: 'Cadbury', count: 2 },
    { name: 'Ferrero', count: 1 },
    { name: 'KitKat', count: 1 },
    { name: 'Nutella', count: 1 },
  ],
  'personal-care': [
    { name: 'Dettol', count: 1 },
    { name: 'Head & Shoulders', count: 1 },
    { name: 'Dove', count: 1 },
    { name: 'Colgate', count: 1 },
    { name: 'Nivea', count: 1 },
  ],
  'household': [
    { name: 'Surf Excel', count: 1 },
    { name: 'Vim', count: 1 },
    { name: 'Harpic', count: 1 },
    { name: 'Lizol', count: 1 },
    { name: 'Colin', count: 1 },
  ],
  'produce': [
    { name: 'Grabit Fresh', count: 5 },
  ],
  'tea-coffee': [
    { name: 'Nescafe', count: 2 },
    { name: 'Red Label', count: 1 },
    { name: 'Tata Tea', count: 1 },
    { name: 'Tata Coffee', count: 1 },
  ],
  'biscuits': [
    { name: 'Oreo', count: 1 },
    { name: 'Parle', count: 2 },
    { name: 'Britannia', count: 1 },
    { name: 'Sunfeast', count: 1 },
  ],
  'instant-food': [
    { name: 'Maggi', count: 1 },
    { name: 'Yippee!', count: 1 },
    { name: 'Knorr', count: 1 },
    { name: "Ching's Secret", count: 1 },
    { name: 'MTR', count: 1 },
  ],
  'oil': [
    { name: 'Fortune', count: 2 },
    { name: 'Amul', count: 1 },
    { name: 'Saffola', count: 1 },
    { name: 'Borges', count: 1 },
  ],
  'electronics': [
    { name: 'Sony', count: 1 },
    { name: 'JBL', count: 1 },
    { name: 'boAt', count: 2 },
    { name: 'Xiaomi', count: 1 },
  ],
  'fashion': [
    { name: 'Nike', count: 1 },
    { name: 'Ray-Ban', count: 1 },
    { name: 'Titan', count: 1 },
    { name: 'Puma', count: 1 },
    { name: 'Wildhorn', count: 1 },
  ],
};

export let categories = [...baseCategories];

export async function syncCategoriesFromBackend() {
  try {
    const res = await categoryService.getCategories();
    if (res && Array.isArray(res.results) && res.results.length > 0) {
      categories.length = 0;
      categories.push(...res.results);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('grabit_categories_synced'));
      }
    }
  } catch (err) {
    console.warn('Sync categories error:', err);
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncCategoriesFromBackend();
  }, 0);

  window.addEventListener('grabit_categories_updated', syncCategoriesFromBackend);
  window.addEventListener('storage', syncCategoriesFromBackend);
}
