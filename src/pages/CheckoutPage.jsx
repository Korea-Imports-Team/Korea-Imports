import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './CheckoutPage.module.css';

const VALID_COUPONS = { 'BEMVINDO10': 10, 'KOREA15': 15 };

const STEPS = [
    { number: 1, label: 'Endereço',  sub: 'Dados de entrega' },
    { number: 2, label: 'Frete',     sub: 'Método de envio' },
    { number: 3, label: 'Pagamento', sub: 'Forma de pagamento' },
    { number: 4, label: 'Revisão',   sub: 'Confirmar pedido' },
];

export default function CheckoutPage() {
    const { cartItems } = useCart();
    const { user }      = useAuth();
    const navigate      = useNavigate();

    const [cepError, setCepError]         = useState('');
    const [loadingCep, setLoadingCep]     = useState(false);
    const [addressLocked, setAddressLocked] = useState(false);
    const [couponInput, setCouponInput]   = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError]   = useState('');
    const [couponApplied, setCouponApplied] = useState('');

    const [form, setForm] = useState({
        name: '', email: user?.email || '', phone: '',
        cep: '', address: '', number: '', complement: '',
        neighborhood: '', city: '', state: '',
    });

    // ✅ Sem frete — é escolhido na próxima tela
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = (subtotal * couponDiscount) / 100;
    const total    = subtotal - discount;

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleCep(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        setForm((prev) => ({ ...prev, cep: value }));
        setCepError('');
        const clean = value.replace(/\D/g, '');
        if (clean.length === 8) {
            setLoadingCep(true);
            try {
                const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
                const data = await res.json();
                if (data.erro) { setCepError('CEP não encontrado 😕'); return; }
                setForm((prev) => ({
                    ...prev,
                    address: data.logradouro || '', neighborhood: data.bairro || '',
                    city: data.localidade || '',    state: data.uf || '',
                }));
                setAddressLocked(true);
            } catch { setCepError('Erro ao buscar CEP 😕'); }
            finally  { setLoadingCep(false); }
        }
    }

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

    function handleSubmit(e) {
        e.preventDefault();
        navigate('/frete', {
            state: { form, cartItems, subtotal, discount, total, couponApplied, couponDiscount },
        });
    }

    if (cartItems.length === 0) {
        return (
            <main className={styles.page}>
                <div className={styles.empty}>
                    <p>Seu carrinho está vazio.</p>
                    <Link to="/catalogo">Ver Catálogo</Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className="container">
                <Link to="/carrinho" className={styles.back}>
                    <ArrowLeft size={16} /> Voltar ao carrinho
                </Link>

                {/* Stepper */}
                <div className={styles.stepper}>
                    {STEPS.map((step, idx) => {
                        const isActive    = step.number === 1;
                        const isCompleted = step.number < 1;
                        return (
                            <div key={step.number} className={styles.stepperItem}>
                                {idx > 0 && <div className={`${styles.stepLine} ${isCompleted ? styles.stepLineDone : ''}`} />}
                                <div className={styles.stepCircleWrap}>
                                    <div className={`${styles.stepCircle} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepDone : ''}`}>
                                        {step.number}
                                    </div>
                                    <div className={styles.stepLabels}>
                                        <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>{step.label}</span>
                                        <span className={styles.stepSub}>{step.sub}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <h1 className={styles.title}>Finalizar Compra</h1>

                <form className={styles.layout} onSubmit={handleSubmit}>
                    <div className={styles.leftCol}>
                        {/* Dados Pessoais */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}><User size={18} />Dados Pessoais</h2>
                            <div className={styles.formGrid}>
                                <div className={`${styles.field} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Nome Completo *</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} className={styles.input} required />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>E-mail *</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} className={styles.input} required />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Telefone</label>
                                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(11) 99999-9999" className={styles.input} />
                                </div>
                            </div>
                        </div>

                        {/* Endereço */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}><MapPin size={18} />Endereço de Entrega</h2>
                            <div className={styles.formGrid}>
                                <div className={styles.field}>
                                    <label className={styles.label}>CEP *</label>
                                    <input type="text" name="cep" value={form.cep} onChange={handleCep} placeholder="00000-000" className={styles.input} maxLength={9} required />
                                    {cepError   && <span className={styles.inputError}>{cepError}</span>}
                                    {loadingCep && <span className={styles.cepLoading}>Buscando...</span>}
                                </div>
                                <div className={`${styles.field} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Endereço *</label>
                                    <input type="text" name="address" value={form.address} onChange={handleChange} className={`${styles.input} ${addressLocked ? styles.inputDisabled : ''}`} required disabled={addressLocked} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Número *</label>
                                    <input type="text" name="number" value={form.number} onChange={handleChange} className={styles.input} required />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Complemento</label>
                                    <input type="text" name="complement" value={form.complement} onChange={handleChange} placeholder="Apto, bloco..." className={styles.input} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Bairro *</label>
                                    <input type="text" name="neighborhood" value={form.neighborhood} onChange={handleChange} className={`${styles.input} ${addressLocked ? styles.inputDisabled : ''}`} required disabled={addressLocked} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Cidade *</label>
                                    <input type="text" name="city" value={form.city} onChange={handleChange} className={`${styles.input} ${addressLocked ? styles.inputDisabled : ''}`} required disabled={addressLocked} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Estado *</label>
                                    <input type="text" name="state" value={form.state} onChange={handleChange} className={`${styles.input} ${addressLocked ? styles.inputDisabled : ''}`} maxLength={2} required disabled={addressLocked} />
                                </div>
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
                                                <span className={styles.summaryItemSize}>{item.selectedSize} • Qtd: {item.quantity}</span>
                                            )}
                                            <span className={styles.summaryItemPrice}>
                                                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.couponSection}>
                                <h3 className={styles.couponTitle}><Tag size={15} />Cupom de Desconto</h3>
                                <div className={styles.couponRow}>
                                    <input type="text" placeholder="Digite o cupom" value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)} className={styles.couponInput} disabled={!!couponApplied} />
                                    <button type="button" className={styles.couponBtn} onClick={handleApplyCoupon} disabled={!!couponApplied}>Aplicar</button>
                                </div>
                                {couponError   && <p className={styles.couponError}>{couponError}</p>}
                                {couponApplied && <p className={styles.couponSuccess}>✓ Cupom {couponApplied} aplicado! -{couponDiscount}%</p>}
                            </div>

                            <div className={styles.totals}>
                                <div className={styles.totalRow}>
                                    <span>Subtotal</span>
                                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className={`${styles.totalRow} ${styles.discountRow}`}>
                                        <span>Desconto</span>
                                        <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}
                                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                                    <span>Total</span>
                                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn}>Continuar Compra</button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}