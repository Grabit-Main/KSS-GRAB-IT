import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Zap, Star, TrendingUp, ArrowLeft, Sliders, X, ChevronDown, Check } from 'lucide-react';
// Clean Production Verified Build
import ProductCard from '../components/common/ProductCard';
import ProductSvg from '../components/common/ProductSvg';
import ProductSuggestionModal from '../../components/common/ProductSuggestionModal';
import { products, syncProductsFromBackend } from '../data/products';
import { subCategories, brands, getCanonicalSlug, inferProductCategory } from '../data/categories';
import useWindowWidth from '../hooks/useWindowWidth';
import { forceScrollToTop } from '../../utils/scrollToTop';
import { get } from '../../api';
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
  'baby-care': {
    title: 'Baby Care',
    sub: 'Pampers diapers, gentle wipes, baby shampoo & infant cereals.',
    catKey: 'baby-care',
    isDark: false,
    heroImg: '/category-baby-care.jpg',
    gradient: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 40%, #BAE6FD 80%, #7DD3FC 100%)',
    accentColor: '#0284C7',
    bannerIcons: ['category-baby-care.jpg'],
  },
  'pet-care': {
    title: 'Pet Care & Food',
    sub: 'Pedigree dog food, Whiskas cat food, grooming shampoos & treats.',
    catKey: 'pet-care',
    isDark: false,
    heroImg: '/category-pet-care.jpg',
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 40%, #FED7AA 80%, #FDBA74 100%)',
    accentColor: '#EA580C',
    bannerIcons: ['category-pet-care.jpg'],
  },
  'beauty-cosmetics': {
    title: 'Beauty & Cosmetics',
    sub: 'Niacinamide face serums, kajal, sunscreens & moisturizing creams.',
    catKey: 'beauty-cosmetics',
    isDark: false,
    heroImg: '/category-beauty-cosmetics.jpg',
    gradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 40%, #FECDD3 80%, #FDA4AF 100%)',
    accentColor: '#E11D48',
    bannerIcons: ['category-beauty-cosmetics.jpg'],
  },
  'health-wellness': {
    title: 'Health & Wellness',
    sub: 'Dabur chyawanprash, daily multivitamins, pain relief sprays & first aid.',
    catKey: 'health-wellness',
    isDark: false,
    heroImg: '/category-health-wellness.jpg',
    gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #BBF7D0 80%, #86EFAC 100%)',
    accentColor: '#16A34A',
    bannerIcons: ['category-health-wellness.jpg'],
  },
  'meat-seafood': {
    title: 'Meat, Fish & Eggs',
    sub: 'Farm fresh chicken, pink salmon steaks & country brown eggs.',
    catKey: 'meat-seafood',
    isDark: false,
    heroImg: '/category-meat-seafood.jpg',
    gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 40%, #FECACA 80%, #FCA5A5 100%)',
    accentColor: '#DC2626',
    bannerIcons: ['category-meat-seafood.jpg'],
  },
  'home-kitchen': {
    title: 'Home & Kitchen',
    sub: 'Pressure cookers, stainless steel flasks, non-stick pans & glass lunch containers.',
    catKey: 'home-kitchen',
    isDark: false,
    heroImg: '/category-home-kitchen.jpg',
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 40%, #FED7AA 80%, #FDBA74 100%)',
    accentColor: '#EA580C',
    bannerIcons: ['category-home-kitchen.jpg'],
  },
  'stationery-office': {
    title: 'Stationery & Office',
    sub: 'Classmate spiral notebooks, Parker pens, artistic marker sets & scientific calculators.',
    catKey: 'stationery-office',
    isDark: false,
    heroImg: '/category-stationery-office.jpg',
    gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #BFDBFE 80%, #93C5FD 100%)',
    accentColor: '#2563EB',
    bannerIcons: ['category-stationery-office.jpg'],
  },
  'sports-fitness': {
    title: 'Sports & Fitness',
    sub: 'Yonex carbon rackets, MuscleBlaze 100% whey, gym shaker bottles & yoga mats.',
    catKey: 'sports-fitness',
    isDark: false,
    heroImg: '/category-sports-fitness.jpg',
    gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 40%, #BBF7D0 80%, #86EFAC 100%)',
    accentColor: '#16A34A',
    bannerIcons: ['category-sports-fitness.jpg'],
  },
  'toys-games': {
    title: 'Toys & Games',
    sub: 'LEGO creative bricks, classic Monopoly, Hot Wheels cars & speed Rubik cubes.',
    catKey: 'toys-games',
    isDark: false,
    heroImg: '/category-toys-games.jpg',
    gradient: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 40%, #E9D5FF 80%, #D8B4FE 100%)',
    accentColor: '#9333EA',
    bannerIcons: ['category-toys-games.jpg'],
  },
  'pooja-needs': {
    title: 'Pooja & Spiritual Needs',
    sub: 'Cycle pure agarbatti, traditional brass diyas, pure camphor crystals & ghee wicks.',
    catKey: 'pooja-needs',
    isDark: false,
    heroImg: '/category-pooja-needs.jpg',
    gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 40%, #FDE68A 80%, #FCD34D 100%)',
    accentColor: '#D97706',
    bannerIcons: ['category-pooja-needs.jpg'],
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
CATEGORY_MAP['baby'] = CATEGORY_MAP['baby-care'];
CATEGORY_MAP['pet'] = CATEGORY_MAP['pet-care'];
CATEGORY_MAP['beauty'] = CATEGORY_MAP['beauty-cosmetics'];
CATEGORY_MAP['cosmetics'] = CATEGORY_MAP['beauty-cosmetics'];
CATEGORY_MAP['pharmacy'] = CATEGORY_MAP['health-wellness'];
CATEGORY_MAP['health'] = CATEGORY_MAP['health-wellness'];
CATEGORY_MAP['meat'] = CATEGORY_MAP['meat-seafood'];
CATEGORY_MAP['seafood'] = CATEGORY_MAP['meat-seafood'];
CATEGORY_MAP['chicken-meat'] = CATEGORY_MAP['meat-seafood'];

const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating: High to Low', 'Discount: High to Low'];

const matchesSubCategory = (product, subCat, categorySlug = '') => {
  if (!subCat || subCat === 'All') return true;

  // 1. Direct explicit subCategory on the product
  const directSub = product.subCategory || product.sub_category || product.subcategory || '';
  if (directSub && directSub.toLowerCase().trim() === subCat.toLowerCase().trim()) {
    return true;
  }

  const name = String(product.name || '').toLowerCase();
  const sub = subCat.toLowerCase().trim();
  const cat = String(categorySlug || '').toLowerCase().trim();

  // 2. Category-Specific Matching Rules

  // (a) Beverages / Cold Drinks & Juices
  if (cat.includes('beverage') || cat.includes('drink')) {
    if (sub.includes('soft') || sub.includes('soda')) {
      return name.includes('cola') || name.includes('coke') || name.includes('thums up') || name.includes('sprite') || name.includes('fanta') || name.includes('pepsi') || name.includes('limca') || name.includes('soda') || name.includes('kinley');
    }
    if (sub.includes('energy')) {
      return name.includes('red bull') || name.includes('monster') || name.includes('energy');
    }
    if (sub.includes('juice') || sub.includes('fruit')) {
      return name.includes('juice') || name.includes('real') || name.includes('tropicana') || name.includes('maaza') || name.includes('frooti') || name.includes('aamras') || name.includes('appy') || name.includes('paper boat') || name.includes('slice');
    }
    if (sub.includes('tea') || sub.includes('coffee')) {
      return name.includes('coffee') || name.includes('nescafe') || name.includes('tea') || name.includes('chai');
    }
  }

  // (b) Baby Care & Infant Needs
  if (cat.includes('baby')) {
    if (sub.includes('diaper') || sub.includes('wipe')) {
      return name.includes('diaper') || name.includes('wipe') || name.includes('pampers') || name.includes('huggies') || name.includes('mamy poko') || name.includes('himalaya');
    }
    if (sub.includes('bath') || sub.includes('skin') || sub.includes('lotion') || sub.includes('shampoo')) {
      return name.includes('shampoo') || name.includes('lotion') || name.includes('powder') || name.includes('oil') || name.includes('soap') || name.includes('wash') || name.includes('cream');
    }
    if (sub.includes('food') || sub.includes('cereal')) {
      return name.includes('cerelac') || name.includes('cereal') || name.includes('nestle') || name.includes('feed') || name.includes('baby food');
    }
  }

  // (c) Pet Care & Supplies
  if (cat.includes('pet')) {
    if (sub.includes('dog') || sub.includes('treat')) {
      return name.includes('dog') || name.includes('pedigree') || name.includes('dentastix') || name.includes('bone') || name.includes('drools');
    }
    if (sub.includes('cat')) {
      return name.includes('cat') || name.includes('whiskas') || name.includes('kitten');
    }
    if (sub.includes('grooming') || sub.includes('shampoo')) {
      return name.includes('shampoo') || name.includes('grooming') || name.includes('zack') || name.includes('tea tree');
    }
  }

  // (d) Beauty & Cosmetics
  if (cat.includes('beauty') || cat.includes('cosmetics')) {
    if (sub.includes('serum') || sub.includes('cream')) {
      return name.includes('serum') || name.includes('cream') || name.includes('niacinamide') || name.includes('moisturizing');
    }
    if (sub.includes('sunscreen') || sub.includes('cleanser') || sub.includes('water')) {
      return name.includes('sunscreen') || name.includes('micellar') || name.includes('cleansing') || name.includes('spf');
    }
    if (sub.includes('makeup') || sub.includes('kajal')) {
      return name.includes('kajal') || name.includes('lipstick') || name.includes('eyeliner') || name.includes('maybelline') || name.includes('colossal');
    }
  }

  // (e) Health & Wellness / Pharmacy
  if (cat.includes('health') || cat.includes('wellness') || cat.includes('pharmacy')) {
    if (sub.includes('immunity') || sub.includes('ayurveda')) {
      return name.includes('chyawanprash') || name.includes('dabur') || name.includes('ayurvedic') || name.includes('herbal');
    }
    if (sub.includes('vitamin') || sub.includes('supplement')) {
      return name.includes('revital') || name.includes('vitamin') || name.includes('charge') || name.includes('capsule') || name.includes('tablet') || name.includes('fast&up') || name.includes('multivitamin');
    }
    if (sub.includes('pain') || sub.includes('device')) {
      return name.includes('volini') || name.includes('spray') || name.includes('thermometer') || name.includes('morepen') || name.includes('relief');
    }
  }

  // (f) Meat, Seafood & Eggs
  if (cat.includes('meat') || cat.includes('seafood') || cat.includes('chicken')) {
    if (sub.includes('chicken')) {
      return name.includes('chicken') || name.includes('breast') || name.includes('curry cut');
    }
    if (sub.includes('egg')) {
      return name.includes('egg') || name.includes('brown eggs') || name.includes('country');
    }
    if (sub.includes('fish') || sub.includes('seafood') || sub.includes('prawn')) {
      return name.includes('salmon') || name.includes('prawn') || name.includes('fish') || name.includes('steak');
    }
  }

  // (g) Home & Kitchen
  if (cat.includes('home') || cat.includes('kitchen')) {
    if (sub.includes('cookware') || sub.includes('pan')) {
      return name.includes('cooker') || name.includes('pan') || name.includes('prestige') || name.includes('hawkins');
    }
    if (sub.includes('bottle') || sub.includes('flask')) {
      return name.includes('bottle') || name.includes('flask') || name.includes('milton');
    }
    if (sub.includes('storage') || sub.includes('container')) {
      return name.includes('borosil') || name.includes('lunch') || name.includes('container') || name.includes('box');
    }
    if (sub.includes('tool') || sub.includes('knife')) {
      return name.includes('knife') || name.includes('pigeon') || name.includes('shears') || name.includes('cutter');
    }
  }

  // (h) Stationery & Office
  if (cat.includes('stationery') || cat.includes('office')) {
    if (sub.includes('notebook') || sub.includes('pad')) {
      return name.includes('notebook') || name.includes('spiral') || name.includes('classmate') || name.includes('pad');
    }
    if (sub.includes('pen') || sub.includes('marker')) {
      return name.includes('pen') || name.includes('parker') || name.includes('faber-castell') || name.includes('marker');
    }
    if (sub.includes('desk') || sub.includes('tape')) {
      return name.includes('scotch') || name.includes('tape') || name.includes('scissors');
    }
    if (sub.includes('calculator')) {
      return name.includes('casio') || name.includes('calculator');
    }
  }

  // (i) Sports & Fitness
  if (cat.includes('sports') || cat.includes('fitness')) {
    if (sub.includes('racket') || sub.includes('ball')) {
      return name.includes('yonex') || name.includes('badminton') || name.includes('football') || name.includes('nivia') || name.includes('racket');
    }
    if (sub.includes('supplement') || sub.includes('protein')) {
      return name.includes('whey') || name.includes('muscleblaze') || name.includes('protein');
    }
    if (sub.includes('shaker') || sub.includes('bottle')) {
      return name.includes('shaker') || name.includes('boldfit') || name.includes('mixer');
    }
    if (sub.includes('yoga') || sub.includes('mat')) {
      return name.includes('yoga') || name.includes('mat') || name.includes('strava');
    }
  }

  // (j) Toys & Games
  if (cat.includes('toy') || cat.includes('game')) {
    if (sub.includes('block') || sub.includes('lego')) {
      return name.includes('lego') || name.includes('brick') || name.includes('building');
    }
    if (sub.includes('board') || sub.includes('puzzle')) {
      return name.includes('monopoly') || name.includes('rubik') || name.includes('cube') || name.includes('puzzle');
    }
    if (sub.includes('car') || sub.includes('track')) {
      return name.includes('hot wheels') || name.includes('car') || name.includes('diecast');
    }
    if (sub.includes('doll') || sub.includes('figurine')) {
      return name.includes('barbie') || name.includes('doll');
    }
  }

  // (k) Pooja & Spiritual Needs
  if (cat.includes('pooja') || cat.includes('spiritual')) {
    if (sub.includes('agarbatti') || sub.includes('incense')) {
      return name.includes('agarbatti') || name.includes('incense') || name.includes('cycle');
    }
    if (sub.includes('diya') || sub.includes('lamp')) {
      return name.includes('diya') || name.includes('lamp') || name.includes('brass');
    }
    if (sub.includes('camphor') || sub.includes('wick')) {
      return name.includes('camphor') || name.includes('kapoor') || name.includes('wick') || name.includes('batti') || name.includes('bhimseni') || name.includes('mangaldeep');
    }
    if (sub.includes('haldi') || sub.includes('kumkum') || sub.includes('roli')) {
      return name.includes('haldi') || name.includes('kumkum') || name.includes('roli') || name.includes('patanjali') || name.includes('shubhkart');
    }
  }

  // (l) Fresh Fruits & Veggies / Produce
  if (cat.includes('produce') || cat.includes('fruit') || cat.includes('veggie')) {
    if (sub.includes('fruit')) {
      return name.includes('apple') || name.includes('banana') || name.includes('mango') || name.includes('grapes') || name.includes('berry') || name.includes('orange') || name.includes('avocado') || name.includes('pomegranate') || name.includes('papaya');
    }
    if (sub.includes('veggie') || sub.includes('vegetable')) {
      return name.includes('tomato') || name.includes('potato') || name.includes('onion') || name.includes('broccoli') || name.includes('carrot') || name.includes('cucumber') || name.includes('capsicum') || name.includes('spinach');
    }
    if (sub.includes('herb') || sub.includes('extra')) {
      return name.includes('garlic') || name.includes('ginger') || name.includes('coriander') || name.includes('mint') || name.includes('lemon') || name.includes('chilli');
    }
  }

  // (m) Dairy & Bakery
  if (cat.includes('dairy') || cat.includes('bakery')) {
    if (sub.includes('milk') || sub.includes('butter')) {
      return name.includes('milk') || (name.includes('butter') && !name.includes('buttermilk')) || name.includes('taaza') || name.includes('amul gold');
    }
    if (sub.includes('cheese') || sub.includes('paneer')) {
      return name.includes('paneer') || name.includes('cheese') || name.includes('mozzarella') || name.includes('slice');
    }
    if (sub.includes('bread') || sub.includes('bakery')) {
      return name.includes('bread') || name.includes('loaf') || name.includes('wheat bread') || name.includes('multigrain') || name.includes('sourdough');
    }
    if (sub.includes('curd') || sub.includes('dahi') || sub.includes('yogurt')) {
      return name.includes('curd') || name.includes('dahi') || name.includes('yogurt') || name.includes('masti') || name.includes('epigamia') || name.includes('buttermilk') || name.includes('lassi');
    }
  }

  // (n) Snacks & Munchies
  if (cat.includes('snack') || cat.includes('munch')) {
    if (sub.includes('potato') || sub.includes('chip')) {
      return name.includes('chip') || name.includes('lays') || name.includes('pringles') || name.includes('wafer') || name.includes('angles') || name.includes('sizzlin');
    }
    if (sub.includes('tortilla') || sub.includes('corn') || sub.includes('nacho')) {
      return name.includes('dorito') || name.includes('nacho') || name.includes('cornito') || name.includes('tortilla');
    }
    if (sub.includes('namkeen') || sub.includes('crunch') || sub.includes('mix')) {
      return name.includes('bhujia') || name.includes('mixture') || name.includes('kurkure') || name.includes('sev') || name.includes('boondi') || name.includes('popcorn') || name.includes('snack') || name.includes('moong dal');
    }
  }

  // (o) Atta, Rice & Dal / Staples
  if (cat.includes('staple') || cat.includes('atta') || cat.includes('rice') || cat.includes('dal')) {
    if (sub.includes('atta') || sub.includes('flour')) {
      return name.includes('atta') || name.includes('flour') || name.includes('maida') || name.includes('sooji') || name.includes('besan') || name.includes('aashirvaad');
    }
    if (sub.includes('rice') || sub.includes('grain')) {
      return name.includes('rice') || name.includes('basmati') || name.includes('daawat') || name.includes('india gate') || name.includes('kolam');
    }
    if (sub.includes('dal') || sub.includes('pulse')) {
      return name.includes('dal') || name.includes('pulse') || name.includes('toor') || name.includes('moong') || name.includes('chana');
    }
    if (sub.includes('salt') || sub.includes('spice') || sub.includes('noodle')) {
      return name.includes('salt') || name.includes('tata salt') || name.includes('masala') || name.includes('chilli') || name.includes('noodle') || name.includes('maggi');
    }
  }

  // (p) Chocolates & Sweets
  if (cat.includes('chocolate') || cat.includes('sweet')) {
    if (sub.includes('premium') || (sub.includes('chocolate') && !sub.includes('wafer') && !sub.includes('bar'))) {
      return name.includes('dairy milk') || name.includes('silk') || name.includes('dark') || name.includes('bournville') || name.includes('ferrero') || name.includes('chocolate') || name.includes('cadbury');
    }
    if (sub.includes('wafer') || sub.includes('bar')) {
      return name.includes('kitkat') || name.includes('munch') || name.includes('perk') || name.includes('snickers') || name.includes('5 star');
    }
    if (sub.includes('sweet') || sub.includes('mithai')) {
      return name.includes('sweet') || name.includes('mithai') || name.includes('halwa') || name.includes('gulab') || name.includes('rasgulla') || name.includes('soan');
    }
    if (sub.includes('spread') || sub.includes('gift') || sub.includes('syrup')) {
      return name.includes('nutella') || name.includes('hershey') || name.includes('spread') || name.includes('celebration') || name.includes('gift');
    }
  }

  // (q) Biscuits & Cookies
  if (cat.includes('biscuit') || cat.includes('cookie')) {
    if (sub.includes('cream')) {
      return name.includes('cream') || name.includes('oreo') || name.includes('bourbon') || name.includes('choco fills') || name.includes('dark fantasy') || name.includes('treat');
    }
    if (sub.includes('butter') || sub.includes('cookie') || sub.includes('nut')) {
      return name.includes('butter') || name.includes('cookie') || name.includes('good day') || name.includes('hide & seek') || name.includes('cashew') || name.includes('unibic') || name.includes('nutri');
    }
    if (sub.includes('digestive') || sub.includes('glucose')) {
      return name.includes('glucose') || name.includes('parle-g') || name.includes('marie') || name.includes('digestive') || name.includes('sunfeast') || name.includes('gold');
    }
  }

  // (r) Edible Oils & Ghee
  if (cat.includes('oil') || cat.includes('ghee')) {
    if (sub.includes('sunflower') || sub.includes('mustard')) {
      return name.includes('sunflower') || name.includes('sunlite') || name.includes('saffola') || name.includes('mustard') || name.includes('kachi ghani') || name.includes('dhara');
    }
    if (sub.includes('ghee')) {
      return name.includes('ghee') || name.includes('cow ghee') || name.includes('amul pure');
    }
    if (sub.includes('olive') || sub.includes('heart') || sub.includes('specialty')) {
      return name.includes('olive') || name.includes('rice bran') || name.includes('groundnut') || name.includes('sesame') || name.includes('coconut');
    }
  }

  // (s) Personal Care
  if (cat.includes('personal') || cat.includes('care')) {
    if (sub.includes('handwash') || sub.includes('soap') || sub.includes('hygiene')) {
      return name.includes('handwash') || name.includes('soap') || name.includes('dettol') || name.includes('dove') || name.includes('pears') || name.includes('fiama');
    }
    if (sub.includes('hair')) {
      return name.includes('shampoo') || name.includes('hair') || name.includes('head & shoulders') || name.includes('pantene') || name.includes('clinic') || name.includes('conditioner');
    }
    if (sub.includes('oral') || sub.includes('skin') || sub.includes('body')) {
      return name.includes('lotion') || name.includes('cream') || name.includes('nivea') || name.includes('vaseline') || name.includes('ponds') || name.includes('toothpaste') || name.includes('colgate') || name.includes('sensodyne');
    }
    if (sub.includes('grooming') || sub.includes('perfume')) {
      return name.includes('deodorant') || name.includes('perfume') || name.includes('spray') || name.includes('razor') || name.includes('gillette') || name.includes('fogg') || name.includes('axe') || name.includes('park avenue');
    }
  }

  // (t) Household Essentials
  if (cat.includes('household')) {
    if (sub.includes('detergent') || sub.includes('wash')) {
      return name.includes('surf') || name.includes('ariel') || name.includes('tide') || name.includes('detergent') || name.includes('mat') || name.includes('rin');
    }
    if (sub.includes('dishwash') || sub.includes('cleaner')) {
      return name.includes('vim') || name.includes('gel') || name.includes('harpic') || name.includes('lysol') || name.includes('collin') || name.includes('dettol');
    }
    if (sub.includes('air') || sub.includes('freshener')) {
      return name.includes('godrej') || name.includes('aer') || name.includes('odonil') || name.includes('spray') || name.includes('freshener');
    }
    if (sub.includes('disinfectant') || sub.includes('pest') || sub.includes('mop')) {
      return name.includes('hit') || name.includes('all out') || name.includes('goodknight') || name.includes('mop') || name.includes('wiper') || name.includes('scrub') || name.includes('scotch-brite') || name.includes('disinfectant');
    }
  }

  // (u) Tea, Coffee & Drinks
  if (cat.includes('tea') || cat.includes('coffee')) {
    if (sub.includes('coffee')) return name.includes('coffee') || name.includes('nescafe') || name.includes('sunrise') || name.includes('bru') || name.includes('grand');
    if (sub.includes('tea') || sub.includes('chai')) return name.includes('tea') || name.includes('red label') || name.includes('tata tea') || name.includes('taj mahal') || name.includes('chai');
  }

  // (v) Instant & Frozen Food
  if (cat.includes('instant') || cat.includes('frozen')) {
    if (sub.includes('noodle')) return name.includes('maggi') || name.includes('noodle') || name.includes('yippee') || name.includes('ramen');
    if (sub.includes('soup') || sub.includes('chinese') || sub.includes('pasta')) return name.includes('soup') || name.includes('pasta') || name.includes('knorr') || name.includes('sauce');
    if (sub.includes('curry') || sub.includes('ready')) return name.includes('curry') || name.includes('ready') || name.includes('meal') || name.includes('paneer');
  }

  // (w) Electronics & Gadgets
  if (cat.includes('electronic')) {
    if (sub.includes('watch') || sub.includes('smartwatch')) return name.includes('watch') || name.includes('smartwatch') || name.includes('wave call') || name.includes('pulse') || name.includes('ninja');
    if (sub.includes('speaker')) return name.includes('speaker') || name.includes('soundbar') || name.includes('go 3') || name.includes('flip') || name.includes('warrior') || name.includes('jbl') || name.includes('sony');
    if (sub.includes('headphone') || sub.includes('tws') || sub.includes('earbud')) return name.includes('headphone') || name.includes('earbud') || name.includes('earphone') || name.includes('tws') || name.includes('airdrop') || name.includes('buds') || name.includes('basshead') || name.includes('sony wh');
    if (sub.includes('computer') || sub.includes('power') || sub.includes('accessories')) return name.includes('mouse') || name.includes('keyboard') || name.includes('power bank') || name.includes('usb') || name.includes('card') || name.includes('mic') || name.includes('sandisk') || name.includes('logitech') || name.includes('extender') || name.includes('bulb') || name.includes('receiver') || name.includes('rode');
  }

  // (x) Fashion & Accessories
  if (cat.includes('fashion')) {
    if (sub.includes('shoe') || sub.includes('sneaker')) return name.includes('shoe') || name.includes('sneaker') || name.includes('boot') || name.includes('running') || name.includes('bata') || name.includes('nike') || name.includes('puma') || name.includes('adidas') || name.includes('woodland') || name.includes('campus') || name.includes('sparx');
    if (sub.includes('watch') || sub.includes('sunglass') || sub.includes('glasses')) return name.includes('watch') || name.includes('sunglass') || name.includes('ray-ban') || name.includes('titan') || name.includes('fastrack') || name.includes('fossil') || name.includes('casio') || name.includes('sonata');
    if (sub.includes('bag') || sub.includes('wallet') || sub.includes('accessories')) return name.includes('bag') || name.includes('backpack') || name.includes('trolley') || name.includes('wallet') || name.includes('handbag') || name.includes('necklace') || name.includes('earring') || name.includes('belt') || name.includes('cap') || name.includes('tourister') || name.includes('skybags') || name.includes('safari') || name.includes('lavie') || name.includes('caprese') || name.includes('zaveri') || name.includes('youbella') || name.includes('tommy');
  }

  // Fallback matching with stem strip (remove trailing 'es' or 's')
  const words = sub.split(' ').map(w => w.replace(/es$/, '').replace(/s$/, '')).filter(w => w.length > 2);
  return words.some(w => name.includes(w));
};

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

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

  const canonicalSlug = getCanonicalSlug(slug);
  const cleanSlug = canonicalSlug || String(slug || '').toLowerCase().trim();
  const cleanSlugSpace = String(slug || '').toLowerCase().trim().replace(/-/g, ' ');

  const matchedCatObj = allCategories.find(c => 
    (c.slug && (c.slug === cleanSlug || getCanonicalSlug(c.slug) === canonicalSlug)) ||
    String(c.id).toLowerCase().trim() === cleanSlug ||
    (c.name && String(c.name).toLowerCase().trim() === cleanSlugSpace) ||
    (c.name && getCanonicalSlug(c.name) === canonicalSlug)
  );

  const catInfo = CATEGORY_MAP[canonicalSlug] || CATEGORY_MAP[cleanSlug] || (matchedCatObj ? {
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

  const [searchParams] = useSearchParams();
  const subcatParam = searchParams.get('subcat');

  const [activeSubCat, setActiveSubCat] = useState(() => subcatParam || 'All');
  const [activeBrands, setActiveBrands] = useState([]);
  const [priceRange, setPriceRange] = useState(5000);
  const [sort, setSort] = useState('Relevance');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  const [allProductsState, setAllProductsState] = useState(() => [...products]);

  useEffect(() => {
    let isMounted = true;
    const updateProds = () => {
      if (isMounted) setAllProductsState([...products]);
    };
    updateProds();

    // Actively fetch products from backend API so newly added seller products appear
    const fetchApiProducts = async () => {
      try {
        if (typeof syncProductsFromBackend === 'function') {
          await syncProductsFromBackend();
        }
        const res = await get('/products/').catch(() => []);
        const apiProds = Array.isArray(res) ? res : (res?.results || []);
        if (apiProds.length > 0 && isMounted) {
          const existingIds = new Set(products.map(p => String(p.id)));
          const newApiProds = [];
          for (const ap of apiProds) {
            const idStr = String(ap.id);
            if (!existingIds.has(idStr)) {
              const resolvedCat = inferProductCategory(ap, allCategories);
              newApiProds.push({
                id: ap.id,
                name: ap.name,
                price: Number(ap.price) || 0,
                mrp: Number(ap.mrp || ap.price) || 0,
                discount: ap.mrp ? Math.round(((ap.mrp - ap.price) / ap.mrp) * 100) : 10,
                image: ap.image || ap.image_url || 'default-product.png',
                category: resolvedCat,
                category_slug: resolvedCat,
                brand: ap.brand || 'Grabit Seller',
                weight: ap.weight || ap.unit || '1 unit',
                rating: Number(ap.rating) || 4.8,
                reviews: Number(ap.reviews) || 12,
                inStock: ap.is_active !== false && ((ap.stock ?? ap.stock_quantity ?? 1) > 0),
                stock_quantity: parseInt(ap.stock_quantity ?? ap.stock ?? 50, 10),
              });
              existingIds.add(idStr);
            }
          }
          if (newApiProds.length > 0) {
            products.push(...newApiProds);
          }
          if (isMounted) {
            setAllProductsState([...products]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch category products from API:', err);
      }
    };

    fetchApiProducts();

    window.addEventListener('grabit_products_synced', updateProds);
    window.addEventListener('grabit_products_updated', updateProds);
    window.addEventListener('storage', updateProds);
    return () => {
      isMounted = false;
      window.removeEventListener('grabit_products_synced', updateProds);
      window.removeEventListener('grabit_products_updated', updateProds);
      window.removeEventListener('storage', updateProds);
    };
  }, [slug]);

  useEffect(() => {
    if (subcatParam) {
      setActiveSubCat(subcatParam);
    } else {
      setActiveSubCat('All');
    }
    setActiveBrands([]);
    forceScrollToTop();
  }, [slug, subcatParam]);

  useEffect(() => {
    forceScrollToTop();
  }, [activeSubCat]);

  const categoryProducts = allProductsState.filter(p => {
    if (!slug) return true;
    const resolvedCat = inferProductCategory(p, allCategories);
    return resolvedCat === canonicalSlug;
  });
  const rawSubCats = subCategories[canonicalSlug] || subCategories[slug] || [{ name: 'All', count: categoryProducts.length }];

  const subCats = rawSubCats.map(s => {
    if (s.name === 'All') return { ...s, count: categoryProducts.length };
    const matchedCount = categoryProducts.filter(p => matchesSubCategory(p, s.name, canonicalSlug)).length;
    return { ...s, count: matchedCount };
  }).filter(s => s.name === 'All' || s.count > 0);

  // Dynamically derive brandList with real counts from categoryProducts
  const brandList = React.useMemo(() => {
    const counts = {};
    categoryProducts.forEach(p => {
      if (p.brand && String(p.brand).trim()) {
        const b = String(p.brand).trim();
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    const dynamicList = Object.entries(counts).map(([name, count]) => ({ name, count }));
    if (dynamicList.length > 0) return dynamicList;
    return brands[canonicalSlug] || brands[slug] || [];
  }, [categoryProducts, canonicalSlug, slug]);

  const toggleBrand = (b) => {
    setActiveBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  let filtered = categoryProducts.filter(p => {
    if (activeSubCat !== 'All' && !matchesSubCategory(p, activeSubCat, canonicalSlug)) return false;
    if (activeBrands.length > 0 && !activeBrands.includes(p.brand)) return false;
    if (p.price > priceRange) return false;
    return true;
  });

  if (sort === 'Price: Low to High') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'Price: High to Low') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'Rating: High to Low') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (sort === 'Discount: High to Low') filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));

  const prodGridCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)';

  return (
    <div key={slug} className="container section category-transition-container" style={{ paddingTop: isMobile ? '20px' : '24px', paddingBottom: isMobile ? '90px' : '40px', paddingLeft: isMobile ? '12px' : '24px', paddingRight: isMobile ? '12px' : '24px', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      


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

          <p style={{ color: catInfo.isDark ? '#94A3B8' : '#475569', fontSize: isMobile ? '13px' : '15px', lineHeight: 1.5, marginBottom: '4px', fontWeight: 500 }}>
            {catInfo.sub}
          </p>
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

      {/* 🚀 TOUCHABLE SUBCATEGORIES BAR (Directly below category image banner) */}
      {subCats.length > 1 && (
        <div style={{
          marginBottom: '20px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '4px'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            width: 'max-content'
          }}>
            {subCats.map(s => {
              const isSelected = activeSubCat === s.name;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setActiveSubCat(s.name)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isSelected ? '#0071E3' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    border: isSelected ? '1.5px solid #0071E3' : '1px solid #CBD5E1',
                    borderRadius: '24px',
                    padding: isMobile ? '8px 14px' : '9px 18px',
                    fontSize: isMobile ? '12.5px' : '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 4px 12px rgba(0,113,227,0.3)' : '0 1px 4px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  <span>{s.name}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#64748B'
                  }}>
                    {s.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 🌟 CATEGORY TITLE ROW */}
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
          Available Products
        </h2>
      </div>

      {/* 🌟 CLEAN FILTER & SORT TOOLBAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: isMobile ? '8px' : '12px', marginBottom: '20px', width: '100%', maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {/* 1. Filters Drawer Trigger Pill */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: isMobile ? '6px' : '8px',
            background: (activeBrands.length > 0 || activeSubCat !== 'All') ? '#0071E3' : '#FFFFFF',
            color: (activeBrands.length > 0 || activeSubCat !== 'All') ? '#FFFFFF' : '#0F172A',
            border: (activeBrands.length > 0 || activeSubCat !== 'All') ? '1.5px solid #0071E3' : '1.5px solid #CBD5E1',
            borderRadius: '24px', padding: isMobile ? '6px 12px' : '9px 18px',
            fontSize: isMobile ? '12px' : '13px', fontWeight: 900,
            cursor: 'pointer', boxShadow: (activeBrands.length > 0 || activeSubCat !== 'All') ? '0 4px 12px rgba(0,113,227,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
            whiteSpace: 'nowrap', height: isMobile ? '36px' : '40px', flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
        >
          <Sliders size={isMobile ? 14 : 15} color={(activeBrands.length > 0 || activeSubCat !== 'All') ? '#FFFFFF' : '#0071E3'} />
          <span>{isMobile ? 'Filters' : 'Filters & Refine'}</span>
          {(activeBrands.length > 0 || activeSubCat !== 'All') && (
            <span style={{
              background: '#FFFFFF', color: '#0071E3',
              fontSize: '10.5px', fontWeight: 900, padding: '1px 6px', borderRadius: '10px'
            }}>
              {activeBrands.length + (activeSubCat !== 'All' ? 1 : 0)}
            </span>
          )}
        </button>

        {/* 2. Sort Dropdown Pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: '#FFFFFF', border: '1.5px solid #CBD5E1',
          borderRadius: '24px', padding: isMobile ? '0 10px' : '0 16px', height: isMobile ? '36px' : '40px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)', flexShrink: 0,
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: isMobile ? '11.5px' : '12.5px', color: '#64748B', fontWeight: 800 }}>Sort:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              background: 'transparent', border: 'none', fontSize: isMobile ? '11.5px' : '13px',
              fontWeight: 900, color: '#0F172A', cursor: 'pointer', outline: 'none',
              padding: 0, maxWidth: isMobile ? '100px' : 'auto'
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* 🌟 ULTRA-PREMIUM ACTIVE FILTERS BAR */}
      {(activeBrands.length > 0 || activeSubCat !== 'All' || priceRange < 5000) && (
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

          {priceRange < 5000 && (
            <span
              onClick={() => setPriceRange(5000)}
              style={{
                background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1',
                borderRadius: '20px', padding: '5px 12px', fontSize: '12px',
                fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.15s ease'
              }}
            >
              <span>Price: Under ₹{priceRange}</span>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', background: '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={10} color="#64748B" strokeWidth={2.5} />
              </div>
            </span>
          )}

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
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Try clearing brand or price filters to view items in {catInfo.title}.</p>
              <button
                onClick={() => { setActiveBrands([]); setActiveSubCat('All'); setPriceRange(5000); }}
                style={{
                  background: '#0071E3', color: '#FFFFFF', border: 'none',
                  borderRadius: '12px', padding: '10px 20px', fontSize: '13px',
                  fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,113,227,0.2)'
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: prodGridCols, gap: isMobile ? '10px' : '16px' }}>
              {filtered.map((p, pIdx) => (
                <ProductCard key={`${p.id}-${pIdx}`} product={p} />
              ))}
            </div>
          )}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            padding: isMobile ? '20px 16px' : '24px 32px',
            marginTop: '32px',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: '20px',
              flex: 1,
              minWidth: 0
            }}>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/suggest-product-3d.png"
                  alt="Suggest Product 3D"
                  style={{
                    width: isMobile ? '76px' : '88px',
                    height: isMobile ? '76px' : '88px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 18px rgba(0, 113, 227, 0.22))'
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: '#EFF6FF', color: '#0071E3', fontSize: '10px',
                  fontWeight: 900, padding: '3px 10px', borderRadius: '12px',
                  marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase'
                }}>
                  💡 REQUEST AN ITEM
                </div>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                  Missing your favorite product in {catInfo.title}?
                </h3>
                <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#64748B', margin: 0, fontWeight: 500, lineHeight: 1.45 }}>
                  Tell us what item you'd like to see in {catInfo.title} and our sourcing team will endeavor to stock it!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSuggestionModalOpen(true)}
              style={{
                background: '#0071E3', color: '#FFFFFF', border: 'none',
                borderRadius: '14px', padding: '13px 26px', fontSize: '13.5px',
                fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0, 113, 227, 0.28)',
                display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
                width: isMobile ? '100%' : 'auto', justifyContent: 'center', flexShrink: 0,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#005BB5';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 22px rgba(0, 113, 227, 0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0071E3';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 113, 227, 0.28)';
              }}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <span>Suggest Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* 💡 Product Suggestion Modal */}
      <ProductSuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        prefillCategory={catInfo.title}
      />
    </div>
  );
}
