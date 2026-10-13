import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(() => {
    setLoading(true);
    console.log('📦 Carregando produtos do backend...');
    // Carregar todos os produtos com um limite alto (página e tamanho grande)
    api.get('/products?page=0&size=10000', { auth: false })
      .then((response) => {
        console.log('📡 Resposta do backend:', response);
        // Backend retorna Page<ProductResponse>, extrair content
        let data = [];
        if (Array.isArray(response)) {
          data = response;
          console.log('✅ Resposta é um array:', data.length, 'produtos');
        } else if (response?.content) {
          data = response.content; // Response é uma Page<ProductResponse>
          console.log('✅ Resposta tem .content:', data.length, 'produtos');
        } else if (response?.products) {
          data = response.products;
          console.log('✅ Resposta tem .products:', data.length, 'produtos');
        } else if (response?.data) {
          data = response.data;
          console.log('✅ Resposta tem .data:', data.length, 'produtos');
        }
        console.log('🎯 Produtos carregados:', data.length);
        setProducts(data);
      })
      .catch((err) => {
        console.error('❌ Erro ao carregar produtos:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getPaginatedProducts = useCallback((page = 1, limit = 12) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      items: products.slice(start, end),
      total: products.length,
      page,
      limit,
      totalPages: Math.ceil(products.length / limit),
    };
  }, [products]);

  return (
    <ProductsContext.Provider value={{ products, loading, error, getPaginatedProducts, refreshProducts: loadProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsData() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProductsData must be used within ProductsProvider');
  return context;
}