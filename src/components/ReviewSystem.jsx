import { useState, useRef } from 'react';
import { Star, Camera, X, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './ReviewSystem.module.css';

// ─── helpers ─────────────────────────────────────────────────────────────────
function getReviews(productId) {
    try {
        const all = JSON.parse(localStorage.getItem('reviews') || '{}');
        return all[productId] || [];
    } catch { return []; }
}

function saveReview(productId, review) {
    try {
        const all = JSON.parse(localStorage.getItem('reviews') || '{}');
        all[productId] = [review, ...(all[productId] || [])];
        localStorage.setItem('reviews', JSON.stringify(all));
    } catch { /* silent */ }
}

function likeReview(productId, reviewId) {
    try {
        const all = JSON.parse(localStorage.getItem('reviews') || '{}');
        all[productId] = (all[productId] || []).map((r) =>
            r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
        );
        localStorage.setItem('reviews', JSON.stringify(all));
    } catch { /* silent */ }
}

function ratingLabel(r) {
    return ['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][r] || '';
}

// ─── Star selector ────────────────────────────────────────────────────────────
function StarSelector({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className={styles.starSelector}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    className={styles.starBtn}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(n)}
                    aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                >
                    <Star
                        size={32}
                        fill={(hovered || value) >= n ? '#F59E0B' : 'none'}
                        stroke={(hovered || value) >= n ? '#F59E0B' : '#D1D5DB'}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
            {(hovered || value) > 0 && (
                <span className={styles.ratingLabel}>{ratingLabel(hovered || value)}</span>
            )}
        </div>
    );
}

// ─── Star display ─────────────────────────────────────────────────────────────
function StarDisplay({ value, size = 14 }) {
    return (
        <div className={styles.starDisplay}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={size}
                    fill={value >= n ? '#F59E0B' : value >= n - 0.5 ? '#F59E0B' : 'none'}
                    stroke={value >= n ? '#F59E0B' : '#D1D5DB'}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}

// ─── Rating bar ───────────────────────────────────────────────────────────────
function RatingBar({ label, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className={styles.ratingBar}>
            <span className={styles.ratingBarLabel}>{label}</span>
            <div className={styles.ratingBarTrack}>
                <div className={styles.ratingBarFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.ratingBarCount}>{count}</span>
        </div>
    );
}

// ─── Review form ──────────────────────────────────────────────────────────────
function ReviewForm({ productId, userName, onSubmit, onCancel }) {
    const [rating, setRating]       = useState(0);
    const [title, setTitle]         = useState('');
    const [body, setBody]           = useState('');
    const [photos, setPhotos]       = useState([]);
    const [error, setError]         = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef();

    function handlePhoto(e) {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            if (photos.length >= 3) return;
            const reader = new FileReader();
            reader.onload = (ev) => setPhotos((prev) => [...prev, ev.target.result].slice(0, 3));
            reader.readAsDataURL(file);
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (rating === 0) { setError('Selecione uma avaliação.'); return; }
        if (body.trim().length < 10) { setError('Escreva pelo menos 10 caracteres.'); return; }

        setSubmitting(true);
        const review = {
            id: Date.now().toString(),
            productId,
            userName: userName || 'Anônimo',
            rating,
            title: title.trim(),
            body: body.trim(),
            photos,
            likes: 0,
            createdAt: new Date().toISOString(),
        };
        saveReview(productId, review);
        setTimeout(() => { setSubmitting(false); onSubmit(review); }, 600);
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h3 className={styles.formTitle}>Avaliar produto</h3>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Sua nota *</label>
                <StarSelector value={rating} onChange={setRating} />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="rv-title">Título (opcional)</label>
                <input
                    id="rv-title"
                    className={styles.formInput}
                    placeholder="Resuma sua experiência"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={80}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="rv-body">Comentário *</label>
                <textarea
                    id="rv-body"
                    className={styles.formTextarea}
                    placeholder="Conte o que achou do produto, tamanho, qualidade, caimento..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={600}
                    rows={4}
                />
                <span className={styles.charCount}>{body.length}/600</span>
            </div>

            {/* Fotos */}
            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fotos (até 3)</label>
                <div className={styles.photoRow}>
                    {photos.map((src, i) => (
                        <div key={i} className={styles.photoThumb}>
                            <img src={src} alt={`foto ${i + 1}`} />
                            <button
                                type="button"
                                className={styles.photoRemove}
                                onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {photos.length < 3 && (
                        <button
                            type="button"
                            className={styles.photoAdd}
                            onClick={() => fileRef.current?.click()}
                        >
                            <Camera size={20} />
                            <span>Adicionar</span>
                        </button>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handlePhoto}
                    />
                </div>
            </div>

            {error && <p className={styles.formError}>{error}</p>}

            <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                    {submitting ? <span className={styles.spinner} /> : 'Publicar avaliação'}
                </button>
            </div>
        </form>
    );
}

// ─── Single review card ───────────────────────────────────────────────────────
function ReviewCard({ review, productId, onLike }) {
    const [expanded, setExpanded] = useState(false);
    const [liked, setLiked]       = useState(false);
    const [lightbox, setLightbox] = useState(null);
    const long = review.body.length > 200;

    function handleLike() {
        if (liked) return;
        setLiked(true);
        likeReview(productId, review.id);
        onLike(review.id);
    }

    const dateStr = new Date(review.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric',
    });

    return (
        <div className={styles.reviewCard}>
            {/* Header */}
            <div className={styles.reviewHeader}>
                <div className={styles.reviewAvatar}>
                    {review.userName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.reviewMeta}>
                    <span className={styles.reviewUser}>{review.userName}</span>
                    <span className={styles.reviewDate}>{dateStr}</span>
                </div>
                <div className={styles.reviewRating}>
                    <StarDisplay value={review.rating} />
                    <span className={styles.reviewRatingLabel}>{ratingLabel(review.rating)}</span>
                </div>
            </div>

            {/* Title */}
            {review.title && <p className={styles.reviewTitle}>{review.title}</p>}

            {/* Body */}
            <p className={styles.reviewBody}>
                {long && !expanded ? `${review.body.slice(0, 200)}...` : review.body}
            </p>
            {long && (
                <button className={styles.expandBtn} onClick={() => setExpanded((e) => !e)}>
                    {expanded ? <><ChevronUp size={14} /> Ver menos</> : <><ChevronDown size={14} /> Ver mais</>}
                </button>
            )}

            {/* Photos */}
            {review.photos?.length > 0 && (
                <div className={styles.reviewPhotos}>
                    {review.photos.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt={`foto ${i + 1}`}
                            className={styles.reviewPhoto}
                            onClick={() => setLightbox(src)}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className={styles.reviewFooter}>
                <button
                    className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ''}`}
                    onClick={handleLike}
                >
                    <ThumbsUp size={13} />
                    Útil {review.likes > 0 && `(${review.likes})`}
                </button>
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div className={styles.lightbox} onClick={() => setLightbox(null)}>
                    <img src={lightbox} alt="foto ampliada" className={styles.lightboxImg} />
                    <button className={styles.lightboxClose}><X size={20} /></button>
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
// userName vazio = não logado | qualquer string = logado e pode avaliar
export default function ReviewSystem({ productId, userName }) {
    const [reviews, setReviews]       = useState(() => getReviews(productId));
    const [showForm, setShowForm]     = useState(false);
    const [sortBy, setSortBy]         = useState('recent');
    const [filterStar, setFilterStar] = useState(0);

    const isLoggedIn      = !!userName && userName !== 'Anônimo';
    const alreadyReviewed = reviews.some((r) => r.userName === userName);
    const canReview       = isLoggedIn && !alreadyReviewed;

    const avg   = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    const total = reviews.length;
    const dist  = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    const sorted = [...reviews]
        .filter((r) => filterStar === 0 || r.rating === filterStar)
        .sort((a, b) => {
            if (sortBy === 'recent')  return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'highest') return b.rating - a.rating;
            if (sortBy === 'lowest')  return a.rating - b.rating;
            if (sortBy === 'useful')  return (b.likes || 0) - (a.likes || 0);
            return 0;
        });

    function handleSubmit(review) {
        setReviews((prev) => [review, ...prev]);
        setShowForm(false);
    }

    function handleLike(reviewId) {
        setReviews((prev) =>
            prev.map((r) => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r)
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Avaliações</h2>
                {/* Botão visível para qualquer usuário logado que ainda não avaliou */}
                {canReview && !showForm && (
                    <button className={styles.btnWrite} onClick={() => setShowForm(true)}>
                        Escrever avaliação
                    </button>
                )}
            </div>

            {/* Resumo de notas */}
            {total > 0 && (
                <div className={styles.summary}>
                    <div className={styles.summaryScore}>
                        <span className={styles.scoreNumber}>{avg.toFixed(1)}</span>
                        <StarDisplay value={avg} size={20} />
                        <span className={styles.scoreTotal}>{total} avaliação{total !== 1 ? 'ões' : ''}</span>
                    </div>
                    <div className={styles.summaryBars}>
                        {dist.map(({ star, count }) => (
                            <RatingBar key={star} label={`${star}★`} count={count} total={total} />
                        ))}
                    </div>
                </div>
            )}

            {/* Formulário */}
            {showForm && (
                <ReviewForm
                    productId={productId}
                    userName={userName}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Usuário já avaliou */}
            {isLoggedIn && alreadyReviewed && !showForm && (
                <div className={styles.alreadyReviewed}>
                    ✓ Você já avaliou este produto. Obrigado pelo feedback!
                </div>
            )}

            {/* Não logado — aviso para entrar */}
            {!isLoggedIn && !showForm && (
                <div className={styles.loginPrompt}>
                    <Star size={20} strokeWidth={1.5} color="#F59E0B" fill="#F59E0B" />
                    <div>
                        <p className={styles.loginPromptTitle}>Quer deixar uma avaliação?</p>
                        <p className={styles.loginPromptText}>
                            <a href="/entrar" className={styles.loginPromptLink}>Entre na sua conta</a>
                            {' '}para avaliar este produto e ajudar outros clientes.
                        </p>
                    </div>
                </div>
            )}

            {/* Filtros */}
            {total > 0 && (
                <div className={styles.filters}>
                    <div className={styles.filterStars}>
                        <button
                            className={`${styles.filterStar} ${filterStar === 0 ? styles.filterStarActive : ''}`}
                            onClick={() => setFilterStar(0)}
                        >
                            Todos
                        </button>
                        {[5, 4, 3, 2, 1].map((n) => (
                            <button
                                key={n}
                                className={`${styles.filterStar} ${filterStar === n ? styles.filterStarActive : ''}`}
                                onClick={() => setFilterStar(n === filterStar ? 0 : n)}
                            >
                                {n}★
                            </button>
                        ))}
                    </div>
                    <select
                        className={styles.sortSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="recent">Mais recentes</option>
                        <option value="highest">Melhor avaliação</option>
                        <option value="lowest">Pior avaliação</option>
                        <option value="useful">Mais úteis</option>
                    </select>
                </div>
            )}

            {/* Lista de avaliações */}
            {sorted.length === 0 ? (
                <div className={styles.empty}>
                    <Star size={40} strokeWidth={1.2} color="#D1D5DB" />
                    <p>Nenhuma avaliação ainda.</p>
                    {canReview && !showForm && (
                        <button className={styles.btnWrite} onClick={() => setShowForm(true)}>
                            Seja o primeiro a avaliar
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.list}>
                    {sorted.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            productId={productId}
                            onLike={handleLike}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}