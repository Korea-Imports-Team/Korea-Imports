import { useState, useRef, useEffect } from "react";
import "./OrdersDashboard.css";

const STATUS_LABELS = {
  pending:      "Pendente",
  processing:   "Em Separação",
  shipped:      "Enviado",
  "in-transit": "Em Transporte",
  delivered:    "Entregue",
};

const STATUS_CLASS = {
  pending:      "od-s-pending",
  processing:   "od-s-processing",
  shipped:      "od-s-shipped",
  "in-transit": "od-s-transit",
  delivered:    "od-s-delivered",
};

const MOCK_ORDERS = [
  {
    id: "ORD-0001",
    customerName: "Lucas Ferreira",
    date: "2026-04-20",
    status: "delivered",
    total: 179.80,
    shippingInfo: { city: "São Paulo", state: "SP", address: "Rua das Flores, 123", cep: "01310-100", trackingCode: "BR123456789" },
    items: [
      { name: "Camiseta Oversized Azul", size: "M", quantity: 1, price: 89.90, image: "/src/assets/Camiseta Oversized Azul.jpeg" },
      { name: "Shorts Liso Brooksfield", size: "M", quantity: 1, price: 89.90, image: "/src/assets/Shorts Liso Brooksfield.jpeg" },
    ],
  },
  {
    id: "ORD-0002",
    customerName: "Mariana Costa",
    date: "2026-04-22",
    status: "shipped",
    total: 143.92,
    shippingInfo: { city: "Rio de Janeiro", state: "RJ", address: "Av. Atlântica, 500", cep: "22010-000", trackingCode: "BR987654321" },
    items: [
      { name: "Camiseta Oversized Nike Branca", size: "G", quantity: 1, price: 143.92, image: "/src/assets/Camiseta Oversized Nike Branca.jpeg" },
    ],
  },
  {
    id: "ORD-0003",
    customerName: "Rafael Souza",
    date: "2026-04-23",
    status: "processing",
    total: 161.41,
    shippingInfo: { city: "Belo Horizonte", state: "MG", address: "Rua da Bahia, 200", cep: "30160-010", trackingCode: null },
    items: [
      { name: "Calça Alfaiataria Zara", size: "P", quantity: 1, price: 161.41, image: "/src/assets/Calça Alfaiataria Zara.jpeg" },
    ],
  },
  {
    id: "ORD-0004",
    customerName: "Isabela Nunes",
    date: "2026-04-24",
    status: "in-transit",
    total: 259.80,
    shippingInfo: { city: "Curitiba", state: "PR", address: "Rua XV de Novembro, 55", cep: "80020-310", trackingCode: "BR112233445" },
    items: [
      { name: "Polo Emporio Armani Azul", size: "M", quantity: 1, price: 79.90, image: "/src/assets/Polo Emporio Armani Azul.jpeg" },
      { name: "Moletom Canguru Brooksfield", size: "G", quantity: 1, price: 134.91, image: "/src/assets/Moletom Canguru Brooksfield.jpeg" },
    ],
  },
  {
    id: "ORD-0005",
    customerName: "Carlos Mendes",
    date: "2026-04-25",
    status: "pending",
    total: 89.90,
    shippingInfo: { city: "Porto Alegre", state: "RS", address: "Av. Ipiranga, 1000", cep: "90160-091", trackingCode: null },
    items: [
      { name: "Camiseta Lacoste Golf Azul", size: "GG", quantity: 1, price: 89.91, image: "/src/assets/Camiseta Lacoste Golf Azul.jpeg" },
    ],
  },
  {
    id: "ORD-0006",
    customerName: "Fernanda Lima",
    date: "2026-04-26",
    status: "pending",
    total: 269.82,
    shippingInfo: { city: "Salvador", state: "BA", address: "Rua Chile, 8", cep: "40020-050", trackingCode: null },
    items: [
      { name: "Camiseta Oversized Azul", size: "P", quantity: 1, price: 89.90, image: "/src/assets/Camiseta Oversized Azul.jpeg" },
      { name: "Calça Alfaiataria Zara", size: "M", quantity: 1, price: 161.41, image: "/src/assets/Calça Alfaiataria Zara.jpeg" },
    ],
  },
];

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
  const [orders, setOrders]       = useState(MOCK_ORDERS);
  const [search, setSearch]       = useState("");
  const [viewOrder, setViewOrder] = useState(null);

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  function handleStatusChange(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
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
              filtered.map((order) => (
                <tr key={order.id}>
                  <td><span className="od-id">{order.id}</span></td>
                  <td>
                    <div className="od-customer-name">{order.customerName}</div>
                    <div className="od-customer-city">{order.shippingInfo.city} - {order.shippingInfo.state}</div>
                  </td>
                  <td style={{ fontSize: 13, color: "#374151" }}>
                    {new Date(order.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ fontSize: 13, color: "#6B7280" }}>
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td><span className="od-total">R$ {order.total.toFixed(2)}</span></td>
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
                      onClick={() => setViewOrder(order)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
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
              <div className="od-info-name">{viewOrder.customerName}</div>
              <div className="od-info-sub">{viewOrder.shippingInfo.address}</div>
              <div className="od-info-sub">
                {viewOrder.shippingInfo.city} - {viewOrder.shippingInfo.state} - CEP {viewOrder.shippingInfo.cep}
              </div>
              {viewOrder.shippingInfo.trackingCode && (
                <div className="od-info-sub">Rastreio: {viewOrder.shippingInfo.trackingCode}</div>
              )}
            </div>

            {/* Produtos */}
            <div className="od-section">
              <div className="od-section-title">Produtos</div>
              {viewOrder.items.map((item, i) => (
                <div key={i} className="od-item-row">
                  <img
                    className="od-item-img"
                    src={item.image}
                    alt={item.name}
                    onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="od-item-name">{item.name}</div>
                    <div className="od-item-sub">Tamanho: {item.size} • Qtd: {item.quantity}</div>
                  </div>
                  <div className="od-item-price">R$ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="od-total-row">
              <span className="od-total-label">Total</span>
              <span className="od-total-val">R$ {viewOrder.total.toFixed(2)}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}