import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <img
              src="/src/assets/logo.png"
              alt="Korea Imports"
              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '50%' }}
            />
            <div>
              <span className={styles.brandName}>Korea Imports</span>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Navegação</h4>
          <ul className={styles.colLinks}>
            <li><Link to="/catalogo">Catálogo</Link></li>
            <li><Link to="/sobre">Sobre Nós</Link></li>
            <li><Link to="/contato">Contato</Link></li>
          </ul>
        </div>

        {/* Atendimento */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Atendimento</h4>
          <ul className={styles.colLinks}>
            <li><Link to="/rastrear">Rastrear Pedido</Link></li>
            <li><Link to="/trocas">Trocas e Devoluções</Link></li>
            <li><Link to="/faq">Perguntas Frequentes</Link></li>
          </ul>
        </div>

        {/* Contato */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contato</h4>
          <a href="mailto:contato@koreaimports.com" className={styles.email}>
            <Mail size={15} />
            contato@koreaimports.com
          </a>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram" className="social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook" className="social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.7 5.5 4.4 9 4.5-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© 2026 Korea Imports. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}