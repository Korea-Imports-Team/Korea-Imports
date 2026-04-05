import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products, categories } from '../data/products';
import ProductCard from '../components/ui/ProductCard';
import styles from './CatalogPage.module.css';

const SIZES = ['P', 'M', 'G', 'GG'];

const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até R$ 100', min: 0, max: 100 },
  { label: 'R$ 100 - R$ 200', min: 100, max: 200 },
  { label: 'Acima de R$ 200', min: 200, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Menor preço', value: 'menor-preco' },
  { label: 'Maior preço', value: 'maior-preco' },
  { label: 'Mais novo', value: 'mais-novo' },
  { label: 'Mais vendido', value: 'mais-vendido' },
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoria = searchParams.get('categoria') || 'todos';
  const query = searchParams.get('q') || '';

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedSort, setSelectedSort] = useState('menor-preco');

  function handleCategory(id) {
    const next = new URLSearchParams(searchParams);
    if (id === 'todos') {
      next.delete('categoria');
    } else {
      next.set('categoria', id);
    }
    setSearchParams(next);
  }

  function toggleSize(size) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  const filtered = useMemo(() => {
    let list = products;

    if (categoria !== 'todos') {
      list = list.filter((p) => p.category === categoria);
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))
      );
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.sizes?.some(
          (s) =>
            selectedSizes.includes(s) &&
            !p.sizesOutOfStock?.includes(s)
        )
      );
    }

    const range = PRICE_RANGES[selectedPrice];
    list = list.filter((p) => p.price >= range.min && p.price <= range.max);

    if (selectedSort === 'menor-preco') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'maior-preco') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'mais-novo') {
      list = [...list].filter((p) => p.isNew).concat(list.filter((p) => !p.isNew));
    } else if (selectedSort === 'mais-vendido') {
      list = [...list].filter((p) => p.isBestSeller).concat(list.filter((p) => !p.isBestSeller));
    }

    return list;
  }, [categoria, query, selectedSizes, selectedPrice, selectedSort]);

  function clearFilters() {
    setSelectedSizes([]);
    setSelectedPrice(0);
    setSelectedSort('relevante');
  }

  const hasFilters = selectedSizes.length > 0 || selectedPrice !== 0 || selectedSort !== 'relevante';

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            {query ? `Resultados para "${query}"` : 'Catálogo'}
          </h1>
          <p className={styles.pageCount}>
            {filtered.length} produto{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros de categoria */}
        <div className={styles.filters}>
          {categories
            .filter((cat) => cat.id !== 'inicio')
            .map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterBtn} ${categoria === cat.id || (cat.id === 'todos' && !searchParams.get('categoria'))
                    ? styles.filterActive
                    : ''
                  }`}
                onClick={() => handleCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
        </div>

        <div className={styles.layout}>
          {/* Sidebar de filtros */}
          <aside className={styles.sidebar}>

            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Filtros</h3>
              {hasFilters && (
                <button className={styles.clearBtn} onClick={clearFilters}>
                  Limpar
                </button>
              )}
            </div>

            {/* Tamanho */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Tamanho</h4>
              <div className={styles.sizeOptions}>
                {SIZES.map((size) => (
                  <button
                    key={size}
                    className={`${styles.sizeOption} ${selectedSizes.includes(size) ? styles.sizeOptionActive : ''}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Faixa de preço */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Faixa de Preço</h4>
              <div className={styles.priceOptions}>
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={i}
                    className={`${styles.priceOption} ${selectedPrice === i ? styles.priceOptionActive : ''}`}
                    onClick={() => setSelectedPrice(i)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenação */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Ordenar por</h4>
              <div className={styles.sortOptions}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.sortOption} ${selectedSort === opt.value ? styles.sortOptionActive : ''}`}
                    onClick={() => setSelectedSort(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* Grid de produtos */}
          <div className={styles.content}>
            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>Nenhum produto encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}