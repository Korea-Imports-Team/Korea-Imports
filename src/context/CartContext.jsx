import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {

  // 🛒 Carrinho com persistência
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ❤️ Wishlist com persistência
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 💾 Salvar carrinho sempre que mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 💾 Salvar wishlist sempre que mudar
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // ➕ Adicionar ao carrinho
  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === product.selectedSize
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  // ❌ Remover item
  const removeFromCart = useCallback((productId, selectedSize) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.selectedSize === selectedSize)
      )
    );
  }, []);

  // ➖ Diminuir quantidade
  const decreaseQuantity = useCallback((productId, selectedSize) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === productId && item.selectedSize === selectedSize
      );

      if (existing && existing.quantity === 1) {
        return prev.filter(
          (item) => !(item.id === productId && item.selectedSize === selectedSize)
        );
      }

      return prev.map((item) =>
        item.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  }, []);

  // 🧼 Limpar carrinho (🔥 útil no checkout)
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart'); // 🔥 garante limpeza total
  }, []);

  // ❤️ Wishlist toggle
  const toggleWishlist = useCallback((productId) => {
    setWishlistItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // 🔍 Verificar wishlist
  const isInWishlist = useCallback(
    (productId) => wishlistItems.includes(productId),
    [wishlistItems]
  );

  // 🔢 Contador do carrinho
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        wishlistItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
      }}
    >
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