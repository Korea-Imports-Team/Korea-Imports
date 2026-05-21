import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage         from './pages/HomePage';
import CatalogoPage     from './pages/CatalogoPage';
import ProductPage      from './pages/ProductPage';
import CartPage         from './pages/CartPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import WishlistPage     from './pages/WishlistPage';
import ProfilePage      from './pages/ProfilePage';
import CheckoutPage     from './pages/CheckoutPage';
import ShippingPage     from './pages/ShippingPage';
import PaymentPage      from './pages/PaymentPage';
import ReviewPage       from './pages/ReviewPage';
import ConfirmationPage from './pages/ConfirmationPage';
import OrdersPage       from './pages/OrdersPage';
import Dashboard        from './pages/Dashboard';
import ReviewTestPage   from './pages/ReviewTestPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>

            {/* Com navbar e footer */}
            <Route element={<Layout />}>
              <Route path="/"            element={<HomePage />} />
              <Route path="/catalogo"    element={<CatalogoPage />} />
              <Route path="/produto/:id" element={<ProductPage />} />
              <Route path="/carrinho"    element={<CartPage />} />
              <Route path="/entrar"      element={<LoginPage />} />
              <Route path="/cadastro"    element={<RegisterPage />} />
              <Route path="/favoritos"   element={<WishlistPage />} />
              <Route path="/test-review"  element={<ReviewTestPage />} />

              {/* Protegidas com navbar */}
              <Route path="/meus-pedidos" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/perfil"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Route>

            {/* Checkout sem navbar, protegidas */}
            <Route path="/checkout"    element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/frete"       element={<ProtectedRoute><ShippingPage /></ProtectedRoute>} />
            <Route path="/pagamento"   element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route path="/revisao"     element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
            <Route path="/confirmacao" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />

            {/* Admin sem navbar */}
            <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}