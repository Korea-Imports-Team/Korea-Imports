import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { cartItems, removeFromCart, addToCart, decreaseQuantity } = useCart();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.empty}`}>
          <ShoppingBag size={48} className={styles.emptyIcon} />
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione produtos para continuar comprando.</p>
          <Link to="/catalogo" className={styles.btnShop}>Ver Catálogo</Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Meu Carrinho</h1>
        <div className={styles.layout}>
          <div className={styles.items}>
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className={styles.item}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  {item.selectedSize && (
                    <span className={styles.itemSize}>Tamanho: {item.selectedSize}</span>
                  )}
                  <span className={styles.itemQty}>Qtd: {item.quantity}</span>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.itemPrice}>
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                  <div className={styles.qtyControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => decreaseQuantity(item.id, item.selectedSize)}
                      aria-label="Diminuir"
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.qtyNum}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => addToCart(item)}
                      aria-label="Aumentar"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className={`${styles.qtyBtn} ${styles.removeBtn}`}
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      aria-label="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Resumo do Pedido</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <Link to="/checkout" className={styles.checkoutBtn}>
              Finalizar Compra
              <ArrowRight size={16} />
            </Link>
            <Link to="/catalogo" className={styles.continueShopping}>Continuar comprando</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * CartPage.jsx
 *
 * Página do carrinho de compras.
 * Lista os produtos adicionados, permite remover itens,
 * aumentar/diminuir quantidade e exibe o resumo do pedido.
 */

