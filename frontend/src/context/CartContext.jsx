import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { get, post } from '../api';

const CartContext = createContext();

export const AVAILABLE_COUPONS = [
  {
    code: 'GRABIT50',
    title: '₹50 Instant Discount',
    description: 'Get Flat ₹50 OFF on orders above ₹149',
    minOrder: 149,
    discountType: 'fixed',
    discountValue: 50,
    badge: 'POPULAR'
  },
  {
    code: 'WELCOME100',
    title: '₹100 New User Discount',
    description: 'Get Flat ₹100 OFF on orders above ₹299',
    minOrder: 299,
    discountType: 'fixed',
    discountValue: 100,
    badge: 'NEW USER'
  },
  {
    code: 'FREESHIP',
    title: 'Free Express Delivery',
    description: 'Waive ₹30 express delivery fee on your order',
    minOrder: 0,
    discountType: 'free_delivery',
    discountValue: 30,
    badge: 'FREE DELIVERY'
  }
];

const getUserPhone = () => {
  try {
    const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
    const digits = (u.phone || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  } catch {
    return '';
  }
};

const getCartKey = (phone) => phone ? `grabit_cart_${phone}` : 'grabit_cart_guest';

const loadStoredCart = (phone) => {
  try {
    const raw = localStorage.getItem(getCartKey(phone));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadStoredCart(getUserPhone()));
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem('grabit_applied_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isInitialMount = useRef(true);

  // Sync to local storage and Cloud Backend on item changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const currentPhone = getUserPhone();
    const storageKey = getCartKey(currentPhone);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}

    // Cloud DB & Redis sync — only sync if user is logged in with active auth token
    const hasToken = localStorage.getItem('grabit_session') || localStorage.getItem('grabit_seller_access') || localStorage.getItem('grabit_jwt');
    if (currentPhone && hasToken) {
      post('/cart/sync', { phone: currentPhone, items }).catch(() => {});
    }
  }, [items]);

  // Initial cloud fetch on mount
  useEffect(() => {
    const initCloudCart = async () => {
      const currentPhone = getUserPhone();
      const hasToken = localStorage.getItem('grabit_session') || localStorage.getItem('grabit_seller_access') || localStorage.getItem('grabit_jwt');
      if (!currentPhone || !hasToken) return;
      const local = loadStoredCart(currentPhone);
      // If local cart is explicitly empty, do not re-populate from stale cloud cart
      if (Array.isArray(local) && local.length === 0) return;
      try {
        const data = await get(`/cart/user/${currentPhone}`);
        const localCheck = loadStoredCart(currentPhone);
        if (localCheck.length === 0) return; // Cart was cleared while request was in flight
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
          localStorage.setItem(getCartKey(currentPhone), JSON.stringify(data.items));
        }
      } catch {}
    };
    initCloudCart();
  }, []);

  // Handle Login & Logout events to load that specific customer's cart
  useEffect(() => {
    const handleAuthChange = async () => {
      const newPhone = getUserPhone();
      const hasToken = localStorage.getItem('grabit_session') || localStorage.getItem('grabit_seller_access') || localStorage.getItem('grabit_jwt');
      const local = loadStoredCart(newPhone);
      setItems(local || []);

      if (newPhone && hasToken && (!local || local.length > 0)) {
        try {
          const data = await get(`/cart/user/${newPhone}`);
          const localCheck = loadStoredCart(newPhone);
          if (localCheck.length === 0) {
            setItems([]);
            return;
          }
          if (data && Array.isArray(data.items)) {
            setItems(data.items);
            localStorage.setItem(getCartKey(newPhone), JSON.stringify(data.items));
          }
        } catch {}
      }
    };

    const handleExternalCartSync = () => {
      const currentPhone = getUserPhone();
      const local = loadStoredCart(currentPhone);
      setItems(local || []);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('grabit_auth_updated', handleAuthChange);
      window.addEventListener('grabit_cart_updated', handleExternalCartSync);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('grabit_auth_updated', handleAuthChange);
        window.removeEventListener('grabit_cart_updated', handleExternalCartSync);
      }
    };
  }, []);

  const addItem = useCallback((product) => {
    if (!product || !product.id) return;
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      const safePrice = Number(product.price) || 0;
      const safeMrp = Number(product.mrp) || safePrice;
      return [...prev, {
        id: product.id,
        name: product.name || 'Product',
        weight: product.weight || '',
        price: safePrice,
        mrp: safeMrp,
        qty: 1,
        image: product.image || 'lays-classic-salted'
      }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Number(qty) || 1 } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('grabit_applied_coupon');
    } catch {}
    const currentPhone = getUserPhone();
    try {
      localStorage.setItem(getCartKey(currentPhone), JSON.stringify([]));
      localStorage.setItem('grabit_cart_guest', JSON.stringify([]));
      if (currentPhone) {
        localStorage.removeItem(`grabit_cart_${currentPhone}`);
      }
      localStorage.removeItem('grabit_cart_guest');
    } catch {}
    if (currentPhone) {
      post('/cart/sync', { phone: currentPhone, items: [] }).catch(() => {});
    }
    try {
      window.dispatchEvent(new CustomEvent('grabit_cart_updated', { detail: [] }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }, []);

  const getItemQty = useCallback((id) => {
    return items.find(i => i.id === id)?.qty || 0;
  }, [items]);

  const totalItems = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const itemTotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
  const mrpTotal = items.reduce((s, i) => s + (Number(i.mrp) || Number(i.price) || 0) * (Number(i.qty) || 0), 0);
  const discount = Math.max(0, mrpTotal - itemTotal);
  const deliveryFee = itemTotal >= 100 || itemTotal === 0 ? 0 : 30;

  const applyCoupon = useCallback((codeToApply) => {
    if (!codeToApply || !codeToApply.trim()) {
      return { success: false, message: 'Please enter a valid coupon code' };
    }
    const cleanCode = codeToApply.trim().toUpperCase();
    
    let coupon = AVAILABLE_COUPONS.find(c => c.code === cleanCode);
    if (!coupon) {
      return { success: false, message: `Invalid coupon code "${cleanCode}"` };
    }

    if (itemTotal < coupon.minOrder) {
      const diff = coupon.minOrder - itemTotal;
      return { success: false, message: `Add ₹${diff} more items to apply code ${cleanCode}` };
    }

    setAppliedCoupon(coupon);
    try {
      localStorage.setItem('grabit_applied_coupon', JSON.stringify(coupon));
    } catch {}
    return { success: true, message: `Coupon "${coupon.code}" applied successfully!` };
  }, [itemTotal]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    try {
      localStorage.removeItem('grabit_applied_coupon');
    } catch {}
  }, []);

  let couponDiscount = 0;
  if (appliedCoupon && itemTotal >= (appliedCoupon.minOrder || 0)) {
    if (appliedCoupon.discountType === 'fixed') {
      couponDiscount = Math.min(appliedCoupon.discountValue, itemTotal);
    } else if (appliedCoupon.discountType === 'free_delivery') {
      couponDiscount = deliveryFee;
    }
  }

  const toPay = Math.max(0, itemTotal + deliveryFee - couponDiscount);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart, getItemQty,
      totalItems, itemTotal, mrpTotal, discount, deliveryFee, toPay,
      appliedCoupon, couponDiscount, applyCoupon, removeCoupon, AVAILABLE_COUPONS
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
