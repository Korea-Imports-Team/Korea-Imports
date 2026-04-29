import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './OrdersPage.module.css';

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace('.', ',')}`;

const STATUS_CONFIG = {
    em_transito: { label: 'Em trânsito',       color: '#1353a7', bg: '#eff6ff' },
    entregue:    { label: 'Entregue',           color: '#16a34a', bg: '#dcfce7' },
    aguardando:  { label: 'Aguard. pagamento',  color: '#d97706', bg: '#fffbeb' },
    cancelado:   { label: 'Cancelado',          color: '#dc2626', bg: '#fee2e2' },
};

const PAYMENT_LABELS = {
    pix: 'Pix', credito: 'Cartão de Crédito',
    debito: 'Cartão de Débito', boleto: 'Boleto',
};

const SHIPPING_LABELS = {
    economica: 'Econômica (10–15 dias)',
    padrao:    'Padrão (5–7 dias)',
    expressa:  'Expressa (2–3 dias)',
};

function TrackingTimeline({ steps = [] }) {
    return (
        <div className={styles.timeline}>
            {steps.map((step, idx) => (
                <div key={idx} className={styles.timelineItem}>
                    <div className={styles.timelineLeft}>
                        <div className={`${styles.timelineDot} ${step.done ? styles.timelineDotDone : styles.timelineDotPending}`}>
                            {step.done && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                    stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`${styles.timelineLine} ${step.done ? styles.timelineLineDone : ''}`} />
                        )}
                    </div>
                    <div className={styles.timelineContent}>
                        <p className={`${styles.timelineLabel} ${!step.done ? styles.timelineLabelPending : ''}`}>
                            {step.label}
                        </p>
                        {step.date && <p className={styles.timelineDate}>{step.date}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}

function OrderCard({ order }) {
    const [open, setOpen] = useState(false);
    const status  = STATUS_CONFIG[order.status] || STATUS_CONFIG.aguardando;
    const dateStr = new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
        <div className={styles.orderCard}>
            {/* Header */}
            <div className={styles.orderHeader}>
                <div className={styles.orderHeaderLeft}>
                    <div className={styles.orderIconWrap}>
                        <Package size={18} color="var(--color-primary)" />
                    </div>
                    <div>
                        <p className={styles.orderId}>{order.id}</p>
                        <p className={styles.orderDate}>{dateStr}</p>
                    </div>
                </div>
                <div className={styles.orderHeaderRight}>
                    <span className={styles.statusBadge} style={{ color: status.color, background: status.bg }}>
                        {status.label}
                    </span>
                    <span className={styles.orderTotal}>{fmt(order.total)}</span>
                    <button className={styles.toggleBtn} onClick={() => setOpen((o) => !o)}>
                        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {/* Preview das imagens */}
            <div className={styles.itemsPreview}>
                {(order.cartItems || []).slice(0, 3).map((item, i) => (
                    <img
                        key={i}
                        src={item.image}
                        alt={item.name}
                        className={styles.itemThumb}
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                ))}
                {(order.cartItems || []).length > 3 && (
                    <div className={styles.itemThumbMore}>+{order.cartItems.length - 3}</div>
                )}
                <span className={styles.itemCount}>
                    {(order.cartItems || []).reduce((a, i) => a + i.quantity, 0)} item(s)
                    {order.paymentMethod ? ` · ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}` : ''}
                </span>
            </div>

            {/* Expandable */}
            {open && (
                <div className={styles.orderBody}>

                    {/* Itens detalhados */}
                    <div className={styles.orderSection}>
                        <h4 className={styles.orderSectionTitle}>Itens do Pedido</h4>
                        {(order.cartItems || []).map((item, i) => (
                            <div key={i} className={styles.orderItem}>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className={styles.orderItemImg}
                                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                                />
                                <div className={styles.orderItemInfo}>
                                    <p className={styles.orderItemName}>{item.name}</p>
                                    <p className={styles.orderItemMeta}>
                                        {item.selectedSize && `${item.selectedSize} · `}Qtd: {item.quantity}
                                    </p>
                                </div>
                                <p className={styles.orderItemPrice}>{fmt(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Resumo de valores */}
                    <div className={styles.orderSection}>
                        <h4 className={styles.orderSectionTitle}>Valores</h4>
                        <div className={styles.valueRow}>
                            <span>Subtotal</span><span>{fmt(order.subtotal || 0)}</span>
                        </div>
                        <div className={styles.valueRow}>
                            <span>Frete ({SHIPPING_LABELS[order.shippingOption] || 'Padrão'})</span>
                            <span>{fmt(order.shippingPrice || 0)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className={`${styles.valueRow} ${styles.valueDiscount}`}>
                                <span>Desconto{order.couponApplied ? ` (${order.couponApplied})` : ''}</span>
                                <span>- {fmt(order.discount)}</span>
                            </div>
                        )}
                        <div className={`${styles.valueRow} ${styles.valueTotal}`}>
                            <span>Total</span><span>{fmt(order.total)}</span>
                        </div>
                    </div>

                    {/* Endereço */}
                    {order.form && (
                        <div className={styles.orderSection}>
                            <h4 className={styles.orderSectionTitle}>Endereço de Entrega</h4>
                            <p className={styles.addressLine}>{order.form.name}</p>
                            <p className={styles.addressLine}>
                                {order.form.address}{order.form.number ? `, ${order.form.number}` : ''}
                                {order.form.complement ? ` – ${order.form.complement}` : ''}
                            </p>
                            <p className={styles.addressLine}>
                                {order.form.neighborhood} – {order.form.city}/{order.form.state}
                            </p>
                            <p className={styles.addressLine}>CEP: {order.form.cep}</p>
                        </div>
                    )}

                    {/* Rastreamento */}
                    <div className={styles.orderSection}>
                        <h4 className={styles.orderSectionTitle}>Rastreamento</h4>
                        <TrackingTimeline steps={order.tracking || []} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    // ✅ Lê pedidos reais do localStorage
    const orders = (() => {
        try {
            return JSON.parse(localStorage.getItem('orders') || '[]');
        } catch {
            return [];
        }
    })();

    return (
        <main className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Meus Pedidos</h1>
                        <p className={styles.sub}>
                            {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link to="/catalogo" className={styles.btnCatalog}>
                        Continuar Comprando
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className={styles.empty}>
                        <Package size={48} color="var(--color-gray-400)" />
                        <p>Você ainda não fez nenhum pedido.</p>
                        <Link to="/catalogo" className={styles.btnCatalog}>Ver Catálogo</Link>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}