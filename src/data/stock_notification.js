// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1: Notificações visuais de estoque
// Adicione esta função no seu ProductPage.jsx e substitua o bloco de tamanhos
// ─────────────────────────────────────────────────────────────────────────────

// Cole esta função antes do componente ProductPage:
function getStockInfo(product, size) {
  // Simula estoque baseado nos dados existentes
  // Na prática, você teria isso no produto (ex: product.stock = { P: 10, M: 2, G: 0 })
  const isOut = product.sizesOutOfStock?.includes(size);
  if (isOut) return { qty: 0, label: null, urgency: 'out' };

  // Simulação determinística por produto+tamanho para parecer real
  const seed = (product.id * size.charCodeAt(0)) % 15;
  if (seed <= 2) return { qty: seed + 1, label: `Última${seed === 0 ? '' : 's'} ${seed + 1} unidade${seed === 0 ? '' : 's'}`, urgency: 'critical' };
  if (seed <= 5) return { qty: seed, label: `Restam ${seed} unidades`, urgency: 'low' };
  return { qty: seed + 5, label: null, urgency: 'ok' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Substitua o bloco de tamanhos no JSX do ProductPage pelo código abaixo:
// ─────────────────────────────────────────────────────────────────────────────

/*
{product.sizes && (
  <div className={styles.sizesBlock}>
    <div className={styles.sizesHeader}>
      <span className={styles.sizesLabel}>Selecione o tamanho</span>
      <button className={styles.sizeGuideBtn} onClick={...}>
        Guia de tamanhos
      </button>
    </div>

    <div className={styles.sizes}>
      {product.sizes.map((size) => {
        const outOfStock = product.sizesOutOfStock?.includes(size);
        const stock      = getStockInfo(product, size);
        return (
          <div key={size} className={styles.sizeWrap}>
            <button
              className={[
                styles.sizeBtn,
                selectedSize === size ? styles.sizeBtnActive : '',
                outOfStock ? styles.sizeBtnDisabled : '',
                stock.urgency === 'critical' ? styles.sizeBtnCritical : '',
              ].join(' ')}
              onClick={() => { if (!outOfStock) { setSelectedSize(size); setError(''); } }}
              disabled={outOfStock}
              title={outOfStock ? 'Sem estoque' : stock.label || ''}
            >
              {size}
              {stock.urgency === 'critical' && !outOfStock && (
                <span className={styles.sizeDot} />
              )}
            </button>
            {selectedSize === size && stock.label && !outOfStock && (
              <span className={[
                styles.stockLabel,
                stock.urgency === 'critical' ? styles.stockCritical : styles.stockLow,
              ].join(' ')}>
                {stock.label}
              </span>
            )}
          </div>
        );
      })}
    </div>

    {// Aviso geral se tamanho selecionado tem estoque crítico
    selectedSize && getStockInfo(product, selectedSize).urgency === 'critical' &&
      !product.sizesOutOfStock?.includes(selectedSize) && (
      <div className={styles.stockWarning}>
        🔥 Alta demanda! Este tamanho está quase esgotado.
      </div>
    )}

    {error && <div id="sizes-error" className={styles.errorCard}>⚠️ {error}</div>}
  </div>
)}
*/

// ─────────────────────────────────────────────────────────────────────────────
// Adicione estas classes no FINAL do ProductPage.module.css:
// ─────────────────────────────────────────────────────────────────────────────

/*
.sizeWrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
}

.sizeBtnCritical {
  border-color: #f97316 !important;
  color: #f97316;
}

.sizeDot {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f97316;
  border: 1.5px solid #fff;
}

.stockLabel {
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
  border-radius: 20px;
  padding: 1px 6px;
}

.stockCritical {
  color: #c2410c;
  background: #ffedd5;
}

.stockLow {
  color: #b45309;
  background: #fef9c3;
}

.stockWarning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff7ed;
  border: 1.5px solid #fed7aa;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  color: #c2410c;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.75; }
}
*/