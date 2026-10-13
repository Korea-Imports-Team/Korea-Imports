import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Lock, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import styles from './ProfilePage.module.css';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getAddresses() {
    try { return JSON.parse(localStorage.getItem('savedAddresses') || '[]'); }
    catch { return []; }
}

function saveAddresses(list) {
    try { localStorage.setItem('savedAddresses', JSON.stringify(list)); }
    catch { /* silent */ }
}

// ✅ Máscara de telefone: (11) 99999-9999
function maskPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2)  return `(${digits}`;
    if (digits.length <= 6)  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const EMPTY_ADDRESS = {
    id: '', label: '', name: '', phone: '',
    cep: '', address: '', number: '', complement: '',
    neighborhood: '', city: '', state: '', isDefault: false,
};

const TABS = [
    { id: 'dados',     label: 'Dados Pessoais', icon: User   },
    { id: 'enderecos', label: 'Endereços',       icon: MapPin },
    { id: 'senha',     label: 'Senha',           icon: Lock   },
];

// ─── Address form ─────────────────────────────────────────────────────────────
function AddressForm({ initial = EMPTY_ADDRESS, onSave, onCancel }) {
    const [form, setForm]             = useState(initial);
    const [loadingCep, setLoadingCep] = useState(false);
    const [cepError, setCepError]     = useState('');

    function set(field, val) { setForm((f) => ({ ...f, [field]: val })); }

    // ✅ Máscara de telefone no formulário de endereço
    function handlePhone(e) {
        set('phone', maskPhone(e.target.value));
    }

    async function handleCep(e) {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        set('cep', v);
        setCepError('');
        const clean = v.replace(/\D/g, '');
        if (clean.length === 8) {
            setLoadingCep(true);
            try {
                const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
                const data = await res.json();
                if (data.erro) { setCepError('CEP não encontrado'); return; }
                setForm((f) => ({
                    ...f,
                    address:      data.logradouro || '',
                    neighborhood: data.bairro     || '',
                    city:         data.localidade || '',
                    state:        data.uf         || '',
                }));
            } catch { setCepError('Erro ao buscar CEP'); }
            finally  { setLoadingCep(false); }
        }
    }

    return (
        <div className={styles.addressForm}>
            <div className={styles.afGrid}>
                <div className={`${styles.afField} ${styles.afFull}`}>
                    <label className={styles.afLabel}>Identificação (ex: Casa, Trabalho)</label>
                    <input className={styles.afInput} value={form.label}
                        onChange={(e) => set('label', e.target.value)} placeholder="Casa" />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>Nome completo *</label>
                    <input className={styles.afInput} value={form.name}
                        onChange={(e) => set('name', e.target.value)} required />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>Telefone</label>
                    {/* ✅ Campo com máscara */}
                    <input
                        className={styles.afInput}
                        value={form.phone}
                        onChange={handlePhone}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        type="tel"
                        inputMode="numeric"
                    />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>CEP *</label>
                    <input className={styles.afInput} value={form.cep}
                        onChange={handleCep} placeholder="00000-000" maxLength={9} />
                    {cepError   && <span className={styles.afError}>{cepError}</span>}
                    {loadingCep && <span className={styles.afHint}>Buscando...</span>}
                </div>
                <div className={`${styles.afField} ${styles.afFull}`}>
                    <label className={styles.afLabel}>Endereço *</label>
                    <input className={styles.afInput} value={form.address}
                        onChange={(e) => set('address', e.target.value)} />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>Número *</label>
                    <input className={styles.afInput} value={form.number}
                        onChange={(e) => set('number', e.target.value)} />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>Complemento</label>
                    <input className={styles.afInput} value={form.complement}
                        onChange={(e) => set('complement', e.target.value)} placeholder="Apto, bloco..." />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>Bairro *</label>
                    <input className={styles.afInput} value={form.neighborhood}
                        onChange={(e) => set('neighborhood', e.target.value)} />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>Cidade *</label>
                    <input className={styles.afInput} value={form.city}
                        onChange={(e) => set('city', e.target.value)} />
                </div>
                <div className={styles.afField}>
                    <label className={styles.afLabel}>Estado *</label>
                    <input className={styles.afInput} value={form.state}
                        onChange={(e) => set('state', e.target.value)} maxLength={2} />
                </div>
            </div>

            <label className={styles.defaultCheck}>
                <input type="checkbox" checked={form.isDefault}
                    onChange={(e) => set('isDefault', e.target.checked)} />
                Definir como endereço padrão
            </label>

            <div className={styles.afActions}>
                <button type="button" className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
                <button type="button" className={styles.btnPrimary}
                    onClick={() => onSave({ ...form, id: form.id || Date.now().toString() })}>
                    Salvar endereço
                </button>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();
    const [activeTab, setActiveTab] = useState('dados');

    const [profile, setProfile]           = useState({});
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileDraft, setProfileDraft] = useState(profile);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Carrega o perfil do back ao montar
    useEffect(() => {
        api.get('/users/me')
            .then((data) => setProfile((prev) => ({ ...prev, ...data })))
            .catch(() => {});
    }, []);

    async function saveProfileData() {
        setProfileError('');
        try {
            await api.put('/users/me', { name: profileDraft.name });
        } catch (err) {
            setProfileError(err.message);
            return;
        }
        setProfile(profileDraft);
        setEditingProfile(false);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
    }

    const [addresses, setAddresses]     = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddr, setEditingAddr] = useState(null);
    const [addressLoading, setAddressLoading] = useState(true);
    const [addressError, setAddressError] = useState('');

    // 🔄 Carregar endereços do backend ao montar
    useEffect(() => {
        loadAddresses();
    }, [user]);

    async function loadAddresses() {
        if (!user) return;
        setAddressLoading(true);
        try {
            const data = await api.get('/users/me/addresses');
            setAddresses(data || []);
        } catch (err) {
            setAddressError('Erro ao carregar endereços');
            console.error(err);
        } finally {
            setAddressLoading(false);
        }
    }

    async function handleSaveAddress(addr) {
        setAddressError('');
        try {
            if (addr.id) {
                // Editar endereço existente
                await api.put(`/users/me/addresses/${addr.id}`, addr);
            } else {
                // Criar novo endereço
                await api.post('/users/me/addresses', addr);
            }
            
            // Se é padrão, chamar PATCH para sincronizar
            if (addr.isDefault) {
                await api.patch(`/users/me/addresses/${addr.id}/default`);
            }
            
            loadAddresses();
            setShowAddForm(false);
            setEditingAddr(null);
        } catch (err) {
            setAddressError(err.message || 'Erro ao salvar endereço');
        }
    }

    async function handleDeleteAddress(id) {
        setAddressError('');
        try {
            await api.delete(`/users/me/addresses/${id}`);
            loadAddresses();
        } catch (err) {
            setAddressError(err.message || 'Erro ao remover endereço');
        }
    }

    async function handleSetDefault(id) {
        setAddressError('');
        try {
            await api.patch(`/users/me/addresses/${id}/default`);
            loadAddresses();
        } catch (err) {
            setAddressError(err.message || 'Erro ao definir endereço padrão');
        }
    }

    const [pwd, setPwd]           = useState({ current: '', next: '', confirm: '' });
    const [pwdError, setPwdError] = useState('');
    const [pwdSaved, setPwdSaved] = useState(false);

    async function handlePwdSave() {
        if (pwd.next.length < 6)        { setPwdError('A senha deve ter pelo menos 6 caracteres.'); return; }
        if (pwd.next !== pwd.confirm)   { setPwdError('As senhas não coincidem.'); return; }
        
        setPwdError('');
        try {
            await api.put('/users/me/password', {
                currentPassword: pwd.current,
                newPassword: pwd.next,
            });
            setPwdSaved(true);
            setPwd({ current: '', next: '', confirm: '' });
            setTimeout(() => setPwdSaved(false), 2500);
        } catch (err) {
            setPwdError(err.message || 'Erro ao alterar senha');
        }
    }

    const displayName = profile.name || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
    const initials    = displayName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

    return (
        <main className={styles.page}>
            <div className="container">
                <div className={styles.layout}>

                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={styles.avatarWrap}>
                            <div className={styles.avatar}>{initials}</div>
                            <div>
                                <p className={styles.avatarName}>{displayName}</p>
                                <p className={styles.avatarEmail}>{user?.email}</p>
                            </div>
                        </div>

                        <nav className={styles.tabNav}>
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className={styles.sidebarLinks}>
                            <Link to="/meus-pedidos" className={styles.sidebarLink}>Meus Pedidos</Link>
                            <Link to="/favoritos"    className={styles.sidebarLink}>Favoritos</Link>
                            <button
                                className={`${styles.sidebarLink} ${styles.sidebarLogout}`}
                                onClick={() => { logout(); navigate('/'); }}
                            >
                                Sair da conta
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className={styles.content}>

                        {/* ── Dados Pessoais ── */}
                        {activeTab === 'dados' && (
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.cardTitle}>Dados Pessoais</h2>
                                    {!editingProfile && (
                                        <button className={styles.btnEdit}
                                            onClick={() => { setProfileDraft(profile); setEditingProfile(true); }}>
                                            <Edit2 size={14} /> Editar
                                        </button>
                                    )}
                                </div>

                                {profileSaved && (
                                    <div className={styles.successBanner}>
                                        <Check size={16} /> Dados salvos com sucesso!
                                    </div>
                                )}
                                {profileError && <p className={styles.afError}>{profileError}</p>}

                                {editingProfile ? (
                                    <div className={styles.profileForm}>
                                        <div className={styles.profileGrid}>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Nome completo</label>
                                                <input className={styles.profileInput}
                                                    value={profileDraft.name || ''}
                                                    onChange={(e) => setProfileDraft((p) => ({ ...p, name: e.target.value }))} />
                                            </div>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Apelido</label>
                                                <input className={styles.profileInput}
                                                    value={profileDraft.nickname || ''}
                                                    onChange={(e) => setProfileDraft((p) => ({ ...p, nickname: e.target.value }))} />
                                            </div>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Telefone</label>
                                                {/* ✅ Máscara aplicada */}
                                                <input
                                                    className={styles.profileInput}
                                                    value={profileDraft.phone || ''}
                                                    placeholder="(11) 99999-9999"
                                                    maxLength={15}
                                                    type="tel"
                                                    inputMode="numeric"
                                                    onChange={(e) =>
                                                        setProfileDraft((p) => ({ ...p, phone: maskPhone(e.target.value) }))
                                                    }
                                                />
                                            </div>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>CPF</label>
                                                <input className={styles.profileInput}
                                                    value={profileDraft.cpf || ''}
                                                    placeholder="000.000.000-00"
                                                    maxLength={14}
                                                    inputMode="numeric"
                                                    onChange={(e) => {
                                                        // Máscara de CPF: 000.000.000-00
                                                        const d = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                        let masked = d;
                                                        if (d.length > 9) masked = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
                                                        else if (d.length > 6) masked = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
                                                        else if (d.length > 3) masked = `${d.slice(0,3)}.${d.slice(3)}`;
                                                        setProfileDraft((p) => ({ ...p, cpf: masked }));
                                                    }}
                                                />
                                            </div>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Data de nascimento</label>
                                                <input className={styles.profileInput} type="date"
                                                    value={profileDraft.birthday || ''}
                                                    onChange={(e) => setProfileDraft((p) => ({ ...p, birthday: e.target.value }))} />
                                            </div>
                                            <div className={styles.profileField}>
                                                <label className={styles.profileLabel}>Gênero</label>
                                                <select className={styles.profileSelect}
                                                    value={profileDraft.gender || ''}
                                                    onChange={(e) => setProfileDraft((p) => ({ ...p, gender: e.target.value }))}>
                                                    <option value="">Prefiro não informar</option>
                                                    <option value="M">Masculino</option>
                                                    <option value="F">Feminino</option>
                                                    <option value="O">Outro</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className={styles.profileActions}>
                                            <button className={styles.btnGhost} onClick={() => setEditingProfile(false)}>Cancelar</button>
                                            <button className={styles.btnPrimary} onClick={saveProfileData}>Salvar alterações</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.profileDisplay}>
                                        {[
                                            { label: 'Nome completo',      value: profile.name },
                                            { label: 'Apelido',            value: profile.nickname },
                                            { label: 'E-mail',             value: user?.email },
                                            { label: 'Telefone',           value: profile.phone },
                                            { label: 'CPF',                value: profile.cpf },
                                            { label: 'Data de nascimento', value: profile.birthday
                                                ? new Date(profile.birthday + 'T00:00').toLocaleDateString('pt-BR') : null },
                                            { label: 'Gênero', value: { M: 'Masculino', F: 'Feminino', O: 'Outro' }[profile.gender] },
                                        ].map(({ label, value }) => (
                                            <div key={label} className={styles.profileRow}>
                                                <span className={styles.profileRowLabel}>{label}</span>
                                                <span className={styles.profileRowValue}>
                                                    {value || <em className={styles.empty}>Não informado</em>}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Endereços ── */}
                        {activeTab === 'enderecos' && (
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.cardTitle}>Endereços Salvos</h2>
                                    {!showAddForm && !editingAddr && (
                                        <button
                                            className={styles.btnPrimary}
                                            style={{ fontSize: '0.8125rem', height: 36, padding: '0 1rem' }}
                                            onClick={() => setShowAddForm(true)}
                                        >
                                            <Plus size={14} /> Novo endereço
                                        </button>
                                    )}
                                </div>

                                {addressLoading && <p className={styles.afHint}>Carregando endereços...</p>}
                                {addressError && <p className={styles.afError}>{addressError}</p>}

                                {showAddForm && (
                                    <AddressForm onSave={handleSaveAddress} onCancel={() => setShowAddForm(false)} />
                                )}

                                {addresses.length === 0 && !showAddForm ? (
                                    <div className={styles.emptyAddresses}>
                                        <MapPin size={40} strokeWidth={1.2} color="#D1D5DB" />
                                        <p>Nenhum endereço salvo.</p>
                                        <button className={styles.btnPrimary} onClick={() => setShowAddForm(true)}>
                                            <Plus size={14} /> Adicionar endereço
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.addressList}>
                                        {addresses.map((addr) => (
                                            <div key={addr.id}>
                                                {editingAddr === addr.id ? (
                                                    <AddressForm
                                                        initial={addr}
                                                        onSave={handleSaveAddress}
                                                        onCancel={() => setEditingAddr(null)}
                                                    />
                                                ) : (
                                                    <div className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ''}`}>
                                                        <div className={styles.addressCardTop}>
                                                            <div className={styles.addressCardMeta}>
                                                                <span className={styles.addressCardLabel}>
                                                                    {addr.label || 'Endereço'}
                                                                </span>
                                                                {addr.isDefault && (
                                                                    <span className={styles.defaultBadge}>Padrão</span>
                                                                )}
                                                            </div>
                                                            <div className={styles.addressCardActions}>
                                                                {!addr.isDefault && (
                                                                    <button className={styles.addrBtn} onClick={() => handleSetDefault(addr.id)}>
                                                                        Definir padrão
                                                                    </button>
                                                                )}
                                                                <button className={styles.addrIconBtn} onClick={() => setEditingAddr(addr.id)} title="Editar">
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button className={`${styles.addrIconBtn} ${styles.addrIconBtnDel}`}
                                                                    onClick={() => handleDeleteAddress(addr.id)} title="Remover">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className={styles.addressName}>{addr.name}</p>
                                                        <p className={styles.addressText}>
                                                            {addr.address}{addr.number ? `, ${addr.number}` : ''}
                                                            {addr.complement ? ` – ${addr.complement}` : ''}
                                                        </p>
                                                        <p className={styles.addressText}>
                                                            {addr.neighborhood}{addr.city ? ` – ${addr.city}` : ''}{addr.state ? `/${addr.state}` : ''}
                                                        </p>
                                                        <p className={styles.addressText}>CEP: {addr.cep}</p>
                                                        {addr.phone && <p className={styles.addressText}>Tel: {addr.phone}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Senha ── */}
                        {activeTab === 'senha' && (
                            <div className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <h2 className={styles.cardTitle}>Alterar Senha</h2>
                                </div>

                                {pwdSaved && (
                                    <div className={styles.successBanner}>
                                        <Check size={16} /> Senha alterada com sucesso!
                                    </div>
                                )}

                                <div className={styles.pwdForm}>
                                    <div className={styles.profileField}>
                                        <label className={styles.profileLabel}>Senha atual</label>
                                        <input className={styles.profileInput} type="password"
                                            value={pwd.current}
                                            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} />
                                    </div>
                                    <div className={styles.profileField}>
                                        <label className={styles.profileLabel}>Nova senha</label>
                                        <input className={styles.profileInput} type="password"
                                            value={pwd.next}
                                            onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} />
                                        <span className={styles.afHint}>Mínimo 6 caracteres</span>
                                    </div>
                                    <div className={styles.profileField}>
                                        <label className={styles.profileLabel}>Confirmar nova senha</label>
                                        <input className={styles.profileInput} type="password"
                                            value={pwd.confirm}
                                            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} />
                                    </div>
                                    {pwdError && <p className={styles.afError}>{pwdError}</p>}
                                    <div className={styles.profileActions}>
                                        <button className={styles.btnPrimary} onClick={handlePwdSave}>
                                            Salvar nova senha
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}