import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../services/api';
import "./OrdersDashboard.css";

const STATUS_LABELS = {
  PENDING:    'Pendente',
  PROCESSING: 'Em Separação',
  SHIPPED:    'Enviado',
  IN_TRANSIT: 'Em Transporte',
  DELIVERED:  'Entregue',
};

const STATUS_CLASS = {
  pending:      "od-s-pending",
  processing:   "od-s-processing",
  shipped:      "od-s-shipped",
  "in-transit": "od-s-transit",
  delivered:    "od-s-delivered",
};

/* ── StatusBadge: badge colorido + chevron separado + dropdown limpo ── */
function StatusBadge({ orderId, status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function select(val) {
    onChange(orderId, val);
    setOpen(false);
  }

  return (
    <div className="od-status-wrap" ref={ref}>
      <div className="od-status-row">
        <span className={`od-status-badge ${STATUS_CLASS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
        <button
          className="od-chevron-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Alterar status"
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="od-status-dropdown">
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <div
              key={val}
              className={`od-status-option${status === val ? " active" : ""}`}
              onClick={() => select(val)}
            >
              <span>{label}</span>
              {status === val && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function OrdersDashboard() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]           = useState("");
  const [viewOrder, setViewOrder]     = useState(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingSaved, setTrackingSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/orders')
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(
    (o) =>
      (o.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingAddress?.name || o.customerName || '').toLowerCase().includes(search.toLowerCase())
  );

  async function handleStatusChange(orderId, newStatus) {
    try {
      const updated = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao atualizar status.');
    }
  }

  function openModal(order) {
    setViewOrder(order);
    setTrackingInput(order.trackingCode || order.shippingInfo?.trackingCode || "");
    setTrackingSaved(false);
  }

  async function handleTracking(orderId, trackingCode) {
    try {
      const updated = await api.patch(`/admin/orders/${orderId}/tracking`, { trackingCode });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return updated;
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao salvar código.');
      return null;
    }
  }

  async function saveTrackingCode() {
    if (!viewOrder) return;
    const code = trackingInput.trim().toUpperCase();
    const updated = await handleTracking(viewOrder.id, code || null);
    if (!updated) return;

    setViewOrder(updated);
    setTrackingSaved(true);
    setTimeout(() => setTrackingSaved(false), 2500);
  }

  return (
    <div className="od">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>Gestão de Pedidos</div>
        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Gerencie os pedidos dos clientes</div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <div className="od-search-wrap">
          <span className="od-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="od-search"
            placeholder="Buscar pedidos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="od-table-wrap">
        <table className="od-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Produtos</th>
              <th>Total</th>
              <th>Status</th>
              <th className="right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="od-empty">Nenhum pedido encontrado.</td></tr>
            ) : (
              filtered.map((order) => {
                const customerName = order.shippingAddress?.name || order.customerName || 'Cliente';
                const city = order.shippingAddress?.city || order.shippingInfo?.city || '';
                const state = order.shippingAddress?.state || order.shippingInfo?.state || '';
                const dateVal = order.createdAt || order.date;
                const itemsCount = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
                const orderTotal = Number(order.total || 0);

                return (
                  <tr key={order.id}>
                    <td><span className="od-id">{order.id}</span></td>
                    <td>
                      <div className="od-customer-name">{customerName}</div>
                      <div className="od-customer-city">
                        {city ? `${city}${state ? ` - ${state}` : ''}` : 'N/A'}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "#374151" }}>
                      {dateVal ? new Date(dateVal).toLocaleDateString("pt-BR") : 'N/A'}
                    </td>
                    <td style={{ fontSize: 13, color: "#6B7280" }}>
                      {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                    </td>
                    <td><span className="od-total">R$ {orderTotal.toFixed(2)}</span></td>
                    <td>
                      <StatusBadge
                        orderId={order.id}
                        status={order.status}
                        onChange={handleStatusChange}
                      />
                    </td>
                    <td className="right">
                      <button
                        className="od-icon-btn"
                        title="Ver detalhes"
                        onClick={() => openModal(order)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="od-overlay" onClick={() => setViewOrder(null)}>
          <div className="od-modal" onClick={(e) => e.stopPropagation()}>

            <div className="od-modal-header">
              <div className="od-modal-title">Detalhes do Pedido {viewOrder.id}</div>
              <button className="od-close-btn" onClick={() => setViewOrder(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Cliente */}
            <div className="od-section">
              <div className="od-section-title">Cliente</div>
              <div className="od-info-name">
                {viewOrder.shippingAddress?.name || viewOrder.customerName || 'Cliente'}
              </div>
              <div className="od-info-sub">
                {viewOrder.shippingAddress
                  ? `${viewOrder.shippingAddress.street || ''}${viewOrder.shippingAddress.number ? `, ${viewOrder.shippingAddress.number}` : ''}${viewOrder.shippingAddress.complement ? ` - ${viewOrder.shippingAddress.complement}` : ''}${viewOrder.shippingAddress.neighborhood ? ` - ${viewOrder.shippingAddress.neighborhood}` : ''}`
                  : (viewOrder.shippingInfo?.address || 'Nenhum endereço informado')}
              </div>
              <div className="od-info-sub">
                {viewOrder.shippingAddress
                  ? `${viewOrder.shippingAddress.city || ''} - ${viewOrder.shippingAddress.state || ''} - CEP ${viewOrder.shippingAddress.cep || ''}`
                  : `${viewOrder.shippingInfo?.city || ''} - ${viewOrder.shippingInfo?.state || ''} - CEP ${viewOrder.shippingInfo?.cep || ''}`}
              </div>
            </div>

            {/* Código de rastreamento */}
            <div className="od-section">
              <div className="od-section-title">Código de Rastreamento</div>
              <div className="od-tracking-row">
                <input
                  className="od-tracking-input"
                  type="text"
                  placeholder="Ex: AA123456789BR"
                  value={trackingInput}
                  onChange={(e) => { setTrackingInput(e.target.value); setTrackingSaved(false); }}
                  maxLength={13}
                />
                <button className="od-tracking-save-btn" onClick={saveTrackingCode}>
                  Salvar
                </button>
              </div>
              {trackingSaved && (
                <div className="od-tracking-feedback">
                  ✓ Código salvo — o cliente já pode ver
                </div>
              )}
              {(viewOrder.trackingCode || viewOrder.shippingInfo?.trackingCode) && (
                <a
                  href={`https://rastreamento.correios.com.br/app/index.php?objetos=${viewOrder.trackingCode || viewOrder.shippingInfo?.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="od-tracking-link"
                >
                  Rastrear no site dos Correios ↗
                </a>
              )}
            </div>

            {/* Produtos */}
            <div className="od-section">
              <div className="od-section-title">Produtos</div>
              {(viewOrder.items || []).map((item, i) => {
                const itemName = item.productName || item.name;
                const itemImg = item.productImage || item.image;
                const unitPrice = Number(item.priceAtTime ?? item.price ?? 0);
                const itemTotal = Number(item.subtotal ?? (unitPrice * (item.quantity || 1)));

                return (
                  <div key={i} className="od-item-row">
                    <img
                      className="od-item-img"
                      src={itemImg}
                      alt={itemName}
                      onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="od-item-name">{itemName}</div>
                      <div className="od-item-sub">Tamanho: {item.size || 'N/A'} • Qtd: {item.quantity}</div>
                    </div>
                    <div className="od-item-price">R$ {itemTotal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="od-total-row">
              <span className="od-total-label">Total</span>
              <span className="od-total-val">R$ {Number(viewOrder.total || 0).toFixed(2)}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}