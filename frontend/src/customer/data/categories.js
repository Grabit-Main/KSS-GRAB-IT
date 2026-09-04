export const categories = [
  { id: 1,  name: 'Snacks & Munchies', slug: 'snacks-munchies', icon: 'lays-cream-onion' },
  { id: 2,  name: 'Dairy & Bakery', slug: 'dairy-bakery', icon: 'amul-butter' },
  { id: 3,  name: 'Cold Drinks & Juices', slug: 'beverages', icon: 'coca-cola' },
  { id: 4,  name: 'Atta, Rice & Dal', slug: 'staples', icon: 'aashirvaad-atta' },
  { id: 5,  name: 'Chocolates & Sweets', slug: 'chocolates', icon: 'dairy-milk-silk' },
  { id: 6,  name: 'Personal Care', slug: 'personal-care', icon: 'dettol-handwash' },
  { id: 7,  name: 'Household Essentials', slug: 'household', icon: 'surf-excel-powder' },
  { id: 8,  name: 'Fresh Fruits & Veggies', slug: 'produce', icon: 'fresh-red-apples' },
  { id: 9,  name: 'Tea, Coffee & Drinks', slug: 'beverages', icon: 'nescafe-coffee' },
  { id: 10, name: 'Biscuits & Cookies', slug: 'biscuits', icon: 'oreo-biscuits' },
  { id: 11, name: 'Instant & Frozen Food', slug: 'staples', icon: 'maggi-noodles' },
  { id: 12, name: 'Edible Oils & Ghee', slug: 'oil', icon: 'fortune-oil' },
  { id: 13, name: 'Electronics & Gadgets', slug: 'electronics', icon: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645101/grabit_media/p1.jpg' },
  { id: 14, name: 'Fashion & Accessories', slug: 'fashion', icon: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645079/grabit_media/sneakers.jpg' },
  { id: 15, name: 'Baby Care', slug: 'baby-care', icon: '/category-baby-care.jpg' },
  { id: 16, name: 'Pet Care & Food', slug: 'pet-care', icon: '/category-pet-care.jpg' },
  { id: 17, name: 'Beauty & Cosmetics', slug: 'beauty-cosmetics', icon: '/category-beauty-cosmetics.jpg' },
  { id: 18, name: 'Health & Wellness', slug: 'health-wellness', icon: '/category-health-wellness.jpg' },
  { id: 19, name: 'Meat, Fish & Eggs', slug: 'meat-seafood', icon: '/category-meat-seafood.jpg' },
  { id: 20, name: 'Home & Kitchen', slug: 'home-kitchen', icon: '/category-home-kitchen.jpg' },
  { id: 21, name: 'Stationery & Office', slug: 'stationery-office', icon: '/category-stationery-office.jpg' },
  { id: 22, name: 'Sports & Fitness', slug: 'sports-fitness', icon: '/category-sports-fitness.jpg' },
  { id: 23, name: 'Toys & Games', slug: 'toys-games', icon: '/category-toys-games.jpg' },
  { id: 24, name: 'Pooja & Spiritual', slug: 'pooja-needs', icon: '/category-pooja-needs.jpg' },
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
  'baby-care': [
    { name: 'All', count: 5 },
    { name: 'Diapers & Wipes', count: 2 },
    { name: 'Baby Bath & Skin', count: 2 },
    { name: 'Baby Food & Cereal', count: 1 },
  ],
  'pet-care': [
    { name: 'All', count: 5 },
    { name: 'Dog Food & Treats', count: 3 },
    { name: 'Cat Food', count: 1 },
    { name: 'Pet Grooming', count: 1 },
  ],
  'beauty-cosmetics': [
    { name: 'All', count: 5 },
    { name: 'Face Serums & Creams', count: 2 },
    { name: 'Sunscreens & Cleansers', count: 2 },
    { name: 'Makeup & Kajal', count: 1 },
  ],
  'health-wellness': [
    { name: 'All', count: 5 },
    { name: 'Immunity & Ayurveda', count: 1 },
    { name: 'Vitamins & Supplements', count: 2 },
    { name: 'Pain Relief & Devices', count: 2 },
  ],
  'meat-seafood': [
    { name: 'All', count: 5 },
    { name: 'Fresh Chicken', count: 2 },
    { name: 'Farm Eggs', count: 1 },
    { name: 'Fish & Seafood', count: 2 },
  ],
  'home-kitchen': [
    { name: 'All', count: 5 },
    { name: 'Cookware & Pans', count: 2 },
    { name: 'Bottles & Flasks', count: 1 },
    { name: 'Storage & Containers', count: 1 },
    { name: 'Kitchen Tools', count: 1 },
  ],
  'stationery-office': [
    { name: 'All', count: 5 },
    { name: 'Notebooks & Pads', count: 1 },
    { name: 'Pens & Markers', count: 2 },
    { name: 'Desk Tools & Tapes', count: 1 },
    { name: 'Calculators', count: 1 },
  ],
  'sports-fitness': [
    { name: 'All', count: 5 },
    { name: 'Rackets & Balls', count: 2 },
    { name: 'Fitness Supplements', count: 1 },
    { name: 'Gym Shakers & Bottles', count: 1 },
    { name: 'Yoga & Mats', count: 1 },
  ],
  'toys-games': [
    { name: 'All', count: 5 },
    { name: 'Building Blocks', count: 1 },
    { name: 'Board Games & Puzzles', count: 2 },
    { name: 'Diecast Cars & Tracks', count: 1 },
    { name: 'Dolls & Figurines', count: 1 },
  ],
  'pooja-needs': [
    { name: 'All', count: 5 },
    { name: 'Agarbatti & Incense', count: 1 },
    { name: 'Brass Diyas & Lamps', count: 1 },
    { name: 'Pure Camphor & Wicks', count: 2 },
    { name: 'Haldi Kumkum & Roli', count: 1 },
  ],
};

export const subCategoryImages = {
  // Snacks & Munchies
  'Potato Chips': '/subcat-potato-chips.jpg',
  'Tortilla & Corn': '/subcat-tortilla-corn.jpg',
  'Namkeen & Crunch': '/subcat-namkeen.jpg',

  // Dairy & Bakery
  'Milk & Butter': '/subcat-milk-butter.jpg',
  'Cheese & Paneer': '/amul-butter-real.jpg',
  'Fresh Bread': '/brown-bread-real.jpg',

  // Beverages
  'Soft Drinks & Sodas': '/subcat-soft-drinks.jpg',
  'Energy Drinks': '/red-bull-real.jpg',
  'Fruit Juices': '/tropicana-juice-real.jpg',

  // Produce
  'Fresh Fruits': '/subcat-fresh-fruits.jpg',
  'Fresh Vegetables': '/subcat-fresh-vegetables.jpg',

  // Staples & Cooking
  'Atta & Flours': '/subcat-atta-flours.jpg',
  'Basmati Rice': '/fortune-basmati-real.jpg',
  'Dals & Pulses': '/toor-dal-real.jpg',
  'Salt & Spices': '/tata-salt-real.jpg',
  'Sunflower & Mustard Oil': '/fortune-oil-real.jpg',
  'Pure Desi Ghee': '/amul-ghee.jpg',
  'Olive & Heart Care Oils': '/oil-hero-cutout.png',

  // Chocolates & Sweets
  'Premium Chocolates': '/subcat-chocolates.jpg',
  'Wafer Bars': '/kitkat-real.jpg',
  'Spreads & Gifts': '/cadbury-silk-real.jpg',

  // Tea & Coffee
  'Instant Coffee': '/subcat-instant-coffee.jpg',
  'Premium Tea Powder': '/red-label-tea.jpg',

  // Biscuits & Cookies
  'Cream Biscuits': '/oreo-biscuits-real.jpg',
  'Glucose & Cookies': '/parle-g-real.jpg',

  // Instant Food
  'Instant Noodles': '/maggi-noodles-real.jpg',
  'Soups & Chinese': '/instant-noodles-hero-transparent.png',
  'Ready to Eat Curries': '/aashirvaad-atta-real.jpg',

  // Personal Care & Beauty
  'Handwash & Hygiene': '/dettol-handwash-real.jpg',
  'Hair Care': '/dettol-real.jpg',
  'Bath & Body Soaps': '/combo-hygiene.jpg',
  'Face Serums & Creams': '/subcat-face-serums.jpg',
  'Sunscreens & Cleansers': '/banner-skincare-sale.png',
  'Makeup & Kajal': '/category-beauty-cosmetics.jpg',

  // Electronics & Gadgets
  'Headphones & TWS': '/subcat-headphones.jpg',
  'Bluetooth Speakers': '/electronics-hero-cutout.png',
  'Smartwatches': '/electronics-hero-banner.jpg',
  'Power Banks & Accessories': '/electronics-hero-transparent.png',

  // Household Essentials
  'Detergents & Wash': '/surf-excel-real.jpg',
  'Dishwash & Cleaners': '/household-hero-transparent.png',
  'Disinfectants': '/dettol-real.jpg',
  'Glass Cleaners': '/household-hero-cutout.png',

  // Baby & Pet Care
  'Diapers & Wipes': '/promo-baby.png',

  // Meat & Seafood
  'Fresh Chicken': '/banner-fresh-meat-section.jpg',
  'Farm Eggs': '/banner-chicken-eggs.jpg',
  'Fish & Seafood': '/category-meat-seafood.jpg',
};

export const brands = {
  'snacks-munchies': [
    { name: "Lay's", count: 5 },
    { name: "Doritos", count: 3 },
    { name: "Haldiram's", count: 5 },
    { name: "Pringles", count: 2 },
    { name: "Bingo!", count: 2 },
  ],
  'dairy-bakery': [
    { name: "Amul", count: 12 },
    { name: "Britannia", count: 4 },
    { name: "Mother Dairy", count: 3 },
    { name: "Epigamia", count: 3 },
  ],
  'beverages': [
    { name: "Coca-Cola", count: 3 },
    { name: "Real", count: 4 },
    { name: "Nescafe", count: 3 },
    { name: "Paper Boat", count: 2 },
    { name: "Red Bull", count: 2 },
  ],
  'staples': [
    { name: "Aashirvaad", count: 3 },
    { name: "Tata Sampann", count: 6 },
    { name: "Fortune", count: 4 },
    { name: "Maggi", count: 2 },
  ],
  'chocolates': [
    { name: "Cadbury", count: 10 },
    { name: "Amul", count: 2 },
    { name: "Ferrero", count: 2 },
    { name: "Hershey's", count: 2 },
  ],
  'personal-care': [
    { name: "Dettol", count: 4 },
    { name: "Colgate", count: 2 },
    { name: "Gillette", count: 2 },
    { name: "Dove", count: 1 },
  ],
  'household': [
    { name: "Surf Excel", count: 3 },
    { name: "Gala", count: 2 },
    { name: "Hit", count: 2 },
    { name: "Origami", count: 2 },
  ],
  'produce': [
    { name: "Grabit Fresh", count: 23 },
  ],
  'tea-coffee': [
    { name: "Nescafe", count: 2 },
    { name: "Red Label", count: 1 },
    { name: "Tata Tea", count: 1 },
    { name: "Tata Coffee", count: 1 },
  ],
  'biscuits': [
    { name: "Britannia", count: 9 },
    { name: "Oreo", count: 3 },
    { name: "Parle", count: 5 },
    { name: "Unibic", count: 3 },
  ],
  'instant-food': [
    { name: "Maggi", count: 1 },
    { name: "Yippee!", count: 1 },
    { name: "Knorr", count: 1 },
    { name: "Ching's Secret", count: 1 },
    { name: "MTR", count: 1 },
  ],
  'oil': [
    { name: "Fortune", count: 8 },
    { name: "Saffola", count: 3 },
    { name: "Borges", count: 3 },
    { name: "Amul", count: 1 },
  ],
  'electronics': [
    { name: "boAt", count: 4 },
    { name: "Sony", count: 2 },
    { name: "JBL", count: 2 },
    { name: "SanDisk", count: 2 },
  ],
  'fashion': [
    { name: "Nike", count: 1 },
    { name: "Titan", count: 1 },
    { name: "Ray-Ban", count: 1 },
    { name: "Puma", count: 1 },
    { name: "Wildhorn", count: 1 },
  ],
  'baby-care': [
    { name: "Pampers", count: 1 },
    { name: "Johnson's", count: 2 },
    { name: "Himalaya", count: 1 },
    { name: "Nestle", count: 1 },
  ],
  'pet-care': [
    { name: "Pedigree", count: 2 },
    { name: "Whiskas", count: 1 },
    { name: "Captain Zack", count: 1 },
    { name: "Drools", count: 1 },
  ],
  'beauty-cosmetics': [
    { name: "Minimalist", count: 1 },
    { name: "Maybelline", count: 1 },
    { name: "Lakme", count: 1 },
    { name: "Garnier", count: 1 },
    { name: "Nivea", count: 1 },
  ],
  'health-wellness': [
    { name: "Dabur", count: 1 },
    { name: "Revital", count: 1 },
    { name: "Volini", count: 1 },
    { name: "Fast&Up", count: 1 },
    { name: "Dr. Morepen", count: 1 },
  ],
  'meat-seafood': [
    { name: "Grabit Fresh", count: 5 },
  ],
  'home-kitchen': [
    { name: "Prestige", count: 1 },
    { name: "Milton", count: 1 },
    { name: "Hawkins", count: 1 },
    { name: "Borosil", count: 1 },
    { name: "Pigeon", count: 1 },
  ],
  'stationery-office': [
    { name: "Classmate", count: 1 },
    { name: "Parker", count: 1 },
    { name: "Faber-Castell", count: 1 },
    { name: "Scotch", count: 1 },
    { name: "Casio", count: 1 },
  ],
  'sports-fitness': [
    { name: "Yonex", count: 1 },
    { name: "MuscleBlaze", count: 1 },
    { name: "Boldfit", count: 1 },
    { name: "Nivia", count: 1 },
    { name: "Strava", count: 1 },
  ],
  'toys-games': [
    { name: "LEGO", count: 1 },
    { name: "Hasbro", count: 1 },
    { name: "Hot Wheels", count: 1 },
    { name: "Rubik's", count: 1 },
    { name: "Barbie", count: 1 },
  ],
  'pooja-needs': [
    { name: "Cycle Pure", count: 1 },
    { name: "Mangaldeep", count: 1 },
    { name: "Bhimseni", count: 1 },
    { name: "Patanjali", count: 1 },
    { name: "Shubhkart", count: 1 },
  ],
};

export const SLUG_MAPPING = {
  'atta, rice & dal': 'staples',
  'atta-rice-dal': 'staples',
  'atta,-rice-&-dal': 'staples',
  'atta-rice-dals': 'staples',
  'atta': 'staples',
  'staples': 'staples',

  'dairy & bakery': 'dairy-bakery',
  'dairy-bakery': 'dairy-bakery',
  'dairy-&-bakery': 'dairy-bakery',
  'dairy': 'dairy-bakery',

  'cold drinks & juices': 'beverages',
  'cold-drinks-juices': 'beverages',
  'cold-drinks-&-juices': 'beverages',
  'cold-drinks': 'beverages',
  'drinks': 'beverages',
  'beverages': 'beverages',

  'snacks & munchies': 'snacks-munchies',
  'snacks-munchies': 'snacks-munchies',
  'snacks-&-munchies': 'snacks-munchies',
  'snacks': 'snacks-munchies',

  'chocolates & sweets': 'chocolates',
  'chocolates-sweets': 'chocolates',
  'chocolates-&-sweets': 'chocolates',
  'chocolates': 'chocolates',

  'personal care': 'personal-care',
  'personal-care': 'personal-care',

  'household essentials': 'household',
  'household-essentials': 'household',
  'household': 'household',

  'fresh fruits & veggies': 'produce',
  'fresh fruits & vegetables': 'produce',
  'fresh-fruits-veggies': 'produce',
  'fresh-fruits-vegetables': 'produce',
  'fresh-fruits-&-veggies': 'produce',
  'fresh-fruits-&-vegetables': 'produce',
  'fruits-and-vegetables': 'produce',
  'fruits-and-veggies': 'produce',
  'fresh-produce': 'produce',
  'fruits-vegetables': 'produce',
  'fruits & vegetables': 'produce',
  'fruits': 'produce',
  'veggies': 'produce',
  'vegetables': 'produce',
  'produce': 'produce',

  'tea, coffee & drinks': 'tea-coffee',
  'tea-coffee-drinks': 'tea-coffee',
  'tea,-coffee-&-drinks': 'tea-coffee',
  'tea-coffee': 'tea-coffee',

  'biscuits & cookies': 'biscuits',
  'biscuits-cookies': 'biscuits',
  'biscuits-&-cookies': 'biscuits',
  'cookies': 'biscuits',
  'biscuits': 'biscuits',

  'instant & frozen food': 'instant-food',
  'instant-frozen-food': 'instant-food',
  'instant-&-frozen-food': 'instant-food',
  'instant-food': 'instant-food',

  'edible oils & ghee': 'oil',
  'edible-oils-ghee': 'oil',
  'edible-oils-&-ghee': 'oil',
  'oils-ghee': 'oil',
  'oils': 'oil',
  'oil': 'oil',

  'electronics & gadgets': 'electronics',
  'electronics-gadgets': 'electronics',
  'electronics-&-gadgets': 'electronics',
  'electronics': 'electronics',

  'fashion & accessories': 'fashion',
  'fashion-accessories': 'fashion',
  'fashion-&-accessories': 'fashion',
  'fashion': 'fashion',

  'baby care': 'baby-care',
  'baby-care': 'baby-care',
  'baby': 'baby-care',

  'pet care & food': 'pet-care',
  'pet care': 'pet-care',
  'pet-care': 'pet-care',
  'pet': 'pet-care',

  'beauty & cosmetics': 'beauty-cosmetics',
  'beauty-cosmetics': 'beauty-cosmetics',
  'beauty': 'beauty-cosmetics',
  'cosmetics': 'beauty-cosmetics',

  'health & wellness': 'health-wellness',
  'health-wellness': 'health-wellness',
  'pharmacy & health': 'health-wellness',
  'pharmacy': 'health-wellness',
  'health': 'health-wellness',

  'meat, fish & eggs': 'meat-seafood',
  'meat & seafood': 'meat-seafood',
  'meat-seafood': 'meat-seafood',
  'chicken & meat': 'meat-seafood',
  'chicken-meat': 'meat-seafood',
  'meat': 'meat-seafood',

  'home & kitchen': 'home-kitchen',
  'home-kitchen': 'home-kitchen',
  'cookware & dining': 'home-kitchen',
  'kitchen': 'home-kitchen',
  'home': 'home-kitchen',

  'stationery & office': 'stationery-office',
  'stationery-office': 'stationery-office',
  'stationery': 'stationery-office',
  'office': 'stationery-office',

  'sports & fitness': 'sports-fitness',
  'sports-fitness': 'sports-fitness',
  'sports': 'sports-fitness',
  'fitness': 'sports-fitness',
  'gym': 'sports-fitness',

  'toys & games': 'toys-games',
  'toys-games': 'toys-games',
  'toys': 'toys-games',
  'games': 'toys-games',

  'pooja & spiritual needs': 'pooja-needs',
  'pooja & spiritual': 'pooja-needs',
  'pooja-needs': 'pooja-needs',
  'pooja': 'pooja-needs',
  'spiritual': 'pooja-needs',
};

export function getCanonicalSlug(identifier) {
  if (!identifier) return '';
  const str = String(identifier).toLowerCase().trim();
  if (SLUG_MAPPING[str]) return SLUG_MAPPING[str];
  const clean = str.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (SLUG_MAPPING[clean]) return SLUG_MAPPING[clean];
  return clean || str;
}

export function inferProductCategory(product, categoriesList = []) {
  if (!product) return 'produce';

  const KNOWN_SLUGS = [
    'snacks-munchies', 'dairy-bakery', 'beverages', 'staples', 'chocolates',
    'personal-care', 'household', 'produce', 'biscuits', 'oil', 'electronics',
    'tea-coffee', 'instant-food', 'fashion', 'baby-care', 'pet-care',
    'beauty-cosmetics', 'health-wellness', 'meat-seafood', 'home-kitchen',
    'stationery-office', 'sports-fitness', 'toys-games', 'pooja-needs'
  ];

  // 1. Direct explicit category on the product (Highest priority)
  if (product.categories) {
    const slugFromCat = getCanonicalSlug(product.categories.slug || product.categories.name || '');
    if (slugFromCat && KNOWN_SLUGS.includes(slugFromCat)) {
      return slugFromCat;
    }
  }

  const directSlug = String(product.category_slug || product.catKey || '').toLowerCase().trim();
  if (directSlug && !/^[0-9]+$/.test(directSlug)) {
    const canonical = getCanonicalSlug(directSlug);
    if (KNOWN_SLUGS.includes(canonical)) {
      return canonical;
    }
  }

  const directCat = String(product.category || '').toLowerCase().trim();
  if (directCat && !/^[0-9]+$/.test(directCat) && !/^[0-9a-fA-F-]{32,36}$/.test(directCat)) {
    const canonical = getCanonicalSlug(directCat);
    if (KNOWN_SLUGS.includes(canonical)) {
      return canonical;
    }
  }

  const catId = product.category_id || (typeof product.category === 'number' || /^[0-9]+$/.test(product.category) ? product.category : null);
  if (catId && categoriesList && categoriesList.length > 0) {
    const matched = categoriesList.find(c => String(c.id) === String(catId));
    if (matched) {
      const slugFromMatched = getCanonicalSlug(matched.slug || matched.name);
      if (slugFromMatched && KNOWN_SLUGS.includes(slugFromMatched)) {
        return slugFromMatched;
      }
    }
  }

  // 2. Name-Based Classifier (Evaluated for products lacking explicit category)
  const name = String(product.name || '').toLowerCase();

  // (a) Baby Care & Infant Needs (check before personal-care and dairy/produce)
  if (name.includes('diaper') || name.includes('pampers') || name.includes('huggies') || name.includes('mamy poko') || name.includes('baby lotion') || name.includes('baby shampoo') || name.includes('baby wipes') || name.includes('baby cereal') || name.includes('cerelac') || name.includes('baby powder') || name.includes('baby oil') || name.includes('baby soap') || name.includes('baby') || name.includes('infant')) {
    return 'baby-care';
  }

  // (b) Pet Care & Supplies (check before meat and personal-care)
  if (name.includes('pedigree') || name.includes('whiskas') || name.includes('dog food') || name.includes('cat food') || name.includes('dentastix') || name.includes('dog treat') || name.includes('cat treat') || name.includes('pet shampoo') || name.includes('drools') || name.includes('kibble') || name.includes('pet food') || name.includes('pet') || name.includes('cat') || name.includes('dog')) {
    return 'pet-care';
  }

  // (c) Sports & Fitness (check before chocolates for whey protein chocolate)
  if (name.includes('yonex') || name.includes('badminton') || name.includes('racket') || name.includes('whey protein') || name.includes('whey') || name.includes('muscleblaze') || name.includes('shaker') || name.includes('boldfit') || name.includes('football') || name.includes('nivia') || name.includes('yoga mat') || name.includes('dumbbell') || name.includes('gym') || name.includes('fitness')) {
    return 'sports-fitness';
  }

  // (d) Toys & Games
  if (name.includes('lego') || name.includes('monopoly') || name.includes('hot wheels') || name.includes('rubik') || name.includes('cube') || name.includes('barbie') || name.includes('board game') || name.includes('puzzle') || name.includes('toy') || name.includes('doll') || name.includes('hasbro')) {
    return 'toys-games';
  }

  // (e) Pooja & Spiritual Needs
  if (name.includes('agarbatti') || name.includes('incense') || name.includes('diya') || name.includes('lamp') || name.includes('camphor') || name.includes('kapoor') || name.includes('wick') || name.includes('batti') || name.includes('haldi kumkum') || name.includes('roli') || name.includes('pooja') || name.includes('spiritual') || name.includes('mangaldeep') || name.includes('bhimseni')) {
    return 'pooja-needs';
  }

  // (f) Stationery & Office
  if (name.includes('notebook') || name.includes('spiral') || name.includes('parker') || name.includes('pen') || name.includes('marker') || name.includes('faber-castell') || name.includes('scotch') || name.includes('calculator') || name.includes('casio') || name.includes('classmate') || name.includes('stationery') || name.includes('office')) {
    return 'stationery-office';
  }

  // (g) Home & Kitchen (check before general bottles/containers)
  if (name.includes('cooker') || name.includes('pan') || name.includes('flask') || name.includes('borosil') || name.includes('lunch box') || name.includes('knife set') || name.includes('prestige') || name.includes('milton') || name.includes('hawkins') || name.includes('pigeon') || name.includes('cookware') || name.includes('kitchen')) {
    return 'home-kitchen';
  }

  // (h) Health, Wellness & Pharmacy
  if (name.includes('chyawanprash') || name.includes('revital') || name.includes('multivitamin') || name.includes('volini') || name.includes('fast&up') || name.includes('thermometer') || name.includes('pain relief') || name.includes('band-aid') || name.includes('bandage') || name.includes('ors') || name.includes('electral') || name.includes('glucon-d') || name.includes('first aid') || name.includes('vitamin c') || name.includes('fish oil') || name.includes('omega-3') || name.includes('wellness') || name.includes('pharmacy')) {
    return 'health-wellness';
  }

  // (i) Beauty, Skincare & Cosmetics
  if (name.includes('niacinamide') || name.includes('face serum') || name.includes('serum') || name.includes('kajal') || name.includes('sunscreen') || name.includes('micellar') || name.includes('moisturizing cream') || name.includes('lipstick') || name.includes('foundation') || name.includes('eyeliner') || name.includes('compact powder') || name.includes('blush') || name.includes('mascara') || name.includes('face cream') || name.includes('face mask') || name.includes('lakme') || name.includes('maybelline') || name.includes('minimalist') || name.includes('cosmetics') || name.includes('beauty')) {
    return 'beauty-cosmetics';
  }

  // (j) Fresh Meat, Fish & Eggs
  if (name.includes('chicken breast') || name.includes('chicken curry') || name.includes('chicken') || name.includes('mutton') || name.includes('salmon') || name.includes('prawn') || name.includes('fish') || name.includes('country eggs') || name.includes('brown eggs') || name.includes('meat') || name.includes('seafood')) {
    return 'meat-seafood';
  }

  // (k) Biscuits & Cookies
  if (name.includes('biscuit') || name.includes('cookie') || name.includes('oreo') || name.includes('bourbon') || name.includes('parle-g') || name.includes('parle g') || name.includes('good day') || name.includes('hide & seek') || name.includes('dark fantasy') || name.includes('rusk') || name.includes('cracker') || name.includes('choco fills')) {
    return 'biscuits';
  }

  // (l) Chocolates & Sweets
  if (name.includes('chocolate') || name.includes('silk') || name.includes('dairy milk') || name.includes('cadbury') || name.includes('kitkat') || name.includes('snickers') || name.includes('ferrero') || name.includes('bournville') || name.includes('nutella') || name.includes('mithai') || name.includes('candy') || name.includes('toffee') || name.includes('5 star') || name.includes('bar-one') || name.includes('sweet treat') || name.includes('sweet')) {
    return 'chocolates';
  }

  // (m) Snacks & Munchies (Chips, Nachos, Namkeen - checked before produce so Potato Chips is never produce)
  if (name.includes('chip') || name.includes('dorito') || name.includes('nacho') || name.includes('cornito') || name.includes('kurkure') || name.includes('pringles') || name.includes('namkeen') || name.includes('bhujia') || name.includes('sev') || name.includes('boondi') || name.includes('popcorn') || name.includes('munchies') || name.includes('tedhe medhe') || name.includes('mad angles') || name.includes('mixture') || name.includes('moong dal salty') || name.includes('snack') || name.includes('cashew') || name.includes('peanut')) {
    return 'snacks-munchies';
  }

  // (n) Cold Drinks & Juices / Beverages (Checked before produce so Mango Juice is never produce)
  if (name.includes('cola') || name.includes('coke') || name.includes('thums up') || name.includes('sprite') || name.includes('fanta') || name.includes('red bull') || name.includes('pepsi') || name.includes('limca') || name.includes('maaza') || name.includes('frooti') || name.includes('juice') || name.includes('appy fizz') || name.includes('aamras') || name.includes('paper boat') || name.includes('soda') || name.includes('soft drink') || name.includes('energy drink') || name.includes('kinley') || name.includes('beverage') || name.includes('drink')) {
    return 'beverages';
  }

  // (o) Tea, Coffee & Drinks
  if (name.includes('coffee') || name.includes('nescafe') || name.includes('tea powder') || name.includes('tea gold') || name.includes('red label') || name.includes('taj mahal') || name.includes('tata tea') || name.includes('chai') || name.includes('green tea') || name.includes('tea')) {
    return 'tea-coffee';
  }

  // (p) Instant & Frozen Food
  if (name.includes('maggi') || name.includes('noodle') || name.includes('yippee') || name.includes('ramen') || name.includes('pasta') || name.includes('knorr soup') || name.includes('ready to eat') || name.includes('instant food') || name.includes('soup')) {
    return 'instant-food';
  }

  // (q) Edible Oils & Ghee
  if (name.includes('sunflower oil') || name.includes('mustard oil') || name.includes('cooking oil') || name.includes('ghee') || name.includes('saffola') || name.includes('fortune oil') || name.includes('fortune sunlite') || name.includes('olive oil') || name.includes('dhara') || name.includes('kachi ghani') || (name.includes('oil') && !name.includes('hair'))) {
    return 'oil';
  }

  // (r) Dairy & Bakery (Milk, Butter, Paneer, Cheese, Bread, Curd, Dahi, Lassi)
  if (name.includes('milk') || name.includes('butter') || name.includes('cheese') || name.includes('paneer') || name.includes('curd') || name.includes('dahi') || name.includes('bread') || name.includes('yogurt') || name.includes('cream') || name.includes('buttermilk') || name.includes('taaza') || name.includes('amul gold') || name.includes('masti') || name.includes('lassi') || name.includes('sourdough')) {
    return 'dairy-bakery';
  }

  // (s) Atta, Rice & Dal / Staples
  if (name.includes('atta') || name.includes('rice') || name.includes('dal') || name.includes('toor') || name.includes('moong') || name.includes('flour') || name.includes('salt') || name.includes('sugar') || name.includes('basmati') || name.includes('daawat') || name.includes('india gate') || name.includes('aashirvaad') || name.includes('tata salt') || name.includes('besan') || name.includes('maida') || name.includes('sooji') || name.includes('wheat') || name.includes('pulse')) {
    return 'staples';
  }

  // (t) Personal Care
  if (name.includes('shampoo') || name.includes('soap') || name.includes('handwash') || name.includes('dettol') || name.includes('dove') || name.includes('colgate') || name.includes('toothpaste') || name.includes('lotion') || name.includes('facewash') || name.includes('sanitizer') || name.includes('conditioner') || name.includes('deodorant') || name.includes('perfume') || name.includes('razor') || name.includes('gillette')) {
    return 'personal-care';
  }

  // (u) Household Essentials
  if (name.includes('surf excel') || name.includes('detergent') || name.includes('ariel') || name.includes('tide') || name.includes('harpic') || name.includes('vim') || name.includes('cleaner') || name.includes('dishwash') || name.includes('hit spray') || name.includes('goodknight') || name.includes('all out') || name.includes('mop') || name.includes('wiper') || name.includes('disinfectant')) {
    return 'household';
  }

  // (v) Electronics & Audio Gear
  if (name.includes('headphone') || name.includes('earbud') || name.includes('earphone') || name.includes('speaker') || name.includes('smartwatch') || name.includes('boat') || name.includes('power bank') || name.includes('cable') || name.includes('charger') || name.includes('sandisk') || name.includes('jbl') || name.includes('sony')) {
    return 'electronics';
  }

  // (w) Fashion & Accessories
  if (name.includes('shoe') || name.includes('sneaker') || name.includes('sunglass') || name.includes('sunglasses') || name.includes('wallet') || name.includes('handbag') || name.includes('backpack') || name.includes('fastrack') || name.includes('titan') || name.includes('ray-ban') || name.includes('nike') || name.includes('puma') || name.includes('bata')) {
    return 'fashion';
  }

  // (x) Fresh Fruits & Veggies (Strictly raw produce only)
  if (name.includes('apple') || name.includes('banana') || name.includes('tomato') || name.includes('onion') || name.includes('capsicum') || name.includes('potato') || name.includes('broccoli') || name.includes('carrot') || name.includes('cucumber') || name.includes('spinach') || name.includes('grapes') || name.includes('mango') || name.includes('orange') || name.includes('pomegranate') || name.includes('papaya') || name.includes('lemon') || name.includes('ginger') || name.includes('garlic') || name.includes('coriander') || name.includes('mint') || name.includes('avocado') || name.includes('vegetable') || name.includes('fruit')) {
    return 'produce';
  }

  return 'produce';
}
