import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import styles from './CtaBanner.module.css';

export default function CtaBanner() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Se estiver logado, não mostra o banner
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