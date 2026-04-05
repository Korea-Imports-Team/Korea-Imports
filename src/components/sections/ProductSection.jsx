import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';
import styles from './ProductSection.module.css';

export default function ProductSection({ title, subtitle, products, linkTo = '/catalogo', linkLabel = 'Ver Todos' }) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <Link to={linkTo} className={styles.viewAll}>
            {linkLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**

 Seção reutilizável para exibir um grid de produtos com título, subtítulo e link "Ver Todos".
 
 Props:
 - title (string)     → título da seção
 - subtitle (string)  → subtítulo opcional
 - products (array)   → lista de produtos a exibir
 - linkTo (string)    → rota do botão "Ver Todos"
 - linkLabel (string) → texto do botão (padrão: "Ver Todos")
 */

