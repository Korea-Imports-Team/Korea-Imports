import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useProductsData } from '../context/ProductsContext';
import HeroBanner from '../components/HeroBanner';
import FeaturesSection from '../components/FeaturesSection';
import ProductSection from '../components/ProductSection';
import CtaBanner from '../components/CtaBanner';
import WelcomeModal from '../components/WelcomeModal';

export default function HomePage() {
  const location = useLocation();
  const { products } = useProductsData();
  const newProducts = useMemo(() => {
    const news = products.filter((p) => p.isNew);
    return (news.length > 0 ? news : products).slice(0, 3);
  }, [products]);

  const bestSellers = useMemo(() => {
    const bests = products.filter((p) => p.isBestSeller);
    // Se nenhum produto foi marcado explicitamente como isBestSeller no backend,
    // usa os produtos disponíveis ordenados por avaliação (rating) ou os primeiros produtos como fallback
    if (bests.length > 0) return bests.slice(0, 4);
    return [...products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [products]);

  const promoProducts = useMemo(() => products.filter((p) => p.discount).slice(0, 3), [products]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <main>
      <WelcomeModal />
      <HeroBanner />
      <FeaturesSection />
      <ProductSection
        id="novidades"
        title="Novidades"
        subtitle="Confira os produtos recém-chegados"
        products={newProducts}
        linkTo="/catalogo?filtro=novo"
      />
      <ProductSection
        title="Mais Vendidos"
        subtitle="Os favoritos dos nossos clientes"
        products={bestSellers}
        linkTo="/catalogo?filtro=mais-vendidos"
      />
      <ProductSection
        id="promocoes"
        title="Promoções"
        subtitle="Aproveite os descontos especiais"
        products={promoProducts}
        linkTo="/catalogo?filtro=promocoes"
      />
      <CtaBanner />
    </main>
  );
}

/**
 
 Seções exibidas:
 - HeroBanner     → banner principal com imagem de fundo
 - FeaturesSection → diferenciais da loja
 - ProductSection  → Novidades (produtos com isNew: true)
 - ProductSection  → Mais Vendidos (produtos com isBestSeller: true)
 - ProductSection  → Promoções (produtos com desconto)
 - CtaBanner       → call-to-action para cadastro
 */

