// ─────────────────────────────────────────────────────────────
// ADICIONE ISSO NO SEU ProductPage.jsx
// ─────────────────────────────────────────────────────────────

// 1. No topo do arquivo, junto dos outros imports:
import ReviewSystem from '../components/ReviewSystem';
import { useAuth } from '../context/AuthContext';

// 2. Dentro do componente, antes do return:
const { user } = useAuth();

const hasPurchased = (() => {
  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.some((order) =>
      order.cartItems?.some((item) => item.id === product.id)
    );
  } catch { return false; }
})();

// 3. No JSX, adicione ANTES do fechamento do <main> ou depois da
//    descrição do produto — onde fizer mais sentido visualmente:
<div className="container">
  <ReviewSystem
    productId={product.id}
    userName={
      user?.displayName ||
      user?.email?.split('@')[0] ||
      'Anônimo'
    }
    hasPurchased={hasPurchased}
  />
</div>

// ─────────────────────────────────────────────────────────────
// TAMBÉM: adicione no CheckoutPage.module.css o estilo do banner
// ─────────────────────────────────────────────────────────────

/*
.addressBanner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  color: #1e40af;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.addressBannerBtn {
  font-weight: 700;
  color: var(--color-primary);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0;
}
.addressBannerBtn:hover { color: var(--color-primary-dark); }
*/