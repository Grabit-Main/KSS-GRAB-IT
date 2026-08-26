import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const CartContext = createContext();

const API_BASE = 'http://127.0.0.1:8000';

const getUserPhone = () => {
  try {
    const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
    return (u.phone || '').replace(/\D/g, '');
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

    // Cloud DB & Redis sync
    if (currentPhone) {
      fetch(`${API_BASE}/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: currentPhone, items })
      }).catch(() => {});
    }
  }, [items]);

  // Initial cloud fetch on mount
  useEffect(() => {
    const initCloudCart = async () => {
      const currentPhone = getUserPhone();
      if (!currentPhone) return;
      try {
        const res = await fetch(`${API_BASE}/cart/user/${currentPhone}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            setItems(data.items);
            localStorage.setItem(getCartKey(currentPhone), JSON.stringify(data.items));
          }
        }
      } catch {}
    };
    initCloudCart();
  }, []);

  // Handle Login & Logout events to load that specific customer's cart
  useEffect(() => {
    const handleAuthChange = async () => {
      const newPhone = getUserPhone();
      if (newPhone) {
        // 1. Immediately load customer's saved local cart
        const local = loadStoredCart(newPhone);
        if (local && local.length > 0) {
          setItems(local);
        } else {
          setItems([]);
        }

        // 2. Fetch fresh cart from cloud database
        try {
          const res = await fetch(`${API_BASE}/cart/user/${newPhone}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items) && data.items.length > 0) {
              setItems(data.items);
              localStorage.setItem(getCartKey(newPhone), JSON.stringify(data.items));
            }
          }
        } catch {}
      } else {
        // User logged out -> reset to guest cart
        setItems(loadStoredCart(''));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('grabit_auth_updated', handleAuthChange);
      window.addEventListener('storage', handleAuthChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('grabit_auth_updated', handleAuthChange);
        window.removeEventListener('storage', handleAuthChange);
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
    const currentPhone = getUserPhone();
    try {
      localStorage.removeItem(getCartKey(currentPhone));
    } catch {}
    if (currentPhone) {
      fetch(`${API_BASE}/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: currentPhone, items: [] })
      }).catch(() => {});
    }
  }, []);

  const getItemQty = useCallback((id) => {
    return items.find(i => i.id === id)?.qty || 0;
  }, [items]);

  const totalItems = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const itemTotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);
  const mrpTotal = items.reduce((s, i) => s + (Number(i.mrp) || Number(i.price) || 0) * (Number(i.qty) || 0), 0);
  const discount = Math.max(0, mrpTotal - itemTotal);
  const deliveryFee = itemTotal >= 100 || itemTotal === 0 ? 0 : 30;
  const toPay = itemTotal + deliveryFee;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, getItemQty, totalItems, itemTotal, mrpTotal, discount, deliveryFee, toPay }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

