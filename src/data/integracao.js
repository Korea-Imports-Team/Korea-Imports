/*
 * ═══════════════════════════════════════════════════════
 * GUIA DE INTEGRAÇÃO - Instruções de implementação
 * ═══════════════════════════════════════════════════════
 */

/*
 * 1. App.jsx — adicione estas rotas dentro do <Route element={<Layout /}>
 * ═══════════════════════════════════════════════════════
 *
 * import ProfilePage from './pages/ProfilePage';
 *
 * Dentro do Layout (com navbar):
 * <Route
 *   path="/perfil"
 *   element={
 *     <ProtectedRoute>
 *       <ProfilePage />
 *     </ProtectedRoute>
 *   }
 * />
 */

/*
 * 2. ProductPage.jsx — adicione o ReviewSystem no final da página
 * ═══════════════════════════════════════════════════════
 *
 * import ReviewSystem from '../components/ReviewSystem';
 * import { useAuth } from '../context/AuthContext';
 *
 * Dentro do componente ProductPage, antes do return:
 * const { user } = useAuth();
 *
 * Verifique se o usuário comprou o produto:
 * const hasPurchased = (() => {
 *   try {
 *     const orders = JSON.parse(localStorage.getItem('orders') || '[]');
 *     return orders.some((order) =>
 *       order.cartItems?.some((item) => item.id === product.id)
 *     );
 *   } catch { return false; }
 * })();
 *
 * No JSX, depois da descrição do produto ou antes do footer:
 * <ReviewSystem
 *   productId={product.id}
 *   userName={user?.displayName || user?.email?.split('@')[0] || 'Anônimo'}
 *   hasPurchased={hasPurchased}
 * />
 */

/*
 * 3. Header.jsx — adicione o link para o perfil no dropdown
 * ═══════════════════════════════════════════════════════
 *
 * Dentro do userDropdown, antes de "Meus Pedidos":
 * <Link
 *   to="/perfil"
 *   className={styles.userDropdownItem}
 *   onClick={() => setUserMenuOpen(false)}
 * >
 *   Meu Perfil
 * </Link>
 */

/*
 * 4. CheckoutPage.jsx — auto-preencher endereço salvo
 * ═══════════════════════════════════════════════════════
 *
 * No início do CheckoutPage, carregue o endereço padrão:
 * const defaultAddress = (() => {
 *   try {
 *     const addresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
 *     return addresses.find((a) => a.isDefault) || addresses[0] || null;
 *   } catch { return null; }
 * })();
 *
 * Inicialize o form com o endereço padrão se existir:
 * const [form, setForm] = useState({
 *   name:         defaultAddress?.name         || '',
 *   email:        user?.email                  || '',
 *   phone:        defaultAddress?.phone        || '',
 *   cep:          defaultAddress?.cep          || '',
 *   address:      defaultAddress?.address      || '',
 *   number:       defaultAddress?.number       || '',
 *   complement:   defaultAddress?.complement   || '',
 *   neighborhood: defaultAddress?.neighborhood || '',
 *   city:         defaultAddress?.city         || '',
 *   state:        defaultAddress?.state        || '',
 * });
 */

export default {};