import { useMemo } from 'react';
import { products } from '../data/products';
import HeroBanner from '../components/sections/HeroBanner';
import FeaturesSection from '../components/sections/FeaturesSection';
import ProductSection from '../components/sections/ProductSection';
import CtaBanner from '../components/sections/CtaBanner';
import WelcomeModal from '../components/ui/WelcomeModal';

export default function HomePage() {
  const newProducts = useMemo(() => products.filter((p) => p.isNew).slice(0, 3), []);
  const bestSellers = useMemo(() => products.filter((p) => p.isBestSeller).slice(0, 4), []);
  const promoProducts = useMemo(() => products.filter((p) => p.discount).slice(0, 3), []);

  return (
    <main>
      <WelcomeModal />
      <HeroBanner />
      <FeaturesSection />
      <ProductSection
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

