import { useState } from "react";
import { products as initialProducts } from "../data/products";
import "./ProductsDashboard.css";

const SIZES = ["P", "M", "G", "GG"];
const CATEGORIES = ["camisetas", "shorts", "calcas", "roupas-de-frio"];

const EMPTY_FORM = {
  name: "",
  price: "",
  category: "",
  description: "",
  discount: "",
  sizes: [],
  image: "",
};

function stockCount(product) {
  const total = (product.sizes?.length ?? 0) * 8;
  const outOfStock = product.sizesOutOfStock?.length ?? 0;
  return total - outOfStock * 8;
}

export default function ProductsDashboard() {
  const [productList, setProductList] = useState(initialProducts);
  const [search, setSearch]           = useState("");
  const [showAdd, setShowAdd]         = useState(false);
  const [deleteId, setDeleteId]       = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [editId, setEditId]           = useState(null);
  const [editForm, setEditForm]       = useState(EMPTY_FORM);

  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSize(size) {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  }

  function toggleEditSize(size) {
    setEditForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  }

  function handleImageFile(e, setter) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter((prev) => ({ ...prev, image: ev.target.result }));
    reader.readAsDataURL(file);
  }

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
    });
  }

  function handleEditSubmit(e) {
    e.preventDefault();
    setProductList((prev) =>
      prev.map((p) =>
        p.id === editId
          ? {
              ...p,
              name: editForm.name,
              category: editForm.category,
              price: parseFloat(editForm.price),
              discount: editForm.discount ? parseInt(editForm.discount) : null,
              sizes: editForm.sizes,
              image: editForm.image,
              description: editForm.description,
            }
          : p
      )
    );
    setEditId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      originalPrice: null,
      discount: formData.discount ? parseInt(formData.discount) : null,
      rating: 0,
      image: formData.image || "",
      isNew: true,
      isBestSeller: false,
      tags: [],
      sizes: formData.sizes,
      sizesOutOfStock: [],
      pixDiscount: 5,
    };
    setProductList((prev) => [newProduct, ...prev]);
    setFormData(EMPTY_FORM);
    setShowAdd(false);
  }

  function handleDelete(id) {
    setProductList((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  }

  function stockClass(stock) {
    if (stock <= 0)  return "pd-stock-out";
    if (stock < 10)  return "pd-stock-low";
    return "pd-stock-ok";
  }

  function statusBadge(stock) {
    if (stock <= 0)  return <span className="pd-badge out">Esgotado</span>;
    if (stock < 10)  return <span className="pd-badge low">Estoque baixo</span>;
    return <span className="pd-badge ok">Disponível</span>;
  }

  return (
    <div className="pd">
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>Gestão de Produtos</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            {productList.length} produto{productList.length !== 1 ? "s" : ""} cadastrado{productList.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button className="pd-btn" onClick={() => setShowAdd(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar Produto
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: 16 }}>
        <div className="pd-search-wrap">
          <span className="pd-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <tr>
                <td colSpan={7} className="pd-empty">Nenhum produto encontrado.</td>
              </tr>
            ) : (
              filtered.map((product) => {
                const stock = stockCount(product);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="pd-prod-cell">
                        <img
                          className="pd-prod-img"
                          src={product.image}
                          alt={product.name}
                          onError={(e) => { e.currentTarget.style.background = "#E5E7EB"; e.currentTarget.style.visibility = "hidden"; }}
                        />
                        <div>
                          <div className="pd-prod-name">{product.name}</div>
                          {product.isNew && (
                            <div className="pd-prod-sizes">Novo</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pd-cat">
                        {product.category.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div className="pd-price">
                        R$ {product.price.toFixed(2)}
                      </div>
                      {product.discount && (
                        <div className="pd-discount">-{product.discount}%</div>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: "#6B7280" }}>
                      {product.sizes?.join(", ") || "—"}
                    </td>
                    <td>
                      <span className={stockClass(stock)}>{stock}</span>
                    </td>
                    <td>{statusBadge(stock)}</td>
                    <td className="right">
                      <div className="pd-actions">
                        <button
                          className="pd-icon-btn"
                          title="Editar"
                          onClick={() => openEdit(product)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="pd-icon-btn del"
                          title="Remover"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* ── Add Product Modal ── */}
      {showAdd && (
        <div className="pd-overlay" onClick={() => setShowAdd(false)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pd-modal-close" onClick={() => setShowAdd(false)}>×</button>
            <div className="pd-modal-title">Adicionar Novo Produto</div>
            <form className="pd-form" onSubmit={handleSubmit}>
              <div className="pd-field">
                <label className="pd-label" htmlFor="pd-name">Nome do Produto *</label>
                <input
                  id="pd-name"
                  className="pd-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="pd-field">
                <label className="pd-label">Imagem do Produto</label>
                <input
                  type="file"
                  accept="image/*"
                  className="pd-input-file"
                  onChange={(e) => handleImageFile(e, setFormData)}
                />
                {formData.image && (
                  <img src={formData.image} alt="preview" className="pd-img-preview" />
                )}
              </div>

              <div className="pd-grid2">
                <div className="pd-field">
                  <label className="pd-label" htmlFor="pd-price">Preço (R$) *</label>
                  <input
                    id="pd-price"
                    className="pd-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="pd-field">
                  <label className="pd-label" htmlFor="pd-category">Categoria *</label>
                  <select
                    id="pd-category"
                    className="pd-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/-/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pd-field">
                <label className="pd-label">Tamanhos Disponíveis</label>
                <div className="pd-sizes">
                  {SIZES.map((size) => (
                    <label key={size} className="pd-size-opt">
                      <input
                        type="checkbox"
                        checked={formData.sizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pd-field">
                <label className="pd-label" htmlFor="pd-discount">Desconto (%)</label>
                <input
                  id="pd-discount"
                  className="pd-input"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                />
              </div>

              <div className="pd-field">
                <label className="pd-label" htmlFor="pd-description">Descrição</label>
                <textarea
                  id="pd-description"
                  className="pd-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="pd-modal-footer">
                <button type="button" className="pd-btn-ghost" onClick={() => { setShowAdd(false); setFormData(EMPTY_FORM); }}>
                  Cancelar
                </button>
                <button type="submit" className="pd-btn">Adicionar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ── */}
      {editId !== null && (
        <div className="pd-overlay" onClick={() => setEditId(null)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="pd-modal-close" onClick={() => setEditId(null)}>×</button>
            <div className="pd-modal-title">Editar Produto</div>
            <form className="pd-form" onSubmit={handleEditSubmit}>
              <div className="pd-field">
                <label className="pd-label" htmlFor="ed-name">Nome do Produto *</label>
                <input
                  id="ed-name"
                  className="pd-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="pd-field">
                <label className="pd-label">Imagem do Produto</label>
                <input
                  type="file"
                  accept="image/*"
                  className="pd-input-file"
                  onChange={(e) => handleImageFile(e, setEditForm)}
                />
                {editForm.image && (
                  <img src={editForm.image} alt="preview" className="pd-img-preview" />
                )}
              </div>

              <div className="pd-grid2">
                <div className="pd-field">
                  <label className="pd-label" htmlFor="ed-price">Preço (R$) *</label>
                  <input
                    id="ed-price"
                    className="pd-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="pd-field">
                  <label className="pd-label" htmlFor="ed-category">Categoria *</label>
                  <select
                    id="ed-category"
                    className="pd-select"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                  >
                    <option value="">Selecione</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/-/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pd-field">
                <label className="pd-label">Tamanhos Disponíveis</label>
                <div className="pd-sizes">
                  {SIZES.map((size) => (
                    <label key={size} className="pd-size-opt">
                      <input
                        type="checkbox"
                        checked={editForm.sizes.includes(size)}
                        onChange={() => toggleEditSize(size)}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pd-field">
                <label className="pd-label" htmlFor="ed-discount">Desconto (%)</label>
                <input
                  id="ed-discount"
                  className="pd-input"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.discount}
                  onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                />
              </div>

              <div className="pd-field">
                <label className="pd-label" htmlFor="ed-description">Descrição</label>
                <textarea
                  id="ed-description"
                  className="pd-textarea"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="pd-modal-footer">
                <button type="button" className="pd-btn-ghost" onClick={() => setEditId(null)}>
                  Cancelar
                </button>
                <button type="submit" className="pd-btn">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
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
    </div>
  );
}