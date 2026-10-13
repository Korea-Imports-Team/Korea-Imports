import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';
import styles from './OrdersPage.module.css';

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace('.', ',')}`;

const STATUS_CONFIG = {
    PENDING: { label: 'Aguard. pagamento', color: '#d97706', bg: '#fffbeb' },
    PROCESSING: { label: 'Em separação', color: '#1353a7', bg: '#eff6ff' },
    SHIPPED: { label: 'Enviado', color: '#7c3aed', bg: '#f5f3ff' },
    IN_TRANSIT: { label: 'Em trânsito', color: '#0891b2', bg: '#ecfeff' },
    DELIVERED: { label: 'Entregue', color: '#16a34a', bg: '#dcfce7' },
    CANCELLED: { label: 'Cancelado', color: '#dc2626', bg: '#fee2e2' },
};

const PAYMENT_LABELS = {
    PIX: 'Pix', CREDIT: 'Cartão de Crédito',
    DEBIT: 'Cartão de Débito', BOLETO: 'Boleto',
};

const SHIPPING_LABELS = {
    ECONOMICA: 'Econômica (10–15 dias)',
    PADRAO: 'Padrão (5–7 dias)',
    EXPRESSA: 'Expressa (2–3 dias)',
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
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.aguardando;
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
                {(order.items || []).slice(0, 3).map((item, i) => (
                    <img
                        key={i}
                        src={item.productImage || item.image}
                        alt={item.productName}
                        className={styles.itemThumb}
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                    />
                ))}
                {(order.items || []).length > 3 && (
                    <div className={styles.itemThumbMore}>+{order.items.length - 3}</div>
                )}
                <span className={styles.itemCount}>
                    {(order.items || []).reduce((a, i) => a + i.quantity, 0)} item(s)
                    {order.paymentMethod ? ` · ${PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}` : ''}
                </span>
            </div>

            {/* Expandable */}
            {open && (
                <div className={styles.orderBody}>

                    {/* Itens detalhados */}
                    <div className={styles.orderSection}>
                        <h4 className={styles.orderSectionTitle}>Itens do Pedido</h4>
                        {(order.items || []).map((item, i) => {
                            const unitPrice = item.priceAtTime ?? item.price ?? 0;
                            const itemTotal = item.subtotal ?? (unitPrice * item.quantity);
                            return (
                                <div key={i} className={styles.orderItem}>
                                    <img
                                        src={item.productImage || item.image}
                                        alt={item.productName}
                                        className={styles.orderItemImg}
                                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                                    />
                                    <div className={styles.orderItemInfo}>
                                        <p className={styles.orderItemName}>{item.productName}</p>
                                        <p className={styles.orderItemMeta}>
                                            {item.size && `${item.size} · `}Qtd: {item.quantity}
                                        </p>
                                    </div>
                                    <p className={styles.orderItemPrice}>{fmt(itemTotal)}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Resumo de valores */}
                    <div className={styles.orderSection}>
                        <h4 className={styles.orderSectionTitle}>Valores</h4>
                        <div className={styles.valueRow}>
                            <span>Subtotal</span>
                            <span>
                                {fmt(
                                    order.subtotal ??
                                    (order.items || []).reduce(
                                        (sum, i) => sum + Number(i.subtotal ?? (i.priceAtTime ?? i.price ?? 0) * i.quantity),
                                        0
                                    )
                                )}
                            </span>
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
                    {order.shippingAddress && (
                        <div className={styles.orderSection}>
                            <h4 className={styles.orderSectionTitle}>Endereço de Entrega</h4>
                            <p className={styles.addressLine}>{order.shippingAddress.name}</p>
                            <p className={styles.addressLine}>
                                {order.shippingAddress.street}{order.shippingAddress.number ? `, ${order.shippingAddress.number}` : ''}
                                {order.shippingAddress.complement ? ` – ${order.shippingAddress.complement}` : ''}
                            </p>
                            <p className={styles.addressLine}>
                                {order.shippingAddress.neighborhood} – {order.shippingAddress.city}/{order.shippingAddress.state}
                            </p>
                            <p className={styles.addressLine}>CEP: {order.shippingAddress.cep}</p>
                        </div>
                    )}

                    {/* Rastreamento */}
                    <div className={styles.orderSection}>
                        <h4 className={styles.orderSectionTitle}>Rastreamento</h4>
                        {(() => {
                            let code = null;
                            try {
                                const codes = JSON.parse(localStorage.getItem('order_tracking_codes') || '{}');
                                code = codes[order.id] || order.shippingInfo?.trackingCode || null;
                            } catch (_) {
                                code = order.shippingInfo?.trackingCode || null;
                            }
                            return code ? (
                                <div className={styles.trackingBox}>
                                    <div className={styles.trackingCodeRow}>
                                        <span className={styles.trackingCodeLabel}>Código dos Correios</span>
                                        <code className={styles.trackingCode}>{code}</code>
                                    </div>
                                    <a
                                        href={`https://rastreamento.correios.com.br/app/index.php?objetos=${code}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.trackingBtn}
                                    >
                                        Rastrear nos Correios ↗
                                    </a>
                                    <p className={styles.trackingHint}>
                                        Você também pode inserir o código acima nos apps Correios, 17track ou Melhor Rastreio.
                                    </p>
                                </div>
                            ) : (
                                <TrackingTimeline steps={order.tracking || []} />
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        api.get('/orders')
            .then(setOrders)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Carregando pedidos...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '4rem', color: 'red' }}>{error}</div>;

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