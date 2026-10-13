import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();

  // 🛒 Carrinho sincronizado com backend
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ❤️ Wishlist — carregada do back após login
  const [wishlistItems, setWishlistItems] = useState([]);

  // 🔄 Carregar carrinho do backend quando o usuário loga
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setWishlistItems([]);
      return;
    }

    setLoading(true);
    // Carregar carrinho do backend
    api.get('/users/me/cart')
      .then((response) => {
        // Converter resposta do backend para formato local
        const items = response.items.map((item) => ({
          id: item.productId,
          name: item.productName,
          image: item.productImage,
          price: item.price,
          selectedSize: item.size,
          quantity: item.quantity,
        }));
        setCartItems(items);
      })
      .catch(() => setCartItems([])) // Se falhar, começa vazio
      .finally(() => setLoading(false));

    // Carregar wishlist
    api.get('/users/me/wishlist')
      .then((products) => setWishlistItems(products.map((p) => p.id)))
      .catch(() => {});
  }, [user]);

  // 💾 Sincronizar carrinho com backend quando mudar
  const syncCartToBackend = useCallback(async (items) => {
    if (!user) return;
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.selectedSize,
        })),
      };
      await api.post('/users/me/cart', payload);
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error);
    }
  }, [user]);

  // ➕ Adicionar ao carrinho
  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === product.selectedSize
      );

      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }
      
      syncCartToBackend(updated);
      return updated;
    });
  }, [syncCartToBackend]);

  // ❌ Remover item
  const removeFromCart = useCallback(
    (productId, selectedSize) => {
      setCartItems((prev) => {
        const updated = prev.filter(
          (item) => !(item.id === productId && item.selectedSize === selectedSize)
        );
        syncCartToBackend(updated);
        return updated;
      });
    },
    [syncCartToBackend]
  );

  // ➖ Diminuir quantidade
  const decreaseQuantity = useCallback(
    (productId, selectedSize) => {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.id === productId && item.selectedSize === selectedSize
        );

        let updated;
        if (existing && existing.quantity === 1) {
          updated = prev.filter(
            (item) => !(item.id === productId && item.selectedSize === selectedSize)
          );
        } else {
          updated = prev.map((item) =>
            item.id === productId && item.selectedSize === selectedSize
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        }
        syncCartToBackend(updated);
        return updated;
      });
    },
    [syncCartToBackend]
  );

  // 🧼 Limpar carrinho
  const clearCart = useCallback(async () => {
    setCartItems([]);
    if (user) {
      try {
        await api.delete('/users/me/cart');
      } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
      }
    }
  }, [user]);

  // ❤️ Wishlist toggle — sincroniza com back
  const toggleWishlist = useCallback(async (productId) => {
    if (!user) return;
    try {
      const result = await api.post(`/users/me/wishlist/${productId}`);
      setWishlistItems((prev) =>
        result.added ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
    } catch (error) {
      console.error('Erro ao toggle wishlist:', error);
    }
  }, [user]);

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
        loading,
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