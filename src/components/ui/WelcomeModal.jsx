import { useState, useEffect } from 'react';
import { X, Tag, Copy, Check } from 'lucide-react';
import styles from './WelcomeModal.module.css';

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true') {
      setTimeout(() => setVisible(true), 800);
      localStorage.removeItem('isNewUser');
    }
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText('BEMVINDO10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={() => setVisible(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={() => setVisible(false)}>
          <X size={18} />
        </button>

        <div className={styles.iconWrapper}>
          <Tag size={28} />
        </div>

        <h2 className={styles.title}>Bem-vindo à Korea Imports! 🎉</h2>
        <p className={styles.subtitle}>
          Como presente de boas-vindas, você ganhou um cupom de <strong>10% de desconto</strong> na sua primeira compra!
        </p>

        <div className={styles.couponBox}>
          <span className={styles.couponCode}>BEMVINDO10</span>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        <p className={styles.couponInfo}>
          Use esse cupom e ganhe 10% de desconto. Válido apenas para a primeira compra.
        </p>

        <button className={styles.closeFullBtn} onClick={() => setVisible(false)}>
          Começar a comprar
        </button>

      </div>
    </div>
  );
}