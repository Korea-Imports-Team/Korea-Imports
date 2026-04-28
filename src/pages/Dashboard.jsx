import { useState } from "react";
import { products } from "../data/products";
import logoImg from "../assets/logo.png";
import "./Dashboard.css";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Unidades vendidas por produto (determinístico)
const UNITS_SOLD = {
  1: 138, 2: 109, 3: 130, 4: 88,  5: 79,  6: 90,
  7: 82,  8: 74,  9: 136, 10: 117, 11: 109, 12: 93,
  13: 90, 14: 82, 15: 100, 16: 91, 17: 75, 18: 64,
  19: 61, 20: 52, 21: 76,
};

// Faturamento mensal: índice 0 = mês atual, 11 = há 12 meses
const MONTHLY_BASE = [28900, 25700, 31200, 22400, 19800, 26500, 24100, 21300, 28700, 30100, 23500, 18900];

function buildMonthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: i,
      label: `${MONTH_NAMES[d.getMonth()]}/${d.getFullYear()}`,
      revenue: MONTHLY_BASE[i],
      prevRevenue: MONTHLY_BASE[i + 1] ?? MONTHLY_BASE[i] * 0.88,
    };
  });
}
const monthOptions = buildMonthOptions();

const getAnnualRevenue = (m) => MONTHLY_BASE.slice(0, m).reduce((a, b) => a + b, 0);

// Rankings
const ranked       = [...products].sort((a, b) => (UNITS_SOLD[b.id] || 0) - (UNITS_SOLD[a.id] || 0));
const bestSellers  = ranked.slice(0, 5);
const worstSellers = [...ranked].reverse().slice(0, 5);

const totalStock = products.reduce((a, p) => a + (p.sizes?.length ?? 0) * 8, 0);
const totalSold  = products.reduce((a, p) => a + (UNITS_SOLD[p.id] || 0), 0);

// ─── Ícones da sidebar ────────────────────────────────────────────────────────
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

// ─── Sub-componente: linha de produto ─────────────────────────────────────────
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
        <div className="kid-ps2">{UNITS_SOLD[product.id] ?? 0} vendidos</div>
      </div>
      <div className="kid-pp">{fmt(product.price)}</div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function KoreaDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selMonth, setSelMonth]   = useState(0);
  const [annualM, setAnnualM]     = useState(12);

  const md   = monthOptions[selMonth];
  const diff = ((md.revenue - md.prevRevenue) / md.prevRevenue) * 100;

  return (
    <div className="kid">

      {/* ── SIDEBAR ── */}
      <aside className="kid-sb">
        <div className="kid-brand">
          <div className="kid-av">K</div>
          <div>
            <div className="kid-bn">Korea Imports</div>
            <div className="kid-br">Admin Panel</div>
          </div>
        </div>

        <nav className="kid-nav">
          {["Dashboard", "Produtos", "Pedidos", "Cupons"].map((n) => {
            const on = activeNav === n;
            return (
              <button
                key={n}
                className={`kid-ni${on ? " on" : ""}`}
                onClick={() => setActiveNav(n)}
              >
                {ICONS[n](on)}
                {n}
              </button>
            );
          })}
        </nav>

        <div className="kid-foot">
          <button className="kid-ni" style={{ color: "#6B7280" }}>
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

        {/* Cabeçalho */}
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
              <select
                className="kid-sel"
                value={selMonth}
                onChange={(e) => setSelMonth(Number(e.target.value))}
              >
                {monthOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="kid-cv">{fmt(md.revenue)}</div>
            <div className={`kid-cc ${diff >= 0 ? "pos" : "neg"}`}>
              {diff >= 0 ? "+" : ""}{diff.toFixed(1)}% vs mês anterior
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
              <select
                className="kid-sel"
                value={annualM}
                onChange={(e) => setAnnualM(Number(e.target.value))}
              >
                {[3, 6, 9, 12].map((m) => (
                  <option key={m} value={m}>Últimos {m} meses</option>
                ))}
              </select>
            </div>
            <div className="kid-cv">{fmt(getAnnualRevenue(annualM))}</div>
            <div className="kid-cc">Últimos {annualM} meses</div>
          </div>

          {/* Estoque Total */}
          <div className="kid-sc a2">
            <div className="kid-ch">
              <span className="kid-cl">Estoque Total</span>
              <span className="kid-ci">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </span>
            </div>
            <div className="kid-cv">{totalStock}</div>
            <div className="kid-cc">{products.length} produtos</div>
          </div>

          {/* Total de Vendas */}
          <div className="kid-sc a2">
            <div className="kid-ch">
              <span className="kid-cl">Total de Vendas</span>
              <span className="kid-ci">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
              </span>
            </div>
            <div className="kid-cv">{totalSold}</div>
            <div className="kid-cc">Unidades vendidas</div>
          </div>

        </div>

        {/* Tabelas de produtos */}
        <div className="kid-tg a3">
          <div className="kid-tc">
            <div className="kid-th">
              <span className="kid-tt">Produtos Mais Vendidos</span>
              <span className="kid-bg">Top 3</span>
            </div>
            {bestSellers.map((p, i) => (
              <ProdRow key={p.id} rank={i + 1} product={p} />
            ))}
          </div>

          <div className="kid-tc">
            <div className="kid-th">
              <span className="kid-tt">Produtos Menos Vendidos</span>
              <span className="kid-bg">Bottom 3</span>
            </div>
            {worstSellers.map((p, i) => (
              <ProdRow key={p.id} rank={i + 1} product={p} />
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}