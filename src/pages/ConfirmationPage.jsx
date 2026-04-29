import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './ConfirmationPage.module.css';

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace('.', ',')}`;

function FakeQRCode() {
    const pattern = [
        [1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,1,0,0],[1,0,1,1,1,0,1,0,1],
        [1,0,1,1,1,0,1,0,1],[1,0,0,0,0,0,1,0,0],[1,1,1,1,1,1,1,0,1],
        [0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,0,1,0],[1,1,1,0,1,0,1,1,1],
    ];
    const cell = 18;
    return (
        <svg width={9 * cell} height={9 * cell} viewBox={`0 0 ${9 * cell} ${9 * cell}`}>
            {pattern.map((row, y) => row.map((v, x) => v
                ? <rect key={`${x}-${y}`} x={x*cell} y={y*cell} width={cell-1} height={cell-1} fill="#0D0D0D" rx="2"/>
                : null
            ))}
        </svg>
    );
}

export default function ConfirmationPage() {
    const location = useLocation();
    const navigate  = useNavigate();
    const { clearCart } = useCart();
    const saved = useRef(false);
    const state = location.state || {};

    const {
        orderId = `KI-${Date.now().toString().slice(-8)}`,
        paymentMethod = 'pix',
        cartItems = [],
        subtotal = 0,
        shippingPrice = 0,
        shippingOption,
        discount = 0,
        total = 0,
        form = {},
        createdAt = new Date().toISOString(),
        couponApplied,
        couponDiscount = 0,
    } = state;

    const pixCode    = `00020126580014BR.GOV.BCB.PIX0136korea-imports@pix.com.br520400005303986540${total.toFixed(2)}5802BR5913KoreaImports6009SAOPAULO6304${orderId.slice(-4)}`;
    const boletoCode = `23793.38128 60007.827136 91000.063305 1 ${Math.floor(total * 100).toString().padStart(14, '0')}`;

    // ✅ Salva o pedido no localStorage uma única vez
    useEffect(() => {
        if (saved.current) return;
        saved.current = true;

        clearCart();

        const newOrder = {
            id: orderId,
            createdAt,
            paymentMethod,
            shippingOption,
            shippingPrice,
            subtotal,
            discount,
            total,
            couponApplied,
            couponDiscount,
            form,
            cartItems,
            status: paymentMethod === 'credito' || paymentMethod === 'debito'
                ? 'em_transito'
                : 'aguardando',
            tracking: [
                { date: new Date(createdAt).toLocaleString('pt-BR'), label: 'Pedido confirmado', done: true },
                { date: paymentMethod === 'credito' || paymentMethod === 'debito'
                    ? new Date(createdAt).toLocaleString('pt-BR') : '',
                  label: 'Pagamento aprovado',
                  done: paymentMethod === 'credito' || paymentMethod === 'debito' },
                { date: '', label: 'Em separação no estoque', done: false },
                { date: '', label: 'Enviado para transportadora', done: false },
                { date: '', label: 'Em trânsito', done: false },
                { date: '', label: 'Entregue', done: false },
            ],
        };

        try {
            const existing = JSON.parse(localStorage.getItem('orders') || '[]');
            localStorage.setItem('orders', JSON.stringify([newOrder, ...existing]));
        } catch { /* silent */ }
    }, []);

    const dateStr = new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
        <main className={styles.page}>
            <div className="container">
                <div className={styles.wrapper}>

                    {/* Cabeçalho */}
                    <div className={styles.successHeader}>
                        <div className={styles.checkCircle}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <h1 className={styles.successTitle}>Pedido Realizado!</h1>
                            <p className={styles.successSub}>
                                Obrigado, {form.name?.split(' ')[0] || 'cliente'}! Seu pedido <strong>{orderId}</strong> foi recebido.
                            </p>
                            <p className={styles.successDate}>{dateStr}</p>
                        </div>
                    </div>

                    <div className={styles.layout}>
                        <div className={styles.leftCol}>

                            {/* PIX */}
                            {paymentMethod === 'pix' && (
                                <div className={styles.paymentBox}>
                                    <div className={styles.paymentBoxHeader}>
                                        <div className={styles.paymentBoxIcon} style={{ background: '#dcfce7' }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2L2 7l10 5 10-5-10-5"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className={styles.paymentBoxTitle}>Pague via Pix</h3>
                                            <p className={styles.paymentBoxSub}>Confirmado em até 5 minutos após o pagamento</p>
                                        </div>
                                    </div>
                                    <div className={styles.pixContent}>
                                        <div className={styles.qrWrap}>
                                            <FakeQRCode />
                                            <p className={styles.qrLabel}>Escaneie o QR Code</p>
                                        </div>
                                        <div className={styles.pixOr}>ou</div>
                                        <div className={styles.pixCodeWrap}>
                                            <p className={styles.pixCodeLabel}>Pix Copia e Cola</p>
                                            <div className={styles.codeBox}>
                                                <span className={styles.codeText}>{pixCode.slice(0, 55)}...</span>
                                                <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(pixCode)}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                                    </svg>
                                                    Copiar
                                                </button>
                                            </div>
                                            <p className={styles.pixExpiry}>⏱ Expira em 30 minutos</p>
                                        </div>
                                    </div>
                                    <div className={styles.totalDue}>
                                        <span>Valor a pagar</span>
                                        <span className={styles.totalDueValue}>{fmt(total)}</span>
                                    </div>
                                </div>
                            )}

                            {/* BOLETO */}
                            {paymentMethod === 'boleto' && (
                                <div className={styles.paymentBox}>
                                    <div className={styles.paymentBoxHeader}>
                                        <div className={styles.paymentBoxIcon} style={{ background: '#fffbeb' }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className={styles.paymentBoxTitle}>Boleto Bancário</h3>
                                            <p className={styles.paymentBoxSub}>Vencimento em 3 dias úteis. Pague em qualquer banco ou lotérica.</p>
                                        </div>
                                    </div>
                                    <div className={styles.boletoContent}>
                                        <div className={styles.barcode}>
                                            {Array.from({ length: 60 }).map((_, i) => (
                                                <div key={i} className={styles.bar} style={{ width: i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2 }} />
                                            ))}
                                        </div>
                                        <div className={styles.codeBox}>
                                            <span className={styles.codeText}>{boletoCode}</span>
                                            <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(boletoCode)}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                                </svg>
                                                Copiar linha digitável
                                            </button>
                                        </div>
                                        <button className={styles.downloadBtn}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                            </svg>
                                            Baixar Boleto PDF
                                        </button>
                                    </div>
                                    <div className={styles.totalDue}>
                                        <span>Valor do boleto</span>
                                        <span className={styles.totalDueValue}>{fmt(total)}</span>
                                    </div>
                                </div>
                            )}

                            {/* CARTÃO */}
                            {(paymentMethod === 'credito' || paymentMethod === 'debito') && (
                                <div className={styles.paymentBox}>
                                    <div className={styles.paymentBoxHeader}>
                                        <div className={styles.paymentBoxIcon} style={{ background: '#eff6ff' }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1353a7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className={styles.paymentBoxTitle}>
                                                Cartão de {paymentMethod === 'credito' ? 'Crédito' : 'Débito'} aprovado!
                                            </h3>
                                            <p className={styles.paymentBoxSub}>Seu pagamento foi processado com sucesso.</p>
                                        </div>
                                    </div>
                                    <div className={styles.cardConfirm}>
                                        <div className={styles.cardConfirmRow}>
                                            <span className={styles.cardConfirmLabel}>Titular</span>
                                            <span className={styles.cardConfirmValue}>{state.cardName || '—'}</span>
                                        </div>
                                        <div className={styles.cardConfirmRow}>
                                            <span className={styles.cardConfirmLabel}>Valor cobrado</span>
                                            <span className={styles.cardConfirmValue}>{fmt(total)}</span>
                                        </div>
                                        <div className={styles.cardConfirmRow}>
                                            <span className={styles.cardConfirmLabel}>Status</span>
                                            <span className={styles.approvedBadge}>✓ Aprovado</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Itens */}
                            <div className={styles.itemsCard}>
                                <h3 className={styles.itemsTitle}>Itens do Pedido</h3>
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.selectedSize}`} className={styles.orderItem}>
                                        <img src={item.image} alt={item.name} className={styles.orderItemImg} />
                                        <div className={styles.orderItemInfo}>
                                            <span className={styles.orderItemName}>{item.name}</span>
                                            {item.selectedSize && (
                                                <span className={styles.orderItemMeta}>{item.selectedSize} • Qtd: {item.quantity}</span>
                                            )}
                                        </div>
                                        <span className={styles.orderItemPrice}>{fmt(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.footerActions}>
                                <Link to="/meus-pedidos" className={styles.btnOrders}>Ver Meus Pedidos</Link>
                                <Link to="/" className={styles.btnHome}>Continuar Comprando</Link>
                            </div>
                        </div>

                        {/* Resumo lateral */}
                        <div className={styles.rightCol}>
                            <div className={styles.summary}>
                                <h2 className={styles.summaryTitle}>Resumo</h2>
                                <div className={styles.summaryRow}><span>Pedido</span><span className={styles.orderId}>{orderId}</span></div>
                                <div className={styles.summaryRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                                <div className={styles.summaryRow}><span>Frete</span><span>{fmt(shippingPrice)}</span></div>
                                {discount > 0 && (
                                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                        <span>Desconto</span><span>- {fmt(discount)}</span>
                                    </div>
                                )}
                                <div className={`${styles.summaryRow} ${styles.totalFinal}`}>
                                    <span>Total</span><span>{fmt(total)}</span>
                                </div>
                                <div className={styles.summaryDivider} />
                                <div className={styles.summaryInfo}>
                                    <p className={styles.summaryInfoTitle}>Entrega para</p>
                                    <p className={styles.summaryInfoText}>{form.name}</p>
                                    <p className={styles.summaryInfoText}>{form.address}{form.number ? `, ${form.number}` : ''}</p>
                                    <p className={styles.summaryInfoText}>{form.city}/{form.state} – CEP {form.cep}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}