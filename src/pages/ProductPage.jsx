import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, Truck, RefreshCw } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();
  const product = useMemo(() => products.find((p) => p.id === Number(id)), [id]);
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('descricao');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(false);

  if (!product) {
    return (
      <main className={styles.notFound}>
        <p>Produto não encontrado.</p>
        <Link to="/catalogo">← Voltar ao catálogo</Link>
      </main>
    );
  }

  const images = [product.image, ...(product.imageBack ? [product.imageBack] : [])];
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
        document.querySelector('#sizes-error')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
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

  const installment = (product.price / 3).toFixed(2).replace('.', ',');

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
                {product.isNew && <span className={styles.badgeNew}>Novo</span>}
                {product.discount && <span className={styles.badgeDiscount}>-{product.discount}%</span>}
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
                    return (
                      <button
                        key={size}
                        className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ''} ${outOfStock ? styles.sizeBtnDisabled : ''}`}
                        onClick={() => {
                          if (!outOfStock) {
                            setSelectedSize(size);
                            setError('');
                          }
                        }}
                        disabled={outOfStock}
                        title={outOfStock ? 'Sem estoque' : ''}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {error && (
                  <div id="sizes-error" className={styles.errorCard}>
                    ⚠️ {error}
                  </div>
                )}
              </div>
            )}

            {/* Em estoque */}
            <p className={styles.inStock}>✓ Em estoque</p>

            {/* Botões */}
            <div className={styles.actions}>
              <button className={styles.buyBtn} onClick={() => handleAddToCart(true)}>
                <ShoppingCart size={18} />
                Comprar
              </button>
              <button className={styles.addBtn} onClick={() => handleAddToCart(false)}>
                <ShoppingCart size={18} />
                Adicionar ao Carrinho
              </button>
            </div>

            {/* Frete e Troca */}
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

            {/* Tags */}
            <div className={styles.tags}>
              {product.tags.map((tag) => (
                <span key={tag} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} id="tabs">
          <div className={styles.tabsHeader}>
            {['descricao', 'guia'].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'descricao' ? 'Descrição' : 'Guia de Tamanhos'}
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
                    <th>Tamanho</th>
                    <th>Largura (cm)</th>
                    <th>Comprimento (cm)</th>
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
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          ✓ Adicionado ao carrinho!
        </div>
      )}
    </main>
  );
}

/**
 * ProductPage.jsx
 *
 * Página de detalhe de um produto individual.
 * Busca o produto pelo ID presente na URL (/produto/:id).
 *
 * Exibe: carrossel de imagens, tamanhos, frete, guia de tamanhos e descrição.
 */