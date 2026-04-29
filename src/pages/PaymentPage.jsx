import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import styles from './PaymentPage.module.css';

const STEPS = [
    { number: 1, label: 'Endereço',  sub: 'Dados de entrega' },
    { number: 2, label: 'Frete',     sub: 'Método de envio' },
    { number: 3, label: 'Pagamento', sub: 'Forma de pagamento' },
    { number: 4, label: 'Revisão',   sub: 'Confirmar pedido' },
];

const CURRENT_STEP = 3;

const PAYMENT_METHODS = [
    {
        id: 'credito',
        label: 'Crédito',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
        ),
    },
    {
        id: 'debito',
        label: 'Débito',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
                <line x1="6" y1="15" x2="10" y2="15"/>
            </svg>
        ),
    },
    {
        id: 'pix',
        label: 'Pix',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
        ),
    },
    {
        id: 'boleto',
        label: 'Boleto',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
                <line x1="8" y1="9"  x2="10" y2="9"/>
            </svg>
        ),
    },
];

const VALID_COUPONS = { 'BEMVINDO10': 10, 'KOREA15': 15 };
const fmt = (n) => `R$ ${n.toFixed(2).replace('.', ',')}`;

export default function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const {
        form,
        cartItems = [],
        subtotal = 0,
        shippingOption,
        shippingPrice = 0,
    } = state;

    // Cupom — herdado de telas anteriores
    const [couponInput, setCouponInput]     = useState('');
    const [couponApplied, setCouponApplied] = useState(state.couponApplied || '');
    const [couponDiscount, setCouponDiscount] = useState(state.couponDiscount || 0);
    const [couponError, setCouponError]     = useState('');

    const [selected, setSelected] = useState('credito');

    // Campos de cartão
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName]     = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv]       = useState('');
    const [installments, setInstallments] = useState('1');

    const discountAmt = (subtotal * couponDiscount) / 100;
    const total       = subtotal + shippingPrice - discountAmt;

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

    function formatCardNumber(val) {
        return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }

    function formatExpiry(val) {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
        return digits;
    }

    function handleBack() {
        navigate('/frete', { state });
    }

    function handleContinue() {
        navigate('/revisao', {
            state: {
                ...state,
                paymentMethod: selected,
                couponApplied,
                couponDiscount,
                discount: discountAmt,
                total,
                cardName: selected === 'credito' || selected === 'debito' ? cardName : undefined,
            },
        });
    }

    const isCard = selected === 'credito' || selected === 'debito';

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
                    <div className={styles.leftCol}>
                        <div className={styles.section}>

                            {/* Header */}
                            <div className={styles.sectionHeader}>
                                <CreditCard size={20} className={styles.sectionIcon} />
                                <div>
                                    <h2 className={styles.sectionTitle}>Forma de Pagamento</h2>
                                    <p className={styles.sectionSub}>Escolha como deseja pagar</p>
                                </div>
                            </div>

                            {/* Métodos */}
                            <div className={styles.methods}>
                                {PAYMENT_METHODS.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        className={`${styles.methodBtn} ${selected === m.id ? styles.methodSelected : ''}`}
                                        onClick={() => setSelected(m.id)}
                                    >
                                        <span className={`${styles.methodIcon} ${selected === m.id ? styles.methodIconActive : ''}`}>
                                            {m.icon}
                                        </span>
                                        <span className={styles.methodLabel}>{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Campos de cartão */}
                            {isCard && (
                                <div className={styles.cardFields}>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Número do Cartão</label>
                                        <input
                                            className={styles.input}
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            maxLength={19}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label className={styles.label}>Nome no Cartão</label>
                                        <input
                                            className={styles.input}
                                            placeholder="Como aparece no cartão"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <div className={styles.cardRow}>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Validade</label>
                                            <input
                                                className={styles.input}
                                                placeholder="MM/AA"
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                maxLength={5}
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>CVV</label>
                                            <input
                                                className={styles.input}
                                                placeholder="000"
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                maxLength={4}
                                            />
                                        </div>
                                        {selected === 'credito' && (
                                            <div className={styles.field}>
                                                <label className={styles.label}>Parcelas</label>
                                                <select
                                                    className={styles.select}
                                                    value={installments}
                                                    onChange={(e) => setInstallments(e.target.value)}
                                                >
                                                    {[1,2,3,4,5,6].map((n) => (
                                                        <option key={n} value={n}>
                                                            {n}x de {fmt(total / n)}
                                                            {n === 1 ? ' (sem juros)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Info Pix */}
                            {selected === 'pix' && (
                                <div className={styles.pixInfo}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                        stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                        <path d="M2 17l10 5 10-5"/>
                                        <path d="M2 12l10 5 10-5"/>
                                    </svg>
                                    <div>
                                        <p className={styles.pixTitle}>Pagamento via Pix</p>
                                        <p className={styles.pixSub}>
                                            Após confirmar o pedido, você receberá o QR Code para pagamento.
                                            O pedido é confirmado em até 5 minutos após o pagamento.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Info Boleto */}
                            {selected === 'boleto' && (
                                <div className={styles.boletoInfo}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                        stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="8" y1="13" x2="16" y2="13"/>
                                        <line x1="8" y1="17" x2="16" y2="17"/>
                                    </svg>
                                    <div>
                                        <p className={styles.boletoTitle}>Pagamento via Boleto</p>
                                        <p className={styles.boletoSub}>
                                            O boleto será gerado após a confirmação. O prazo de compensação é de
                                            até 3 dias úteis. O pedido será enviado após a confirmação do pagamento.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Botões */}
                            <div className={styles.actions}>
                                <button type="button" className={styles.btnBack} onClick={handleBack}>
                                    Voltar
                                </button>
                                <button type="button" className={styles.btnContinue} onClick={handleContinue}>
                                    Continuar para Revisão
                                </button>
                            </div>
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
                                    <p className={styles.couponSuccess}>✓ Cupom {couponApplied} aplicado! -{couponDiscount}%</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}