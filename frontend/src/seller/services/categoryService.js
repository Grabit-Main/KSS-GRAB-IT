import { get, post, del, uploadImage } from '../../api';
import { categories as defaultCategories, subCategories } from '../../data/categories';
import { products as defaultProducts } from '../../data/products';
import { resolveMediaUrl, DEFAULT_CATEGORY_FALLBACK } from '../utils/mediaResolver';


function getStatusOverrides() {
  try {
    return JSON.parse(localStorage.getItem('grabit_categories_status') || '{}');
  } catch {
    return {};
  }
}

function getDeletedCategories() {
  try {
    return JSON.parse(localStorage.getItem('grabit_deleted_categories') || '[]');
  } catch {
    return [];
  }
}

function saveDeletedCategory(id, name, slug) {
  try {
    const list = getDeletedCategories();
    const idStr = String(id);
    const nameNorm = name ? name.toLowerCase().trim() : '';
    const slugNorm = slug ? slug.toLowerCase().trim() : '';
    if (!list.some(item => String(item.id) === idStr || (nameNorm && item.name === nameNorm) || (slugNorm && item.slug === slugNorm))) {
      list.push({ id: idStr, name: nameNorm, slug: slugNorm });
      localStorage.setItem('grabit_deleted_categories', JSON.stringify(list));
    }
  } catch {}
}

function saveStatusOverride(id, isActive) {

  try {
    const map = getStatusOverrides();
    map[String(id)] = isActive;
    localStorage.setItem('grabit_categories_status', JSON.stringify(map));
    emitCategoryEvent();
  } catch {}
}

function emitCategoryEvent() {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grabit_categories_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  } catch {}
}

function getStandardSlug(name, slug) {
  const n = name ? name.toLowerCase().trim() : '';
  const s = slug ? slug.toLowerCase().trim() : '';

  if (n === 'cold drinks & juices' || n === 'cold drinks' || n === 'beverages' || s === 'beverages' || n.includes('cold drinks') || n.includes('beverage')) return 'beverages';
  if (n === 'atta, rice & dal' || n === 'atta' || n === 'staples' || s === 'staples' || n.includes('atta') || n.includes('staple')) return 'staples';
  if (n === 'snacks & munchies' || n === 'snacks' || s === 'snacks-munchies' || n.includes('snack') || n.includes('munchies')) return 'snacks-munchies';
  if (n === 'dairy & bakery' || n === 'dairy' || s === 'dairy-bakery' || n.includes('dairy') || n.includes('bakery')) return 'dairy-bakery';
  if (n === 'chocolates & sweets' || n === 'chocolates' || s === 'chocolates' || n.includes('chocolate') || n.includes('sweet')) return 'chocolates';
  if (n === 'personal care' || s === 'personal-care' || n.includes('personal care')) return 'personal-care';
  if (n === 'household essentials' || n === 'household' || s === 'household' || n.includes('household')) return 'household';
  if (n === 'fresh fruits & veggies' || n === 'fruits & vegetables' || n === 'produce' || s === 'produce' || n.includes('fruit') || n.includes('veggie') || n.includes('vegetable')) return 'produce';
  if (n === 'tea, coffee & drinks' || n === 'tea & coffee' || s === 'tea-coffee' || n.includes('tea') || n.includes('coffee')) return 'tea-coffee';
  if (n === 'biscuits & cookies' || n === 'biscuits' || s === 'biscuits' || n.includes('biscuit') || n.includes('cookie')) return 'biscuits';
  if (n === 'instant & frozen food' || n === 'instant food' || s === 'instant-food' || n.includes('instant') || n.includes('frozen')) return 'instant-food';
  if (n === 'edible oils & ghee' || n === 'oil' || s === 'oil' || n.includes('oil') || n.includes('ghee')) return 'oil';
  if (n === 'electronics & gadgets' || n === 'electronics' || s === 'electronics' || n.includes('electronic') || n.includes('gadget')) return 'electronics';
  if (n === 'fashion & accessories' || n === 'fashion' || s === 'fashion' || n.includes('fashion') || n.includes('accessories') || n.includes('shoe') || n.includes('clothing')) return 'fashion';

  return s || n.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const categoryService = {
  async getCategories(params = {}) {
    try {
      // 1. Base Customer Portal Categories (14 Categories)
      const safeProducts = (typeof defaultProducts !== 'undefined' && Array.isArray(defaultProducts)) ? defaultProducts : [];
      let results = (Array.isArray(defaultCategories) ? defaultCategories : []).map((c) => {
        const resolvedSlug = getStandardSlug(c.name, c.slug);
        const subList = (typeof subCategories !== 'undefined' && subCategories && subCategories[resolvedSlug]) ? subCategories[resolvedSlug] : [];
        const prodsInCat = safeProducts.filter((p) => {
          if (p.category === resolvedSlug) return true;
          if (resolvedSlug === 'beverages' && (p.category === 'beverages' || p.category === 3 || p.category === 9)) return true;
          if (resolvedSlug === 'staples' && (p.category === 'staples' || p.category === 4 || p.category === 11)) return true;
          if (resolvedSlug === 'chocolates' && (p.category === 'chocolates' || p.category === 5)) return true;
          if (resolvedSlug === 'produce' && (p.category === 'produce' || p.category === 8)) return true;
          if (resolvedSlug === 'biscuits' && (p.category === 'biscuits' || p.category === 10)) return true;
          if (resolvedSlug === 'oil' && (p.category === 'oil' || p.category === 12)) return true;
          if (String(p.category) === String(c.id)) return true;
          return false;
        });

        return {
          id: String(c.id),
          name: c.name,
          slug: resolvedSlug,
          icon: c.icon,
          image: resolveMediaUrl(c.icon || resolvedSlug, DEFAULT_CATEGORY_FALLBACK),
          image_url: resolveMediaUrl(c.icon || resolvedSlug, DEFAULT_CATEGORY_FALLBACK),
          is_active: true,
          subcategory_count: subList.length > 0 ? subList.length : 4,
          product_count: prodsInCat.length > 0 ? prodsInCat.length : 23,
          description: `${c.name} quick-commerce essentials delivered in 10-15 mins`,
        };
      });

      // 2. Fetch and merge live database categories from Supabase
      try {
        const dbCats = await get('/categories/').catch(() => []);
        if (Array.isArray(dbCats) && dbCats.length > 0) {
          const mappedDb = dbCats.map((c) => {
            const resolvedSlug = getStandardSlug(c.name, c.slug);
            const resolvedImg = resolveMediaUrl(c.image_url || c.name || resolvedSlug, DEFAULT_CATEGORY_FALLBACK);
            return {
              id: String(c.id),
              name: c.name,
              slug: resolvedSlug,
              icon: resolvedImg,
              image: resolvedImg,
              image_url: resolvedImg,
              is_active: true,
              subcategory_count: 4,
              product_count: 20,
              description: `${c.name} quick-commerce essentials`,
            };
          });
          results = [...mappedDb, ...results];
        }
      } catch (err) {
        console.warn('Live database category fetch fallback:', err);
      }

      // 3. Merge any custom created categories from localStorage
      try {
        const customCats = JSON.parse(localStorage.getItem('grabit_seller_custom_categories') || '[]');
        if (Array.isArray(customCats) && customCats.length > 0) {
          const mappedCustom = customCats.map((c) => {
            const resolvedSlug = getStandardSlug(c.name, c.slug);
            return {
              ...c,
              slug: resolvedSlug
            };
          });
          results = [...mappedCustom, ...results];
        }
      } catch {}

      const OBSOLETE_NAMES = new Set([
        'bakery & breads',
        'beverages & drinks',
        'dairy & breakfast',
        'fruits & vegetables',
        'gourmet organic sweets',
        'gourmet organic...'
      ]);

      // Deduplicate categories by ID and normalized Name
      const seenIds = new Set();
      const seenNames = new Set();
      results = results.filter((c) => {
        const idStr = String(c.id);
        const nameNorm = c.name ? c.name.toLowerCase().trim() : '';
        if (OBSOLETE_NAMES.has(nameNorm)) return false;
        if (seenIds.has(idStr) || (nameNorm && seenNames.has(nameNorm))) return false;
        seenIds.add(idStr);
        if (nameNorm) seenNames.add(nameNorm);
        return true;
      });

      // Filter out any categories marked as deleted
      const deletedList = getDeletedCategories();
      if (deletedList.length > 0) {
        const deletedIds = new Set(deletedList.map((d) => String(d.id)));
        const deletedNames = new Set(deletedList.map((d) => d.name).filter(Boolean));
        const deletedSlugs = new Set(deletedList.map((d) => d.slug).filter(Boolean));

        results = results.filter((c) => {
          const idStr = String(c.id);
          const nameNorm = c.name ? c.name.toLowerCase().trim() : '';
          const slugNorm = c.slug ? c.slug.toLowerCase().trim() : '';
          if (deletedIds.has(idStr)) return false;
          if (nameNorm && deletedNames.has(nameNorm)) return false;
          if (slugNorm && deletedSlugs.has(slugNorm)) return false;
          return true;
        });
      }


      // Apply persistent status overrides
      const statusMap = getStatusOverrides();
      results = results.map((c) => ({
        ...c,
        is_active: statusMap[String(c.id)] !== undefined ? Boolean(statusMap[String(c.id)]) : true,
      }));

      // Search filter
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter((c) => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)));
      }

      // Active / Inactive filter
      if (params.is_active !== undefined) {
        results = results.filter((c) => Boolean(c.is_active) === Boolean(params.is_active));
      }

      return {
        count: results.length,
        results,
      };
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      return { count: defaultCategories.length, results: defaultCategories };
    }
  },

  async getCategory(id) {
    const res = await categoryService.getCategories();
    const cat = res.results.find((c) => String(c.id) === String(id));
    if (!cat) throw new Error('Category not found');
    return cat;
  },

  async getParentsList(excludeId) {
    try {
      const res = await categoryService.getCategories();
      const list = res.results || [];
      return list.filter((c) => String(c.id) !== String(excludeId));
    } catch {
      return [];
    }
  },

  async getCategoryTree() {
    try {
      const res = await categoryService.getCategories();
      const list = res.results || [];
      return list.map((c) => {
        const subList = (typeof subCategories !== 'undefined' && subCategories && subCategories[c.slug]) ? subCategories[c.slug] : [];
        return {
          ...c,
          children: subList.map((sub, sIdx) => ({
            id: `${c.id}-sub-${sIdx}`,
            name: typeof sub === 'string' ? sub : sub.name || `Subcategory ${sIdx + 1}`,
            slug: typeof sub === 'string' ? sub.toLowerCase().replace(/\s+/g, '-') : sub.slug || `${c.slug}-sub-${sIdx}`,
            parent_id: c.id,
            is_active: c.is_active,
            product_count: 5,
          })),
        };
      });
    } catch {
      return [];
    }
  },

  async createCategory(formData) {
    let name = '';
    let image = null;
    let isActive = true;

    if (formData instanceof FormData) {
      name = formData.get('name') || '';
      if (formData.get('is_active') !== null) {
        isActive = formData.get('is_active') === 'true' || formData.get('is_active') === true;
      }
      const file = formData.get('image');
      if (file instanceof File && file.size > 0) {
        try {
          image = await uploadImage(file, 'grabit_media/categories');
        } catch (e) {
          console.warn('Cloudinary category upload fallback:', e);
        }
      }
    } else if (typeof formData === 'object') {
      name = formData.name || '';
      image = formData.image || null;
      if (formData.is_active !== undefined) isActive = Boolean(formData.is_active);
    }

    const payload = {
      name: name.trim(),
      image_url: image || DEFAULT_CATEGORY_FALLBACK,
    };

    let created = null;
    try {
      created = await post('/categories/', payload);
    } catch (e) {
      console.warn('Backend category creation fallback:', e);
    }

    const catId = created?.id ? String(created.id) : `cat-${payload.name.toLowerCase().replace(/\s+/g, '-')}`;

    const newCat = {
      id: catId,
      name: payload.name,
      slug: payload.name.toLowerCase().replace(/\s+/g, '-'),
      image: created?.image_url || payload.image_url,
      image_url: created?.image_url || payload.image_url,
      is_active: isActive,
      subcategory_count: 0,
      product_count: 0,
      description: `${payload.name} category items`,
      created_at: created?.created_at || new Date().toISOString(),
    };

    saveStatusOverride(newCat.id, isActive);

    try {
      const stored = JSON.parse(localStorage.getItem('grabit_seller_custom_categories') || '[]');
      const existingIdx = stored.findIndex((c) => 
        String(c.id) === String(newCat.id) || 
        (c.name && c.name.toLowerCase().trim() === payload.name.toLowerCase().trim())
      );
      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], ...newCat };
      } else {
        stored.unshift(newCat);
      }
      localStorage.setItem('grabit_seller_custom_categories', JSON.stringify(stored));
    } catch {}

    emitCategoryEvent();
    return newCat;
  },

  async updateCategory(id, formData) {
    let name = '';
    let image = null;
    let isActive = true;

    if (formData instanceof FormData) {
      name = formData.get('name') || '';
      if (formData.get('is_active') !== null) {
        isActive = formData.get('is_active') === 'true' || formData.get('is_active') === true;
      }
      const file = formData.get('image');
      if (file instanceof File && file.size > 0) {
        try {
          image = await uploadImage(file, 'grabit_media/categories');
        } catch (e) {
          console.warn('Cloudinary category upload fallback:', e);
        }
      }
    } else if (typeof formData === 'object') {
      name = formData.name || '';
      image = formData.image || null;
      if (formData.is_active !== undefined) isActive = Boolean(formData.is_active);
    }

    saveStatusOverride(id, isActive);

    try {
      const stored = JSON.parse(localStorage.getItem('grabit_seller_custom_categories') || '[]');
      const up = stored.map((c) => (String(c.id) === String(id) ? { ...c, name: name || c.name, image: image || c.image, is_active: isActive } : c));
      localStorage.setItem('grabit_seller_custom_categories', JSON.stringify(up));
    } catch {}

    emitCategoryEvent();
    return {
      id: String(id),
      name,
      image: image || DEFAULT_CATEGORY_FALLBACK,
      is_active: isActive,
    };
  },

  async toggleStatus(id) {
    const statusMap = getStatusOverrides();
    const current = statusMap[String(id)] !== undefined ? Boolean(statusMap[String(id)]) : true;
    const next = !current;
    saveStatusOverride(id, next);
    emitCategoryEvent();
    return { id: String(id), is_active: next, message: `Category is now ${next ? 'Active' : 'Inactive'}` };
  },

  async deleteCategory(id) {
    const idStr = String(id);
    let targetName = '';
    let targetSlug = '';

    try {
      const allCats = await categoryService.getCategories();
      const cat = allCats.results?.find((c) => String(c.id) === idStr);
      if (cat) {
        targetName = cat.name || '';
        targetSlug = cat.slug || '';
      }
    } catch {}

    saveDeletedCategory(idStr, targetName, targetSlug);

    try {
      const stored = JSON.parse(localStorage.getItem('grabit_seller_custom_categories') || '[]');
      const up = stored.filter((c) => {
        const cId = String(c.id);
        const cName = c.name ? c.name.toLowerCase().trim() : '';
        const tName = targetName ? targetName.toLowerCase().trim() : '';
        if (cId === idStr) return false;
        if (tName && cName === tName) return false;
        return true;
      });
      localStorage.setItem('grabit_seller_custom_categories', JSON.stringify(up));
    } catch {}

    try {
      await del(`/categories/${id}`);
    } catch (e) {}

    emitCategoryEvent();
    return true;
  },

};

export default categoryService;
