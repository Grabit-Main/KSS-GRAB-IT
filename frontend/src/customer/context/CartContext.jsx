import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

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
