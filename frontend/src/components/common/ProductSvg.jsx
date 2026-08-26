// Comprehensive Supermarket Product Graphics Renderer (Supports 80+ Product Items & Public Folder Images)
export default function ProductSvg({ name, size = 100 }) {
  const s = size;

  if (!name) {
    return (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="12" fill="#F1F5F9"/>
        <circle cx="50" cy="50" r="25" fill="#CBD5E1"/>
      </svg>
    );
  }

  // 1. Direct Image Handling for URLs (http/https), file extensions (.png, .jpg) or public folder images (p1.jpg..p35.jpg)
  if (typeof name === 'string' && (name.startsWith('http://') || name.startsWith('https://') || name.endsWith('.jpg') || name.endsWith('.png') || name.startsWith('/'))) {
    const src = (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('/')) ? name : `/${name}`;
    return (
      <img
        src={src}
        alt="Product"
        style={{ height: s + 'px', width: 'auto', objectFit: 'contain', maxHeight: s + 'px' }}
      />
    );
  }

  // 1.1 Category Slugs & Names Lookup
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

  const normKey = typeof name === 'string' ? name.toLowerCase().trim().replace(/\s+/g, '-') : '';
  if (CATEGORY_IMAGE_LOOKUP[name] || CATEGORY_IMAGE_LOOKUP[normKey]) {
    const src = CATEGORY_IMAGE_LOOKUP[name] || CATEGORY_IMAGE_LOOKUP[normKey];
    return (
      <img
        src={src}
        alt={name}
        style={{ height: s + 'px', width: 'auto', objectFit: 'contain', maxHeight: s + 'px' }}
      />
    );
  }

  if (name.startsWith('p') && !isNaN(name.slice(1))) {
    return (
      <img
        src={`/${name}.jpg`}
        alt="Product"
        style={{ height: s + 'px', width: 'auto', objectFit: 'contain', maxHeight: s + 'px' }}
      />
    );
  }

  // 2. Direct Image Handling for User-Uploaded & Generated Photorealistic Assets
  if (name === 'doritos-nacho' || name === 'doritos') {
    return <img src="/doritos-nacho.png" alt="Doritos Nacho Cheese" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'lays-magic-masala' || name === 'lays-blue') {
    return <img src="/lays-magic-masala.png" alt="Lay's India's Magic Masala" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'lays-classic-salted') {
    return <img src="/lays-classic-salted.png" alt="Lay's Classic Salted" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'doritos-cool-ranch') {
    return <img src="/doritos-cool-ranch.png" alt="Doritos Cool Ranch" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'bingo-mad-angles' || name === 'bingo') {
    return <img src="/bingo-mad-angles.png" alt="Bingo! Mad Angles Achaari Masti" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'lays-cream-onion' || name === 'lays-green') {
    return <img src="/lays-cream-onion.png" alt="Lay's American Style Cream & Onion" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'lays-yellow' || name === 'lays-classic') {
    return <img src="/lays-yellow.png" alt="Lay's Classic" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'lays-sizzlin-hot' || name === 'lays-darkred') {
    return <img src="/lays-sizzlin-hot.png" alt="Lay's Sizzlin' Hot" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'lays-chile-limon' || name === 'lays-lightgreen') {
    return <img src="/lays-chile-limon.png" alt="Lay's Chile Limón" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }

  // 🪢 Generated Photorealistic Rakhi Commercial Photos
  if (name === 'rakhi-designer-gold' || name === 'rakhi-1') {
    return <img src="/rakhi-gold-kundan.jpg" alt="Golden Kundan Rakhi" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'rakhi-peacock-stone' || name === 'rakhi-2') {
    return <img src="/rakhi-peacock-blue.jpg" alt="Royal Blue Peacock Rakhi" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'rakhi-silver-rudraksha' || name === 'rakhi-3') {
    return <img src="/rakhi-silver-rudraksha.jpg" alt="Sterling Silver Om Rudraksha Rakhi" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'rakhi-kids-cartoon' || name === 'rakhi-4') {
    return <img src="/rakhi-kids-star.jpg" alt="Kids Cartoon Star Rakhi" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }

  // Real Generated Commercial Supermarket Product Photos
  if (name === 'amul-butter') {
    return <img src="/amul-butter-real.jpg" alt="Amul Butter" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'coca-cola') {
    return <img src="/coca-cola-real.jpg" alt="Coca-Cola" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'aashirvaad-atta') {
    return <img src="/aashirvaad-atta-real.jpg" alt="Aashirvaad Atta" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'dairy-milk-silk') {
    return <img src="/cadbury-silk-real.jpg" alt="Cadbury Dairy Milk Silk" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'dettol-handwash') {
    return <img src="/dettol-handwash-real.jpg" alt="Dettol Handwash" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'surf-excel-powder') {
    return <img src="/surf-excel-real.jpg" alt="Surf Excel" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'fresh-red-apples') {
    return <img src="/fresh-red-apples-real.jpg" alt="Fresh Red Apples" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'nescafe-coffee') {
    return <img src="/nescafe-coffee-real.jpg" alt="Nescafé Coffee" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'oreo-biscuits') {
    return <img src="/oreo-biscuits-real.jpg" alt="Oreo Biscuits" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'maggi-noodles') {
    return <img src="/maggi-noodles-real.jpg" alt="Maggi Noodles" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }
  if (name === 'fortune-oil') {
    return <img src="/fortune-oil-real.jpg" alt="Fortune Sunflower Oil" style={{ height: s + 'px', width: 'auto', objectFit: 'contain' }} />;
  }

  // 2. High Quality Realistic Vector Renderings for Supermarket Products
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
  };

  return svgs[name] || (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="12" fill="#F1F5F9"/>
      <circle cx="50" cy="50" r="25" fill="#CBD5E1"/>
    </svg>
  );
}
