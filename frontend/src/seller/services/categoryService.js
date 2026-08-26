import { get, post, uploadImage } from '../../api';

export const categoryService = {
  async getCategories(params = {}) {
    try {
      const cats = await get('/categories/');
      const results = (cats || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: (c.name || '').toLowerCase().replace(/\s+/g, '-'),
        image: c.image_url || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645161/grabit_media/fresh_fruits_veggies.jpg',
        is_active: true,
        product_count: 15,
        description: `${c.name} items delivered in 10-15 mins`,
      }));

      return {
        count: results.length,
        results,
      };
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      return { count: 0, results: [] };
    }
  },

  async getCategory(id) {
    const res = await this.getCategories();
    const cat = res.results.find((c) => String(c.id) === String(id));
    if (!cat) throw new Error('Category not found');
    return cat;
  },

  async createCategory(formData) {
    let name = '';
    let image = null;

    if (formData instanceof FormData) {
      name = formData.get('name') || '';
      const file = formData.get('image');
      if (file instanceof File && file.size > 0) {
        try {
          image = await uploadImage(file, 'grabit_media/categories');
        } catch (e) {
          console.warn('Category image upload fallback:', e);
        }
      } else {
        image = formData.get('image_url');
      }
    } else if (typeof formData === 'object') {
      name = formData.name || '';
      image = formData.image || formData.image_url;
    }

    const created = await post('/categories/', {
      name,
      image_url: image || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645161/grabit_media/fresh_fruits_veggies.jpg',
    });

    return {
      id: created.id,
      name: created.name,
      image: created.image_url,
      is_active: true,
    };
  },

  async updateCategory(id, formData) {
    // Return existing or updated mock representation
    return { id, is_active: true };
  },

  async deleteCategory(id) {
    return true;
  },
};

export default categoryService;
