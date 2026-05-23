import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, Truck, RefreshCw, Star } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewSystem from '../components/ReviewSystem';
import styles from './ProductPage.module.css';

// ─── Stock urgency helper ────────────────────────────────────────────────────
function getStockInfo(product, size) {
  const isOut = product.sizesOutOfStock?.includes(size);
  if (isOut) return { qty: 0, label: null, urgency: 'out' };
  const seed = (product.id * size.charCodeAt(0)) % 15;
  if (seed <= 1) return { qty: seed + 1, label: `Última${seed === 0 ? '' : 's'} ${seed + 1} unidade${seed === 0 ? '' : 's'}`, urgency: 'critical' };
  if (seed <= 4) return { qty: seed, label: `Restam ${seed} unidades`, urgency: 'low' };
  return { qty: seed + 5, label: null, urgency: 'ok' };
}

// ─── Lê avaliações do produto ─────────────────────────────────────────────────
function getProductReviews(productId) {
  try {
    const all = JSON.parse(localStorage.getItem('reviews') || '{}');
    return all[productId] || [];
  } catch { return []; }
}

// ─── Mini display de estrelas ─────────────────────────────────────────────────
function StarRow({ value, count, onClick }) {
  return (
    <button className={styles.starRow} onClick={onClick} title="Ver avaliações">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          fill={value >= n ? '#F59E0B' : 'none'}
          stroke={value >= n ? '#F59E0B' : '#D1D5DB'}
          strokeWidth={1.5}
        />
      ))}
      <span className={styles.starAvg}>{value > 0 ? value.toFixed(1) : '—'}</span>
      <span className={styles.starCount}>
        {count > 0 ? `(${count} avaliação${count !== 1 ? 'ões' : ''})` : 'Sem avaliações — seja o primeiro!'}
      </span>
    </button>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const product = useMemo(() => products.find((p) => p.id === Number(id)), [id]);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize]  = useState(null);
  // ✅ 'avaliacoes' adicionado como terceira aba
  const [activeTab, setActiveTab]        = useState('descricao');
  const [error, setError]                = useState('');
  const [toast, setToast]                = useState(false);

  if (!product) {
    return (
      <main className={styles.notFound}>
        <p>Produto não encontrado.</p>
        <Link to="/catalogo">← Voltar ao catálogo</Link>
      </main>
    );
  }

  // ─── Dados de avaliações ───────────────────────────────────────────────────
  const reviews    = getProductReviews(product.id);
  const reviewCount = reviews.length;
  const reviewAvg  = reviewCount > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : 0;

  // ─── Compra verificada ────────────────────────────────────────────────────
  const hasPurchased = (() => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      return orders.some((o) => o.cartItems?.some((item) => item.id === product.id));
    } catch { return false; }
  })();

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Anônimo';

  const images   = [product.image, ...(product.imageBack ? [product.imageBack] : [])];
  const inWishlist = isInWishlist(product.id);

  function prevImage() {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }
  function nextImage() {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  function handleAddToCart(isBuy = false) {
    if (product.sizes && (!selectedSize || selectedSize === '')) {
      setError('Selecione um tamanho antes de continuar');
      setTimeout(() => {
        document.querySelector('#sizes-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setError('');
    addToCart({ ...product, selectedSize });
    if (isBuy) {
      navigate('/carrinho');
    } else {
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    }
  }

  // ✅ Rola até as tabs e abre aba de avaliações
  function goToReviews() {
    setActiveTab('avaliacoes');
    setTimeout(() => {
      document.querySelector('#tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  const installment = (product.price / 3).toFixed(2).replace('.', ',');

  // ✅ Definição das 3 tabs
  const TABS = [
    { id: 'descricao',  label: 'Descrição' },
    { id: 'guia',       label: 'Guia de Tamanhos' },
    {
      id: 'avaliacoes',
      label: reviewCount > 0 ? `Avaliações (${reviewCount})` : 'Avaliações',
    },
  ];

  return (
    <main className={styles.page}>
      <div className="container">
        <Link to="/catalogo" className={styles.back}>
          <ArrowLeft size={16} />
          Voltar ao catálogo
        </Link>

        <div className={styles.layout}>
          {/* Carrossel */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              <img
                src={images[currentImage]}
                alt={`${product.name} - foto ${currentImage + 1}`}
                className={styles.image}
              />
              <div className={styles.badges}>
                {product.isNew      && <span className={styles.badgeNew}>Novo</span>}
                {product.discount   && <span className={styles.badgeDiscount}>-{product.discount}%</span>}
              </div>

              <button
                className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistActive : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-label="Favoritar"
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>

              {images.length > 1 && (
                <>
                  <button className={`${styles.carouselBtn} ${styles.carouselPrev}`} onClick={prevImage} aria-label="Foto anterior">
                    <ChevronLeft size={20} />
                  </button>
                  <button className={`${styles.carouselBtn} ${styles.carouselNext}`} onClick={nextImage} aria-label="Próxima foto">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${currentImage === i ? styles.thumbActive : ''}`}
                    onClick={() => setCurrentImage(i)}
                  >
                    <img src={img} alt={`Foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.infoCol}>
            <h1 className={styles.name}>{product.name}</h1>

            {/* ✅ Nota média clicável — leva direto para aba de avaliações */}
            <StarRow value={reviewAvg} count={reviewCount} onClick={goToReviews} />

            <div className={styles.priceBlock}>
              <span className={styles.price}>
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
              <p className={styles.installment}>ou 3x de R$ {installment} sem juros</p>
            </div>

            {/* Tamanhos */}
            {product.sizes && (
              <div className={styles.sizesBlock}>
                <div className={styles.sizesHeader}>
                  <span className={styles.sizesLabel}>Selecione o tamanho</span>
                  <button
                    className={styles.sizeGuideBtn}
                    onClick={() => {
                      setActiveTab('guia');
                      setTimeout(() => {
                        document.querySelector('#tabs')?.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }}
                  >
                    Guia de tamanhos
                  </button>
                </div>
                <div className={styles.sizes}>
                  {product.sizes.map((size) => {
                    const outOfStock = product.sizesOutOfStock?.includes(size);
                    const stock = getStockInfo(product, size);
                    return (
                      <div key={size} className={styles.sizeWrap}>
                        <button
                          className={[
                            styles.sizeBtn,
                            selectedSize === size ? styles.sizeBtnActive : '',
                            outOfStock ? styles.sizeBtnDisabled : '',
                            stock.urgency === 'critical' && !outOfStock ? styles.sizeBtnCritical : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => { if (!outOfStock) { setSelectedSize(size); setError(''); } }}
                          disabled={outOfStock}
                          title={outOfStock ? 'Sem estoque' : stock.label || ''}
                        >
                          {size}
                          {stock.urgency === 'critical' && !outOfStock && (
                            <span className={styles.sizeDot} />
                          )}
                        </button>
                        {selectedSize === size && stock.label && !outOfStock && (
                          <span className={[
                            styles.stockLabel,
                            stock.urgency === 'critical' ? styles.stockCritical : styles.stockLow,
                          ].join(' ')}>
                            {stock.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedSize && getStockInfo(product, selectedSize).urgency === 'critical' &&
                  !product.sizesOutOfStock?.includes(selectedSize) && (
                  <div className={styles.stockWarning}>
                    🔥 Alta demanda! Este tamanho está quase esgotado.
                  </div>
                )}

                {error && <div id="sizes-error" className={styles.errorCard}>⚠️ {error}</div>}
              </div>
            )}

            <p className={styles.inStock}>✓ Em estoque</p>

            <div className={styles.actions}>
              <button className={styles.buyBtn} onClick={() => handleAddToCart(true)}>
                <ShoppingCart size={18} /> Comprar
              </button>
              <button className={styles.addBtn} onClick={() => handleAddToCart(false)}>
                <ShoppingCart size={18} /> Adicionar ao Carrinho
              </button>
            </div>

            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <Truck size={20} className={styles.infoCardIcon} />
                <div>
                  <span className={styles.infoCardTitle}>Frete Grátis</span>
                  <span className={styles.infoCardDesc}>Em compras acima de R$ 200</span>
                </div>
              </div>
              <div className={styles.infoCard}>
                <RefreshCw size={20} className={styles.infoCardIcon} />
                <div>
                  <span className={styles.infoCardTitle}>Troca Garantida</span>
                  <span className={styles.infoCardDesc}>7 dias para trocar ou devolver</span>
                </div>
              </div>
            </div>

            <div className={styles.tags}>
              {product.tags.map((tag) => (
                <span key={tag} className={styles.tag}>#{tag}</span>
              ))}
            </div>

            {/* ✅ CTA de avaliação se comprou e não avaliou ainda */}
            {hasPurchased && !reviews.some((r) => r.userName === userName) && (
              <button className={styles.reviewCta} onClick={goToReviews}>
                <Star size={15} fill="#F59E0B" stroke="#F59E0B" />
                Você comprou este produto — deixe sua avaliação!
              </button>
            )}
          </div>
        </div>

        {/* ✅ Tabs com 3 opções: Descrição | Guia | Avaliações */}
        <div className={styles.tabs} id="tabs">
          <div className={styles.tabsHeader}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {/* Indicador visual na aba de avaliações */}
                {tab.id === 'avaliacoes' && reviewCount > 0 && (
                  <span className={styles.tabBadge}>{reviewAvg.toFixed(1)} ★</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'descricao' && (
              <p className={styles.desc}>
                Do streetwear ao casual, essa peça se adapta ao seu estilo. Confortável, durável e com aquele acabamento que você sente na primeira vez que veste.
              </p>
            )}

            {activeTab === 'guia' && (
              <table className={styles.sizeTable}>
                <thead>
                  <tr>
                    <th>Tamanho</th><th>Largura (cm)</th><th>Comprimento (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>P</td><td>52</td><td>68</td></tr>
                  <tr><td>M</td><td>55</td><td>71</td></tr>
                  <tr><td>G</td><td>58</td><td>74</td></tr>
                  <tr><td>GG</td><td>61</td><td>77</td></tr>
                </tbody>
              </table>
            )}

            {/* ✅ Avaliações dentro da aba */}
            {activeTab === 'avaliacoes' && (
              <ReviewSystem
                productId={product.id}
                userName={userName}
                hasPurchased={hasPurchased}
              />
            )}
          </div>
        </div>

      </div>

      {toast && <div className={styles.toast}>✓ Adicionado ao carrinho!</div>}
    </main>
  );
}