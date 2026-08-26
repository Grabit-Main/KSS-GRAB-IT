import { get, post, patch, del, uploadImage } from '../../api';

export const productService = {
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append('category_id', params.category);
      if (params.search) queryParams.append('q', params.search);

      const qs = queryParams.toString();
      const endpoint = `/products/${qs ? '?' + qs : ''}`;
      const prods = await get(endpoint);

      const results = (prods || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category_id,
        category_name: p.categories?.name || 'General',
        price: p.price,
        discount_price: p.discount_price || null,
        delivery_time: p.delivery_time || '10 mins',
        stock_quantity: p.stock || 50,
        unit: p.unit || '1 unit',
        description: p.description || '',
        image: p.image_url || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png',
        is_active: p.is_active ?? true,
        created_at: p.created_at || new Date().toISOString(),
      }));

      return {
        count: results.length,
        results,
      };
    } catch (err) {
      console.error('Failed to fetch live products:', err);
      return { count: 0, results: [] };
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
      category_id: data.category || null,
      price: parseFloat(data.price) || 0,
      stock: parseInt(data.stock_quantity, 10) || 50,
      image_url: imageUrl || 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645084/grabit_media/fresh_groceries_basket_only.png',
    };

    const created = await post('/products/', payload);
    return {
      id: created.id,
      name: created.name,
      category: created.category_id,
      price: created.price,
      stock_quantity: created.stock,
      image: created.image_url,
      is_active: true,
      created_at: created.created_at,
    };
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
    if (data.category !== undefined) payload.category_id = data.category;
    if (imageUrl) payload.image_url = imageUrl;

    const updated = await patch(`/products/${id}`, payload);
    return {
      ...data,
      id: updated.id || id,
      image: updated.image_url || imageUrl,
    };
  },

  async deleteProduct(id) {
    await del(`/products/${id}`);
    return true;
  },
};

export default productService;
