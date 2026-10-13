import { useEffect, useState } from "react";
import { useProductsData } from '../context/ProductsContext';
import { api, ApiError } from '../services/api';
import "./ProductsDashboard.css";


const SIZES = ["P", "M", "G", "GG"];
const CATEGORIES = ["camisetas", "shorts", "calcas", "roupas-de-frio", "camisas-de-time"];

const EMPTY_STOCK = { P: 0, M: 0, G: 0, GG: 0 };

const EMPTY_FORM = {
  name: "", price: "", category: "", description: "",
  discount: "", sizes: [], image: "",
  isNew: false, isBestSeller: false,
  stock: { ...EMPTY_STOCK },
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function buildStock(product) {
  // Se o produto já tem estoque manual salvo, usa ele.
  // Caso contrário, constrói a partir do tamanho * 8 menos esgotados.
  if (product.stockBySize) return product.stockBySize;
  const result = {};
  (product.sizes || []).forEach((s) => {
    result[s] = product.sizesOutOfStock?.includes(s) ? 0 : 8;
  });
  return result;
}

function totalStock(stockBySize) {
  return Object.values(stockBySize || {}).reduce((a, b) => a + Number(b), 0);
}

function stockStatus(stockBySize) {
  const t = totalStock(stockBySize);
  if (t <= 0) return "out";
  if (t < 10) return "low";
  return "ok";
}

// ─── Stock editor ─────────────────────────────────────────────────────────────
function StockEditor({ sizes, stock, onChange }) {
  if (!sizes || sizes.length === 0) return null;
  return (
    <div className="pd-stock-editor">
      <div className="pd-label" style={{ marginBottom: 6 }}>Quantidade em estoque por tamanho</div>
      <div className="pd-stock-size-row">
        {sizes.map((s) => (
          <div key={s} className="pd-stock-size-item">
            <span className="pd-stock-size-label">{s}</span>
            <input
              className="pd-input pd-stock-qty-input"
              type="number"
              min="0"
              max="9999"
              value={stock[s] ?? 0}
              onChange={(e) => onChange(s, Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
        ))}
      </div>
      <div className="pd-stock-total">
        Total: <strong>{totalStock(stock)} unidades</strong>
      </div>
    </div>
  );
}

export default function ProductsDashboard() {
  // Inicializa produtos com estoque calculado
  const { products: initialProducts, loading, refreshProducts } = useProductsData();
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    if (initialProducts.length > 0) setProductList(initialProducts);
  }, [initialProducts]);

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [showStockReport, setShowStockReport] = useState(false);
  const [stockThreshold, setStockThreshold] = useState(10);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingImageEdit, setUploadingImageEdit] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageErrorEdit, setImageErrorEdit] = useState("");

  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Tamanhos ───────────────────────────────────────────────────────────────
  function toggleSize(size) {
    setFormData((prev) => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      const newStock = { ...prev.stock };
      if (!newSizes.includes(size)) delete newStock[size];
      else if (newStock[size] === undefined) newStock[size] = 0;
      return { ...prev, sizes: newSizes, stock: newStock };
    });
  }

  function toggleEditSize(size) {
    setEditForm((prev) => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      const newStock = { ...prev.stock };
      if (!newSizes.includes(size)) delete newStock[size];
      else if (newStock[size] === undefined) newStock[size] = 0;
      return { ...prev, sizes: newSizes, stock: newStock };
    });
  }

  function updateFormStock(size, qty) {
    setFormData((prev) => ({ ...prev, stock: { ...prev.stock, [size]: qty } }));
  }

  function updateEditStock(size, qty) {
    setEditForm((prev) => ({ ...prev, stock: { ...prev.stock, [size]: qty } }));
  }

  // ─── Imagem ─────────────────────────────────────────────────────────────────
  async function handleImageFile(e, setter, setLoading, setError) {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/admin/products/upload', formData);
      
      const imageUrl = response.url || response.imageUrl;
      if (!imageUrl) throw new Error('URL de imagem não recebida');
      
      setter((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : 'Erro ao enviar imagem';
      setError(errorMsg);
      console.error('Erro upload:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Editar ─────────────────────────────────────────────────────────────────
  function openEdit(product) {
    setEditId(product.id);
    setEditForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description || "",
      discount: product.discount ? String(product.discount) : "",
      sizes: product.sizes || [],
      image: product.image || "",
      isNew: !!product.isNew,
      isBestSeller: !!product.isBestSeller,
      stock: { ...buildStock(product) },
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editId) return;
    try {
      const updated = await api.put(`/admin/products/${editId}`, {
        name: editForm.name,
        category: editForm.category,
        price: parseFloat(editForm.price),
        discount: editForm.discount ? parseInt(editForm.discount) : null,
        image: editForm.image || null,
        description: editForm.description || null,
        sizes: editForm.sizes,
        stockBySize: { ...editForm.stock },
        sizesOutOfStock: editForm.sizes.filter((s) => (editForm.stock[s] ?? 0) === 0),
        isNew: !!editForm.isNew,
        isBestSeller: !!editForm.isBestSeller,
        pixDiscount: 5,
        colors: [],
        tags: [],
      });
      setProductList((prev) => prev.map((p) => p.id === editId ? updated : p));
      setEditId(null);
      refreshProducts();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao atualizar produto.');
    }
  }

  // handleSubmit (criar):
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const created = await api.post('/admin/products', {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        discount: formData.discount ? parseInt(formData.discount) : null,
        image: formData.image || null,
        description: formData.description || null,
        sizes: formData.sizes,
        stockBySize: { ...formData.stock },
        sizesOutOfStock: formData.sizes.filter((s) => (formData.stock[s] ?? 0) === 0),
        isNew: !!formData.isNew,
        isBestSeller: !!formData.isBestSeller,
        pixDiscount: 5,
        colors: [],
        tags: [],
      });
      setProductList((prev) => [created, ...prev]);
      setFormData(EMPTY_FORM);
      setShowAdd(false);
      refreshProducts();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao criar produto.');
    }
  }

  // handleSave (editar):
  async function handleSave(id) {
    try {
      const updated = await api.put(`/admin/products/${id}`, {
        name: editForm.name,
        category: editForm.category,
        price: parseFloat(editForm.price),
        discount: editForm.discount ? parseInt(editForm.discount) : null,
        image: editForm.image,
        description: editForm.description,
        sizes: editForm.sizes,
        stockBySize: { ...editForm.stock },
        sizesOutOfStock: editForm.sizes.filter((s) => (editForm.stock[s] ?? 0) === 0),
      });
      setProductList((prev) => prev.map((p) => p.id === id ? updated : p));
      setEditId(null);
      refreshProducts();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao atualizar produto.');
    }
  }

  // handleDelete:
  async function handleDelete(id) {
    try {
      await api.delete(`/admin/products/${id}`);
      setProductList((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
      refreshProducts();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao remover produto.');
    }
  }

  // ─── Status ─────────────────────────────────────────────────────────────────
  function stockClass(status) {
    if (status === "out") return "pd-stock-out";
    if (status === "low") return "pd-stock-low";
    return "pd-stock-ok";
  }

  function statusBadge(status) {
    if (status === "out") return <span className="pd-badge out">Esgotado</span>;
    if (status === "low") return <span className="pd-badge low">Estoque baixo</span>;
    return <span className="pd-badge ok">Disponível</span>;
  }

  // ─── Alertas de estoque crítico no topo ─────────────────────────────────────
  const criticalProducts = productList.filter(
    (p) => totalStock(p.stockBySize) > 0 && totalStock(p.stockBySize) < stockThreshold
  );
  const outProducts = productList.filter((p) => totalStock(p.stockBySize) === 0);

  return (
    <div className="pd">

      {/* ── Alertas inline no topo ── */}
      {(outProducts.length > 0 || criticalProducts.length > 0) && (
        <div className="pd-alerts">
          {outProducts.length > 0 && (
            <div className="pd-alert pd-alert-danger">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <strong>{outProducts.length} produto{outProducts.length !== 1 ? "s" : ""} esgotado{outProducts.length !== 1 ? "s" : ""}:</strong>
              {outProducts.slice(0, 3).map((p) => p.name).join(", ")}
              {outProducts.length > 3 && ` e mais ${outProducts.length - 3}...`}
            </div>
          )}
          {criticalProducts.length > 0 && (
            <div className="pd-alert pd-alert-warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <strong>{criticalProducts.length} produto{criticalProducts.length !== 1 ? "s" : ""} com estoque baixo</strong>
              {" "}(abaixo de {stockThreshold} unidades)
              <button className="pd-alert-link" onClick={() => setShowStockReport(true)}>
                Ver relatório →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>Gestão de Produtos</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            {productList.length} produto{productList.length !== 1 ? "s" : ""} cadastrado{productList.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Threshold rápido */}
          <div className="pd-threshold-inline">
            <span className="pd-threshold-inline-label">Alertar abaixo de</span>
            <input
              className="pd-input pd-threshold-input"
              type="number" min="1" max="999"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <span className="pd-threshold-inline-label">un.</span>
          </div>
          <button className="pd-btn-outline" onClick={() => setShowStockReport(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            Relatório
          </button>
          <button className="pd-btn" onClick={() => setShowAdd(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar Produto
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: 16 }}>
        <div className="pd-search-wrap">
          <span className="pd-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="pd-search"
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="pd-table-wrap">
        <table className="pd-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Tamanhos</th>
              <th>Estoque</th>
              <th>Status</th>
              <th className="right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="pd-empty">Nenhum produto encontrado.</td></tr>
            ) : (
              filtered.map((product) => {
                const status = stockStatus(product.stockBySize);
                const total = totalStock(product.stockBySize);
                return (
                  <tr key={product.id} className={status === "out" ? "pd-row-out" : status === "low" ? "pd-row-low" : ""}>
                    <td>
                      <div className="pd-prod-cell">
                        <img className="pd-prod-img" src={product.image} alt={product.name}
                          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                        <div>
                          <div className="pd-prod-name">{product.name}</div>
                          {product.isNew && <div className="pd-prod-sizes">Novo</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="pd-cat">{product.category.replace(/-/g, " ")}</span></td>
                    <td>
                      <div className="pd-price">R$ {product.price.toFixed(2)}</div>
                      {product.discount && <div className="pd-discount">-{product.discount}%</div>}
                    </td>
                    <td>
                      {/* Estoque por tamanho na tabela */}
                      <div className="pd-size-stock-list">
                        {(product.sizes || []).map((s) => {
                          const qty = product.stockBySize?.[s] ?? 0;
                          return (
                            <span key={s} className={`pd-size-stock-tag ${qty === 0 ? "out" : qty < 5 ? "low" : "ok"}`}>
                              {s}: {qty}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <span className={stockClass(status)} style={{ fontWeight: 700 }}>
                        {total} un.
                      </span>
                    </td>
                    <td>{statusBadge(status)}</td>
                    <td className="right">
                      <div className="pd-actions">
                        <button className="pd-icon-btn" title="Editar" onClick={() => openEdit(product)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button className="pd-icon-btn del" title="Remover" onClick={() => setDeleteId(product.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Modal ── */}
      {showAdd && (
        <div className="pd-overlay" onClick={() => setShowAdd(false)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pd-modal-close" onClick={() => { setShowAdd(false); setFormData(EMPTY_FORM); }}>×</button>
            <div className="pd-modal-title">Adicionar Novo Produto</div>
            <form className="pd-form" onSubmit={handleSubmit}>

              <div className="pd-field">
                <label className="pd-label" htmlFor="pd-name">Nome do Produto *</label>
                <input id="pd-name" className="pd-input" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="pd-field">
                <label className="pd-label">Imagem do Produto {uploadingImage && '(enviando...)'}</label>
                <input type="file" accept="image/*" className="pd-input-file" disabled={uploadingImage}
                  onChange={(e) => handleImageFile(e, setFormData, setUploadingImage, setImageError)} />
                {imageError && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{imageError}</div>}
                {formData.image && <img src={formData.image} alt="preview" className="pd-img-preview" />}
              </div>

              <div className="pd-grid2">
                <div className="pd-field">
                  <label className="pd-label" htmlFor="pd-price">Preço (R$) *</label>
                  <input id="pd-price" className="pd-input" type="number" step="0.01" min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="pd-field">
                  <label className="pd-label" htmlFor="pd-category">Categoria *</label>
                  <select id="pd-category" className="pd-select" value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">Selecione</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
                  </select>
                </div>
              </div>

              {/* ✅ Tamanhos + Estoque por tamanho */}
              <div className="pd-field">
                <label className="pd-label">Tamanhos Disponíveis *</label>
                <div className="pd-sizes">
                  {SIZES.map((size) => (
                    <label key={size} className="pd-size-opt">
                      <input type="checkbox" checked={formData.sizes.includes(size)} onChange={() => toggleSize(size)} />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              {formData.sizes.length > 0 && (
                <StockEditor
                  sizes={formData.sizes}
                  stock={formData.stock}
                  onChange={updateFormStock}
                />
              )}

              <div className="pd-field">
                <label className="pd-label" htmlFor="pd-discount">Desconto (%)</label>
                <input id="pd-discount" className="pd-input" type="number" min="0" max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })} />
              </div>

              <div className="pd-field">
                <label className="pd-label">Destaques</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    />
                    Novo (Novidades)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    />
                    Mais Vendido (Destaques)
                  </label>
                </div>
              </div>

              <div className="pd-modal-footer">
                <button type="button" className="pd-btn-ghost" onClick={() => { setShowAdd(false); setFormData(EMPTY_FORM); }}>Cancelar</button>
                <button type="submit" className="pd-btn">Adicionar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editId !== null && (
        <div className="pd-overlay" onClick={() => setEditId(null)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pd-modal-close" onClick={() => setEditId(null)}>×</button>
            <div className="pd-modal-title">Editar Produto</div>
            <form className="pd-form" onSubmit={handleEditSubmit}>

              <div className="pd-field">
                <label className="pd-label" htmlFor="ed-name">Nome do Produto *</label>
                <input id="ed-name" className="pd-input" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>

              <div className="pd-field">
                <label className="pd-label">Imagem do Produto {uploadingImageEdit && '(enviando...)'}</label>
                <input type="file" accept="image/*" className="pd-input-file" disabled={uploadingImageEdit}
                  onChange={(e) => handleImageFile(e, setEditForm, setUploadingImageEdit, setImageErrorEdit)} />
                {imageErrorEdit && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{imageErrorEdit}</div>}
                {editForm.image && <img src={editForm.image} alt="preview" className="pd-img-preview" />}
              </div>

              <div className="pd-grid2">
                <div className="pd-field">
                  <label className="pd-label" htmlFor="ed-price">Preço (R$) *</label>
                  <input id="ed-price" className="pd-input" type="number" step="0.01" min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
                </div>
                <div className="pd-field">
                  <label className="pd-label" htmlFor="ed-category">Categoria *</label>
                  <select id="ed-category" className="pd-select" value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required>
                    <option value="">Selecione</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ")}</option>)}
                  </select>
                </div>
              </div>

              {/* ✅ Tamanhos + Estoque por tamanho no editar */}
              <div className="pd-field">
                <label className="pd-label">Tamanhos Disponíveis</label>
                <div className="pd-sizes">
                  {SIZES.map((size) => (
                    <label key={size} className="pd-size-opt">
                      <input type="checkbox" checked={editForm.sizes.includes(size)} onChange={() => toggleEditSize(size)} />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              {editForm.sizes.length > 0 && (
                <StockEditor
                  sizes={editForm.sizes}
                  stock={editForm.stock}
                  onChange={updateEditStock}
                />
              )}

              <div className="pd-field">
                <label className="pd-label" htmlFor="ed-discount">Desconto (%)</label>
                <input id="ed-discount" className="pd-input" type="number" min="0" max="100"
                  value={editForm.discount}
                  onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })} />
              </div>

              <div className="pd-field">
                <label className="pd-label" htmlFor="ed-description">Descrição</label>
                <textarea id="ed-description" className="pd-textarea" value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>

              <div className="pd-field">
                <label className="pd-label">Destaques</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editForm.isNew}
                      onChange={(e) => setEditForm({ ...editForm, isNew: e.target.checked })}
                    />
                    Novo (Novidades)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editForm.isBestSeller}
                      onChange={(e) => setEditForm({ ...editForm, isBestSeller: e.target.checked })}
                    />
                    Mais Vendido (Destaques)
                  </label>
                </div>
              </div>

              <div className="pd-modal-footer">
                <button type="button" className="pd-btn-ghost" onClick={() => setEditId(null)}>Cancelar</button>
                <button type="submit" className="pd-btn">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteId !== null && (
        <div className="pd-overlay" onClick={() => setDeleteId(null)}>
          <div className="pd-modal" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-title">Remover produto?</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>
              Esta ação não pode ser desfeita. O produto será removido permanentemente da lista.
            </div>
            <div className="pd-confirm-btns">
              <button className="pd-btn-ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="pd-btn-danger" onClick={() => handleDelete(deleteId)}>Remover</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stock Report Modal ── */}
      {showStockReport && (
        <div className="pd-overlay" onClick={() => setShowStockReport(false)}>
          <div className="pd-modal pd-stock-report-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pd-modal-close" onClick={() => setShowStockReport(false)}>×</button>
            <div className="pd-modal-title">Relatório de Estoque</div>
            <p className="pd-modal-sub">Visão geral do estoque por produto e tamanho</p>

            <div className="pd-threshold-row">
              <label className="pd-label" htmlFor="pd-threshold">Alertar abaixo de</label>
              <input id="pd-threshold" className="pd-input pd-threshold-input" type="number"
                min="1" max="999" value={stockThreshold}
                onChange={(e) => setStockThreshold(Math.max(1, parseInt(e.target.value) || 1))} />
              <span className="pd-threshold-unit">unidades</span>
            </div>

            {(() => {
              const lowStock = productList
                .map((p) => ({ ...p, total: totalStock(p.stockBySize) }))
                .filter((p) => p.total < stockThreshold)
                .sort((a, b) => a.total - b.total);

              if (lowStock.length === 0) {
                return (
                  <div className="pd-stock-ok-msg">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Todos os produtos têm estoque acima de {stockThreshold} unidades.</span>
                  </div>
                );
              }

              return (
                <div className="pd-stock-list">
                  <div className="pd-stock-alert-banner">
                    ⚠️ {lowStock.length} produto{lowStock.length !== 1 ? "s" : ""} com estoque crítico
                  </div>
                  {lowStock.map((p) => (
                    <div key={p.id} className="pd-stock-row">
                      <img className="pd-stock-img" src={p.image} alt={p.name}
                        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                      <div className="pd-stock-info">
                        <div className="pd-stock-name">{p.name}</div>
                        <div className="pd-stock-sizes">
                          {(p.sizes || []).map((s) => {
                            const qty = p.stockBySize?.[s] ?? 0;
                            return (
                              <span key={s} className={`pd-size-stock-tag ${qty === 0 ? "out" : qty < 5 ? "low" : "ok"}`}>
                                {s}: {qty}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className={`pd-stock-qty ${p.total <= 0 ? "pd-stock-out" : "pd-stock-low"}`}>
                        {p.total <= 0 ? "Esgotado" : `${p.total} un.`}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}