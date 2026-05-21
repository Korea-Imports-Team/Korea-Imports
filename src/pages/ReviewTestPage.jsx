import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import ReviewSystem from '../components/ReviewSystem';
import { useAuth } from '../context/AuthContext';
import styles from './ReviewTestPage.module.css';

export default function ReviewTestPage() {
    const { user } = useAuth();
    const [selectedProduct, setSelectedProduct] = useState(products[0]);
    const [search, setSearch] = useState('');

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const userName =
        user?.displayName ||
        user?.email?.split('@')[0] ||
        'Visitante';

    return (
        <main className={styles.page}>
            <div className="container">

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <div className={styles.breadcrumb}>
                            <Link to="/" className={styles.breadLink}>Início</Link>
                            <span className={styles.breadSep}>/</span>
                            <span>Teste de Avaliações</span>
                        </div>
                        <h1 className={styles.title}>Teste de Avaliações</h1>
                        <p className={styles.subtitle}>
                            Selecione um produto abaixo e escreva uma avaliação. As avaliações ficam
                            visíveis para todos os visitantes na página do produto.
                        </p>
                    </div>
                </div>

                {/* Info banner */}
                <div className={styles.infoBanner}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div>
                        <p className={styles.infoBannerTitle}>Modo de Teste Ativado</p>
                        <p className={styles.infoBannerText}>
                            Nesta página você pode avaliar qualquer produto sem precisar ter comprado.
                            As avaliações publicadas aqui aparecem automaticamente na página real do produto.
                            {user
                                ? ` Avaliando como: ${userName}.`
                                : ' Você não está logado — avaliando como Visitante.'}
                        </p>
                    </div>
                </div>

                <div className={styles.layout}>

                    {/* Sidebar de produtos */}
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <h2 className={styles.sidebarTitle}>Produtos</h2>
                            <div className={styles.searchWrap}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <input
                                    className={styles.searchInput}
                                    placeholder="Buscar produto..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.productList}>
                            {filtered.map((p) => {
                                // Conta avaliações existentes
                                const reviewCount = (() => {
                                    try {
                                        const all = JSON.parse(localStorage.getItem('reviews') || '{}');
                                        return (all[p.id] || []).length;
                                    } catch { return 0; }
                                })();

                                return (
                                    <button
                                        key={p.id}
                                        className={`${styles.productItem} ${selectedProduct.id === p.id ? styles.productItemActive : ''}`}
                                        onClick={() => setSelectedProduct(p)}
                                    >
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className={styles.productThumb}
                                            onError={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
                                        />
                                        <div className={styles.productInfo}>
                                            <p className={styles.productName}>{p.name}</p>
                                            <p className={styles.productMeta}>
                                                R$ {p.price.toFixed(2).replace('.', ',')}
                                            </p>
                                            {reviewCount > 0 && (
                                                <p className={styles.productReviewCount}>
                                                    {reviewCount} avaliação{reviewCount !== 1 ? 'ões' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            {filtered.length === 0 && (
                                <p className={styles.noResults}>Nenhum produto encontrado.</p>
                            )}
                        </div>
                    </aside>

                    {/* Área principal */}
                    <div className={styles.main}>

                        {/* Card do produto selecionado */}
                        <div className={styles.selectedCard}>
                            <img
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                className={styles.selectedImg}
                                onError={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
                            />
                            <div className={styles.selectedInfo}>
                                <span className={styles.selectedCategory}>
                                    {selectedProduct.category.replace(/-/g, ' ')}
                                </span>
                                <h2 className={styles.selectedName}>{selectedProduct.name}</h2>
                                <p className={styles.selectedPrice}>
                                    R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                                </p>
                                {selectedProduct.sizes?.length > 0 && (
                                    <div className={styles.selectedSizes}>
                                        {selectedProduct.sizes.map((s) => (
                                            <span key={s} className={styles.sizeTag}>{s}</span>
                                        ))}
                                    </div>
                                )}
                                <Link
                                    to={`/produto/${selectedProduct.id}`}
                                    className={styles.viewProductBtn}
                                    target="_blank"
                                >
                                    Ver página do produto →
                                </Link>
                            </div>
                        </div>

                        {/* Sistema de avaliações em modo teste (hasPurchased=true sempre) */}
                        <ReviewSystem
                            productId={selectedProduct.id}
                            userName={userName}
                            hasPurchased={true}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}