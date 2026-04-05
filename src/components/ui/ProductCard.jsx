import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(product.id);
  const [toast, setToast] = useState(false);
  const navigate = useNavigate();

  function handleAddToCart(e) {
    e.preventDefault();
    if (product.sizes && product.sizes.length > 0) {
      navigate(`/produto/${product.id}`);
      return;
    }
    addToCart(product);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  function handleWishlist(e) {
    e.preventDefault();
    toggleWishlist(product.id);
  }

  return (
    <div className={styles.card}>
      <Link to={`/produto/${product.id}`} className={styles.imageWrapper}>
        <img src={product.image} alt={product.name} className={styles.image} loading="lazy" />
        {product.imageBack && (
          <img
            src={product.imageBack}
            alt={`${product.name} - verso`}
            className={`${styles.image} ${styles.imageBack}`}
            loading="lazy"
          />
        )}
        <div className={styles.badges}>
          {product.isNew && <span className={styles.badgeNew}>Novo</span>}
          {product.discount && (
            <span className={styles.badgeDiscount}>-{product.discount}%</span>
          )}
        </div>
        <button
          className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistActive : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      {product.colors && (
        <div className={styles.colors}>
          {product.colors.map((color, i) => (
            <div
              key={i}
              className={styles.colorDot}
              title={color.name}
              style={{ background: color.halves[0] }}
            />
          ))}
        </div>
      )}

      <div className={styles.info}>
        <Link to={`/produto/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <div className={styles.priceRow}>
          <span className={styles.price}>
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>
              R$ {product.originalPrice.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
        {product.pixDiscount && (
          <p className={styles.pix}>
            💠 R$ {(product.price * (1 - product.pixDiscount / 100)).toFixed(2).replace('.', ',')} via Pix
          </p>
        )}
        <button className={styles.addBtn} onClick={handleAddToCart}>
          <ShoppingCart size={16} />
          Adicionar
        </button>
      </div>

      {toast && (
        <div className={styles.toast}>
          ✓ Adicionado ao carrinho!
        </div>
      )}
    </div>
  );
}