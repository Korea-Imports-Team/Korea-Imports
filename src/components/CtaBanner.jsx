import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './CtaBanner.module.css';

export default function CtaBanner() {
  const { user } = useAuth();

  if (user) return null;

  return (
    <section className={styles.banner}>
      <div className={`container ${styles.content}`}>
        <h2 className={styles.title}>Cadastre-se e ganhe 10% de desconto</h2>
        <p className={styles.subtitle}>Receba novidades e ofertas exclusivas</p>
        <Link to="/cadastro" className={styles.btn}>
          Criar Conta Grátis
        </Link>
      </div>
    </section>
  );
}