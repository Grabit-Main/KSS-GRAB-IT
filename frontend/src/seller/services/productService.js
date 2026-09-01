import { get, post, patch, del, uploadImage } from '../../api';
import { products as defaultProducts, baseProducts } from '../../data/products';
import { categories as defaultCategories } from '../../data/categories';
import { resolveMediaUrl, DEFAULT_PRODUCT_FALLBACK } from '../utils/mediaResolver';

const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str || ''));

// Helper to resolve readable category name from category slug or id
const getCategoryName = (catKeyOrId) => {
  const cat = defaultCategories.find(
    (c) => String(c.id) === String(catKeyOrId) || c.slug === catKeyOrId
  );
  if (cat) return cat.name;

  const keyMap = {
    snacks: 'Snacks & Munchies',
    'snacks-munchies': 'Snacks & Munchies',
    dairy: 'Dairy & Bakery',
    'dairy-bakery': 'Dairy & Bakery',
    beverages: 'Cold Drinks & Juices',
    'cold-drinks-juices': 'Cold Drinks & Juices',
    staples: 'Atta, Rice & Dal',
    'atta-rice-dal': 'Atta, Rice & Dal',
    chocolates: 'Chocolates & Sweets',
    'chocolates-sweets': 'Chocolates & Sweets',
    'personal-care': 'Personal Care',
    household: 'Household Essentials',
    'household-essentials': 'Household Essentials',
    produce: 'Fresh Fruits & Veggies',
    'fresh-fruits-veggies': 'Fresh Fruits & Veggies',
    biscuits: 'Biscuits & Cookies',
    'biscuits-cookies': 'Biscuits & Cookies',
    'tea-coffee-drinks': 'Tea, Coffee & Drinks',
    'instant-frozen-food': 'Instant & Frozen Food',
    oil: 'Edible Oils & Ghee',
    'edible-oils-ghee': 'Edible Oils & Ghee',
    electronics: 'Electronics & Gadgets',
    'electronics-gadgets': 'Electronics & Gadgets',
    fashion: 'Fashion & Accessories',
    'fashion-accessories': 'Fashion & Accessories',
  };

  return keyMap[catKeyOrId] || 'Grocery Essentials';
};

function getDeletedProductIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem('grabit_seller_deleted_product_ids') || '[]').map(String));
  } catch {
    return new Set();
  }
}

function getProductOverrides() {
  try {
    return JSON.parse(localStorage.getItem('grabit_seller_product_overrides') || '{}');
  } catch {
    return {};
  }
}

function emitProductEvent() {
  try {
    window.dispatchEvent(new CustomEvent('grabit_products_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

export const productService = {
  async getProducts(params = {}) {
    try {
      const deletedIds = getDeletedProductIds();
      const overrides = getProductOverrides();

      // 1. Base customer portal products catalog
      const rawProds = (defaultProducts && defaultProducts.length > 0) ? defaultProducts : (baseProducts || []);
      const safeProds = Array.isArray(rawProds) ? rawProds : [];
      const safeCats = (typeof defaultCategories !== 'undefined' && Array.isArray(defaultCategories)) ? defaultCategories : [];

      let results = safeProds
        .filter((p) => !deletedIds.has(String(p.id)))
        .map((p) => {
          const catName = getCategoryName(p.category);
          const catObj = safeCats.find((c) => c.slug === p.category || String(c.id) === String(p.category));
          const ov = overrides[String(p.id)] || {};

          return {
            id: String(p.id),
            name: ov.name || p.name,
            category: ov.category || (catObj ? String(catObj.id) : p.category),
            category_slug: p.category,
            category_name: ov.category_name || catName,
            brand: ov.brand || p.brand || 'Grabit',
            price: ov.price !== undefined ? String(ov.price) : String(p.price),
            mrp: ov.mrp !== undefined ? String(ov.mrp) : String(p.mrp || p.price),
            discount_price: p.mrp > p.price ? String(p.price) : null,
            discount: p.discount || (p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0),
            delivery_time: '10 mins',
            rating: p.rating || 4.8,
            reviews: p.reviews || 240,
            stock_quantity: ov.stock_quantity !== undefined ? ov.stock_quantity : (p.stock_quantity !== undefined ? p.stock_quantity : (p.inStock ? 50 : 0)),
            unit: ov.unit || p.weight || '1 unit',
            description: ov.description || `${p.name} by ${p.brand || 'Grabit'} - 100% genuine and farm-fresh.`,
            image: resolveMediaUrl(ov.image || p.image, DEFAULT_PRODUCT_FALLBACK),
            is_active: ov.is_active !== undefined ? ov.is_active : (p.inStock ?? true),
            created_at: p.created_at || new Date().toISOString(),
          };
        });

      // 2. Fetch and merge live database products from Supabase backend
      try {
        const dbProducts = await get('/products/').catch(() => []);
        if (Array.isArray(dbProducts) && dbProducts.length > 0) {
          const mappedDb = dbProducts
            .filter((p) => !deletedIds.has(String(p.id)))
            .map((p) => ({
              id: String(p.id),
              name: p.name,
              category: p.category_id || '1',
              category_name: p.categories?.name || getCategoryName(p.category_id),
              brand: p.brand || 'Grabit',
              price: String(p.price),
              mrp: String(p.mrp || p.price),
              discount_price: p.discount_price || null,
              discount: p.discount || 0,
              delivery_time: '10 mins',
              rating: p.rating || 4.8,
              reviews: p.reviews || 24,
              stock_quantity: parseInt(p.stock, 10) || 50,
              unit: p.unit || '1 unit',
              description: p.description || `${p.name} - Available at GrabIt.`,
              image: resolveMediaUrl(p.image_url, DEFAULT_PRODUCT_FALLBACK),
              is_active: p.is_active ?? true,
              created_at: p.created_at || new Date().toISOString(),
            }));
          results = [...mappedDb, ...results];
        }
      } catch (err) {
        console.warn('Live database product fetch fallback:', err);
      }

      // 3. Merge locally created/modified custom products
      try {
        const localCreated = JSON.parse(localStorage.getItem('grabit_seller_custom_products') || '[]');
        if (Array.isArray(localCreated) && localCreated.length > 0) {
          const filteredCustom = localCreated.filter((p) => !deletedIds.has(String(p.id)));
          results = [...filteredCustom, ...results];
        }
      } catch {}

      // Deduplicate products by unique ID
      const seenIds = new Set();
      results = results.filter((p) => {
        const idStr = String(p.id);
        if (seenIds.has(idStr)) return false;
        seenIds.add(idStr);
        return true;
      });

      // Filter by search query
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category_name && p.category_name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }

      // Filter by category
      if (params.category && params.category !== 'all') {
        results = results.filter((p) => {
          if (String(p.category) === String(params.category)) return true;
          if (p.category_slug === params.category) return true;
          const matchingCat = defaultCategories.find((c) => String(c.id) === String(params.category));
          if (matchingCat && (matchingCat.slug === p.category_slug || matchingCat.name === p.category_name)) return true;
          return false;
        });
      }

      return {
        count: results.length,
        results,
      };
    } catch (err) {
      console.error('Failed to fetch products:', err);
      return { count: defaultProducts.length, results: defaultProducts };
    }
  },

  async createProduct(data) {
    let imageUrl = data.image;

    // Direct Cloudinary upload if file provided
    if (data.imageFile instanceof File || data.imageFile instanceof Blob) {
      try {
        imageUrl = await uploadImage(data.imageFile, 'grabit_media/seller');
      } catch (e) {
        console.warn('Cloudinary upload fallback:', e);
      }
    }

    const payload = {
      name: data.name?.trim(),
      category_id: isUUID(data.category) ? data.category : null,
      price: parseFloat(data.price) || 0,
      stock: parseInt(data.stock_quantity, 10) || 50,
      image_url: imageUrl || DEFAULT_PRODUCT_FALLBACK,
    };

    let created = null;
    try {
      created = await post('/products/', payload);
    } catch (e) {
      console.warn('Backend product creation fallback:', e);
    }

    const newProd = {
      id: String(created?.id || `p-${Date.now()}`),
      name: payload.name,
      category: data.category || '1',
      category_name: data.category_name || getCategoryName(data.category),
      brand: data.brand || 'Grabit Seller',
      price: String(payload.price),
      discount_price: data.discount_price || null,
      stock_quantity: payload.stock,
      delivery_time: data.delivery_time || '10 mins',
      rating: 5.0,
      reviews: 1,
      unit: data.unit || '1 unit',
      description: data.description || '',
      image: resolveMediaUrl(payload.image_url, DEFAULT_PRODUCT_FALLBACK),
      is_active: true,
      created_at: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('grabit_seller_custom_products') || '[]');
      const existingIdx = stored.findIndex((p) => String(p.id) === String(newProd.id));
      if (existingIdx >= 0) {
        stored[existingIdx] = newProd;
      } else {
        stored.unshift(newProd);
      }
      localStorage.setItem('grabit_seller_custom_products', JSON.stringify(stored));
    } catch {}

    emitProductEvent();
    return newProd;
  },

  async updateProduct(id, data) {
    let imageUrl = data.image;
    if (data.imageFile instanceof File || data.imageFile instanceof Blob) {
      try {
        imageUrl = await uploadImage(data.imageFile, 'grabit_media/seller');
      } catch (e) {
        console.warn('Cloudinary upload fallback:', e);
      }
    }

    const payload = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.price !== undefined) payload.price = parseFloat(data.price);
    if (data.stock_quantity !== undefined) payload.stock = parseInt(data.stock_quantity, 10);
    if (data.category !== undefined && isUUID(data.category)) payload.category_id = data.category;
    if (imageUrl) payload.image_url = imageUrl;

    let updated = null;
    if (isUUID(id)) {
      try {
        updated = await patch(`/products/${id}`, payload);
      } catch (e) {
        console.warn('Backend product update fallback:', e);
      }
    }

    // 1. Update in custom products list
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_seller_custom_products') || '[]');
      const up = stored.map((p) =>
        String(p.id) === String(id)
          ? {
              ...p,
              ...data,
              ...(payload.stock !== undefined ? { stock_quantity: payload.stock } : {}),
              image: resolveMediaUrl(payload.image_url || data.image || p.image, DEFAULT_PRODUCT_FALLBACK),
            }
          : p
      );
      localStorage.setItem('grabit_seller_custom_products', JSON.stringify(up));
    } catch {}

    // 2. Also persist in overrides map (for modifying base catalog items)
    try {
      const overrides = getProductOverrides();
      overrides[String(id)] = {
        ...(overrides[String(id)] || {}),
        ...data,
        ...(payload.stock !== undefined ? { stock_quantity: payload.stock } : {}),
      };
      localStorage.setItem('grabit_seller_product_overrides', JSON.stringify(overrides));
    } catch {}

    emitProductEvent();
    return {
      ...data,
      id: String(updated?.id || id),
      image: resolveMediaUrl(updated?.image_url || imageUrl, DEFAULT_PRODUCT_FALLBACK),
    };
  },

  async deleteProduct(id) {
    if (isUUID(id)) {
      try {
        await del(`/products/${id}`);
      } catch (e) {
        console.warn('Backend product delete fallback:', e);
      }
    }

    // 1. Remove from custom products
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_seller_custom_products') || '[]');
      const up = stored.filter((p) => String(p.id) !== String(id));
      localStorage.setItem('grabit_seller_custom_products', JSON.stringify(up));
    } catch {}

    // 2. Add to deleted tracking set
    try {
      const deletedArr = JSON.parse(localStorage.getItem('grabit_seller_deleted_product_ids') || '[]');
      if (!deletedArr.includes(String(id))) {
        deletedArr.push(String(id));
        localStorage.setItem('grabit_seller_deleted_product_ids', JSON.stringify(deletedArr));
      }
    } catch {}

    emitProductEvent();
    return true;
  },
};

export default productService;

