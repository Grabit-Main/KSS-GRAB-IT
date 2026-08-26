// ==========================================================================
// Grabit Quick Commerce - Shared Media & Image Resolver
// Mirrors the customer portal image mappings and assets
// ==========================================================================

export const DEFAULT_PRODUCT_FALLBACK = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png';
export const DEFAULT_CATEGORY_FALLBACK = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645161/grabit_media/fresh_fruits_veggies.jpg';

export const CLOUDINARY_MEDIA_MAP = {
  // 🍿 Snacks & Munchies
  'snacks-munchies': '/category-snacks-banner.png',
  'lays-cream-onion': '/category-snacks-banner.png',

  // 🥛 Dairy & Bakery
  'dairy-bakery': '/amul-butter-real.jpg',
  'amul-butter': '/amul-butter-real.jpg',

  // 🥤 Cold Drinks & Juices
  'beverages': '/coca-cola-real.jpg',
  'cold-drinks-juices': '/coca-cola-real.jpg',
  'coca-cola': '/coca-cola-real.jpg',

  // 🌾 Atta, Rice & Dal
  'staples': '/aashirvaad-atta-real.jpg',
  'atta-rice-dal': '/aashirvaad-atta-real.jpg',
  'aashirvaad-atta': '/aashirvaad-atta-real.jpg',

  // 🍫 Chocolates & Sweets
  'chocolates': '/cadbury-silk-real.jpg',
  'chocolates-sweets': '/cadbury-silk-real.jpg',
  'dairy-milk-silk': '/cadbury-silk-real.jpg',

  // 🧼 Personal Care
  'personal-care': '/dettol-handwash-real.jpg',
  'dettol-handwash': '/dettol-handwash-real.jpg',

  // 🧹 Household Essentials
  'household': '/surf-excel-real.jpg',
  'household-essentials': '/surf-excel-real.jpg',
  'surf-excel-powder': '/surf-excel-real.jpg',

  // 🍎 Fresh Fruits & Veggies
  'produce': '/fresh-produce-splash.jpg',
  'fresh-fruits-veggies': '/fresh-produce-splash.jpg',
  'fresh-red-apples': '/fresh-produce-splash.jpg',

  // ☕ Tea, Coffee & Drinks
  'tea-coffee': '/nescafe-coffee-real.jpg',
  'tea-coffee-drinks': '/nescafe-coffee-real.jpg',
  'nescafe-coffee': '/nescafe-coffee-real.jpg',

  // 🍪 Biscuits & Cookies
  'biscuits': '/oreo-biscuits-real.jpg',
  'biscuits-cookies': '/oreo-biscuits-real.jpg',
  'oreo-biscuits': '/oreo-biscuits-real.jpg',

  // 🍜 Instant & Frozen Food
  'instant-food': '/maggi-noodles-real.jpg',
  'instant-frozen-food': '/maggi-noodles-real.jpg',
  'maggi-noodles': '/maggi-noodles-real.jpg',

  // 🛢️ Edible Oils & Ghee
  'oil': '/fortune-oil-real.jpg',
  'edible-oils-ghee': '/fortune-oil-real.jpg',
  'fortune-oil': '/fortune-oil-real.jpg',

  // 📱 Electronics & Gadgets
  'electronics': '/electronics-hero-banner.jpg',
  'electronics-gadgets': '/electronics-hero-banner.jpg',

  // 👟 Fashion & Accessories
  'fashion': '/sneakers.jpg',
  'fashion-accessories': '/sneakers.jpg',
};

/**
 * Resolves a product or category image key/filename/URL to a high-res Cloudinary image
 */
export const resolveMediaUrl = (keyOrUrl, fallback = DEFAULT_PRODUCT_FALLBACK) => {
  if (!keyOrUrl) return fallback;
  if (typeof keyOrUrl === 'string' && (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://') || keyOrUrl.startsWith('/'))) {
    return keyOrUrl;
  }

  // Strip extension if passed like 'lays-cream-onion.png'
  const cleanKey = String(keyOrUrl).replace(/\.(png|jpg|jpeg|webp)$/i, '').trim();
  if (CLOUDINARY_MEDIA_MAP[cleanKey]) {
    return CLOUDINARY_MEDIA_MAP[cleanKey];
  }

  if (CLOUDINARY_MEDIA_MAP[keyOrUrl]) {
    return CLOUDINARY_MEDIA_MAP[keyOrUrl];
  }

  return fallback;
};
