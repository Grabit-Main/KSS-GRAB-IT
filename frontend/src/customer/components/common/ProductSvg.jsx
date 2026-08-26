import React from 'react';

const CLOUDINARY_MAP = {
  // 🍿 Snacks & Munchies
  'lays-cream-onion': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645082/grabit_media/lays_cream_onion.png',
  'lays-green': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645082/grabit_media/lays_cream_onion.png',
  'lays-magic-masala': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645100/grabit_media/lays_magic_masala.png',
  'lays-blue': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645100/grabit_media/lays_magic_masala.png',
  'lays-classic-salted': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645142/grabit_media/lays_classic_salted.png',
  'lays-yellow': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645136/grabit_media/lays_yellow.png',
  'lays-classic': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645136/grabit_media/lays_yellow.png',
  'lays-sizzlin-hot': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645115/grabit_media/lays_sizzlin_hot.png',
  'lays-darkred': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645115/grabit_media/lays_sizzlin_hot.png',
  'lays-chile-limon': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645145/grabit_media/lays_chile_limon.png',
  'lays-lightgreen': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645145/grabit_media/lays_chile_limon.png',
  'doritos-nacho': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645121/grabit_media/doritos_nacho.png',
  'doritos': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645121/grabit_media/doritos_nacho.png',
  'doritos-cool-ranch': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645076/grabit_media/doritos_cool_ranch.png',
  'bingo-mad-angles': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645054/grabit_media/bingo_mad_angles.png',
  'bingo': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645054/grabit_media/bingo_mad_angles.png',

  // 🥛 Dairy & Bakery
  'amul-butter': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645086/grabit_media/amul_butter_real.jpg',
  'amul-milk': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645086/grabit_media/amul_butter_real.jpg',
  'amul-cheese': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645086/grabit_media/amul_butter_real.jpg',
  'mother-dairy-paneer': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645086/grabit_media/amul_butter_real.jpg',
  'epigamia-yogurt': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645086/grabit_media/amul_butter_real.jpg',

  // 🥤 Cold Drinks & Beverages
  'coca-cola': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645111/grabit_media/coca_cola_real.jpg',
  'real-mango': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645111/grabit_media/coca_cola_real.jpg',
  'nescafe-coffee': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645140/grabit_media/nescafe_coffee_real.jpg',
  'taj-mahal-tea': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645140/grabit_media/nescafe_coffee_real.jpg',

  // 🌾 Staples, Atta & Dal
  'aashirvaad-atta': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645096/grabit_media/aashirvaad_atta_real.jpg',
  'daawat-rice': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645070/grabit_media/atta_real.jpg',
  'fortune-oil': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645142/grabit_media/fortune_oil_real.jpg',
  'fortune-mustard-oil': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645142/grabit_media/fortune_oil_real.jpg',
  'maggi-noodles': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645081/grabit_media/maggi_noodles_real.jpg',

  // 🍫 Chocolates & Sweets
  'dairy-milk-silk': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645118/grabit_media/cadbury_silk_real.jpg',
  'ferrero-rocher': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645118/grabit_media/cadbury_silk_real.jpg',
  'oreo-biscuits': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645050/grabit_media/oreo_biscuits_real.jpg',
  'parle-g-biscuits': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645050/grabit_media/oreo_biscuits_real.jpg',

  // 🧼 Personal Care & Cleaning
  'dettol-handwash': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645135/grabit_media/dettol_handwash_real.jpg',
  'dove-soap': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645135/grabit_media/dettol_handwash_real.jpg',
  'surf-excel-powder': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645057/grabit_media/surf_excel_real.jpg',
  'surf-excel': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645057/grabit_media/surf_excel_real.jpg',
  'vim-gel': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645057/grabit_media/surf_excel_real.jpg',

  // 🍎 Fresh Fruits & Vegetables
  'fresh-red-apples': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645093/grabit_media/fresh_red_apples_real.jpg',
  'shimla-apple': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645093/grabit_media/fresh_red_apples_real.jpg',
  'fresh-produce-hero-green': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645093/grabit_media/fresh_red_apples_real.jpg',

  // 🪢 Festival & Rakhi
  'rakhi-gold': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645099/grabit_media/rakhi_gold_kundan.jpg',
  'rakhi-designer-gold': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645099/grabit_media/rakhi_gold_kundan.jpg',
  'rakhi-1': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645099/grabit_media/rakhi_gold_kundan.jpg',
  'rakhi-peacock-blue': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/rakhi_peacock_blue.jpg',
  'rakhi-peacock-stone': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/rakhi_peacock_blue.jpg',
  'rakhi-2': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/rakhi_peacock_blue.jpg',
  'rakhi-silver-rudraksha': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645088/grabit_media/rakhi_silver_rudraksha.jpg',
  'rakhi-3': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645088/grabit_media/rakhi_silver_rudraksha.jpg',
  'rakhi-kids-star': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645065/grabit_media/rakhi_kids_star.jpg',
  'rakhi-kids-cartoon': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645065/grabit_media/rakhi_kids_star.jpg',
  'rakhi-4': 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645065/grabit_media/rakhi_kids_star.jpg',
};

const DEFAULT_GROCERY_FALLBACK = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png';

export default function ProductSvg({ name, size = 100, s }) {
  const finalSize = s || size;

  if (!name) {
    return (
      <img
        src={DEFAULT_GROCERY_FALLBACK}
        alt="Product"
        style={{ height: `${finalSize}px`, width: 'auto', maxHeight: `${finalSize}px`, objectFit: 'contain' }}
      />
    );
  }

  // 1. Direct Cloudinary / HTTP URL Handling
  if (typeof name === 'string' && (name.startsWith('http://') || name.startsWith('https://'))) {
    return (
      <img
        src={name}
        alt="Product"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = DEFAULT_GROCERY_FALLBACK;
        }}
        style={{ height: `${finalSize}px`, width: 'auto', maxHeight: `${finalSize}px`, objectFit: 'contain' }}
      />
    );
  }

  // 2. Lookup in Cloudinary Mappings
  const mappedUrl = CLOUDINARY_MAP[name];
  if (mappedUrl) {
    return (
      <img
        src={mappedUrl}
        alt={name}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = DEFAULT_GROCERY_FALLBACK;
        }}
        style={{ height: `${finalSize}px`, width: 'auto', maxHeight: `${finalSize}px`, objectFit: 'contain' }}
      />
    );
  }

  // 3. Fallback
  return (
    <img
      src={DEFAULT_GROCERY_FALLBACK}
      alt="Product"
      style={{ height: `${finalSize}px`, width: 'auto', maxHeight: `${finalSize}px`, objectFit: 'contain' }}
    />
  );
}
