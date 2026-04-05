import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Search, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../hooks/useProducts';
import { categories } from '../../data/products';
import styles from './Header.module.css';

export default function Header() {
  const { cartCount, wishlistItems } = useCart();
  const { user, logout } = useAuth();
  const { query, setQuery, results } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(`.${styles.userMenu}`)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(query)}`);
      setQuery('');
      setSearchOpen(false);
    }
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img src="/src/assets/logo.png" alt="Korea Imports" style={{ height: '82px', width: '82px', objectFit: 'cover', borderRadius: '50%' }} />
        </Link>

        {/* Nav centralizada */}
        <nav className={styles.nav}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.id === 'inicio' ? '/' :
                cat.id === 'todos' ? '/catalogo' : `/catalogo?categoria=${cat.id}`}
              className={styles.navLink}
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>

          {/* Search */}
          <div className={styles.searchWrapper}>
            <button
              className={styles.actionBtn}
              aria-label="Buscar"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={20} />
            </button>
            {searchOpen && (
              <form className={styles.searchDropdown} onSubmit={handleSearchSubmit}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X size={14} />
                </button>
                {results.length > 0 && (
                  <div className={styles.searchResults}>
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/produto/${product.id}`}
                        className={styles.searchResult}
                        onClick={() => { setQuery(''); setSearchOpen(false); }}
                      >
                        <img src={product.image} alt={product.name} />
                        <div>
                          <span className={styles.searchResultName}>{product.name}</span>
                          <span className={styles.searchResultPrice}>
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </form>
            )}
          </div>

          <Link to="/favoritos" className={styles.actionBtn} aria-label="Favoritos">
            <Heart size={20} />
            {wishlistItems.length > 0 && (
              <span className={styles.badge}>{wishlistItems.length}</span>
            )}
          </Link>

          <Link to="/carrinho" className={styles.actionBtn} aria-label="Carrinho">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className={styles.badge}>{cartCount}</span>
            )}
          </Link>

          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userIconBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Menu do usuário"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownHeader}>
                    <span className={styles.userDropdownName}>
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <span className={styles.userDropdownEmail}>{user.email}</span>
                  </div>
                  <div className={styles.userDropdownDivider} />
                  <Link to="/pedidos" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                    Meus Pedidos
                  </Link>
                  <Link to="/favoritos" className={styles.userDropdownItem} onClick={() => setUserMenuOpen(false)}>
                    Favoritos
                  </Link>
                  <div className={styles.userDropdownDivider} />
                  <button
                    className={`${styles.userDropdownItem} ${styles.userDropdownLogout}`}
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/entrar" className={styles.btnEntrar}>
              Entrar
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}