import { useState, useMemo } from 'react';
import { products } from '../data/products';

export function useProducts(categoryFilter = 'todos') {
  const filtered = useMemo(() => {
    if (categoryFilter === 'todos') return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [categoryFilter]);

  return filtered;
}

export function useSearch() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }, [query]);

  return { query, setQuery, results };
}

/**
 
 Hooks customizados para busca e filtragem de produtos
 
 Hooks disponíveis:
 - useProducts(categoryFilter) → retorna produtos filtrados por categoria
 - useSearch()                 → retorna busca reativa por nome ou tag
 */

