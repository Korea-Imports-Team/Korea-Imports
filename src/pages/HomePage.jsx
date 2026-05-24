import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { products } from '../data/products';
import HeroBanner from '../components/HeroBanner';
import FeaturesSection from '../components/FeaturesSection';
import ProductSection from '../components/ProductSection';
import CtaBanner from '../components/CtaBanner';
import WelcomeModal from '../components/WelcomeModal';

export default function HomePage() {
  const location = useLocation();
  const newProducts = useMemo(() => products.filter((p) => p.isNew).slice(0, 3), []);
  const bestSellers = useMemo(() => products.filter((p) => p.isBestSeller).slice(0, 4), []);
  const promoProducts = useMemo(() => products.filter((p) => p.discount).slice(0, 3), []);

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

