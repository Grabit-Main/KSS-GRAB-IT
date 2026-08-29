import { get, post, del, uploadImage } from '../../api';
import { categories as defaultCategories, subCategories, getCanonicalSlug } from '../../data/categories';
import { products as defaultProducts } from '../../data/products';
import { resolveMediaUrl, DEFAULT_CATEGORY_FALLBACK } from '../utils/mediaResolver';

export function getDeletedCategories() {
  try {
    const raw = localStorage.getItem('grabit_deleted_categories');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveDeletedCategory(catIdentifier) {
  if (!catIdentifier) return;
  try {
    const set = getDeletedCategories();
    set.add(String(catIdentifier).toLowerCase().trim());
    localStorage.setItem('grabit_deleted_categories', JSON.stringify(Array.from(set)));
  } catch {}
}

function getStatusOverrides() {
  try {
    return JSON.parse(localStorage.getItem('grabit_categories_status') || '{}');
  } catch {
    return {};
  }
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

export const categoryService = {
  async getCategories(params = {}) {
    try {
      // 1. Base Customer Portal Categories (14 Categories)
      const safeProducts = (typeof defaultProducts !== 'undefined' && Array.isArray(defaultProducts)) ? defaultProducts : [];
      let results = (Array.isArray(defaultCategories) ? defaultCategories : []).map((c) => {
        const canonicalSlug = getCanonicalSlug(c.slug || c.name);
        const subList = (typeof subCategories !== 'undefined' && subCategories && subCategories[canonicalSlug]) ? subCategories[canonicalSlug] : [];
        const prodsInCat = safeProducts.filter((p) => {
          if (getCanonicalSlug(p.category) === canonicalSlug) return true;
          if (canonicalSlug === 'beverages' && (p.category === 'beverages' || p.category === 3 || p.category === 9)) return true;
          if (canonicalSlug === 'staples' && (p.category === 'staples' || p.category === 4 || p.category === 11)) return true;
          if (canonicalSlug === 'chocolates' && (p.category === 'chocolates' || p.category === 5)) return true;
          if (canonicalSlug === 'produce' && (p.category === 'produce' || p.category === 8)) return true;
          if (canonicalSlug === 'biscuits' && (p.category === 'biscuits' || p.category === 10)) return true;
          if (canonicalSlug === 'oil' && (p.category === 'oil' || p.category === 12)) return true;
          if (String(p.category) === String(c.id)) return true;
          return false;
        });

        return {
          id: String(c.id),
          name: c.name,
          slug: canonicalSlug,
          icon: c.icon,
          image: resolveMediaUrl(c.icon || canonicalSlug, DEFAULT_CATEGORY_FALLBACK),
          image_url: resolveMediaUrl(c.icon || canonicalSlug, DEFAULT_CATEGORY_FALLBACK),
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
            const canonicalSlug = getCanonicalSlug(c.slug || c.name);
            const resolvedImg = resolveMediaUrl(c.image_url || c.name || canonicalSlug, DEFAULT_CATEGORY_FALLBACK);
            return {
              id: String(c.id),
              name: c.name,
              slug: canonicalSlug,
              icon: resolvedImg,
              image: resolvedImg,
              image_url: resolvedImg,
              is_active: true,
              subcategory_count: 4,
              product_count: 20,
              description: `${c.name} quick-commerce essentials`,
            };
          });
          // Place base categories first so canonical slugs take precedence
          results = [...results, ...mappedDb];
        }
      } catch (err) {
        console.warn('Live database category fetch fallback:', err);
      }


      // 3. Merge any custom created categories from localStorage
      try {
        const customCats = JSON.parse(localStorage.getItem('grabit_seller_custom_categories') || '[]');
        if (Array.isArray(customCats) && customCats.length > 0) {
          results = [...customCats, ...results];
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

      // 4. Filter out any deleted categories across all sources
      const deletedSet = getDeletedCategories();
      results = results.filter((c) => {
        const idStr = String(c.id).toLowerCase().trim();
        const nameNorm = c.name ? c.name.toLowerCase().trim() : '';
        const slugNorm = c.slug ? c.slug.toLowerCase().trim() : '';

        if (deletedSet.has(idStr) || (nameNorm && deletedSet.has(nameNorm)) || (slugNorm && deletedSet.has(slugNorm))) {
          return false;
        }
        return true;
      });

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
    const targetIdStr = String(id).toLowerCase().trim();
    let targetName = '';
    let targetSlug = '';

    try {
      const all = await categoryService.getCategories();
      const cat = (all.results || []).find((c) => 
        String(c.id).toLowerCase().trim() === targetIdStr || 
        String(c.slug).toLowerCase().trim() === targetIdStr
      );
      if (cat) {
        if (cat.name) targetName = cat.name.toLowerCase().trim();
        if (cat.slug) targetSlug = cat.slug.toLowerCase().trim();
      }
    } catch {}

    // Track in deleted categories blacklist in localStorage
    saveDeletedCategory(targetIdStr);
    if (targetName) saveDeletedCategory(targetName);
    if (targetSlug) saveDeletedCategory(targetSlug);

    // Remove from custom categories list
    try {
      const stored = JSON.parse(localStorage.getItem('grabit_seller_custom_categories') || '[]');
      const up = stored.filter((c) => {
        const cId = String(c.id).toLowerCase().trim();
        const cName = String(c.name || '').toLowerCase().trim();
        const cSlug = String(c.slug || '').toLowerCase().trim();
        return cId !== targetIdStr && cName !== targetName && cSlug !== targetSlug;
      });
      localStorage.setItem('grabit_seller_custom_categories', JSON.stringify(up));
    } catch {}

    // Invoke Backend DELETE API
    try {
      await del(`/categories/${encodeURIComponent(id)}`);
    } catch (e) {
      console.warn('Backend category delete API call:', e);
    }

    emitCategoryEvent();
    return true;
  },
};

export default categoryService;
