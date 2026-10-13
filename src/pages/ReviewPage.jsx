import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Truck, CreditCard } from 'lucide-react';
import styles from './ReviewPage.module.css';
import { api, ApiError } from '../services/api';

const STEPS = [
    { number: 1, label: 'Endereço', sub: 'Dados de entrega' },
    { number: 2, label: 'Frete', sub: 'Método de envio' },
    { number: 3, label: 'Pagamento', sub: 'Forma de pagamento' },
    { number: 4, label: 'Revisão', sub: 'Confirmar pedido' },
];

const CURRENT_STEP = 4;

const fmt = (n) => `R$ ${n.toFixed(2).replace('.', ',')}`;

const SHIPPING_LABELS = {
    economica: 'Econômica (10 a 15 dias)',
    padrao: 'Padrão (5 a 7 dias)',
    expressa: 'Expressa (2 a 3 dias)',
};

const PAYMENT_LABELS = {
    credito: 'Cartão de Crédito',
    debito: 'Cartão de Débito',
    pix: 'Pix',
    boleto: 'Boleto Bancário',
};

export default function ReviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const {
        form = {},
        cartItems = [],
        subtotal = 0,
        shippingOption,
        shippingPrice = 0,
        paymentMethod = 'pix',
        cardName,
    } = state;

    const [couponInput, setCouponInput] = useState('');
    const [couponApplied, setCouponApplied] = useState(state.couponApplied || '');
    const [couponDiscount, setCouponDiscount] = useState(state.couponDiscount || 0);
    const [couponError, setCouponError] = useState('');
    const [loading, setLoading] = useState(false);

    const discountAmt = (subtotal * couponDiscount) / 100;
    const total = subtotal + shippingPrice - discountAmt;

    async function handleApplyCoupon() {
        const code = couponInput.trim().toUpperCase();
        if (!code) return;
        try {
            const result = await api.post('/coupons/validate', { code, subtotal }, { auth: false });
            setCouponDiscount(result.discountPercentage ?? result.discountAmount ?? 0);
            setCouponApplied(code);
            setCouponError('');
        } catch (err) {
            setCouponError(err instanceof ApiError ? err.message : 'Cupom inválido ou expirado.');
            setCouponDiscount(0);
            setCouponApplied('');
        }
    }

    function handleBack() {
        navigate('/pagamento', { state });
    }

    async function handleFinish() {
        setLoading(true);

        const shippingMethodMap = { economica: 'ECONOMICA', padrao: 'PADRAO', expressa: 'EXPRESSA' };
        const paymentMethodMap = { credito: 'CREDIT', debito: 'DEBIT', pix: 'PIX', boleto: 'BOLETO' };

        const body = {
            items: cartItems.map((item) => ({
                productId: item.id,
                size: item.selectedSize || null,
                quantity: item.quantity,
            })),
            shippingOption: shippingMethodMap[shippingOption] || shippingOption.toUpperCase(),
            paymentMethod: paymentMethodMap[paymentMethod] || paymentMethod.toUpperCase(),
            shippingAddress: {
                name: form.name,
                street: form.address,
                number: form.number,
                complement: form.complement || null,
                neighborhood: form.neighborhood,
                city: form.city,
                state: form.state,
                cep: form.cep,
            },
            couponCode: couponApplied || null,
        };

        try {
            const order = await api.post('/orders', body);
            navigate('/confirmacao', {
                state: {
                    ...state,
                    orderId: order.id,
                    couponApplied,
                    couponDiscount,
                    discount: Number(order.discount),
                    total: Number(order.total),
                    paymentMethod,
                    createdAt: order.createdAt,
                },
            });
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'Erro ao finalizar pedido. Tente novamente.';
            alert(msg);
            setLoading(false);
        }
    }

    return (
        <main className={styles.page}>
            <div className="container">

                {/* Stepper */}
                <div className={styles.stepper}>
                    {STEPS.map((step, idx) => {
                        const isActive = step.number === CURRENT_STEP;
                        const isCompleted = step.number < CURRENT_STEP;
                        return (
                            <div key={step.number} className={styles.stepperItem}>
                                {idx > 0 && (
                                    <div className={`${styles.stepLine} ${isCompleted ? styles.stepLineDone : ''}`} />
                                )}
                                <div className={styles.stepCircleWrap}>
                                    <div className={`${styles.stepCircle} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepDone : ''}`}>
                                        {isCompleted ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        ) : step.number}
                                    </div>
                                    <div className={styles.stepLabels}>
                                        <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''} ${isCompleted ? styles.stepLabelDone : ''}`}>
                                            {step.label}
                                        </span>
                                        <span className={styles.stepSub}>{step.sub}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.layout}>
                    <div className={styles.leftCol}>
                        <h2 className={styles.pageTitle}>Revisar Pedido</h2>
                        <p className={styles.pageSub}>Confira os dados antes de finalizar</p>

                        {/* Endereço */}
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewCardHeader}>
                                <div className={styles.reviewCardTitle}>
                                    <MapPin size={17} className={styles.reviewIcon} />
                                    Endereço de Entrega
                                </div>
                                <button className={styles.editBtn} onClick={() => navigate('/checkout', { state })}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Editar
                                </button>
                            </div>
                            <div className={styles.reviewCardBody}>
                                <p className={styles.reviewName}>{form.name}</p>
                                <p className={styles.reviewText}>{form.address}{form.number ? `, ${form.number}` : ''}{form.complement ? ` - ${form.complement}` : ''}</p>
                                <p className={styles.reviewText}>{form.neighborhood} – {form.city}/{form.state}</p>
                                <p className={styles.reviewText}>CEP: {form.cep}</p>
                            </div>
                        </div>

                        {/* Frete */}
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewCardHeader}>
                                <div className={styles.reviewCardTitle}>
                                    <Truck size={17} className={styles.reviewIcon} />
                                    Método de Entrega
                                </div>
                                <button className={styles.editBtn} onClick={() => navigate('/frete', { state })}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Editar
                                </button>
                            </div>
                            <div className={styles.reviewCardBody}>
                                <p className={styles.reviewHighlight}>{SHIPPING_LABELS[shippingOption] || 'Padrão'}</p>
                                <p className={styles.reviewText}>{fmt(shippingPrice)}</p>
                            </div>
                        </div>

                        {/* Pagamento */}
                        <div className={styles.reviewCard}>
                            <div className={styles.reviewCardHeader}>
                                <div className={styles.reviewCardTitle}>
                                    <CreditCard size={17} className={styles.reviewIcon} />
                                    Forma de Pagamento
                                </div>
                                <button className={styles.editBtn} onClick={() => navigate('/pagamento', { state })}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Editar
                                </button>
                            </div>
                            <div className={styles.reviewCardBody}>
                                <p className={styles.reviewHighlight}>{PAYMENT_LABELS[paymentMethod] || paymentMethod}</p>
                                {cardName && <p className={styles.reviewText}>{cardName}</p>}
                            </div>
                        </div>

                        {/* Botões */}
                        <div className={styles.actions}>
                            <button type="button" className={styles.btnBack} onClick={handleBack}>Voltar</button>
                            <button
                                type="button"
                                className={styles.btnFinish}
                                onClick={handleFinish}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className={styles.spinner} />
                                ) : 'Finalizar Compra'}
                            </button>
                        </div>
                    </div>

                    {/* Resumo */}
                    <div className={styles.rightCol}>
                        <div className={styles.summary}>
                            <h2 className={styles.summaryTitle}>Resumo do Pedido</h2>
                            <div className={styles.summaryItems}>
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.selectedSize}`} className={styles.summaryItem}>
                                        <img src={item.image} alt={item.name} className={styles.summaryItemImg} />
                                        <div className={styles.summaryItemInfo}>
                                            <span className={styles.summaryItemName}>{item.name}</span>
                                            {item.selectedSize && (
                                                <span className={styles.summaryItemMeta}>{item.selectedSize} • Qtd: {item.quantity}</span>
                                            )}
                                            <span className={styles.summaryItemPrice}>{fmt(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.totals}>
                                <div className={styles.totalRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                                <div className={styles.totalRow}><span>Frete</span><span>{fmt(shippingPrice)}</span></div>
                                {couponDiscount > 0 && (
                                    <div className={`${styles.totalRow} ${styles.discountRow}`}>
                                        <span>Desconto</span><span>- {fmt(discountAmt)}</span>
                                    </div>
                                )}
                                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                                    <span>Total</span><span>{fmt(total)}</span>
                                </div>
                            </div>
                            <div className={styles.couponSection}>
                                <p className={styles.couponLabel}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                                        <line x1="7" y1="7" x2="7.01" y2="7" />
                                    </svg>
                                    Cupom de Desconto
                                </p>
                                <div className={styles.couponRow}>
                                    <input
                                        className={styles.couponInput}
                                        placeholder="Digite o cupom"
                                        value={couponApplied || couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        disabled={!!couponApplied}
                                    />
                                    <button type="button" className={styles.couponBtn} onClick={handleApplyCoupon} disabled={!!couponApplied}>
                                        Aplicar
                                    </button>
                                </div>
                                {couponError && <p className={styles.couponError}>{couponError}</p>}
                                {couponApplied && <p className={styles.couponSuccess}>✓ Cupom {couponApplied} aplicado! -{couponDiscount}%</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}