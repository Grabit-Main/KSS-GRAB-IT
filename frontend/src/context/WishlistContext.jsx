import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

const getUserPhone = () => {
  try {
    const u = JSON.parse(localStorage.getItem('grabit_user') || '{}');
    const digits = (u.phone || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
  } catch {
    return '';
  }
};

const getWishlistKey = (phone) => (phone ? `grabit_wishlist_${phone}` : 'grabit_wishlist_guest');

const loadStoredWishlist = (phone) => {
  try {
    const raw = localStorage.getItem(getWishlistKey(phone)) || localStorage.getItem('grabit_wishlist');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => loadStoredWishlist(getUserPhone()));

  // Listen for login/logout to switch to the active customer's wishlist
  useEffect(() => {
    const handleAuthChange = () => {
      const currentPhone = getUserPhone();
      setWishlistItems(loadStoredWishlist(currentPhone));
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

  useEffect(() => {
    try {
      const currentPhone = getUserPhone();
      localStorage.setItem(getWishlistKey(currentPhone), JSON.stringify(wishlistItems));
    } catch (err) {
      console.error('Failed to save wishlist to localStorage', err);
    }
  }, [wishlistItems]);

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      toggleWishlist,
      isInWishlist,
      wishlistCount: wishlistItems.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
