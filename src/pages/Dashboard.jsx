import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import logoImg from "../assets/logo.png";
import ProductsDashboard from "./ProductsDashboard";
import OrdersDashboard from "./OrdersDashboard";
import CuponsDashboard from "./CuponsDashboard";
import "./Dashboard.css";

const fmt = (n) =>
  "R$ " + Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const ICONS = {
  Dashboard: (active) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Produtos: (active) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  Pedidos: (active) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  Cupons: (active) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? "#fff" : "#6B7280"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12" />
      <path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  ),
};

function ProdRow({ rank, product }) {
  return (
    <div className="kid-pr">
      <div className={`kid-rk r${rank}`}>{rank}</div>
      <div className="kid-img">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="kid-pn">{product.name}</div>
        <div className="kid-ps2">{product.unitsSold} vendidos</div>
      </div>
      <div className="kid-pp">{fmt(product.revenue)}</div>
    </div>
  );
}

export default function KoreaDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [orders, setOrders]       = useState([]);
  const [totalProducts, setTotalProducts] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selMonth, setSelMonth]   = useState(0);
  const [annualM, setAnnualM]     = useState(12);

  useEffect(() => {
    if (activeNav !== "Dashboard") return;
    setLoading(true);
    Promise.all([
      api.get("/admin/orders"),
      api.get("/products?all=true", { auth: false }),
    ])
      .then(([ordersData, productsData]) => {
        setOrders(ordersData);
        setTotalProducts(productsData.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeNav]);

  const summary = useMemo(() => {
    const now = new Date();

    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = orders.filter((o) => {
        const t = new Date(o.createdAt);
        return t >= d && t < next && o.status !== "CANCELLED";
      });
      return {
        value:   i,
        label:   `${MONTH_NAMES[d.getMonth()]}/${d.getFullYear()}`,
        revenue: monthOrders.reduce((s, o) => s + Number(o.total), 0),
        count:   monthOrders.length,
      };
    });

    const productMap = {};
    orders
      .filter((o) => o.status !== "CANCELLED")
      .forEach((o) => {
        o.items.forEach((item) => {
          if (!productMap[item.productId]) {
            productMap[item.productId] = {
              id:        item.productId,
              name:      item.productName,
              image:     item.productImage,
              unitsSold: 0,
              revenue:   0,
            };
          }
          productMap[item.productId].unitsSold += item.quantity;
          productMap[item.productId].revenue   += Number(item.subtotal);
        });
      });

    const ranked       = Object.values(productMap).sort((a, b) => b.unitsSold - a.unitsSold);
    const bestSellers  = ranked.slice(0, 5);
    const worstSellers = [...ranked].reverse().slice(0, 5);
    const totalSold    = ranked.reduce((s, p) => s + p.unitsSold, 0);

    const statusCount  = { PENDING: 0, PROCESSING: 0, SHIPPED: 0, IN_TRANSIT: 0, DELIVERED: 0 };
    orders.forEach((o) => {
      if (statusCount[o.status] !== undefined) statusCount[o.status]++;
    });

    return { byMonth, bestSellers, worstSellers, totalSold, statusCount };
  }, [orders]);

  const monthOptions  = summary.byMonth;
  const md            = monthOptions[selMonth]    ?? { label: "-", revenue: 0, count: 0 };
  const prevMd        = monthOptions[selMonth + 1] ?? { revenue: 0 };
  const diff          = prevMd.revenue > 0
    ? ((md.revenue - prevMd.revenue) / prevMd.revenue) * 100
    : 0;
  const annualRevenue = monthOptions.slice(0, annualM).reduce((s, m) => s + m.revenue, 0);

  if (loading && activeNav === "Dashboard") {
    return (
      <div className="kid">
        <aside className="kid-sb">
          <div className="kid-brand">
            <img src={logoImg} alt="Korea Imports" className="kid-logo" />
          </div>
        </aside>
        <main className="kid-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6B7280" }}>Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="kid">

      {/* ── SIDEBAR ── */}
      <aside className="kid-sb">
        <div className="kid-brand">
          <img src={logoImg} alt="Korea Imports" className="kid-logo" />
        </div>

        <nav className="kid-nav">
          {["Dashboard", "Produtos", "Pedidos", "Cupons"].map((n) => {
            const on = activeNav === n;
            return (
              <button key={n} className={`kid-ni${on ? " on" : ""}`} onClick={() => setActiveNav(n)}>
                {ICONS[n](on)}
                {n}
              </button>
            );
          })}
        </nav>

        <div className="kid-foot">
          <button className="kid-ni" style={{ color: "#6B7280" }} onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#6B7280" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Voltar à Loja
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="kid-main">
        {activeNav === "Produtos" ? (
          <ProductsDashboard />
        ) : activeNav === "Pedidos" ? (
          <OrdersDashboard />
        ) : activeNav === "Cupons" ? (
          <CuponsDashboard />
        ) : (
          <>
            <div className="kid-ph a0">
              <div className="kid-pt">Dashboard</div>
              <div className="kid-ps">Visão geral do seu e-commerce</div>
            </div>

            {/* Cards de estatísticas */}
            <div className="kid-sg">

              {/* Faturamento Mensal */}
              <div className="kid-sc a1">
                <div className="kid-ch">
                  <span className="kid-cl">Faturamento Mensal</span>
                  <span className="kid-ci">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  </span>
                </div>
                <div className="kid-sel-wrap">
                  <select className="kid-sel" value={selMonth}
                    onChange={(e) => setSelMonth(Number(e.target.value))}>
                    {monthOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="kid-cv-wrap">
                  <div className="kid-cv">{fmt(md.revenue)}</div>
                  <div className={`kid-cc ${diff >= 0 ? "pos" : "neg"}`}>
                    {diff >= 0 ? "+" : ""}{diff.toFixed(1)}% vs mês anterior
                  </div>
                </div>
              </div>

              {/* Faturamento Anual */}
              <div className="kid-sc a1">
                <div className="kid-ch">
                  <span className="kid-cl">Faturamento Anual</span>
                  <span className="kid-ci">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </span>
                </div>
                <div className="kid-sel-wrap">
                  <select className="kid-sel" value={annualM}
                    onChange={(e) => setAnnualM(Number(e.target.value))}>
                    {[3, 6, 12].map((m) => (
                      <option key={m} value={m}>Últimos {m} meses</option>
                    ))}
                  </select>
                </div>
                <div className="kid-cv-wrap">
                  <div className="kid-cv">{fmt(annualRevenue)}</div>
                  <div className="kid-cc" style={{ color: "#6B7280" }}>
                    {monthOptions.slice(0, annualM).reduce((s, m) => s + m.count, 0)} pedidos
                  </div>
                </div>
              </div>

              {/* Unidades vendidas */}
              <div className="kid-sc a2">
                <div className="kid-ch">
                  <span className="kid-cl">Unidades Vendidas</span>
                </div>
                <div className="kid-cv-wrap">
                  <div className="kid-cv">{summary.totalSold}</div>
                  <div className="kid-cc" style={{ color: "#6B7280" }}>total acumulado</div>
                </div>
              </div>

              {/* Produtos cadastrados (substituiu totalStock) */}
              <div className="kid-sc a2">
                <div className="kid-ch">
                  <span className="kid-cl">Produtos Cadastrados</span>
                </div>
                <div className="kid-cv-wrap">
                  <div className="kid-cv">{totalProducts ?? "—"}</div>
                  <div className="kid-cc" style={{ color: "#6B7280" }}>no catálogo</div>
                </div>
              </div>

              {/* Status de pedidos */}
              <div className="kid-sc a3" style={{ gridColumn: "span 2" }}>
                <div className="kid-ch">
                  <span className="kid-cl">Status dos Pedidos</span>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                  {[
                    { key: "PENDING",    label: "Pendentes",    color: "#d97706" },
                    { key: "PROCESSING", label: "Em separação", color: "#1353a7" },
                    { key: "SHIPPED",    label: "Enviados",     color: "#7c3aed" },
                    { key: "IN_TRANSIT", label: "Em trânsito",  color: "#0891b2" },
                    { key: "DELIVERED",  label: "Entregues",    color: "#16a34a" },
                  ].map(({ key, label, color }) => (
                    <div key={key} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>
                        {summary.statusCount[key]}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Rankings */}
            <div className="kid-rg">
              <div className="kid-rc">
                <div className="kid-rh">Mais Vendidos</div>
                {summary.bestSellers.length === 0 ? (
                  <p style={{ color: "#6B7280", fontSize: "0.875rem", padding: "1rem 0" }}>
                    Nenhum pedido registrado ainda.
                  </p>
                ) : (
                  summary.bestSellers.map((p, i) => (
                    <ProdRow key={p.id} rank={i + 1} product={p} />
                  ))
                )}
              </div>

              <div className="kid-rc">
                <div className="kid-rh">Menos Vendidos</div>
                {summary.worstSellers.length === 0 ? (
                  <p style={{ color: "#6B7280", fontSize: "0.875rem", padding: "1rem 0" }}>
                    Nenhum pedido registrado ainda.
                  </p>
                ) : (
                  summary.worstSellers.map((p, i) => (
                    <ProdRow key={p.id} rank={i + 1} product={p} />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}