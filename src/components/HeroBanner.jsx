import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={`container ${styles.content}`}>
        <h1 className={styles.title}>Seu estilo começa aqui.
        </h1>
        <p className={styles.subtitle}>
          Roupas que combinam conforto, qualidade e identidade no seu dia a dia
        </p>
        <div className={styles.actions}>
          <Link to="/catalogo" className={styles.btnPrimary}>
            Ver Catálogo
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}