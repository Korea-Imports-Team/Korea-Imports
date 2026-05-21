import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import styles from './WishlistPage.module.css';

export default function WishlistPage() {
    const { wishlistItems, toggleWishlist, addToCart } = useCart();

    // Cruza os IDs da wishlist com os produtos reais
    const favoriteProducts = products.filter((p) => wishlistItems.includes(p.id));

    function handleAddToCart(product) {
        addToCart({
            ...product,
            selectedSize: product.sizes?.[0] || null,
        });
    }

    return (
        <main className={styles.page}>
            <div className="container">

                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Meus Favoritos</h1>
                        <p className={styles.sub}>
                            {favoriteProducts.length} item{favoriteProducts.length !== 1 ? 'ns' : ''} salvos
                        </p>
                    </div>
                    {favoriteProducts.length > 0 && (
                        <Link to="/catalogo" className={styles.btnCatalog}>
                            Continuar Comprando
                        </Link>
                    )}
                </div>

                {/* Empty state */}
                {favoriteProducts.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <Heart size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className={styles.emptyTitle}>Nenhum favorito ainda</h2>
                        <p className={styles.emptySub}>
                            Explore nosso catálogo e salve os produtos que você mais gosta.
                        </p>
                        <Link to="/catalogo" className={styles.btnExplore}>
                            Explorar Catálogo
                        </Link>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {favoriteProducts.map((product) => (
                            <div key={product.id} className={styles.card}>

                                {/* Imagem */}
                                <Link to={`/produto/${product.id}`} className={styles.imgWrap}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className={styles.img}
                                        onError={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
                                    />
                                    {product.discount && (
                                        <span className={styles.discountBadge}>-{product.discount}%</span>
                                    )}
                                    {product.isNew && !product.discount && (
                                        <span className={styles.newBadge}>Novo</span>
                                    )}
                                </Link>

                                {/* Info */}
                                <div className={styles.info}>
                                    <Link to={`/produto/${product.id}`} className={styles.name}>
                                        {product.name}
                                    </Link>

                                    <span className={styles.category}>
                                        {product.category.replace(/-/g, ' ')}
                                    </span>

                                    <div className={styles.priceRow}>
                                        {product.originalPrice && (
                                            <span className={styles.originalPrice}>
                                                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                            </span>
                                        )}
                                        <span className={styles.price}>
                                            R$ {product.price.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>

                                    {product.pixDiscount && (
                                        <p className={styles.pix}>
                                            R$ {(product.price * (1 - product.pixDiscount / 100)).toFixed(2).replace('.', ',')}
                                            <span> no Pix ({product.pixDiscount}% off)</span>
                                        </p>
                                    )}

                                    {/* Tamanhos disponíveis */}
                                    {product.sizes?.length > 0 && (
                                        <div className={styles.sizes}>
                                            {product.sizes.map((s) => (
                                                <span
                                                    key={s}
                                                    className={`${styles.size} ${product.sizesOutOfStock?.includes(s) ? styles.sizeOut : ''}`}
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Ações */}
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.btnCart}
                                            onClick={() => handleAddToCart(product)}
                                            title="Adicionar ao carrinho"
                                        >
                                            <ShoppingCart size={16} />
                                            Adicionar ao Carrinho
                                        </button>
                                        <button
                                            className={styles.btnRemove}
                                            onClick={() => toggleWishlist(product.id)}
                                            title="Remover dos favoritos"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}