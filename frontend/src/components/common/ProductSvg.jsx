// Comprehensive Supermarket Product Graphics Renderer (Supports 80+ Product Items & Public Folder Images)

// Fallback shown when any image 404s or fails to load
const FALLBACK_IMG = '/fresh-groceries-basket-only.png';

// Filename aliases: maps old/wrong filenames → correct public filenames
const IMAGE_ALIASES = {
  'fresh-red-apples.jpg': 'fresh-red-apples-real.jpg',
  'apples-real.jpg': 'apples-real.jpg',
  'butter-real.jpg': 'amul-butter-real.jpg',
  'dettol-real.jpg': 'dettol-handwash-real.jpg',
  'oil-real.jpg': 'fortune-oil-real.jpg',
  'oreo-real.jpg': 'oreo-biscuits-real.jpg',
  'silk-real.jpg': 'cadbury-silk-real.jpg',
  'surf-real.jpg': 'surf-excel-real.jpg',
  'atta-real.jpg': 'aashirvaad-atta-real.jpg',
  'default-product.png': null, // will use FALLBACK_IMG
};

// Category slug → public image
const CATEGORY_IMAGE_LOOKUP = {
  'atta-rice-dal': '/aashirvaad-atta-real.jpg',
  'staples': '/aashirvaad-atta-real.jpg',
  'atta,-rice-&-dal': '/aashirvaad-atta-real.jpg',
  'biscuits-cookies': '/oreo-biscuits-real.jpg',
  'biscuits': '/oreo-biscuits-real.jpg',
  'biscuits-&-cookies': '/oreo-biscuits-real.jpg',
  'chocolates-sweets': '/cadbury-silk-real.jpg',
  'chocolates': '/cadbury-silk-real.jpg',
  'chocolates-&-sweets': '/cadbury-silk-real.jpg',
  'cold-drinks-juices': '/coca-cola-real.jpg',
  'beverages': '/coca-cola-real.jpg',
  'cold-drinks-&-juices': '/coca-cola-real.jpg',
  'dairy-bakery': '/amul-butter-real.jpg',
  'dairy': '/amul-butter-real.jpg',
  'dairy-&-bakery': '/amul-butter-real.jpg',
  'edible-oils-ghee': '/fortune-oil-real.jpg',
  'oil': '/fortune-oil-real.jpg',
  'edible-oils-&-ghee': '/fortune-oil-real.jpg',
  'electronics-gadgets': '/electronics-hero-banner.jpg',
  'electronics': '/electronics-hero-banner.jpg',
  'electronics-&-gadgets': '/electronics-hero-banner.jpg',
  'fashion-accessories': '/sneakers.jpg',
  'fashion': '/sneakers.jpg',
  'fashion-&-accessories': '/sneakers.jpg',
  'fresh-fruits-veggies': '/fresh-produce-splash.jpg',
  'produce': '/fresh-produce-splash.jpg',
  'fresh-fruits-&-veggies': '/fresh-produce-splash.jpg',
  'household-essentials': '/surf-excel-real.jpg',
  'household': '/surf-excel-real.jpg',
  'instant-frozen-food': '/instant-noodles-hero-transparent.png',
  'instant-food': '/instant-noodles-hero-transparent.png',
  'instant-&-frozen-food': '/instant-noodles-hero-transparent.png',
  'personal-care': '/dettol-handwash-real.jpg',
  'personal': '/dettol-handwash-real.jpg',
  'snacks-munchies': '/category-snacks-banner.png',
  'snacks': '/category-snacks-banner.png',
  'snacks-&-munchies': '/category-snacks-banner.png',
  'tea-coffee-drinks': '/tea-coffee-hero-transparent.png',
  'tea-coffee': '/tea-coffee-hero-transparent.png',
  'tea,-coffee-&-drinks': '/tea-coffee-hero-transparent.png',
};

function Img({ src, alt, size: s }) {
  return (
    <img
      src={src}
      alt={alt || 'Product'}
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
      style={{
        height: '100%',
        width: '100%',
        maxHeight: s + 'px',
        maxWidth: s + 'px',
        objectFit: 'contain',
        mixBlendMode: 'multiply',
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.06))',
        transition: 'transform 0.2s ease'
      }}
    />
  );
}

export default function ProductSvg({ name, size = 100 }) {
  const s = size;

  if (!name) {
    return <Img src={FALLBACK_IMG} alt="Product" size={s} />;
  }

  const nameStr = String(name);

  // 1. Full URL (Cloudinary, http, https) — render directly with fallback
  if (nameStr.startsWith('http://') || nameStr.startsWith('https://')) {
    return <Img src={nameStr} alt="Product" size={s} />;
  }

  // 2. Absolute public path (starts with /)
  if (nameStr.startsWith('/')) {
    return <Img src={nameStr} alt="Product" size={s} />;
  }

  // 3. File extension — resolve aliases then serve from public
  if (nameStr.endsWith('.jpg') || nameStr.endsWith('.jpeg') || nameStr.endsWith('.png') || nameStr.endsWith('.webp')) {
    // Check alias map first (fixes mismatched filenames like fresh-red-apples.jpg)
    const alias = IMAGE_ALIASES[nameStr];
    if (alias === null) return <Img src={FALLBACK_IMG} alt="Product" size={s} />; // explicitly unmapped
    const resolved = alias ? `/${alias}` : `/${nameStr}`;
    return <Img src={resolved} alt="Product" size={s} />;
  }

  // 4. Category slug lookup
  const normKey = nameStr.toLowerCase().trim().replace(/\s+/g, '-');
  const catSrc = CATEGORY_IMAGE_LOOKUP[nameStr] || CATEGORY_IMAGE_LOOKUP[normKey];
  if (catSrc) {
    return <Img src={catSrc} alt={nameStr} size={s} />;
  }

  // 5. p1..p35 numeric public images
  if (nameStr.startsWith('p') && !isNaN(nameStr.slice(1))) {
    return <Img src={`/${nameStr}.jpg`} alt="Product" size={s} />;
  }

  // 6. Named product keys — map to public images
  const NAMED_IMAGES = {
    'doritos-nacho': '/doritos-nacho.png', 'doritos': '/doritos-nacho.png',
    'lays-magic-masala': '/lays-magic-masala.png', 'lays-blue': '/lays-magic-masala.png',
    'lays-classic-salted': '/lays-classic-salted.png',
    'doritos-cool-ranch': '/doritos-cool-ranch.png',
    'bingo-mad-angles': '/bingo-mad-angles.png', 'bingo': '/bingo-mad-angles.png',
    'lays-cream-onion': '/lays-cream-onion.png', 'lays-green': '/lays-cream-onion.png',
    'lays-yellow': '/lays-yellow.png', 'lays-classic': '/lays-yellow.png',
    'lays-sizzlin-hot': '/lays-sizzlin-hot.png', 'lays-darkred': '/lays-sizzlin-hot.png',
    'lays-chile-limon': '/lays-chile-limon.png', 'lays-lightgreen': '/lays-chile-limon.png',
    'rakhi-designer-gold': '/rakhi-gold-kundan.jpg', 'rakhi-1': '/rakhi-gold-kundan.jpg',
    'rakhi-peacock-stone': '/rakhi-peacock-blue.jpg', 'rakhi-2': '/rakhi-peacock-blue.jpg',
    'rakhi-silver-rudraksha': '/rakhi-silver-rudraksha.jpg', 'rakhi-3': '/rakhi-silver-rudraksha.jpg',
    'rakhi-kids-cartoon': '/rakhi-kids-star.jpg', 'rakhi-4': '/rakhi-kids-star.jpg',
    'amul-butter': '/amul-butter-real.jpg',
    'coca-cola': '/coca-cola-real.jpg',
    'aashirvaad-atta': '/aashirvaad-atta-real.jpg',
    'dairy-milk-silk': '/cadbury-silk-real.jpg',
    'dettol-handwash': '/dettol-handwash-real.jpg',
    'surf-excel-powder': '/surf-excel-real.jpg',
    'fresh-red-apples': '/fresh-red-apples-real.jpg',
    'nescafe-coffee': '/nescafe-coffee-real.jpg',
    'oreo-biscuits': '/oreo-biscuits-real.jpg',
    'maggi-noodles': '/maggi-noodles-real.jpg',
    'fortune-oil': '/fortune-oil-real.jpg',
  };
  if (NAMED_IMAGES[nameStr]) {
    return <Img src={NAMED_IMAGES[nameStr]} alt={nameStr} size={s} />;
  }


  // 7. SVG artwork for specific named products — falls through to svgs[name] below

  const svgs = {
    'amul-milk': (
      <svg width={s} height={s} viewBox="0 0 100 120" fill="none">
        <rect x="25" y="20" width="50" height="90" rx="6" fill="#FFFFFF" stroke="#0066FF" strokeWidth="3"/>
        <path d="M25 40 Q50 30 75 40 L75 110 Q50 110 25 110 Z" fill="#EBF3FF"/>
        <text x="50" y="65" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0066FF" fontFamily="sans-serif">Amul</text>
        <text x="50" y="78" textAnchor="middle" fontSize="8" fontWeight="800" fill="#1A202C" fontFamily="sans-serif">TAAZA</text>
        <text x="50" y="92" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#0F9D58" fontFamily="sans-serif">TONED MILK</text>
      </svg>
    ),

    'mother-dairy-paneer': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="20" y="20" width="60" height="60" rx="8" fill="#FFFFFF" stroke="#0066FF" strokeWidth="2"/>
        <rect x="26" y="26" width="48" height="48" rx="4" fill="#F8FAFC"/>
        <text x="50" y="50" textAnchor="middle" fontSize="8" fontWeight="900" fill="#0066FF" fontFamily="sans-serif">MOTHER</text>
        <text x="50" y="60" textAnchor="middle" fontSize="8" fontWeight="900" fill="#0066FF" fontFamily="sans-serif">DAIRY</text>
        <text x="50" y="70" textAnchor="middle" fontSize="7" fontWeight="800" fill="#0F9D58" fontFamily="sans-serif">PANEER</text>
      </svg>
    ),

    'amul-cheese': (
      <svg width={s} height={s} viewBox="0 0 110 90" fill="none">
        <rect x="15" y="15" width="80" height="60" rx="6" fill="#FFC107" stroke="#FFA000" strokeWidth="2"/>
        <circle cx="35" cy="35" r="6" fill="#FFE082"/>
        <circle cx="70" cy="55" r="8" fill="#FFE082"/>
        <text x="55" y="45" textAnchor="middle" fontSize="11" fontWeight="900" fill="#D32F2F" fontFamily="sans-serif">Amul</text>
        <text x="55" y="58" textAnchor="middle" fontSize="7" fontWeight="800" fill="#000000" fontFamily="sans-serif">CHEESE</text>
      </svg>
    ),

    'epigamia-yogurt': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <ellipse cx="50" cy="30" rx="35" ry="10" fill="#4A148C"/>
        <path d="M15 30 L25 80 C25 88 75 88 75 80 L85 30 Z" fill="#7B1FA2"/>
        <text x="50" y="55" textAnchor="middle" fontSize="8" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">epigamia</text>
        <text x="50" y="66" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#E1BEE7" fontFamily="sans-serif">BLUEBERRY</text>
      </svg>
    ),

    'thums-up': (
      <svg width={s} height={s} viewBox="0 0 80 120" fill="none">
        <rect x="34" y="10" width="12" height="12" fill="#0D47A1" rx="2"/>
        <path d="M30 22 L20 60 L20 105 L60 105 L60 60 L50 22 Z" fill="#0D47A1"/>
        <rect x="20" y="48" width="40" height="28" fill="#1565C0"/>
        <text x="40" y="64" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">THUMS UP</text>
      </svg>
    ),

    'sprite': (
      <svg width={s} height={s} viewBox="0 0 80 120" fill="none">
        <rect x="34" y="10" width="12" height="12" fill="#388E3C" rx="2"/>
        <path d="M30 22 L20 60 L20 105 L60 105 L60 60 L50 22 Z" fill="#2E7D32"/>
        <ellipse cx="40" cy="62" rx="18" ry="14" fill="#FBC02D"/>
        <text x="40" y="65" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#1B5E20" fontFamily="sans-serif">Sprite</text>
      </svg>
    ),

    'red-bull': (
      <svg width={s} height={s} viewBox="0 0 80 120" fill="none">
        <rect x="22" y="20" width="36" height="85" rx="4" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
        <rect x="22" y="40" width="36" height="40" fill="#1E3A8A"/>
        <circle cx="40" cy="60" r="12" fill="#F59E0B"/>
        <text x="40" y="63" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#DC2626" fontFamily="sans-serif">Red Bull</text>
      </svg>
    ),

    'real-mango': (
      <svg width={s} height={s} viewBox="0 0 90 120" fill="none">
        <rect x="20" y="15" width="50" height="90" rx="4" fill="#FB8C00"/>
        <rect x="20" y="40" width="50" height="45" fill="#FFF3E0"/>
        <text x="45" y="58" textAnchor="middle" fontSize="12" fontWeight="900" fill="#E65100" fontFamily="sans-serif">Real</text>
        <text x="45" y="72" textAnchor="middle" fontSize="8" fontWeight="800" fill="#F57C00" fontFamily="sans-serif">MANGO</text>
      </svg>
    ),

    'tropicana-orange': (
      <svg width={s} height={s} viewBox="0 0 90 120" fill="none">
        <rect x="20" y="15" width="50" height="90" rx="4" fill="#EF6C00"/>
        <circle cx="45" cy="60" r="18" fill="#FFE082"/>
        <text x="45" y="58" textAnchor="middle" fontSize="7" fontWeight="900" fill="#2E7D32" fontFamily="sans-serif">Tropicana</text>
        <text x="45" y="68" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#E65100" fontFamily="sans-serif">ORANGE</text>
      </svg>
    ),

    'tata-salt': (
      <svg width={s} height={s} viewBox="0 0 90 110" fill="none">
        <rect x="15" y="15" width="60" height="80" rx="6" fill="#0D47A1"/>
        <rect x="20" y="35" width="50" height="45" fill="#FFFFFF"/>
        <text x="45" y="54" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0D47A1" fontFamily="sans-serif">TATA</text>
        <text x="45" y="68" textAnchor="middle" fontSize="8" fontWeight="800" fill="#D32F2F" fontFamily="sans-serif">SALT</text>
      </svg>
    ),

    'daawat-rice': (
      <svg width={s} height={s} viewBox="0 0 100 120" fill="none">
        <rect x="15" y="15" width="70" height="90" rx="8" fill="#1B5E20"/>
        <rect x="20" y="35" width="60" height="50" fill="#FFF8E1"/>
        <text x="50" y="55" textAnchor="middle" fontSize="9" fontWeight="900" fill="#1B5E20" fontFamily="sans-serif">DAAWAT</text>
        <text x="50" y="68" textAnchor="middle" fontSize="7" fontWeight="800" fill="#B71C1C" fontFamily="sans-serif">BASMATI RICE</text>
      </svg>
    ),

    'fortune-mustard-oil': (
      <svg width={s} height={s} viewBox="0 0 90 120" fill="none">
        <rect x="35" y="10" width="20" height="12" rx="2" fill="#E65100"/>
        <rect x="20" y="22" width="50" height="85" rx="8" fill="#F57F17"/>
        <rect x="25" y="45" width="40" height="45" fill="#FFFFFF"/>
        <text x="45" y="62" textAnchor="middle" fontSize="8" fontWeight="900" fill="#D32F2F" fontFamily="sans-serif">Fortune</text>
        <text x="45" y="74" textAnchor="middle" fontSize="6" fontWeight="800" fill="#E65100" fontFamily="sans-serif">MUSTARD OIL</text>
      </svg>
    ),

    'ferrero-rocher': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="15" y="15" width="70" height="70" rx="8" fill="#FFF8E1" stroke="#FFB300" strokeWidth="2"/>
        <circle cx="35" cy="40" r="12" fill="#FFB300"/>
        <circle cx="65" cy="40" r="12" fill="#FFB300"/>
        <circle cx="50" cy="65" r="12" fill="#FFB300"/>
        <text x="50" y="44" textAnchor="middle" fontSize="6" fontWeight="900" fill="#3E2723" fontFamily="sans-serif">FERRERO</text>
      </svg>
    ),

    'head-shoulders-shampoo': (
      <svg width={s} height={s} viewBox="0 0 80 120" fill="none">
        <path d="M20 15 C20 15 65 15 65 30 L60 105 L20 105 Z" fill="#1565C0"/>
        <text x="40" y="60" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">head &amp;</text>
        <text x="40" y="70" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">shoulders</text>
      </svg>
    ),

    'dove-soap': (
      <svg width={s} height={s} viewBox="0 0 100 70" fill="none">
        <rect x="10" y="10" width="80" height="50" rx="10" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="2"/>
        <path d="M40 30 C45 20 55 25 50 35 C45 40 35 35 40 30 Z" fill="#FBC02D"/>
        <text x="50" y="46" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1565C0" fontFamily="sans-serif">Dove</text>
      </svg>
    ),

    'fresh-bananas': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <path d="M20 70 Q40 90 75 60 Q85 50 80 40 Q70 45 45 70 Z" fill="#FDD835" stroke="#F57F17" strokeWidth="2"/>
        <path d="M15 65 Q35 85 70 55 Q80 45 75 35 Q65 40 40 65 Z" fill="#FFEE58"/>
      </svg>
    ),

    // 🪢 4 EXQUISITE RAKHI VECTOR GRAPHICS FOR RAKSHA BANDHAN HUB
    'rakhi-designer-gold': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Red & Gold Braided Thread */}
        <path d="M0 60 L120 60" stroke="#DC2626" strokeWidth="4" strokeDasharray="3 3"/>
        <path d="M0 60 L120 60" stroke="#FDE047" strokeWidth="2"/>
        {/* Outer Pearl Ring */}
        <circle cx="60" cy="60" r="30" fill="#7F1D1D" stroke="#F59E0B" strokeWidth="3"/>
        {/* Golden Petal Motif */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <circle key={i} cx={60 + 20 * Math.cos((angle * Math.PI) / 180)} cy={60 + 20 * Math.sin((angle * Math.PI) / 180)} r="5" fill="#FDE047" stroke="#B45309" strokeWidth="1"/>
        ))}
        {/* Center Kundan Stone */}
        <circle cx="60" cy="60" r="14" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2"/>
        <circle cx="60" cy="60" r="7" fill="#FDE047"/>
        <circle cx="58" cy="58" r="2.5" fill="#FFFFFF"/>
      </svg>
    ),

    'rakhi-peacock-stone': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Royal Blue & Gold Thread */}
        <path d="M0 60 L120 60" stroke="#2563EB" strokeWidth="4"/>
        <path d="M0 60 L120 60" stroke="#FDE047" strokeWidth="2" strokeDasharray="4 2"/>
        {/* Peacock Feather Base */}
        <ellipse cx="60" cy="60" rx="32" ry="26" fill="#1E3A8A" stroke="#FDE047" strokeWidth="3"/>
        <ellipse cx="60" cy="60" rx="22" ry="17" fill="#0284C7"/>
        <ellipse cx="60" cy="60" rx="13" ry="10" fill="#0D9488"/>
        <circle cx="60" cy="60" r="5" fill="#FDE047"/>
        {/* Surrounding Gold Beads */}
        <circle cx="24" cy="60" r="6" fill="#F59E0B"/>
        <circle cx="96" cy="60" r="6" fill="#F59E0B"/>
      </svg>
    ),

    'rakhi-silver-rudraksha': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Sacred Saffron Thread */}
        <path d="M0 60 L120 60" stroke="#EA580C" strokeWidth="4"/>
        {/* Side Rudraksha Beads */}
        <circle cx="30" cy="60" r="9" fill="#78350F" stroke="#451A03" strokeWidth="2"/>
        <circle cx="90" cy="60" r="9" fill="#78350F" stroke="#451A03" strokeWidth="2"/>
        {/* Center Sterling Silver Ring */}
        <circle cx="60" cy="60" r="24" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="3"/>
        {/* Sacred Om Motif */}
        <circle cx="60" cy="60" r="15" fill="#DC2626"/>
        <text x="60" y="66" textAnchor="middle" fontSize="16" fontWeight="900" fill="#FDE047" fontFamily="sans-serif">ॐ</text>
      </svg>
    ),

    'rakhi-kids-cartoon': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Soft Multi-color Ribbon */}
        <path d="M0 60 L120 60" stroke="#EC4899" strokeWidth="6"/>
        <path d="M0 60 L120 60" stroke="#06B6D4" strokeWidth="3"/>
        {/* Star Superhero Emblem */}
        <circle cx="60" cy="60" r="28" fill="#FACC15" stroke="#E11D48" strokeWidth="3"/>
        <polygon points="60,38 67,52 82,53 70,63 74,78 60,69 46,78 50,63 38,53 53,52" fill="#E11D48"/>
        <circle cx="60" cy="60" r="6" fill="#FFFFFF"/>
      </svg>
    ),

    'promo-gift': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        <path d="M0 60 L120 60" stroke="#DC2626" strokeWidth="4" strokeDasharray="3 3"/>
        <path d="M0 60 L120 60" stroke="#FDE047" strokeWidth="2"/>
        <circle cx="60" cy="60" r="30" fill="#7F1D1D" stroke="#F59E0B" strokeWidth="3"/>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <circle key={i} cx={60 + 20 * Math.cos((angle * Math.PI) / 180)} cy={60 + 20 * Math.sin((angle * Math.PI) / 180)} r="5" fill="#FDE047" stroke="#B45309" strokeWidth="1"/>
        ))}
        <circle cx="60" cy="60" r="14" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2"/>
        <circle cx="60" cy="60" r="7" fill="#FDE047"/>
        <circle cx="58" cy="58" r="2.5" fill="#FFFFFF"/>
      </svg>
    ),

    // 🪔 AUTHENTIC FESTIVAL PRODUCTS SVGS
    'pooja-thali-brass': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Brass Plate Outer Rim */}
        <circle cx="60" cy="60" r="48" fill="#F59E0B" stroke="#B45309" strokeWidth="3"/>
        <circle cx="60" cy="60" r="40" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5"/>
        {/* Engraved Floral Border */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
          <circle key={i} cx={60 + 35 * Math.cos((deg * Math.PI) / 180)} cy={60 + 35 * Math.sin((deg * Math.PI) / 180)} r="2.5" fill="#B45309"/>
        ))}
        {/* Center Diya with Flame */}
        <ellipse cx="60" cy="65" rx="16" ry="9" fill="#B45309" stroke="#78350F" strokeWidth="1.5"/>
        <ellipse cx="60" cy="64" rx="12" ry="6" fill="#F59E0B"/>
        <path d="M57 58 Q60 40 63 58 Z" fill="#EF4444"/>
        <path d="M58 57 Q60 45 62 57 Z" fill="#FDE047"/>
        {/* Kumkum Roli & Haldi Cups */}
        <circle cx="42" cy="48" r="8" fill="#DC2626" stroke="#B91C1C" strokeWidth="1.5"/>
        <circle cx="42" cy="48" r="4" fill="#EF4444"/>
        <circle cx="78" cy="48" r="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5"/>
        <circle cx="78" cy="48" r="4" fill="#FEF08A"/>
        {/* Bell / Camphor Spot */}
        <circle cx="60" cy="82" r="5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1"/>
      </svg>
    ),

    'mens-grooming-kit': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Luxury Gift Box Base */}
        <rect x="16" y="24" width="88" height="72" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2"/>
        {/* Golden Cross Ribbon */}
        <rect x="56" y="24" width="8" height="72" fill="#F59E0B"/>
        <rect x="16" y="56" width="88" height="8" fill="#F59E0B"/>
        {/* Ribbon Bow */}
        <circle cx="60" cy="60" r="8" fill="#D97706"/>
        <circle cx="55" cy="56" r="5" fill="#FBBF24"/>
        <circle cx="65" cy="56" r="5" fill="#FBBF24"/>
        {/* Bottle Illustration */}
        <rect x="24" y="32" width="18" height="30" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1"/>
        <rect x="29" y="28" width="8" height="4" fill="#94A3B8"/>
        <text x="60" y="86" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#38BDF8" fontFamily="sans-serif">GROOMING KIT</text>
      </svg>
    ),

    'banana-chips-kerala': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Green Pouch Packaging */}
        <rect x="22" y="16" width="76" height="88" rx="8" fill="#15803D" stroke="#166534" strokeWidth="2"/>
        <rect x="22" y="16" width="76" height="18" rx="4" fill="#166534"/>
        <text x="60" y="28" textAnchor="middle" fontSize="6" fontWeight="900" fill="#FEF08A" fontFamily="sans-serif">KERALA SPECIAL</text>
        {/* Transparent Window */}
        <ellipse cx="60" cy="58" rx="26" ry="18" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.5"/>
        {/* Crispy Round Banana Chips */}
        <circle cx="48" cy="56" r="7" fill="#FACC15" stroke="#A16207" strokeWidth="1"/>
        <circle cx="68" cy="54" r="8" fill="#EAB308" stroke="#854D0E" strokeWidth="1"/>
        <circle cx="58" cy="64" r="7" fill="#FDE047" stroke="#CA8A04" strokeWidth="1"/>
        <text x="60" y="90" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">BANANA CHIPS</text>
      </svg>
    ),

    'mtr-payasam-mix': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Dessert Pouch */}
        <rect x="22" y="16" width="76" height="88" rx="8" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2"/>
        {/* Golden Ribbon Banner */}
        <rect x="22" y="28" width="76" height="22" fill="#F59E0B"/>
        <text x="60" y="42" textAnchor="middle" fontSize="9" fontWeight="900" fill="#450A0A" fontFamily="sans-serif">MTR PALADA</text>
        {/* Payasam Bowl Illustration */}
        <path d="M40 66 Q60 90 80 66 Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="2"/>
        <ellipse cx="60" cy="66" rx="20" ry="6" fill="#FEF3C7"/>
        <circle cx="56" cy="66" r="2" fill="#78350F"/>
        <circle cx="64" cy="67" r="2" fill="#78350F"/>
        <text x="60" y="92" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FEF08A" fontFamily="sans-serif">PAYASAM MIX</text>
      </svg>
    ),

    'kerala-kasavu-saree': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Folded Kasavu Cream Cotton Attire */}
        <rect x="20" y="24" width="80" height="72" rx="6" fill="#FFFBEB" stroke="#D4AF37" strokeWidth="2.5"/>
        {/* Golden Zari Borders Top and Bottom */}
        <rect x="20" y="24" width="80" height="14" fill="#D4AF37"/>
        <rect x="20" y="82" width="80" height="14" fill="#D4AF37"/>
        {/* Zari Motifs */}
        <polygon points="32,34 38,26 44,34" fill="#B45309"/>
        <polygon points="56,34 62,26 68,34" fill="#B45309"/>
        <polygon points="80,34 86,26 92,34" fill="#B45309"/>
        <text x="60" y="58" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#854D0E" fontFamily="sans-serif">KASAVU SAREE</text>
        <text x="60" y="70" textAnchor="middle" fontSize="6" fontWeight="700" fill="#A16207" fontFamily="sans-serif">&amp; MUNDU</text>
      </svg>
    ),

    'brass-nilavilakku-lamp': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Base Stand */}
        <ellipse cx="60" cy="98" rx="26" ry="8" fill="#CA8A04" stroke="#854D0E" strokeWidth="2"/>
        <ellipse cx="60" cy="94" rx="18" ry="5" fill="#EAB308"/>
        {/* Tall Pillar Stem */}
        <rect x="56" y="44" width="8" height="50" fill="#FACC15" stroke="#A16207" strokeWidth="1.5"/>
        <circle cx="60" cy="68" r="7" fill="#EAB308"/>
        {/* Oil Bowl Reservoir */}
        <ellipse cx="60" cy="46" rx="24" ry="7" fill="#F59E0B" stroke="#B45309" strokeWidth="2"/>
        {/* Top Crown Finial */}
        <polygon points="60,22 55,36 65,36" fill="#CA8A04"/>
        <circle cx="60" cy="22" r="3" fill="#EAB308"/>
        {/* Golden Radiant Flames */}
        <path d="M58 24 Q60 10 62 24 Z" fill="#EF4444"/>
        <path d="M59 23 Q60 14 61 23 Z" fill="#FDE047"/>
        <path d="M38 46 Q40 36 42 46 Z" fill="#F59E0B"/>
        <path d="M78 46 Q80 36 82 46 Z" fill="#F59E0B"/>
      </svg>
    ),

    'amul-ghee-tin': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Tin Body */}
        <rect x="30" y="26" width="60" height="72" rx="8" fill="#15803D" stroke="#14532D" strokeWidth="2"/>
        {/* Golden Lid */}
        <rect x="36" y="18" width="48" height="10" rx="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5"/>
        {/* Yellow Cow Ghee Label */}
        <rect x="30" y="40" width="60" height="38" fill="#FEF08A"/>
        <text x="60" y="55" textAnchor="middle" fontSize="9" fontWeight="900" fill="#15803D" fontFamily="sans-serif">Amul</text>
        <text x="60" y="68" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#B45309" fontFamily="sans-serif">PURE GHEE</text>
      </svg>
    ),

    'eastern-sambar-powder': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Spice Pouch */}
        <rect x="24" y="16" width="72" height="88" rx="8" fill="#DC2626" stroke="#991B1B" strokeWidth="2"/>
        {/* Center Yellow Spice Banner */}
        <rect x="24" y="36" width="72" height="30" fill="#FBBF24"/>
        <text x="60" y="50" textAnchor="middle" fontSize="8" fontWeight="900" fill="#7F1D1D" fontFamily="sans-serif">EASTERN</text>
        <text x="60" y="61" textAnchor="middle" fontSize="7" fontWeight="900" fill="#991B1B" fontFamily="sans-serif">SAMBAR MIX</text>
        {/* Small spice bowl icon */}
        <path d="M48 80 Q60 92 72 80 Z" fill="#F59E0B"/>
      </svg>
    ),

    'kerala-rice-pappadam': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        {/* Packet Body */}
        <rect x="20" y="18" width="80" height="84" rx="8" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="2"/>
        <rect x="20" y="18" width="80" height="16" fill="#CA8A04"/>
        <text x="60" y="29" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">KERALA PAPPADAM</text>
        {/* Stacked Crispy Pappadams */}
        <ellipse cx="60" cy="55" rx="26" ry="18" fill="#FFFBEB" stroke="#EAB308" strokeWidth="2"/>
        <ellipse cx="60" cy="64" rx="26" ry="18" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2"/>
        <ellipse cx="60" cy="73" rx="26" ry="18" fill="#FFFBEB" stroke="#D97706" strokeWidth="2"/>
      </svg>
    ),

    'fresh-produce-hero-green': (
      <svg width={s} height={s} viewBox="0 0 120 120" fill="none">
        <path d="M15 95 Q50 15 95 20 Q75 75 25 105 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2"/>
        <path d="M22 100 Q55 50 90 22" stroke="#166534" strokeWidth="2.5"/>
        <text x="60" y="80" textAnchor="middle" fontSize="6" fontWeight="900" fill="#14532D" fontFamily="sans-serif">BANANA LEAF</text>
      </svg>
    ),

    // Subcategory Specialized Graphics
    'agarbatti-&-incense': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <path d="M45 80 L52 20" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
        <path d="M55 80 L62 25" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="52" cy="20" r="3" fill="#EF4444"/>
        <circle cx="62" cy="25" r="3" fill="#F59E0B"/>
        <path d="M52 16 Q48 10 54 4" stroke="#94A3B8" strokeWidth="2" fill="none"/>
        <rect x="35" y="78" width="30" height="12" rx="4" fill="#D97706"/>
      </svg>
    ),
    'brass-diyas-&-lamps': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <path d="M20 55 C20 75 80 75 80 55 L70 55 C65 65 35 65 30 55 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2"/>
        <ellipse cx="50" cy="55" rx="30" ry="8" fill="#D97706"/>
        <path d="M50 48 Q44 32 50 20 Q56 32 50 48 Z" fill="#EF4444"/>
        <path d="M50 45 Q46 35 50 26 Q54 35 50 45 Z" fill="#FBBF24"/>
      </svg>
    ),
    'pure-camphor-&-wicks': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="25" y="45" width="22" height="22" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2"/>
        <rect x="53" y="45" width="22" height="22" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2"/>
        <rect x="39" y="30" width="22" height="22" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2"/>
        <path d="M50 25 Q46 15 50 8 Q54 15 50 25 Z" fill="#F59E0B"/>
      </svg>
    ),
    'haldi-kumkum-&-roli': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <circle cx="35" cy="55" r="20" fill="#EAB308" stroke="#CA8A04" strokeWidth="2"/>
        <circle cx="65" cy="55" r="20" fill="#DC2626" stroke="#991B1B" strokeWidth="2"/>
        <circle cx="35" cy="55" r="14" fill="#FACC15"/>
        <circle cx="65" cy="55" r="14" fill="#EF4444"/>
      </svg>
    ),
    'building-blocks': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="20" y="45" width="60" height="35" rx="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="2"/>
        <rect x="30" y="35" width="12" height="10" rx="2" fill="#EF4444"/>
        <rect x="58" y="35" width="12" height="10" rx="2" fill="#EF4444"/>
        <rect x="35" y="20" width="30" height="15" rx="3" fill="#3B82F6"/>
      </svg>
    ),
    'board-games-&-puzzles': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="20" y="20" width="60" height="60" rx="8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2"/>
        <rect x="30" y="30" width="18" height="18" fill="#FFFFFF"/>
        <rect x="52" y="52" width="18" height="18" fill="#FFFFFF"/>
        <circle cx="39" cy="39" r="4" fill="#EF4444"/>
        <circle cx="61" cy="61" r="4" fill="#F59E0B"/>
      </svg>
    ),
    'diecast-cars-&-tracks': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <path d="M15 60 Q25 40 45 40 L65 40 Q80 40 90 60 L90 70 L15 70 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2"/>
        <circle cx="30" cy="70" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="3"/>
        <circle cx="75" cy="70" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="3"/>
      </svg>
    ),
    'dolls-&-figurines': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="35" r="20" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
        <circle cx="43" cy="32" r="3" fill="#1E293B"/>
        <circle cx="57" cy="32" r="3" fill="#1E293B"/>
        <path d="M45 42 Q50 47 55 42" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 60 C30 50 70 50 70 60 L65 85 L35 85 Z" fill="#EC4899"/>
      </svg>
    ),
    'rackets-&-balls': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <ellipse cx="40" cy="40" rx="22" ry="28" stroke="#0071E3" strokeWidth="3" fill="#EFF6FF"/>
        <line x1="40" y1="68" x2="40" y2="95" stroke="#1E293B" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="75" cy="65" r="10" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2"/>
      </svg>
    ),
    'fitness-supplements': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="25" y="25" width="50" height="65" rx="6" fill="#1E293B"/>
        <rect x="25" y="15" width="50" height="12" rx="3" fill="#0071E3"/>
        <text x="50" y="55" textAnchor="middle" fontSize="10" fontWeight="900" fill="#38BDF8" fontFamily="sans-serif">WHEY</text>
        <text x="50" y="68" textAnchor="middle" fontSize="7" fontWeight="800" fill="#FFFFFF" fontFamily="sans-serif">PROTEIN</text>
      </svg>
    ),
    'gym-shakers-&-bottles': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <path d="M30 25 L35 85 L65 85 L70 25 Z" fill="#10B981" stroke="#047857" strokeWidth="2"/>
        <rect x="28" y="15" width="44" height="12" rx="3" fill="#1E293B"/>
      </svg>
    ),
    'yoga-&-mats': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="15" y="40" width="70" height="25" rx="12" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2"/>
        <ellipse cx="15" cy="52.5" rx="5" ry="12.5" fill="#A78BFA"/>
      </svg>
    ),
    'notebooks-&-pads': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="25" y="15" width="55" height="70" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2"/>
        <line x1="20" y1="25" x2="30" y2="25" stroke="#64748B" strokeWidth="3"/>
        <line x1="20" y1="40" x2="30" y2="40" stroke="#64748B" strokeWidth="3"/>
        <line x1="20" y1="55" x2="30" y2="55" stroke="#64748B" strokeWidth="3"/>
        <line x1="20" y1="70" x2="30" y2="70" stroke="#64748B" strokeWidth="3"/>
      </svg>
    ),
    'pens-&-markers': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <path d="M25 80 L75 25 L85 35 L35 90 Z" fill="#0071E3"/>
        <path d="M15 90 L25 80 L35 90 Z" fill="#1E293B"/>
      </svg>
    ),
    'desk-tools-&-tapes': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="30" stroke="#0284C7" strokeWidth="12" fill="none"/>
        <circle cx="50" cy="50" r="18" fill="#F0F9FF"/>
      </svg>
    ),
    'calculators': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="25" y="15" width="50" height="70" rx="6" fill="#1E293B"/>
        <rect x="32" y="24" width="36" height="15" rx="2" fill="#A7F3D0"/>
        <circle cx="36" cy="50" r="4" fill="#64748B"/>
        <circle cx="50" cy="50" r="4" fill="#64748B"/>
        <circle cx="64" cy="50" r="4" fill="#64748B"/>
        <circle cx="36" cy="65" r="4" fill="#64748B"/>
        <circle cx="50" cy="65" r="4" fill="#64748B"/>
        <circle cx="64" cy="65" r="4" fill="#F59E0B"/>
      </svg>
    ),
    'cookware-&-pans': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <ellipse cx="42" cy="55" rx="28" ry="18" fill="#1E293B" stroke="#475569" strokeWidth="2"/>
        <path d="M68 55 L92 50" stroke="#78350F" strokeWidth="6" strokeLinecap="round"/>
      </svg>
    ),
    'bottles-&-flasks': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="35" y="25" width="30" height="65" rx="8" fill="#94A3B8" stroke="#475569" strokeWidth="2"/>
        <rect x="40" y="15" width="20" height="12" rx="3" fill="#1E293B"/>
      </svg>
    ),
    'storage-&-containers': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="25" y="30" width="50" height="55" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2"/>
        <rect x="22" y="22" width="56" height="10" rx="3" fill="#0071E3"/>
      </svg>
    ),
    'kitchen-tools': (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <path d="M30 20 C30 45 45 50 45 60 L45 85 L35 85 L35 60 C35 50 20 45 20 20 Z" fill="#94A3B8"/>
        <path d="M65 20 L75 20 L75 85 L65 85 Z" fill="#78350F"/>
        <path d="M60 20 C75 20 85 30 85 45 L60 45 Z" fill="#CBD5E1"/>
      </svg>
    ),
  };

  const normalizedKey = nameStr.toLowerCase().trim().replace(/[\s\-_]+/g, '-');
  return svgs[nameStr] || svgs[normalizedKey] || <Img src={FALLBACK_IMG} alt="Product" size={s} />;
}
