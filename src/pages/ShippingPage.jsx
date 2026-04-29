import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Truck, Zap, Package } from 'lucide-react';
import styles from './ShippingPage.module.css';

const SHIPPING_OPTIONS = [
    {
        id: 'economica',
        label: 'Econômica',
        sub: '10 a 15 dias úteis',
        price: 15.90,
        icon: Package,
    },
    {
        id: 'padrao',
        label: 'Padrão',
        sub: '5 a 7 dias úteis',
        price: 25.90,
        icon: Truck,
    },
    {
        id: 'expressa',
        label: 'Expressa',
        sub: '2 a 3 dias úteis',
        price: 39.90,
        icon: Zap,
    },
];

const STEPS = [
    { number: 1, label: 'Endereço',  sub: 'Dados de entrega' },
    { number: 2, label: 'Frete',     sub: 'Método de envio' },
    { number: 3, label: 'Pagamento', sub: 'Forma de pagamento' },
    { number: 4, label: 'Revisão',   sub: 'Confirmar pedido' },
];

const CURRENT_STEP = 2;

const fmt = (n) => `R$ ${n.toFixed(2).replace('.', ',')}`;

export default function ShippingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const { form, cartItems = [], subtotal = 0, discount = 0 } = state;

    const [selected, setSelected] = useState('padrao');
    const [couponInput, setCouponInput]   = useState('');
    const [couponApplied, setCouponApplied] = useState(state.couponApplied || '');
    const [couponDiscount, setCouponDiscount] = useState(state.couponDiscount || 0);
    const [couponError, setCouponError]   = useState('');

    const VALID_COUPONS = { 'BEMVINDO10': 10, 'KOREA15': 15 };

    const shippingPrice = SHIPPING_OPTIONS.find((o) => o.id === selected)?.price ?? 0;
    const discountAmt   = (subtotal * couponDiscount) / 100;
    const total         = subtotal + shippingPrice - discountAmt;

    function handleApplyCoupon() {
        const code = couponInput.trim().toUpperCase();
        if (VALID_COUPONS[code]) {
            setCouponDiscount(VALID_COUPONS[code]);
            setCouponApplied(code);
            setCouponError('');
        } else {
            setCouponError('Cupom inválido ou expirado.');
            setCouponDiscount(0);
            setCouponApplied('');
        }
    }

    function handleContinue() {
        navigate('/pagamento', {
            state: {
                ...state,
                shippingOption: selected,
                shippingPrice,
                couponApplied,
                couponDiscount,
                discount: discountAmt,
                total,
            },
        });
    }

    function handleBack() {
        navigate('/checkout', { state });
    }

    return (
        <main className={styles.page}>
            <div className="container">

                {/* ── Stepper ── */}
                <div className={styles.stepper}>
                    {STEPS.map((step, idx) => {
                        const isActive    = step.number === CURRENT_STEP;
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

                {/* ── Content ── */}
                <div className={styles.layout}>
                    {/* Left col */}
                    <div className={styles.leftCol}>
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Truck size={20} className={styles.sectionIcon} />
                                <div>
                                    <h2 className={styles.sectionTitle}>Método de Entrega</h2>
                                    <p className={styles.sectionSub}>Escolha como deseja receber seu pedido</p>
                                </div>
                            </div>

                            <div className={styles.options}>
                                {SHIPPING_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = selected === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                                            onClick={() => setSelected(opt.id)}
                                        >
                                            <div className={`${styles.optionIconWrap} ${isSelected ? styles.optionIconActive : ''}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className={styles.optionInfo}>
                                                <span className={styles.optionLabel}>{opt.label}</span>
                                                <span className={styles.optionSub}>{opt.sub}</span>
                                            </div>
                                            <span className={`${styles.optionPrice} ${isSelected ? styles.optionPriceActive : ''}`}>
                                                {fmt(opt.price)}
                                            </span>
                                            <div className={`${styles.radio} ${isSelected ? styles.radioSelected : ''}`}>
                                                {isSelected && <div className={styles.radioDot} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Botões */}
                            <div className={styles.actions}>
                                <button type="button" className={styles.btnBack} onClick={handleBack}>
                                    Voltar
                                </button>
                                <button type="button" className={styles.btnContinue} onClick={handleContinue}>
                                    Continuar para Pagamento
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right col — Resumo */}
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
                                                <span className={styles.summaryItemMeta}>
                                                    {item.selectedSize} • Qtd: {item.quantity}
                                                </span>
                                            )}
                                            <span className={styles.summaryItemPrice}>
                                                {fmt(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cupom */}
                            <div className={styles.couponSection}>
                                <p className={styles.couponLabel}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                                        <line x1="7" y1="7" x2="7.01" y2="7"/>
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
                                    <button
                                        type="button"
                                        className={styles.couponBtn}
                                        onClick={handleApplyCoupon}
                                        disabled={!!couponApplied}
                                    >
                                        Aplicar
                                    </button>
                                </div>
                                {couponError && <p className={styles.couponError}>{couponError}</p>}
                                {couponApplied && (
                                    <p className={styles.couponSuccess}>✓ Cupom aplicado! -{couponDiscount}%</p>
                                )}
                            </div>

                            {/* Totais */}
                            <div className={styles.totals}>
                                <div className={styles.totalRow}>
                                    <span>Subtotal</span>
                                    <span>{fmt(subtotal)}</span>
                                </div>
                                <div className={styles.totalRow}>
                                    <span>Frete</span>
                                    <span>{fmt(shippingPrice)}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className={`${styles.totalRow} ${styles.discountRow}`}>
                                        <span>Desconto</span>
                                        <span>- {fmt(discountAmt)}</span>
                                    </div>
                                )}
                                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                                    <span>Total</span>
                                    <span>{fmt(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}