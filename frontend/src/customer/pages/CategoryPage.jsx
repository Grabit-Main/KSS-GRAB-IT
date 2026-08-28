import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Star, TrendingUp, ArrowLeft, Sliders, X, ChevronDown, Check } from 'lucide-react';
// Clean Production Verified Build
import ProductCard from '../components/common/ProductCard';
import ProductSvg from '../components/common/ProductSvg';
import { products } from '../data/products';
import { subCategories, brands } from '../data/categories';
import useWindowWidth from '../hooks/useWindowWidth';
import { forceScrollToTop } from '../../utils/scrollToTop';
const CATEGORY_MAP = {
  'snacks-munchies': {
    title: 'Snacks & Munchies',
    sub: 'Crispy, crunchy & delicious snacks for every craving.',
    catKey: 'snacks',
    isDark: false,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645062/grabit_media/category_snacks_feast_hero.png',
    gradient: 'linear-gradient(135deg, #FFF8F0 0%, #FFEDD5 45%, #FED7AA 80%, #FDBA74 100%)',
    accentColor: '#D97706',
    bannerIcons: ['lays-cream-onion', 'lays-sizzlin-hot', 'doritos-nacho', 'bingo-mad-angles']
  },
  'dairy-bakery': {
    title: 'Dairy & Bakery',
    sub: 'Fresh milk, butter, paneer, cheese & daily bakery essentials.',
    catKey: 'dairy',
    isDark: false,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645098/grabit_media/dairy_hero_transparent.png',
    gradient: 'linear-gradient(135deg, #FFFDF5 0%, #FFF3D6 45%, #FFE7A0 80%, #FCD34D 100%)',
    accentColor: '#D97706',
    bannerIcons: ['amul-butter', 'amul-milk', 'mother-dairy-paneer', 'amul-cheese']
  },
  'beverages': {
    title: 'Cold Drinks & Juices',
    sub: 'Chilled soft drinks, fruit juices, energy drinks, tea & coffee.',
    catKey: 'beverages',
    isDark: false,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645114/grabit_media/beverages_hero_transparent.png',
    gradient: 'linear-gradient(135deg, #FFF5F5 0%, #FFE3E3 40%, #FFC9C9 75%, #FFA8A8 100%)',
    accentColor: '#E53935',
    bannerIcons: ['coca-cola', 'real-mango', 'red-bull', 'nescafe-coffee']
  },
  'staples': {
    title: 'Atta, Rice & Dal',
    sub: 'Pure chakki atta, basmati rice, pulses, salt & instant noodles.',
    catKey: 'staples',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645085/grabit_media/staples_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #1A0D03 0%, #3D1C06 40%, #6E3309 75%, #A14B07 100%)',
    accentColor: '#F59E0B',
    bannerIcons: ['aashirvaad-atta', 'tata-salt', 'daawat-rice', 'maggi-noodles']
  },
  'chocolates': {
    title: 'Chocolates & Sweets',
    sub: 'Delicious chocolates, hazelnut spreads & sweet treats.',
    catKey: 'chocolates',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645104/grabit_media/chocolates_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #2D0654 0%, #4C1D95 40%, #6B21A8 75%, #881337 100%)',
    accentColor: '#E9D5FF',
    bannerIcons: ['dairy-milk-silk', 'ferrero-rocher', 'kitkat-chocolate', 'nutella-spread']
  },
  'personal-care': {
    title: 'Personal Care',
    sub: 'Germ protection handwashes, shampoos, soaps & toothpastes.',
    catKey: 'personal-care',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645089/grabit_media/personal_care_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #022C22 0%, #064E3B 40%, #047857 75%, #0D9488 100%)',
    accentColor: '#34D399',
    bannerIcons: ['dettol-handwash', 'head-shoulders-shampoo', 'dove-soap', 'colgate-toothpaste']
  },
  'household': {
    title: 'Household Essentials',
    sub: 'Detergents, dishwash gels & surface disinfectants.',
    catKey: 'household',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645068/grabit_media/household_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #031B33 0%, #073B6C 40%, #0369A1 75%, #0284C7 100%)',
    accentColor: '#38BDF8',
    bannerIcons: ['surf-excel-powder', 'vim-gel', 'harpic-cleaner']
  },
  'produce': {
    title: 'Fresh Fruits & Veggies',
    sub: 'Farm fresh fruits, vegetables & healthy eggs delivered fast.',
    catKey: 'produce',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645111/grabit_media/fresh_produce_splash_transparent.png',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #047857 40%, #0F766E 100%)',
    accentColor: '#34D399',
    bannerIcons: ['fresh-red-apples', 'fresh-bananas', 'fresh-tomatoes', 'fresh-broccoli']
  },
  'biscuits': {
    title: 'Biscuits & Cookies',
    sub: 'Crispy biscuits, cookies & tea-time snacks.',
    catKey: 'biscuits',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645098/grabit_media/biscuits_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #1C0B03 0%, #3B1602 40%, #6E2A06 75%, #A1460A 100%)',
    accentColor: '#F59E0B',
    bannerIcons: ['oreo-original', 'parle-g', 'good-day-butter', 'dark-fantasy']
  },
  'oil': {
    title: 'Edible Oils & Ghee',
    sub: 'Pure sunflower oil, mustard oil & healthy cooking oils.',
    catKey: 'oil',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645122/grabit_media/oil_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #1F1202 0%, #452405 40%, #783D05 75%, #B45309 100%)',
    accentColor: '#FACC15',
    bannerIcons: ['fortune-oil', 'fortune-mustard-oil']
  },
  'electronics': {
    title: 'Electronics & Gadgets',
    sub: 'Premium headphones, speakers, smartwatches & audio gear.',
    catKey: 'electronics',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645107/grabit_media/electronics_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #0A0F1D 0%, #171E38 40%, #251B4E 75%, #0F172A 100%)',
    accentColor: '#38BDF8',
    bannerIcons: ['https://res.cloudinary.com/hmx3azp6/image/upload/v1787645101/grabit_media/p1.jpg', 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645109/grabit_media/p4.jpg', 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645112/grabit_media/p6.jpg', 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645078/grabit_media/p9.jpg']
  },
  'tea-coffee': {
    title: 'Tea, Coffee & Drinks',
    sub: 'Rich instant coffee, aromatic chai leaves & morning beverages.',
    catKey: 'tea-coffee',
    isDark: true,
    heroImg: '/tea-coffee-hero-transparent.png',
    gradient: 'linear-gradient(135deg, #180B04 0%, #331808 40%, #5E2C0C 75%, #854D0E 100%)',
    accentColor: '#EAB308',
    bannerIcons: ['nescafe-coffee', 'tea-coffee-hero-transparent.png'],
  },
  'instant-food': {
    title: 'Instant & Frozen Food',
    sub: 'Quick 2-minute noodles, hot soups, pasta & ready-to-eat meals.',
    catKey: 'instant-food',
    isDark: true,
    heroImg: '/instant-noodles-hero-transparent.png',
    gradient: 'linear-gradient(135deg, #1C0A00 0%, #3D1400 40%, #7C2D12 75%, #B45309 100%)',
    accentColor: '#F59E0B',
    bannerIcons: ['maggi-noodles', 'instant-noodles-hero-transparent.png'],
  },
  'fashion': {
    title: 'Fashion & Accessories',
    sub: 'Trendy sneakers, sunglasses, watches & lifestyle items.',
    catKey: 'fashion',
    isDark: true,
    heroImg: 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645139/grabit_media/fashion_hero_cutout.png',
    gradient: 'linear-gradient(135deg, #2A0413 0%, #4D0922 40%, #881337 75%, #9F1239 100%)',
    accentColor: '#FB7185',
    bannerIcons: ['https://res.cloudinary.com/hmx3azp6/image/upload/v1787645101/grabit_media/p1.jpg', 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645094/grabit_media/p2.jpg'],
  },
};

// Aliases for all common slug variants
CATEGORY_MAP['snacks'] = CATEGORY_MAP['snacks-munchies'];
CATEGORY_MAP['dairy'] = CATEGORY_MAP['dairy-bakery'];
CATEGORY_MAP['cold-drinks-juices'] = CATEGORY_MAP['beverages'];
CATEGORY_MAP['cold-drinks'] = CATEGORY_MAP['beverages'];
CATEGORY_MAP['drinks'] = CATEGORY_MAP['beverages'];
CATEGORY_MAP['atta-rice-dal'] = CATEGORY_MAP['staples'];
CATEGORY_MAP['atta-rice-dals'] = CATEGORY_MAP['staples'];
CATEGORY_MAP['chocolates-sweets'] = CATEGORY_MAP['chocolates'];
CATEGORY_MAP['household-essentials'] = CATEGORY_MAP['household'];
CATEGORY_MAP['fresh-fruits-veggies'] = CATEGORY_MAP['produce'];
CATEGORY_MAP['fresh-produce'] = CATEGORY_MAP['produce'];
CATEGORY_MAP['fruits-vegetables'] = CATEGORY_MAP['produce'];
CATEGORY_MAP['tea-coffee-drinks'] = CATEGORY_MAP['tea-coffee'];
CATEGORY_MAP['biscuits-cookies'] = CATEGORY_MAP['biscuits'];
CATEGORY_MAP['cookies'] = CATEGORY_MAP['biscuits'];
CATEGORY_MAP['instant-frozen-food'] = CATEGORY_MAP['instant-food'];
CATEGORY_MAP['edible-oils-ghee'] = CATEGORY_MAP['oil'];
CATEGORY_MAP['oils-ghee'] = CATEGORY_MAP['oil'];
CATEGORY_MAP['oils'] = CATEGORY_MAP['oil'];
CATEGORY_MAP['electronics-gadgets'] = CATEGORY_MAP['electronics'];
CATEGORY_MAP['fashion-accessories'] = CATEGORY_MAP['fashion'];

const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating: High to Low'];

const matchesSubCategory = (product, subCat) => {
  if (!subCat || subCat === 'All') return true;

  if (product.subCategory && product.subCategory.toLowerCase() === subCat.toLowerCase()) {
    return true;
  }

  const name = (product.name || '').toLowerCase();
  const sub = subCat.toLowerCase();

  // Electronics & Gadgets
  if (sub.includes('watch') || sub.includes('smartwatch')) {
    return name.includes('watch') || name.includes('smartwatch') || name.includes('wave call') || name.includes('pulse') || name.includes('ninja');
  }
  if (sub.includes('speaker')) {
    return name.includes('speaker') || name.includes('soundbar') || name.includes('go 3') || name.includes('flip') || name.includes('warrior') || name.includes('jbl') || name.includes('sony');
  }
  if (sub.includes('headphone') || sub.includes('tws') || sub.includes('earbud')) {
    return name.includes('headphone') || name.includes('earbud') || name.includes('earphone') || name.includes('tws') || name.includes('airdrop') || name.includes('buds') || name.includes('basshead') || name.includes('sony wh');
  }
  if (sub.includes('computer') || sub.includes('accessories')) {
    return name.includes('mouse') || name.includes('keyboard') || name.includes('power bank') || name.includes('usb') || name.includes('card') || name.includes('mic') || name.includes('sandisk') || name.includes('logitech') || name.includes('extender') || name.includes('bulb') || name.includes('receiver') || name.includes('rode');
  }

  // Fashion & Accessories
  if (sub.includes('shoe') || sub.includes('sneaker')) {
    return name.includes('shoe') || name.includes('sneaker') || name.includes('boot') || name.includes('running') || name.includes('bata') || name.includes('nike') || name.includes('puma') || name.includes('adidas') || name.includes('woodland') || name.includes('campus') || name.includes('sparx');
  }
  if (sub.includes('watch') || sub.includes('sunglasses') || sub.includes('sunglass')) {
    return name.includes('watch') || name.includes('sunglass') || name.includes('ray-ban') || name.includes('titan') || name.includes('fastrack') || name.includes('fossil') || name.includes('casio') || name.includes('sonata');
  }
  if (sub.includes('bag') || sub.includes('accessories')) {
    return name.includes('bag') || name.includes('backpack') || name.includes('trolley') || name.includes('wallet') || name.includes('handbag') || name.includes('necklace') || name.includes('earring') || name.includes('belt') || name.includes('cap') || name.includes('tourister') || name.includes('skybags') || name.includes('safari') || name.includes('lavie') || name.includes('caprese') || name.includes('zaveri') || name.includes('youbella') || name.includes('tommy');
  }

  // Edible Oils & Ghee
  if (sub.includes('sunflower')) return name.includes('sunflower') || name.includes('sunlite') || name.includes('saffola');
  if (sub.includes('mustard')) return name.includes('mustard') || name.includes('kachi ghani') || name.includes('dhara');
  if (sub.includes('ghee')) return name.includes('ghee') || name.includes('cow ghee') || name.includes('amul pure');
  if (sub.includes('olive') || sub.includes('specialty')) return name.includes('olive') || name.includes('rice bran') || name.includes('groundnut') || name.includes('sesame') || name.includes('coconut');

  // Personal Care
  if (sub.includes('handwash') || sub.includes('soap')) return name.includes('handwash') || name.includes('soap') || name.includes('dettol') || name.includes('dove') || name.includes('pears') || name.includes('fiama');
  if (sub.includes('hair')) return name.includes('shampoo') || name.includes('hair') || name.includes('head & shoulders') || name.includes('pantene') || name.includes('clinic') || name.includes('conditioner');
  if (sub.includes('skin') || sub.includes('body')) return name.includes('lotion') || name.includes('cream') || name.includes('nivea') || name.includes('vaseline') || name.includes('ponds') || name.includes('toothpaste') || name.includes('colgate') || name.includes('sensodyne');
  if (sub.includes('grooming') || sub.includes('perfume')) return name.includes('deodorant') || name.includes('perfume') || name.includes('spray') || name.includes('razor') || name.includes('gillette') || name.includes('fogg') || name.includes('axe') || name.includes('park avenue');

  // Household Essentials
  if (sub.includes('detergent')) return name.includes('surf') || name.includes('ariel') || name.includes('tide') || name.includes('detergent') || name.includes('mat') || name.includes('rin');
  if (sub.includes('dishwash') || sub.includes('cleaner')) return name.includes('vim') || name.includes('gel') || name.includes('harpic') || name.includes('lysol') || name.includes('collin') || name.includes('dettol');
  if (sub.includes('air') || sub.includes('freshener')) return name.includes('godrej') || name.includes('aer') || name.includes('odonil') || name.includes('spray') || name.includes('freshener');
  if (sub.includes('pest') || sub.includes('mop')) return name.includes('hit') || name.includes('all out') || name.includes('goodknight') || name.includes('mop') || name.includes('wiper') || name.includes('scrub') || name.includes('scotch-brite');

  // Biscuits & Cookies
  if (sub.includes('cream')) {
    return name.includes('cream') || name.includes('oreo') || name.includes('bourbon') || name.includes('choco fills') || name.includes('dark fantasy') || name.includes('treat');
  }
  if (sub.includes('butter') || sub.includes('cookies') || sub.includes('nut')) {
    return name.includes('butter') || name.includes('cookie') || name.includes('good day') || name.includes('hide & seek') || name.includes('cashew') || name.includes('unibic') || name.includes('nutri');
  }
  if (sub.includes('digestive') || sub.includes('glucose')) {
    return name.includes('glucose') || name.includes('parle-g') || name.includes('marie') || name.includes('digestive') || name.includes('sunfeast') || name.includes('gold');
  }

  if (sub.includes('milk') || sub.includes('butter')) return name.includes('milk') || name.includes('butter');
  if (sub.includes('paneer') || sub.includes('cheese')) return name.includes('paneer') || name.includes('cheese');
  if (sub.includes('bread') || sub.includes('bakery')) return name.includes('bread') || name.includes('bakery') || name.includes('bun');
  if (sub.includes('yogurt') || sub.includes('dahi')) return name.includes('yogurt') || name.includes('dahi') || name.includes('curd');

  // Cold Drinks & Juices
  if (sub.includes('soft')) return name.includes('coke') || name.includes('coca') || name.includes('sprite') || name.includes('fanta') || name.includes('pepsi') || name.includes('thums') || name.includes('limca') || name.includes('soda');
  if (sub.includes('juice')) return name.includes('juice') || name.includes('real') || name.includes('tropicana') || name.includes('maaza') || name.includes('frooti') || name.includes('paper boat') || name.includes('appy');
  if (sub.includes('tea') || sub.includes('coffee')) return name.includes('tea') || name.includes('coffee') || name.includes('nescafe');
  if (sub.includes('energy')) return name.includes('red bull') || name.includes('monster') || name.includes('energy');

  // Atta, Rice & Dal
  if (sub.includes('atta') || sub.includes('flour')) return name.includes('atta') || name.includes('flour') || name.includes('aashirvaad');
  if (sub.includes('rice') || sub.includes('grain')) return name.includes('rice') || name.includes('basmati') || name.includes('daawat') || name.includes('india gate');
  if (sub.includes('dal') || sub.includes('pulse')) return name.includes('dal') || name.includes('pulse') || name.includes('toor') || name.includes('moong') || name.includes('chana');

  // Fresh Fruits & Veggies
  if (sub.includes('fruit')) return name.includes('apple') || name.includes('banana') || name.includes('mango') || name.includes('grapes') || name.includes('berry') || name.includes('orange');
  if (sub.includes('veggie') || sub.includes('vegetable')) return name.includes('tomato') || name.includes('potato') || name.includes('onion') || name.includes('broccoli') || name.includes('carrot') || name.includes('cucumber');

  // Fallback matching with stem strip (remove trailing 'es' or 's')
  const words = sub.split(' ').map(w => w.replace(/es$/, '').replace(/s$/, '')).filter(w => w.length > 2);
  return words.some(w => name.includes(w));
};

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [allCategories, setAllCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('grabit_seller_custom_categories');
      const customList = stored ? JSON.parse(stored) : [];
      const stored2 = localStorage.getItem('grabit_custom_categories');
      const customList2 = stored2 ? JSON.parse(stored2) : [];
      return [...customList, ...customList2, ...(window.__grabit_categories || [])];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const updateCategories = () => {
      try {
        const stored = localStorage.getItem('grabit_seller_custom_categories');
        const customList = stored ? JSON.parse(stored) : [];
        const stored2 = localStorage.getItem('grabit_custom_categories');
        const customList2 = stored2 ? JSON.parse(stored2) : [];
        setAllCategories([...customList, ...customList2, ...(window.__grabit_categories || [])]);
      } catch {}
    };
    updateCategories();
    window.addEventListener('grabit_categories_synced', updateCategories);
    window.addEventListener('grabit_categories_updated', updateCategories);
    window.addEventListener('storage', updateCategories);
    return () => {
      window.removeEventListener('grabit_categories_synced', updateCategories);
      window.removeEventListener('grabit_categories_updated', updateCategories);
      window.removeEventListener('storage', updateCategories);
    };
  }, []);

  const resolveStandardSlug = (s) => {
    const slugLower = String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (slugLower === 'cold-drinks-juices' || slugLower === 'cold-drinks' || slugLower === 'beverages' || slugLower.includes('beverage')) return 'beverages';
    if (slugLower === 'atta-rice-dal' || slugLower === 'atta' || slugLower === 'staples' || slugLower.includes('staple')) return 'staples';
    if (slugLower === 'snacks-munchies' || slugLower === 'snacks' || slugLower.includes('snack')) return 'snacks-munchies';
    if (slugLower === 'dairy-bakery' || slugLower === 'dairy' || slugLower.includes('dairy') || slugLower.includes('bakery')) return 'dairy-bakery';
    if (slugLower === 'chocolates-sweets' || slugLower === 'chocolates' || slugLower.includes('chocolate') || slugLower.includes('sweet')) return 'chocolates';
    if (slugLower === 'personal-care' || slugLower.includes('personal-care')) return 'personal-care';
    if (slugLower === 'household-essentials' || slugLower === 'household' || slugLower.includes('household')) return 'household';
    if (slugLower === 'fresh-fruits-veg' || slugLower === 'fruits-vegetables' || slugLower === 'produce' || slugLower.includes('fruit') || slugLower.includes('veggie')) return 'produce';
    if (slugLower === 'tea-coffee-drinks' || slugLower === 'tea-coffee' || slugLower.includes('tea') || slugLower.includes('coffee')) return 'tea-coffee';
    if (slugLower === 'biscuits-cookies' || slugLower === 'biscuits' || slugLower.includes('biscuit') || slugLower.includes('cookie')) return 'biscuits';
    if (slugLower === 'instant-frozen-food' || slugLower === 'instant-food' || slugLower.includes('instant') || slugLower.includes('frozen')) return 'instant-food';
    if (slugLower === 'edible-oils-ghee' || slugLower === 'oil' || slugLower.includes('oil') || slugLower.includes('ghee')) return 'oil';
    if (slugLower === 'electronics-gadgets' || slugLower === 'electronics' || slugLower.includes('electronic') || slugLower.includes('gadget')) return 'electronics';
    if (slugLower === 'fashion-accessories' || slugLower === 'fashion' || slugLower.includes('fashion') || slugLower.includes('clothing') || slugLower.includes('shoe')) return 'fashion';
    return slugLower;
  };

  const cleanSlug = resolveStandardSlug(slug);
  const cleanSlugSpace = cleanSlug.replace(/-/g, ' ');

  const matchedCatObj = allCategories.find(c => 
    (c.slug && String(c.slug).toLowerCase().trim() === cleanSlug) ||
    String(c.id).toLowerCase().trim() === cleanSlug ||
    (c.name && String(c.name).toLowerCase().trim() === cleanSlugSpace) ||
    (c.name && String(c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug)
  );

  const catInfo = CATEGORY_MAP[cleanSlug] || (matchedCatObj ? {
    title: matchedCatObj.name,
    sub: `Explore all products in ${matchedCatObj.name}.`,
    catKey: matchedCatObj.slug || matchedCatObj.id || cleanSlug,
    isDark: false,
    heroImg: matchedCatObj.image_url || matchedCatObj.image || matchedCatObj.icon || '/grabit-logo.png',
    gradient: 'linear-gradient(135deg, #EEF4FF 0%, #E0EDFF 50%, #BFDBFE 100%)',
    accentColor: '#0066FF',
    bannerIcons: []
  } : {
    title: (slug || 'Category').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    sub: 'Explore all products in this category.',
    catKey: cleanSlug,
    isDark: false,
    heroImg: '/grabit-logo.png',
    gradient: 'linear-gradient(135deg, #EEF4FF 0%, #E0EDFF 50%, #BFDBFE 100%)',
    accentColor: '#0066FF',
    bannerIcons: []
  });

  const w = useWindowWidth();
  const isMobile = w <= 640;
  const isTablet = w <= 1024;

  const [activeSubCat, setActiveSubCat] = useState('All');
  const [activeBrands, setActiveBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(5000);
  const [sort, setSort] = useState('Relevance');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const [allProductsState, setAllProductsState] = useState(() => [...products]);

  useEffect(() => {
    const updateProds = () => setAllProductsState([...products]);
    updateProds();
    window.addEventListener('grabit_products_synced', updateProds);
    window.addEventListener('grabit_products_updated', updateProds);
    window.addEventListener('storage', updateProds);
    return () => {
      window.removeEventListener('grabit_products_synced', updateProds);
      window.removeEventListener('grabit_products_updated', updateProds);
      window.removeEventListener('storage', updateProds);
    };
  }, []);

  useEffect(() => {
    setActiveSubCat('All');
    setActiveBrands([]);
    forceScrollToTop();
  }, [slug]);

  useEffect(() => {
    forceScrollToTop();
  }, [activeSubCat]);

  const categoryProducts = allProductsState.filter(p => {
    if (!slug) return true;
    const targetSlug = cleanSlug;
    const targetClean = cleanSlugSpace;

    const pCat = String(p.category || '').toLowerCase().trim();
    const pSlug = String(p.category_slug || '').toLowerCase().trim();
    const pCatName = String(p.category_name || '').toLowerCase().trim();
    const pCatId = String(p.category_id || '').toLowerCase().trim();

    if (matchedCatObj) {
      const mId = String(matchedCatObj.id || '').toLowerCase().trim();
      const mName = String(matchedCatObj.name || '').toLowerCase().trim();
      const mSlug = String(matchedCatObj.slug || '').toLowerCase().trim();

      if (mId && (pCatId === mId || pCat === mId)) return true;
      if (mName && (pCatName === mName || pCat === mName)) return true;
      if (mSlug && (pCat === mSlug || pSlug === mSlug)) return true;
    }

    if (pCat === targetSlug || pSlug === targetSlug) return true;
    if (pCatName === targetClean || pCat === targetClean) return true;
    if (pCatName && targetClean && (pCatName.includes(targetClean) || targetClean.includes(pCatName))) return true;
    if (pCat && targetClean && (pCat.includes(targetClean) || targetClean.includes(pCat))) return true;

    return false;
  });
  const rawSubCats = subCategories[slug] || [{ name: 'All', count: categoryProducts.length }];

  const subCats = rawSubCats.map(s => {
    if (s.name === 'All') return { ...s, count: categoryProducts.length };
    const matchedCount = categoryProducts.filter(p => matchesSubCategory(p, s.name)).length;
    return { ...s, count: matchedCount > 0 ? matchedCount : s.count };
  });

  const brandList = brands[slug] || [];

  const toggleBrand = (b) => {
    setActiveBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  let filtered = categoryProducts.filter(p => {
    if (activeSubCat !== 'All' && !matchesSubCategory(p, activeSubCat)) return false;
    if (activeBrands.length > 0 && !activeBrands.includes(p.brand)) return false;
    if (p.price > priceRange) return false;
    return true;
  });

  if (sort === 'Price: Low to High') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'Price: High to Low') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'Rating: High to Low') filtered.sort((a, b) => b.rating - a.rating);

  const prodGridCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)';

  return (
    <div key={slug} className="container section category-transition-container" style={{ paddingTop: isMobile ? '20px' : '24px', paddingBottom: isMobile ? '90px' : '40px' }}>
      


      {/* ── PREMIUM HERO BANNER ── */}
      <div className="category-hero-morph" style={{
        background: catInfo.gradient,
        borderRadius: isMobile ? '16px' : '24px',
        padding: isMobile ? '14px 14px' : '20px 36px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        border: '1px solid rgba(255,255,255,0.8)',
        minHeight: isMobile ? 'auto' : '155px',
        position: 'relative',
        overflow: 'visible',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        gap: isMobile ? '16px' : '0'
      }}>

        {/* 🌟 AMBIENT GLOW BACKDROP LIGHTING */}
        {slug === 'produce' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            <div
              className="produce-glow-backdrop"
              style={{
                position: 'absolute', top: '-20px', right: '10%', width: '320px', height: '320px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(187,247,208,0.4) 60%, transparent 100%)',
                filter: 'blur(24px)'
              }}
            />
          </div>
        )}

        {slug === 'electronics' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            <div
              className="tech-glow-backdrop"
              style={{
                position: 'absolute', top: '-10px', right: '12%', width: '320px', height: '320px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(253,230,138,0.5) 60%, transparent 100%)',
                filter: 'blur(28px)'
              }}
            />
          </div>
        )}

        {(slug === 'snacks-munchies' || slug === 'snacks') && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            <div
              className="snack-glow-backdrop"
              style={{
                position: 'absolute', top: '-10px', right: '12%', width: '320px', height: '320px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(254,215,170,0.5) 60%, transparent 100%)',
                filter: 'blur(28px)'
              }}
            />
          </div>
        )}

        {(slug === 'dairy-bakery' || slug === 'dairy') && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            <div
              className="snack-glow-backdrop"
              style={{
                position: 'absolute', top: '-20px', right: '10%', width: '380px', height: '380px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.38) 0%, rgba(245,158,11,0.16) 60%, transparent 100%)',
                filter: 'blur(32px)'
              }}
            />
          </div>
        )}

        {slug === 'beverages' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            <div
              className="snack-glow-backdrop"
              style={{
                position: 'absolute', top: '-20px', right: '10%', width: '380px', height: '380px',
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.35) 0%, rgba(16,185,129,0.15) 60%, transparent 100%)',
                filter: 'blur(32px)'
              }}
            />
          </div>
        )}

        {/* 🌟 UNIVERSAL RADIANT AMBIENT LIGHT AURA FOR ALL OTHER CATEGORIES */}
        {catInfo.isDark && slug !== 'produce' && slug !== 'electronics' && slug !== 'snacks-munchies' && slug !== 'dairy-bakery' && slug !== 'beverages' && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            <div
              className="snack-glow-backdrop"
              style={{
                position: 'absolute', top: '-20px', right: '10%', width: '380px', height: '380px',
                borderRadius: '50%', background: `radial-gradient(circle, ${catInfo.accentColor}55 0%, ${catInfo.accentColor}15 60%, transparent 100%)`,
                filter: 'blur(32px)'
              }}
            />
          </div>
        )}

        {/* Left Content Area */}
        <div style={{ maxWidth: isMobile ? '100%' : '500px', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: catInfo.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '4px 12px', borderRadius: '30px',
            fontSize: '11px', fontWeight: 800, color: catInfo.isDark ? '#38BDF8' : catInfo.accentColor,
            marginBottom: '10px', border: catInfo.isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <Sparkles size={13} color={catInfo.isDark ? '#38BDF8' : catInfo.accentColor} />
            <span>SPECIAL OFFER • UP TO 30% OFF</span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '22px' : '34px', fontWeight: 900, color: catInfo.isDark ? '#FFFFFF' : '#0F172A',
            marginBottom: '8px', letterSpacing: '-0.5px', lineHeight: 1.2
          }}>
            {catInfo.title}
          </h1>

          <p style={{ color: catInfo.isDark ? '#94A3B8' : '#475569', fontSize: isMobile ? '13px' : '15px', lineHeight: 1.5, marginBottom: '14px', fontWeight: 500 }}>
            {catInfo.sub}
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: catInfo.isDark ? '#E2E8F0' : '#1E293B' }}>
              <Zap size={15} color="#38BDF8" fill="#38BDF8" />
              <span>30-45 Min Express</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: catInfo.isDark ? '#E2E8F0' : '#1E293B' }}>
              <Star size={15} color="#F59E0B" fill="#F59E0B" />
              <span>4.9★ Rated Favourites</span>
            </div>
          </div>
        </div>

        {/* Mobile Hero Graphic */}
        {isMobile && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '12px', zIndex: 2, position: 'relative' }}>
            {catInfo.heroImg ? (
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={catInfo.heroImg}
                  alt={catInfo.title}
                  style={{
                    height: '240px', width: 'auto', maxWidth: '100%',
                    objectFit: 'contain',
                    mixBlendMode: catInfo.heroImg?.endsWith('.png') ? 'normal' : (catInfo.isDark ? 'screen' : 'multiply'),
                    filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))'
                  }}
                />
                {slug === 'snacks-munchies' && (
                  <div style={{
                    position: 'absolute', top: '-8px', left: '-10px',
                    background: '#FFFFFF', padding: '4px 10px', borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '10px', fontWeight: 900, color: '#E53935'
                  }}>
                    <TrendingUp size={12} color="#E53935" />
                    <span>#1 Best Seller</span>
                  </div>
                )}
              </div>
            ) : catInfo.bannerIcons && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', zIndex: 2 }}>
                {catInfo.bannerIcons.slice(0, 3).map((iconName, i) => (
                  <div key={i} style={{ background: '#FFFFFF', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <ProductSvg name={iconName} size={45} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Graphic Container (Desktop) */}
        {!isMobile && (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {catInfo.heroImg ? (
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '-10px', marginTop: '-35px', marginBottom: '-35px' }}>
                <img
                  src={catInfo.heroImg}
                  alt={catInfo.title}
                  style={{
                    height: '340px', width: 'auto', maxWidth: '640px',
                    objectFit: 'contain',
                    mixBlendMode: catInfo.heroImg?.endsWith('.png') ? 'normal' : (catInfo.isDark ? 'screen' : 'multiply'),
                    filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.15))'
                  }}
                />
                {slug === 'snacks-munchies' && (
                  <div style={{
                    position: 'absolute', top: '-10px', left: '-20px',
                    background: '#FFFFFF', padding: '6px 12px', borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', fontWeight: 900, color: '#E53935'
                  }}>
                    <TrendingUp size={14} color="#E53935" />
                    <span>#1 Best Seller</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 2 }}>
                {catInfo.bannerIcons.map((iconName, i) => (
                  <div key={i} style={{ background: '#FFFFFF', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <ProductSvg name={iconName} size={65} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🌟 CATEGORY TITLE ROW */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
          Available Products
        </h2>
      </div>

      {/* 🌟 CLEAN FILTER & SORT TOOLBAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', marginBottom: '22px', width: '100%', boxSizing: 'border-box'
      }}>
        {/* 1. Filters Drawer Trigger Pill */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: (activeBrands.length > 0 || activeSubCat !== 'All') ? '#0071E3' : '#FFFFFF',
            color: (activeBrands.length > 0 || activeSubCat !== 'All') ? '#FFFFFF' : '#0F172A',
            border: (activeBrands.length > 0 || activeSubCat !== 'All') ? '1.5px solid #0071E3' : '1.5px solid #CBD5E1',
            borderRadius: '24px', padding: '9px 18px', fontSize: '13px', fontWeight: 900,
            cursor: 'pointer', boxShadow: (activeBrands.length > 0 || activeSubCat !== 'All') ? '0 4px 12px rgba(0,113,227,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
            whiteSpace: 'nowrap', height: '40px', flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
        >
          <Sliders size={15} color={(activeBrands.length > 0 || activeSubCat !== 'All') ? '#FFFFFF' : '#0071E3'} />
          <span>Filters &amp; Refine</span>
          {(activeBrands.length > 0 || activeSubCat !== 'All') && (
            <span style={{
              background: '#FFFFFF', color: '#0071E3',
              fontSize: '10.5px', fontWeight: 900, padding: '2px 7px', borderRadius: '10px'
            }}>
              {activeBrands.length + (activeSubCat !== 'All' ? 1 : 0)}
            </span>
          )}
        </button>

        {/* 2. Sort Dropdown Pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#FFFFFF', border: '1.5px solid #CBD5E1',
          borderRadius: '24px', padding: '0 14px', height: '40px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', flexShrink: 0
        }}>
          <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 800 }}>Sort:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              background: 'transparent', border: 'none', fontSize: '13px',
              fontWeight: 900, color: '#0F172A', cursor: 'pointer', outline: 'none'
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* 🌟 ULTRA-PREMIUM ACTIVE FILTERS BAR */}
      {(activeBrands.length > 0 || activeSubCat !== 'All') && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
          marginBottom: '18px', padding: '10px 14px', background: '#F8FAFC',
          borderRadius: '16px', border: '1px solid #E2E8F0'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginRight: '2px' }}>
            Active Filters:
          </span>

          {activeSubCat !== 'All' && (
            <span
              onClick={() => setActiveSubCat('All')}
              style={{
                background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1',
                borderRadius: '20px', padding: '5px 12px', fontSize: '12px',
                fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s ease'
              }}
            >
              <span>Category: {activeSubCat}</span>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={10} color="#64748B" strokeWidth={2.5} />
              </div>
            </span>
          )}

          {activeBrands.map(brand => (
            <span
              key={brand}
              onClick={() => toggleBrand(brand)}
              style={{
                background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1',
                borderRadius: '20px', padding: '5px 12px', fontSize: '12px',
                fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s ease'
              }}
            >
              <span>{brand}</span>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={10} color="#64748B" strokeWidth={2.5} />
              </div>
            </span>
          ))}

          <button
            onClick={() => { setActiveSubCat('All'); setActiveBrands([]); setPriceRange(5000); }}
            style={{
              background: 'transparent', color: '#0071E3', border: 'none',
              fontSize: '12px', fontWeight: 800, cursor: 'pointer',
              marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,113,227,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Clear All
          </button>
        </div>
      )}

      {/* ── 🌟 ULTRA-PREMIUM SLIDE-UP FILTER MODAL DRAWER (Portal to document.body) ── */}
      {isFilterDrawerOpen && createPortal(
        <div
          onClick={() => setIsFilterDrawerOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center', padding: isMobile ? 0 : '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: isMobile ? '24px 24px 0 0' : '24px',
              maxWidth: isMobile ? '100%' : '480px', width: '100%',
              minHeight: isMobile ? '85vh' : '580px',
              maxHeight: isMobile ? '92vh' : '90vh',
              overflowY: 'auto', padding: isMobile ? '20px 18px 28px' : '24px',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '18px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} color="#0071E3" />
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Filters &amp; Refine
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => { setActiveSubCat('All'); setActiveBrands([]); setPriceRange(5000); }}
                  style={{
                    background: 'none', border: 'none', color: '#0071E3',
                    fontSize: '13px', fontWeight: 900, cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>

                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#F1F5F9', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0
                  }}
                >
                  <X size={16} color="#0F172A" />
                </button>
              </div>
            </div>

            {/* All Main Categories Quick Jump Inline Accordion */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                Category
              </label>

              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                style={{
                  width: '100%', height: '46px', padding: '0 14px', borderRadius: '14px',
                  background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                  fontSize: '13.5px', fontWeight: 800, color: '#0F172A',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span>{catInfo.title}</span>
                </div>
                <ChevronDown size={17} color="#0071E3" style={{ transform: isCatDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {isCatDropdownOpen && (
                <div style={{
                  marginTop: '8px', background: '#F8FAFC', borderRadius: '16px',
                  border: '1px solid #E2E8F0', padding: '6px',
                  display: 'flex', flexDirection: 'column', gap: '2px',
                  transition: 'all 0.2s ease'
                }}>
                  {[
                    { name: '🍿 Snacks & Munchies', link: '/category/snacks-munchies' },
                    { name: '🥛 Dairy & Bakery', link: '/category/dairy-bakery' },
                    { name: '🥤 Cold Drinks & Juices', link: '/category/beverages' },
                    { name: '🌾 Atta, Rice & Dal', link: '/category/staples' },
                    { name: '🍫 Chocolates & Sweets', link: '/category/chocolates' },
                    { name: '🧴 Personal Care', link: '/category/personal-care' },
                    { name: '🧼 Household Essentials', link: '/category/household' },
                    { name: '🍎 Fresh Produce', link: '/category/produce' },
                    { name: '🍪 Biscuits & Cookies', link: '/category/biscuits' },
                    { name: '🛢️ Oils & Ghee', link: '/category/oil' },
                    { name: '⚡ Electronics & Gadgets', link: '/category/electronics' },
                    { name: '👟 Fashion & Accessories', link: '/category/fashion' }
                  ].map(cat => {
                    const isSelected = `/category/${slug}` === cat.link;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          navigate(cat.link);
                          setIsFilterDrawerOpen(false);
                          setIsCatDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 14px', borderRadius: '10px',
                          fontSize: '13px', fontWeight: isSelected ? 900 : 600,
                          textAlign: 'left', border: 'none',
                          background: isSelected ? '#0071E3' : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#0F172A',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F1F5F9'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check size={16} color="#FFFFFF" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sub-Categories Section */}
            {subCats.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px' }}>
                  Filter by Sub-Category
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {subCats.map(s => {
                    const isSelected = activeSubCat === s.name;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setActiveSubCat(s.name)}
                        style={{
                          background: isSelected ? '#EFF6FF' : '#F8FAFC',
                          color: isSelected ? '#0071E3' : '#0F172A',
                          border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                          borderRadius: '20px', padding: '6px 14px', fontSize: '12px',
                          fontWeight: 800, cursor: 'pointer'
                        }}
                      >
                        {s.name} ({s.count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Brands Filter */}
            {brandList.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px' }}>
                  Select Brands
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {brandList.map(b => {
                    const isChecked = activeBrands.includes(b.name);
                    return (
                      <div
                        key={b.name}
                        onClick={() => toggleBrand(b.name)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: '12px',
                          border: isChecked ? '2px solid #0071E3' : '1px solid #E2E8F0',
                          background: isChecked ? '#EFF6FF' : '#F8FAFC',
                          cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{b.name}</span>
                        <span style={{ fontSize: '11px', color: isChecked ? '#0071E3' : '#94A3B8', fontWeight: 800 }}>
                          ({b.count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Maximum Price</h4>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#0071E3' }}>₹{priceRange}</span>
              </div>
              <input
                type="range"
                min="10"
                max="5000"
                value={priceRange}
                onChange={e => setPriceRange(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0071E3', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>
                <span>₹10</span>
                <span>₹5,000</span>
              </div>
            </div>

            {/* Footer Apply Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              style={{
                width: '100%', background: '#0071E3', border: 'none',
                borderRadius: '14px', padding: '14px', fontSize: '14px',
                fontWeight: 900, color: '#FFFFFF', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,113,227,0.3)'
              }}
            >
              Apply Filters ({filtered.length} Items)
            </button>
          </div>
        </div>,
        document.body
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
        {/* ── PRODUCT GRID ── */}
        <div style={{ flex: 1, width: '100%' }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Showing <strong>{filtered.length}</strong> items in <strong>{catInfo.title}</strong>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Sort:</span>
                <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', background: 'white', cursor: 'pointer', minHeight: '36px' }}>
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>No products found</h3>
              <p style={{ fontSize: '13px', color: '#64748B' }}>Try clearing brand or price filters to view items in {catInfo.title}.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: prodGridCols, gap: isMobile ? '10px' : '16px' }}>
              {filtered.map((p, pIdx) => (
                <ProductCard key={`${p.id}-${pIdx}`} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
