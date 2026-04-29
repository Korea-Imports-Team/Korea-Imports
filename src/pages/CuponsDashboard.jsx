import { useState } from "react";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import "./CuponsDashboard.css";

const mockCoupons = [
  {
    id: 1,
    code: "BEMVINDO10",
    type: "percentage",
    value: 10,
    expiresAt: "2026-12-31",
    minPurchase: 50,
    active: true,
  },
  {
    id: 2,
    code: "FRETEGRATIS",
    type: "fixed",
    value: 15,
    expiresAt: "2026-11-30",
    minPurchase: 100,
    active: true,
  },
  {
    id: 3,
    code: "DESCONTO5",
    type: "percentage",
    value: 5,
    expiresAt: "2026-10-15",
    minPurchase: null,
    active: false,
  },
];

export default function CuponsDashboard() {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [notification, setNotification] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    expiresAt: "",
    minPurchase: "",
    active: true,
  });

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(""), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Editar cupom existente
      setCoupons(coupons.map(coupon =>
        coupon.id === editingId
          ? {
              ...coupon,
              code: formData.code,
              type: formData.type,
              value: formData.type === "percentage" ? parseInt(formData.value) : parseFloat(formData.value),
              expiresAt: formData.expiresAt,
              minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
              active: formData.active,
            }
          : coupon
      ));
      showNotification("Cupom atualizado com sucesso!");
      setEditingId(null);
    } else {
      // Criar novo cupom
      const newCoupon = {
        id: Math.max(...coupons.map(c => c.id), 0) + 1,
        code: formData.code,
        type: formData.type,
        value: formData.type === "percentage" ? parseInt(formData.value) : parseFloat(formData.value),
        expiresAt: formData.expiresAt,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        active: formData.active,
      };
      setCoupons([...coupons, newCoupon]);
      showNotification("Cupom criado com sucesso!");
    }
    
    setIsDialogOpen(false);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      expiresAt: "",
      minPurchase: "",
      active: true,
    });
  };

  const openEditModal = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      expiresAt: coupon.expiresAt,
      minPurchase: coupon.minPurchase ? String(coupon.minPurchase) : "",
      active: coupon.active,
    });
    setIsDialogOpen(true);
  };

  const closeModal = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      expiresAt: "",
      minPurchase: "",
      active: true,
    });
  };

  const deleteCoupon = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteCoupon = () => {
    setCoupons(coupons.filter(coupon => coupon.id !== confirmDeleteId));
    setConfirmDeleteId(null);
    showNotification("Cupom removido com sucesso!");
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmCoupon = coupons.find((coupon) => coupon.id === confirmDeleteId);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    showNotification("Código copiado!");
  };

  return (
    <div className="cd cd-space-y-6">
      <div className="cd-flex cd-items-center cd-justify-between">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>Gestão de Cupons</h1>
          <p className="cd-text-muted cd-mt-1">
            Crie e gerencie cupons de desconto
          </p>
        </div>
        <button className="cd-btn" onClick={() => setIsDialogOpen(true)}>
          <Plus size={16} />
          Criar Cupom
        </button>
      </div>

      {notification && (
        <div className="cd-toast">
          <span>{notification}</span>
        </div>
      )}

      {confirmDeleteId !== null && confirmCoupon && (
        <div className="cd-overlay" onClick={cancelDelete}>
          <div className="cd-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-confirm-title">Remover cupom</div>
            <div className="cd-confirm-text">
              Tem certeza que deseja remover o cupom <strong>{confirmCoupon.code}</strong>?
            </div>
            <div className="cd-confirm-buttons">
              <button type="button" className="cd-btn-outline" onClick={cancelDelete}>
                Cancelar
              </button>
              <button type="button" className="cd-btn cd-btn-danger" onClick={confirmDeleteCoupon}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="cd-table-wrap">
        <table className="cd-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Validade</th>
              <th>Compra Mínima</th>
              <th>Status</th>
              <th className="cd-text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>
                  <div className="cd-flex cd-items-center cd-gap-2">
                    <code className="cd-code">{coupon.code}</code>
                    <button
                      className="cd-btn-icon"
                      style={{ width: 24, height: 24 }}
                      onClick={() => copyToClipboard(coupon.code)}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </td>
                <td className="cd-capitalize">{coupon.type === "percentage" ? "Porcentagem" : "Valor Fixo"}</td>
                <td className="cd-font-medium">
                  {coupon.type === "percentage"
                    ? `${coupon.value}%`
                    : `R$ ${coupon.value.toFixed(2)}`}
                </td>
                <td>
                  {new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}
                </td>
                <td>
                  {coupon.minPurchase
                    ? `R$ ${coupon.minPurchase.toFixed(2)}`
                    : "-"}
                </td>
                <td>
                  <span className={`cd-badge ${coupon.active ? "cd-badge-active" : "cd-badge-inactive"}`}>
                    {coupon.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="cd-text-right">
                  <div className="cd-flex cd-justify-between cd-gap-2">
                    <button
                      className="cd-btn-ghost"
                      onClick={() => openEditModal(coupon)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="cd-btn-ghost"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <Trash2 size={16} style={{ color: "#dc2626" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isDialogOpen && (
        <div className="cd-overlay" onClick={closeModal}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cd-modal-header">
              <div className="cd-modal-title">{editingId ? "Editar Cupom" : "Criar Novo Cupom"}</div>
              <button type="button" className="cd-modal-close" onClick={closeModal} aria-label="Fechar modal">×</button>
            </div>
            <form className="cd-form" onSubmit={handleSubmit}>
              <div className="cd-field">
                <label className="cd-label" htmlFor="code">Código do Cupom *</label>
                <input
                  id="code"
                  className="cd-input"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Ex: BEMVINDO10"
                  required
                />
              </div>

              <div className="cd-field">
                <label className="cd-label" htmlFor="type">Tipo de Desconto *</label>
                <select
                  id="type"
                  className="cd-select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div className="cd-field">
                <label className="cd-label" htmlFor="value">
                  Valor {formData.type === "percentage" ? "(%)" : "(R$)"} *
                </label>
                <input
                  id="value"
                  className="cd-input"
                  type="number"
                  step={formData.type === "fixed" ? "0.01" : "1"}
                  min="0"
                  max={formData.type === "percentage" ? "100" : undefined}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  required
                />
              </div>

              <div className="cd-field">
                <label className="cd-label" htmlFor="expiresAt">Data de Validade *</label>
                <input
                  id="expiresAt"
                  className="cd-input"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  required
                />
              </div>

              <div className="cd-field">
                <label className="cd-label" htmlFor="minPurchase">
                  Compra Mínima (R$) - Opcional
                </label>
                <input
                  id="minPurchase"
                  className="cd-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minPurchase}
                  onChange={(e) =>
                    setFormData({ ...formData, minPurchase: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="cd-flex cd-items-center cd-gap-2">
                <label className="cd-switch">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                  />
                  <span className="cd-slider"></span>
                </label>
                <label className="cd-label" htmlFor="active" style={{ marginBottom: 0 }}>Cupom Ativo</label>
              </div>

              <div className="cd-modal-footer">
                <button
                  type="button"
                  className="cd-btn-outline"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="cd-btn">{editingId ? "Atualizar Cupom" : "Criar Cupom"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
