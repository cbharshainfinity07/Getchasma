import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cartItems');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Sync with local storage
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Could not save cart to local storage", e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    const qty = Math.max(1, Number(quantity) || 1);
    const price = Number(product.price) || 0;
    const safeItem = {
      ...product,
      id: product.id !== undefined ? String(product.id) : `prod-${Date.now()}`,
      price,
      name: product.name || 'Premium Eyewear Frame',
      image: product.image || '/3d-glasses-transparent.png',
    };

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => String(item.id) === String(safeItem.id));
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty
        };
        return next;
      }
      return [...prev, { ...safeItem, quantity: qty }];
    });

    setLastAddedItem(safeItem);
    setIsCartOpen(true);
    setTimeout(() => setLastAddedItem(null), 3500);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => String(item.id) !== String(productId)));
  };

  const updateQuantity = (productId, amount) => {
    setCartItems(prev => prev.map(item => {
      if (String(item.id) === String(productId)) {
        const newQty = Math.max(1, item.quantity + amount);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('cartItems');
    } catch (e) {}
  };

  const cartTotal = cartItems.reduce((total, item) => total + (Number(item.price || 0) * (item.quantity || 1)), 0);
  const cartCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

  const toggleCart = () => setIsCartOpen(prev => !prev);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      lastAddedItem,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      toggleCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
